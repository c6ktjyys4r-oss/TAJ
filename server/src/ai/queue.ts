/**
 * Background queue worker for AI document processing.
 *
 * Provides:
 *   - Concurrency limiting  — at most maxConcurrentJobs jobs run simultaneously (configurable)
 *   - Rate limiting          — minimum interval between job starts (RATE_LIMIT_MS)
 *   - Automatic retry        — up to maxAttempts on failure with exponential backoff
 *   - Job cancellation       — cancel pending or in-progress jobs by documentId
 *   - Progress visibility    — job status is always kept current in ai_document_jobs
 *   - Non-blocking           — addToQueue() returns immediately; never delays uploads
 *
 * Design note: the queue accepts a `runner` function parameter rather than
 * importing from pipeline.ts directly. This keeps the dependency graph acyclic:
 *   pipeline.ts → queue.ts   (pipeline calls addToQueue, passing runPipeline)
 *   queue.ts    → (nothing from pipeline)
 *
 * Retry semantics:
 *   A failed job is re-enqueued up to (maxAttempts − 1) extra times.
 *   DB status is set to 'retry' while the backoff delay is in progress.
 *   Each retry waits BACKOFF_MS[attempt−1] before re-entering the queue.
 *   Cancellation is checked before each retry so cancelled jobs stop immediately.
 *
 * Status lifecycle:
 *   pending → processing → completed   (happy path)
 *   pending → processing → failed      (no retries remaining)
 *   pending → processing → retry       (backoff in progress)
 *   retry   → processing → completed   (retry succeeded)
 *   pending → cancelled               (cancelled while pending)
 *   processing → cancelled            (cancelled during run — suppresses retry)
 */
import type { Pool } from 'pg';
import { logger }    from '../logger';

// ── Configuration (runtime-adjustable via configureQueue) ─────────────────────

/** Maximum AI jobs running simultaneously in this process. */
let maxConcurrentJobs = 3;

/** Minimum milliseconds between consecutive job starts (rate limit). */
const RATE_LIMIT_MS = 500;

/** Total attempts per document (1 initial + up to maxAttempts−1 retries). */
let maxAttempts = 3;

/** Backoff delays before each retry attempt: [1st retry, 2nd retry, …]. */
const BACKOFF_MS: readonly number[] = [2_000, 10_000, 60_000];

// ── Types ─────────────────────────────────────────────────────────────────────

/** The pipeline execution function injected by pipeline.ts. */
export type PipelineRunner = (documentId: string, pool: Pool) => Promise<void>;

interface QueueItem {
  documentId: string;
  pool:       Pool;
  attempt:    number;   // 1-based: 1 = first try, 2 = first retry, …
  runner:     PipelineRunner;
}

// ── Internal state (module-level singleton) ───────────────────────────────────

let runningCount  = 0;
let lastStartedAt = 0;
const pendingQueue: QueueItem[]  = [];
const cancelledIds: Set<string>  = new Set();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Adjust runtime queue parameters.
 *
 * Called from the AI settings save handler whenever parallel_workers or
 * max_retries change. Takes effect immediately — in-flight jobs are unaffected;
 * the new limits apply to the next drain() cycle.
 */
export function configureQueue(opts: {
  maxConcurrent?: number;
  maxRetries?:    number;
}): void {
  if (typeof opts.maxConcurrent === 'number' && opts.maxConcurrent >= 1) {
    maxConcurrentJobs = Math.min(20, Math.max(1, Math.round(opts.maxConcurrent)));
    logger.info({ maxConcurrentJobs }, 'AI queue: concurrency reconfigured');
  }
  if (typeof opts.maxRetries === 'number' && opts.maxRetries >= 0) {
    // maxAttempts = 1 initial + maxRetries retries
    maxAttempts = Math.min(10, Math.max(1, Math.round(opts.maxRetries) + 1));
    logger.info({ maxAttempts }, 'AI queue: max attempts reconfigured');
  }
}

/**
 * Add a document to the processing queue.
 *
 * `runner` is the pipeline function to call (runPipeline from pipeline.ts).
 * Returns immediately — never blocks or awaits.
 */
export function addToQueue(
  documentId: string,
  pool:       Pool,
  runner:     PipelineRunner,
  attempt = 1,
): void {
  pendingQueue.push({ documentId, pool, attempt, runner });
  logger.debug(
    { documentId, attempt, pending: pendingQueue.length },
    'AI queue: item added',
  );
  void drain();
}

/**
 * Cancel a job.
 *
 * If the job is still pending in the queue it is removed immediately.
 * If it is already running, the flag is noted and any retry is suppressed.
 * The caller is responsible for updating the DB row status to 'cancelled'.
 */
export function cancelJob(documentId: string): void {
  cancelledIds.add(documentId);

  const idx = pendingQueue.findIndex((q) => q.documentId === documentId);
  if (idx !== -1) {
    pendingQueue.splice(idx, 1);
    logger.info({ documentId }, 'AI queue: pending job removed (cancelled)');
  }
}

/** Current queue depth and concurrency level (for health / observability). */
export function getQueueStats(): { running: number; pending: number } {
  return { running: runningCount, pending: pendingQueue.length };
}

/**
 * Reset all module-level queue state.
 *
 * FOR TEST USE ONLY — never call this in production code.
 * Allows test suites to start with a clean slate between describe blocks.
 */
export function _resetForTest(): void {
  runningCount      = 0;
  lastStartedAt     = 0;
  maxConcurrentJobs = 3;
  maxAttempts       = 3;
  pendingQueue.splice(0);
  cancelledIds.clear();
}

// ── Internal ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Drain the queue: start as many jobs as the concurrency limit allows.
 *
 * Called after addToQueue() and after each job finishes.
 * Safe under concurrent invocations: each call re-checks conditions after
 * every async pause, preventing over-commitment of concurrency slots.
 */
async function drain(): Promise<void> {
  while (pendingQueue.length > 0 && runningCount < maxConcurrentJobs) {
    // Rate limiting: enforce minimum gap between job starts
    const elapsed = Date.now() - lastStartedAt;
    if (elapsed < RATE_LIMIT_MS) {
      await delay(RATE_LIMIT_MS - elapsed);
      // Re-check limits after the pause
      if (runningCount >= maxConcurrentJobs || pendingQueue.length === 0) break;
    }

    const item = pendingQueue.shift();
    if (!item) break;

    // Handle cancellation for pending items
    if (cancelledIds.has(item.documentId)) {
      cancelledIds.delete(item.documentId);
      logger.info({ documentId: item.documentId }, 'AI queue: skipping cancelled job');
      try {
        await item.pool.query(
          `UPDATE ai_document_jobs
             SET status = 'cancelled', error = 'Job cancelled before start', updated_at = now()
           WHERE document_id = $1`,
          [item.documentId],
        );
      } catch (e) {
        logger.warn(
          { err: e, documentId: item.documentId },
          'AI queue: failed to persist cancelled status',
        );
      }
      continue;
    }

    runningCount++;
    lastStartedAt = Date.now();

    logger.info(
      { documentId: item.documentId, attempt: item.attempt, running: runningCount },
      'AI queue: starting job',
    );

    // Fire-and-forget with completion bookkeeping
    void executeJob(item).finally(() => {
      runningCount--;
      logger.debug(
        { documentId: item.documentId, running: runningCount },
        'AI queue: job slot freed',
      );
      void drain();
    });
  }
}

/**
 * Execute one pipeline run and schedule an automatic retry if the job
 * failed and has remaining attempts.
 */
async function executeJob(item: QueueItem): Promise<void> {
  const { documentId, pool, attempt, runner } = item;

  try {
    await runner(documentId, pool);
  } catch (err) {
    // runner (runPipeline) catches all errors internally; this is a safety net
    logger.error({ err, documentId, attempt }, 'AI queue: unexpected throw from runner');
  }

  // Suppress retry if cancelled during execution
  if (cancelledIds.has(documentId)) {
    cancelledIds.delete(documentId);
    logger.info({ documentId }, 'AI queue: retry suppressed (cancelled)');
    try {
      await pool.query(
        `UPDATE ai_document_jobs
           SET status = 'cancelled', error = 'Job cancelled during processing', updated_at = now()
         WHERE document_id = $1`,
        [documentId],
      );
    } catch (e) {
      logger.warn({ err: e, documentId }, 'AI queue: failed to persist cancelled status post-run');
    }
    return;
  }

  // Auto-retry if the job failed and attempts remain
  if (attempt < maxAttempts) {
    try {
      const { rows } = await pool.query<{ status: string }>(
        `SELECT status FROM ai_document_jobs WHERE document_id = $1`,
        [documentId],
      );
      const status = rows[0]?.status;

      if (status === 'failed') {
        const backoff = BACKOFF_MS[attempt - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
        logger.info(
          { documentId, attempt, nextAttempt: attempt + 1, backoffMs: backoff },
          'AI queue: scheduling retry after backoff',
        );

        // Set status to 'retry' so the UI can show a meaningful state during backoff
        await pool.query(
          `UPDATE ai_document_jobs
             SET status = 'retry', updated_at = now()
           WHERE document_id = $1`,
          [documentId],
        );

        await delay(backoff);

        // Re-check cancellation after backoff
        if (cancelledIds.has(documentId)) {
          cancelledIds.delete(documentId);
          logger.info({ documentId }, 'AI queue: retry cancelled during backoff');
          await pool.query(
            `UPDATE ai_document_jobs
               SET status = 'cancelled', error = 'Job cancelled during retry backoff', updated_at = now()
             WHERE document_id = $1`,
            [documentId],
          );
          return;
        }

        // Reset job row so runPipeline transitions it to 'processing' again
        await pool.query(
          `UPDATE ai_document_jobs
             SET status = 'pending', error = NULL, updated_at = now()
           WHERE document_id = $1`,
          [documentId],
        );

        addToQueue(documentId, pool, runner, attempt + 1);
      }
    } catch (err) {
      logger.error({ err, documentId, attempt }, 'AI queue: error during retry scheduling');
    }
  } else {
    logger.warn({ documentId, attempt }, 'AI queue: job exhausted all retry attempts');
  }
}

/**
 * AI Document Pipeline.
 *
 * Orchestrates end-to-end AI processing for a single document:
 *   1. Read document + file bytes from the database
 *   2. Extract text (PDF) or pass image bytes to the provider
 *   3. Call provider.processDocument() → structured JSON
 *   4. Validate JSON (handled inside the provider)
 *   5. Apply policy engine decisions — may auto-apply fields to the document
 *   6. Persist the AI result in ai_document_jobs
 *   7. Write an entry to ai_logs (if logging is enabled)
 *
 * Processing is always fire-and-forget: callers use queueDocument() which
 * inserts the job row and starts runPipeline() without awaiting it.
 * Uploads are never delayed by AI processing.
 *
 * Error handling: all errors are caught and stored in ai_document_jobs.error.
 * Nothing propagates out of runPipeline() — it cannot crash the server.
 */
import type { Pool } from 'pg';
import { createProvider, loadProviderConfig } from './factory';
import { applyPolicyDecisions }              from './policy';
import { writeAiLog }                        from './logger';
import { AiErrorClass }                      from './index';
import { logger }                            from '../logger';

// ── Queue a document for AI processing ───────────────────────────────────────

/**
 * Insert a job row for documentId (or reset a failed one) and start processing
 * in the background.  Returns immediately — never awaited by callers.
 */
export async function queueDocument(documentId: string, pool: Pool): Promise<void> {
  try {
    // Upsert: if a row already exists (re-upload or retry), reset to pending
    await pool.query(
      `INSERT INTO ai_document_jobs (document_id, status, error, result, attempts)
       VALUES ($1, 'pending', NULL, NULL, 0)
       ON CONFLICT (document_id) DO UPDATE
         SET status     = 'pending',
             error      = NULL,
             result     = NULL,
             updated_at = now()`,
      [documentId],
    );

    logger.info({ documentId }, 'AI job queued');

    // Start background processing — intentionally NOT awaited
    void runPipeline(documentId, pool).catch((err: unknown) => {
      logger.error({ err, documentId }, 'Unhandled error in runPipeline (should not reach here)');
    });
  } catch (err) {
    // If we can't even insert the job row, log and move on — never throw
    logger.error({ err, documentId }, 'Failed to queue AI document job');
  }
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

async function runPipeline(documentId: string, pool: Pool): Promise<void> {
  const startedAt = Date.now();

  // ── 1. Mark as processing ─────────────────────────────────────────────────
  try {
    await pool.query(
      `UPDATE ai_document_jobs
         SET status = 'processing', attempts = attempts + 1, updated_at = now()
       WHERE document_id = $1`,
      [documentId],
    );
  } catch (err) {
    logger.error({ err, documentId }, 'Failed to update job to processing — aborting pipeline');
    return;
  }

  // ── 2. Load document + file ───────────────────────────────────────────────

  let fileBuffer: Buffer;
  let mimeType: string;

  try {
    const { rows } = await pool.query<{
      file_path: string | null;
      mime_type: string | null;
      content:   Buffer | null;
    }>(
      `SELECT d.file_path, d.mime_type, df.content
         FROM documents d
         LEFT JOIN document_files df ON df.id = d.file_path
        WHERE d.id = $1`,
      [documentId],
    );

    const row = rows[0];
    if (!row || !row.content || !row.mime_type) {
      throw new AiErrorClass('UNKNOWN', 'Document has no attached file — cannot process');
    }

    fileBuffer = row.content;
    mimeType   = row.mime_type;
  } catch (err) {
    await failJob(documentId, err, pool, startedAt, null, null);
    return;
  }

  // ── 3. Load settings + create provider ───────────────────────────────────

  let providerName: string = 'openai';
  let modelName:    string = 'unknown';
  let provider: Awaited<ReturnType<typeof createProvider>>;

  try {
    const { config, settings } = await loadProviderConfig(pool);
    providerName = config.provider;
    modelName    = config.model;

    if (!settings.enabled) {
      // Log as skipped (AI disabled at processing time)
      await pool.query(
        `UPDATE ai_document_jobs
           SET status = 'failed', error = 'AI is disabled', updated_at = now()
         WHERE document_id = $1`,
        [documentId],
      );
      await writeAiLog({
        documentId,
        provider: providerName,
        model:    modelName,
        status:   'skipped',
        processingTimeMs: Date.now() - startedAt,
        error: 'AI is disabled in settings',
      }, pool);
      return;
    }
    if (!config.apiKey) {
      await failJob(documentId, new AiErrorClass('AUTH_ERROR', 'No API key configured'), pool, startedAt, providerName, modelName);
      return;
    }

    provider = createProvider(config);
    await provider.initialize();
  } catch (err) {
    await failJob(documentId, err, pool, startedAt, providerName, modelName);
    return;
  }

  // ── 4. Extract structured data from document ──────────────────────────────

  try {
    const extractionResult = await provider.processDocument({
      fileBuffer,
      mimeType,
      documentId,
    });

    logger.info(
      { documentId, overall_confidence: extractionResult.overall_confidence },
      'AI extraction completed',
    );

    // ── 5. Apply policy engine decisions ─────────────────────────────────────
    const resultWithActions = await applyPolicyDecisions(documentId, extractionResult, pool);

    // ── 6. Persist the final result ───────────────────────────────────────────
    await pool.query(
      `UPDATE ai_document_jobs
         SET status = 'completed', result = $2::jsonb, error = NULL, updated_at = now()
       WHERE document_id = $1`,
      [documentId, JSON.stringify(resultWithActions)],
    );

    // ── 7. Write AI log entry (best-effort) ───────────────────────────────────
    await writeAiLog({
      documentId,
      provider:         providerName,
      model:            modelName,
      response:         extractionResult.raw_response ?? null,
      status:           'success',
      processingTimeMs: Date.now() - startedAt,
    }, pool);

    logger.info({ documentId }, 'AI pipeline completed successfully');

  } catch (err) {
    await failJob(documentId, err, pool, startedAt, providerName, modelName);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function failJob(
  documentId:   string,
  err:          unknown,
  pool:         Pool,
  startedAt:    number,
  provider:     string | null,
  model:        string | null,
): Promise<void> {
  let message: string;
  if (err instanceof AiErrorClass) {
    message = `[${err.code}] ${err.message}`;
  } else if (err instanceof Error) {
    message = err.message;
  } else {
    message = String(err);
  }

  logger.error({ documentId, error: message }, 'AI pipeline failed');

  try {
    await pool.query(
      `UPDATE ai_document_jobs
         SET status = 'failed', error = $2, updated_at = now()
       WHERE document_id = $1`,
      [documentId, message],
    );
  } catch (updateErr) {
    logger.error({ updateErr, documentId }, 'Failed to update job to failed status');
  }

  // Write failure log (best-effort — never throws)
  if (provider && model) {
    await writeAiLog({
      documentId,
      provider,
      model,
      status:           'failed',
      processingTimeMs: Date.now() - startedAt,
      error:            message,
    }, pool);
  }
}

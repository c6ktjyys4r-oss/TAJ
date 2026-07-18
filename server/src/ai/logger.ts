/**
 * AI Logger — writes structured entries to the ai_logs table.
 *
 * Called by the pipeline after each processing attempt (success or failure).
 * Respects ai_settings.log_enabled, store_prompts, store_responses, and
 * max_log_entries.
 *
 * Security invariants:
 *   - API keys are NEVER referenced here.
 *   - prompt / response text is only stored when the corresponding
 *     store_prompts / store_responses flag is enabled.
 *   - Old rows beyond max_log_entries are pruned (oldest-first).
 */
import type { Pool } from 'pg';
import { logger as pino } from '../logger';

export interface AiLogEntry {
  documentId:       string | null;
  provider:         string;
  model:            string;
  /** Raw prompt text. Stored only when store_prompts = true. */
  prompt?:          string | null;
  /** Raw response text. Stored only when store_responses = true. */
  response?:        string | null;
  status:           'success' | 'failed' | 'skipped';
  processingTimeMs: number | null;
  error?:           string | null;
}

/**
 * Write one entry to ai_logs, respecting the configured log settings.
 * Never throws — all errors are logged via Pino and silently swallowed
 * so a logging failure never interrupts pipeline processing.
 */
export async function writeAiLog(entry: AiLogEntry, pool: Pool): Promise<void> {
  try {
    // Load log settings
    const { rows } = await pool.query<{
      log_enabled:     boolean;
      store_prompts:   boolean;
      store_responses: boolean;
      max_log_entries: number;
      provider:        string;
      model:           string;
    }>(
      `SELECT log_enabled, store_prompts, store_responses, max_log_entries, provider, model
         FROM ai_settings WHERE id = 1`,
    );

    const settings = rows[0];
    if (!settings || !settings.log_enabled) return; // logging disabled

    const prompt   = settings.store_prompts   ? (entry.prompt   ?? null) : null;
    const response = settings.store_responses ? (entry.response ?? null) : null;

    // Insert the log row
    await pool.query(
      `INSERT INTO ai_logs
         (document_id, provider, model, prompt, response, status, processing_time_ms, error)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        entry.documentId,
        entry.provider,
        entry.model,
        prompt,
        response,
        entry.status,
        entry.processingTimeMs,
        entry.error ?? null,
      ],
    );

    // Prune excess rows (keep newest max_log_entries rows)
    if (settings.max_log_entries > 0) {
      await pool.query(
        `DELETE FROM ai_logs
          WHERE id IN (
            SELECT id FROM ai_logs
            ORDER BY created_at ASC
            OFFSET $1
          )`,
        [settings.max_log_entries],
      );
    }
  } catch (err) {
    // Log failure must never propagate — writing logs is best-effort
    pino.error({ err, documentId: entry.documentId }, 'writeAiLog: failed to write AI log entry');
  }
}

-- Migration 0007: AI Logs
--
-- Stores one row per AI processing attempt on a document.
-- Used for observability, debugging, and audit trails.
--
-- Security rules:
--   - prompt/response are nullable; only populated when the corresponding
--     ai_settings flags (store_prompts / store_responses) are enabled.
--   - api_key_encrypted is NEVER referenced or stored here.
--   - Rows are pruned by the application when the log count exceeds
--     ai_settings.max_log_entries (oldest rows deleted first).
--
-- status values: 'success' | 'failed' | 'skipped'
--   skipped = AI was disabled at processing time

CREATE TABLE "ai_logs" (
  "id"                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "document_id"         uuid REFERENCES "documents"("id") ON DELETE SET NULL,
  "provider"            text NOT NULL,
  "model"               text NOT NULL,
  "prompt"              text,
  "response"            text,
  "status"              text NOT NULL CHECK ("status" IN ('success', 'failed', 'skipped')),
  "processing_time_ms"  integer,
  "error"               text,
  "created_at"          timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint

CREATE INDEX "ai_logs_document_id_idx" ON "ai_logs" ("document_id");
CREATE INDEX "ai_logs_created_at_idx"  ON "ai_logs" ("created_at" DESC);
CREATE INDEX "ai_logs_status_idx"      ON "ai_logs" ("status");

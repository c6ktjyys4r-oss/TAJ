-- Migration 0005: AI Document Processing Jobs
--
-- Tracks the lifecycle of AI processing for each uploaded document.
-- One row per document (UNIQUE on document_id) — re-runs update the same row.
--
-- status values:
--   pending    — queued, waiting for the background worker
--   processing — pipeline is actively running
--   completed  — extraction finished; result stored in the result column
--   failed     — pipeline errored; error message stored in the error column
--
-- result (jsonb): stores the full AiExtractionResult including per-field
--   confidence scores and the action taken by the policy engine.
-- attempts: incremented on every run attempt (for retry tracking).

CREATE TABLE "ai_document_jobs" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "document_id" uuid NOT NULL UNIQUE
                  REFERENCES "documents"("id") ON DELETE CASCADE,
  "status"      text NOT NULL DEFAULT 'pending'
                  CHECK ("status" IN ('pending', 'processing', 'completed', 'failed')),
  "result"      jsonb,
  "error"       text,
  "attempts"    integer NOT NULL DEFAULT 0,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "ai_document_jobs_document_id_idx" ON "ai_document_jobs" ("document_id");
CREATE INDEX "ai_document_jobs_status_idx"      ON "ai_document_jobs" ("status");

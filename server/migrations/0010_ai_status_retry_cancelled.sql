-- Migration 0010: Extend ai_document_jobs status to include retry and cancelled
--
-- Prior constraint (migration 0005) only allowed: pending, processing, completed, failed
-- Sprint v2 Queue System requires two additional statuses:
--   retry     — job failed and is scheduled for re-attempt (transient)
--   cancelled — job was explicitly cancelled by user or system (terminal)
--
-- We DROP and re-ADD the named constraint because PostgreSQL does not support
-- ALTER CONSTRAINT for CHECK constraints — only for foreign keys.

ALTER TABLE "ai_document_jobs"
  DROP CONSTRAINT IF EXISTS "ai_document_jobs_status_check";

ALTER TABLE "ai_document_jobs"
  ADD CONSTRAINT "ai_document_jobs_status_check"
  CHECK ("status" IN ('pending', 'processing', 'completed', 'failed', 'retry', 'cancelled'));

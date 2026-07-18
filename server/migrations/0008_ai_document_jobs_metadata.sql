-- Migration 0008: Add metadata columns to ai_document_jobs
--
-- The spec requires the document jobs table to store provider, model,
-- processing time, overall confidence, and raw AI response as first-class
-- columns — not buried inside the result jsonb blob.
--
-- All columns are nullable so existing rows are unaffected.
-- The pipeline populates these on every new processing run.
--
-- raw_response: the verbatim text returned by the AI provider before any
--   parsing or validation. Stored here for debugging and audit purposes.
--   Never contains the API key.

ALTER TABLE "ai_document_jobs"
  ADD COLUMN "provider"            text,
  ADD COLUMN "model"               text,
  ADD COLUMN "processing_time_ms"  integer,
  ADD COLUMN "overall_confidence"  integer,
  ADD COLUMN "raw_response"        text;

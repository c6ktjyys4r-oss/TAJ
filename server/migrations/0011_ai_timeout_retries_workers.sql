-- Migration 0011: Add timeout_ms, max_retries, parallel_workers to ai_settings
--
-- These three new columns expose runtime configuration that was previously
-- hardcoded in the server source:
--
--   timeout_ms       — provider API call timeout in milliseconds (default 30 000 ms)
--   max_retries      — maximum retry attempts per failed job (default 3)
--   parallel_workers — maximum concurrent AI jobs in this process (default 3)
--
-- All columns are NOT NULL with safe production defaults so existing rows
-- (and the singleton row already seeded by migration 0004) gain values
-- automatically on migration without manual UPDATE.

ALTER TABLE "ai_settings"
  ADD COLUMN "timeout_ms"        integer NOT NULL DEFAULT 30000,
  ADD COLUMN "max_retries"       integer NOT NULL DEFAULT 3,
  ADD COLUMN "parallel_workers"  integer NOT NULL DEFAULT 3;

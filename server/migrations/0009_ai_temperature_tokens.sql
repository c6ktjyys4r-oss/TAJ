-- Migration 0009: Add temperature and max_tokens to ai_settings
--
-- These parameters are passed to the AI provider on every request.
--
-- temperature: controls response randomness (0.0 = deterministic, 2.0 = max random).
--   For document extraction we default to 0.1 (near-deterministic, more consistent output).
--   Range validated at the application layer: 0.0–2.0.
--
-- max_tokens: upper bound on the response length (provider tokens, not characters).
--   Default 1024 covers all expected extraction JSON payloads with room to spare.
--   Range validated at the application layer: 1–8192.

ALTER TABLE "ai_settings"
  ADD COLUMN "temperature"  numeric(4,2) NOT NULL DEFAULT 0.1,
  ADD COLUMN "max_tokens"   integer NOT NULL DEFAULT 1024;

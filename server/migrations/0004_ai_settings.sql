-- Migration 0004: AI Settings
--
-- Singleton settings row for the AI subsystem.
-- The CHECK (id = 1) constraint ensures exactly one row ever exists.
-- The INSERT … ON CONFLICT DO NOTHING seeds the default row on first run.
--
-- api_key_encrypted: stores the raw provider API key server-side.
--   Never returned to the frontend — only `api_key_set` (boolean) is exposed.
--
-- All policy fields accept the values: 'automatic', 'review', 'suggestion'.

CREATE TABLE "ai_settings" (
  "id"                    integer PRIMARY KEY DEFAULT 1,

  -- General
  "enabled"               boolean NOT NULL DEFAULT false,
  "process_after_upload"  boolean NOT NULL DEFAULT false,
  "assistant_enabled"     boolean NOT NULL DEFAULT true,

  -- Provider
  "provider"              text NOT NULL DEFAULT 'openai',
  "model"                 text NOT NULL DEFAULT 'gpt-4o-mini',
  "api_key_encrypted"     text,
  "base_url"              text,

  -- Processing
  "confidence_threshold"  integer NOT NULL DEFAULT 90,
  "approval_policy"       text NOT NULL DEFAULT 'review',

  -- Field policies
  "policy_category"       text NOT NULL DEFAULT 'review',
  "policy_branch"         text NOT NULL DEFAULT 'review',
  "policy_invoice_date"   text NOT NULL DEFAULT 'review',
  "policy_invoice_number" text NOT NULL DEFAULT 'review',
  "policy_supplier"       text NOT NULL DEFAULT 'review',
  "policy_tax"            text NOT NULL DEFAULT 'review',
  "policy_currency"       text NOT NULL DEFAULT 'review',

  -- Logging
  "log_enabled"           boolean NOT NULL DEFAULT false,
  "store_prompts"         boolean NOT NULL DEFAULT false,
  "store_responses"       boolean NOT NULL DEFAULT false,
  "max_log_entries"       integer NOT NULL DEFAULT 1000,

  "created_at"            timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"            timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT "ai_settings_singleton" CHECK ("id" = 1)
);

-- Seed the default row
INSERT INTO "ai_settings" ("id") VALUES (1) ON CONFLICT DO NOTHING;

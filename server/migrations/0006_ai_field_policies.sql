-- Migration 0006: AI Field Policies
--
-- Separate singleton table for per-field AI policy configuration.
-- Field policies were previously stored as columns on ai_settings.
-- This table makes the policy model explicit and independently queryable.
--
-- Singleton enforced by: PRIMARY KEY (id = 1) + CHECK constraint.
--
-- On first run, field policy values are copied from ai_settings where the
-- ai_settings row exists, so existing deployments keep their configuration.
-- If ai_settings is still empty, defaults are used instead.
--
-- Valid values for all policy_* columns: 'automatic', 'review', 'suggestion'

CREATE TABLE "ai_field_policies" (
  "id"                    integer PRIMARY KEY DEFAULT 1,

  "policy_category"       text NOT NULL DEFAULT 'review',
  "policy_branch"         text NOT NULL DEFAULT 'review',
  "policy_invoice_date"   text NOT NULL DEFAULT 'review',
  "policy_invoice_number" text NOT NULL DEFAULT 'review',
  "policy_supplier"       text NOT NULL DEFAULT 'review',
  "policy_tax"            text NOT NULL DEFAULT 'review',
  "policy_currency"       text NOT NULL DEFAULT 'review',

  "updated_at"            timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT "ai_field_policies_singleton" CHECK ("id" = 1)
);

--> statement-breakpoint

-- Seed from existing ai_settings row (preserves configured policies)
INSERT INTO "ai_field_policies" (
  "id",
  "policy_category",
  "policy_branch",
  "policy_invoice_date",
  "policy_invoice_number",
  "policy_supplier",
  "policy_tax",
  "policy_currency"
)
SELECT
  1,
  COALESCE("policy_category",       'review'),
  COALESCE("policy_branch",         'review'),
  COALESCE("policy_invoice_date",   'review'),
  COALESCE("policy_invoice_number", 'review'),
  COALESCE("policy_supplier",       'review'),
  COALESCE("policy_tax",            'review'),
  COALESCE("policy_currency",       'review')
FROM "ai_settings"
WHERE "id" = 1
ON CONFLICT DO NOTHING;

--> statement-breakpoint

-- Fallback: if ai_settings row was absent, insert defaults
INSERT INTO "ai_field_policies" ("id") VALUES (1) ON CONFLICT DO NOTHING;

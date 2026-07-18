/**
 * Policy Engine.
 *
 * For each extracted field, consults ai_field_policies (with fallback to
 * ai_settings columns for legacy rows) to determine whether to:
 *
 *   automatic  + confidence >= threshold → apply the value to the document
 *   review     (any confidence)          → record as 'suggested', do not apply
 *   suggestion (any confidence)          → record as 'suggested', never apply
 *
 * When automatic application occurs, the document row is patched immediately.
 * All decisions are logged via Pino.
 *
 * The returned result object is identical to the input but with an `action`
 * field added to each ExtractionField:
 *   'applied'   — written to the documents table
 *   'suggested' — stored in the job result for human review
 *   'ignored'   — confidence below threshold for automatic policy
 */
import type { Pool } from 'pg';
import type { ProcessDocumentResult, ExtractionField } from './types';
import { logger } from '../logger';

// ── Settings row shape we need ────────────────────────────────────────────────

interface PolicySettings {
  confidence_threshold:  number;
  approval_policy:       string;
  policy_category:       string;
  policy_branch:         string;
  policy_invoice_date:   string;
  policy_invoice_number: string;
  policy_supplier:       string;
  policy_tax:            string;
  policy_currency:       string;
}

// ── Field → document column mapping ──────────────────────────────────────────

type FieldName = keyof Omit<ProcessDocumentResult, 'overall_confidence' | 'raw_response'>;

/** Maps an extraction field to the document column/metadata path it updates. */
const FIELD_COLUMN_MAP: Record<FieldName, { col: string; meta?: string }> = {
  supplier:       { col: 'vendor'    },
  invoice_number: { col: 'metadata', meta: 'invoice_number' },
  invoice_date:   { col: 'date'      },
  currency:       { col: 'currency'  },
  subtotal:       { col: 'metadata', meta: 'subtotal' },
  vat:            { col: 'metadata', meta: 'vat'      },
  total:          { col: 'amount'    },
  document_type:  { col: 'type'      },
  summary:        { col: 'metadata', meta: 'summary'  },
};

/** Maps field name → which policy column to read from the settings. */
const FIELD_POLICY_KEY: Record<FieldName, keyof PolicySettings | 'approval_policy'> = {
  supplier:       'policy_supplier',
  invoice_number: 'policy_invoice_number',
  invoice_date:   'policy_invoice_date',
  currency:       'policy_currency',
  subtotal:       'approval_policy',       // no dedicated field — use global
  vat:            'policy_tax',
  total:          'approval_policy',
  document_type:  'policy_category',
  summary:        'approval_policy',
};

// ── Extended field type with action recorded ──────────────────────────────────

export interface ExtractionFieldWithAction extends ExtractionField {
  action: 'applied' | 'suggested' | 'ignored';
}

export interface ProcessDocumentResultWithActions
  extends Omit<ProcessDocumentResult, FieldName> {
  supplier:       ExtractionFieldWithAction;
  invoice_number: ExtractionFieldWithAction;
  invoice_date:   ExtractionFieldWithAction;
  currency:       ExtractionFieldWithAction;
  subtotal:       ExtractionFieldWithAction;
  vat:            ExtractionFieldWithAction;
  total:          ExtractionFieldWithAction;
  document_type:  ExtractionFieldWithAction;
  summary:        ExtractionFieldWithAction;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Evaluate every extracted field against the policy settings and apply
 * automatic values to the document.  Returns the result with action labels.
 *
 * Policy is read from ai_field_policies (migration 0006) first.
 * If that table has no row, falls back to policy columns on ai_settings.
 */
export async function applyPolicyDecisions(
  documentId: string,
  result:      ProcessDocumentResult,
  pool:        Pool,
): Promise<ProcessDocumentResultWithActions> {
  // ── Load policy settings ─────────────────────────────────────────────────
  // Primary source: ai_field_policies (separate table — migration 0006)
  // Fallback:       ai_settings columns (original implementation)

  let settings: PolicySettings;

  try {
    const { rows: policyRows } = await pool.query<{
      policy_category:       string;
      policy_branch:         string;
      policy_invoice_date:   string;
      policy_invoice_number: string;
      policy_supplier:       string;
      policy_tax:            string;
      policy_currency:       string;
    }>(
      `SELECT policy_category, policy_branch, policy_invoice_date,
              policy_invoice_number, policy_supplier, policy_tax, policy_currency
         FROM ai_field_policies WHERE id = 1`,
    );

    const { rows: settingsRows } = await pool.query<{
      confidence_threshold: number;
      approval_policy:      string;
      policy_category:       string;
      policy_branch:         string;
      policy_invoice_date:   string;
      policy_invoice_number: string;
      policy_supplier:       string;
      policy_tax:            string;
      policy_currency:       string;
    }>(
      `SELECT confidence_threshold, approval_policy,
              policy_category, policy_branch, policy_invoice_date,
              policy_invoice_number, policy_supplier, policy_tax, policy_currency
         FROM ai_settings WHERE id = 1`,
    );

    const base = settingsRows[0] ?? {
      confidence_threshold:  90,
      approval_policy:       'review',
      policy_category:       'review',
      policy_branch:         'review',
      policy_invoice_date:   'review',
      policy_invoice_number: 'review',
      policy_supplier:       'review',
      policy_tax:            'review',
      policy_currency:       'review',
    };

    // ai_field_policies overrides per-field values from ai_settings
    if (policyRows.length > 0) {
      const p = policyRows[0];
      settings = {
        confidence_threshold:  base.confidence_threshold,
        approval_policy:       base.approval_policy,
        policy_category:       p.policy_category,
        policy_branch:         p.policy_branch,
        policy_invoice_date:   p.policy_invoice_date,
        policy_invoice_number: p.policy_invoice_number,
        policy_supplier:       p.policy_supplier,
        policy_tax:            p.policy_tax,
        policy_currency:       p.policy_currency,
      };
    } else {
      settings = base;
    }
  } catch {
    // If ai_field_policies doesn't exist yet (pre-migration env), use ai_settings
    const { rows: settingsRows } = await pool.query<PolicySettings>(
      `SELECT confidence_threshold, approval_policy,
              policy_category, policy_branch, policy_invoice_date,
              policy_invoice_number, policy_supplier, policy_tax, policy_currency
         FROM ai_settings WHERE id = 1`,
    );
    settings = settingsRows[0] ?? {
      confidence_threshold: 90,
      approval_policy: 'review',
      policy_category: 'review', policy_branch: 'review',
      policy_invoice_date: 'review', policy_invoice_number: 'review',
      policy_supplier: 'review', policy_tax: 'review', policy_currency: 'review',
    };
  }

  const threshold = settings.confidence_threshold;

  // Columns to UPDATE on the documents row
  const directSets: { col: string; val: string }[] = [];
  // Metadata keys to merge into documents.metadata
  const metaSets:   { key: string; val: string }[] = [];

  const resultWithActions: ProcessDocumentResultWithActions = {
    ...result,
    supplier:       attachAction(result.supplier,       'supplier',       settings, threshold, directSets, metaSets, documentId),
    invoice_number: attachAction(result.invoice_number, 'invoice_number', settings, threshold, directSets, metaSets, documentId),
    invoice_date:   attachAction(result.invoice_date,   'invoice_date',   settings, threshold, directSets, metaSets, documentId),
    currency:       attachAction(result.currency,       'currency',       settings, threshold, directSets, metaSets, documentId),
    subtotal:       attachAction(result.subtotal,       'subtotal',       settings, threshold, directSets, metaSets, documentId),
    vat:            attachAction(result.vat,            'vat',            settings, threshold, directSets, metaSets, documentId),
    total:          attachAction(result.total,          'total',          settings, threshold, directSets, metaSets, documentId),
    document_type:  attachAction(result.document_type,  'document_type',  settings, threshold, directSets, metaSets, documentId),
    summary:        attachAction(result.summary,        'summary',        settings, threshold, directSets, metaSets, documentId),
  };

  // ── Apply automatic updates to the documents row ──────────────────────────
  if (directSets.length > 0 || metaSets.length > 0) {
    try {
      await applyToDocument(documentId, directSets, metaSets, pool);
    } catch (err) {
      logger.error({ err, documentId }, 'Policy engine: failed to apply automatic fields');
      // Downgrade applied actions to suggested on DB error
      for (const f of Object.values(resultWithActions) as ExtractionFieldWithAction[]) {
        if (f && typeof f === 'object' && f.action === 'applied') f.action = 'suggested';
      }
    }
  }

  return resultWithActions;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function attachAction(
  field:      ExtractionField,
  fieldName:  FieldName,
  settings:   PolicySettings,
  threshold:  number,
  directSets: { col: string; val: string }[],
  metaSets:   { key: string; val: string }[],
  documentId: string,
): ExtractionFieldWithAction {
  if (field.value === null) {
    logger.debug({ documentId, field: fieldName }, 'Policy: field has null value — skipping');
    return { ...field, action: 'ignored' };
  }

  const policyKey = FIELD_POLICY_KEY[fieldName];
  const policy    = settings[policyKey as keyof PolicySettings] as string;
  const mapping   = FIELD_COLUMN_MAP[fieldName];

  let action: ExtractionFieldWithAction['action'];

  if (policy === 'automatic' && field.confidence >= threshold) {
    action = 'applied';
    if (mapping.meta) {
      metaSets.push({ key: mapping.meta, val: field.value });
    } else {
      directSets.push({ col: mapping.col, val: field.value });
    }
    logger.info({ documentId, field: fieldName, confidence: field.confidence, policy },
      'Policy: automatic apply');
  } else if (policy === 'automatic' && field.confidence < threshold) {
    action = 'ignored';
    logger.info({ documentId, field: fieldName, confidence: field.confidence, threshold, policy },
      'Policy: automatic skipped — confidence below threshold');
  } else {
    // 'review' or 'suggestion' → always suggest
    action = 'suggested';
    logger.info({ documentId, field: fieldName, confidence: field.confidence, policy },
      'Policy: suggestion created');
  }

  return { ...field, action };
}

async function applyToDocument(
  documentId: string,
  directSets: { col: string; val: string }[],
  metaSets:   { key: string; val: string }[],
  pool:       Pool,
): Promise<void> {
  const setClauses: string[] = ['updated_at = now()'];
  const params: unknown[]    = [documentId];
  let p = 2;

  for (const { col, val } of directSets) {
    // document_type must match the enum — validate
    if (col === 'type') {
      const VALID_TYPES = new Set([
        'invoice', 'receipt', 'bank_statement',
        'credit_note', 'debit_note', 'po', 'attachment',
      ]);
      if (!VALID_TYPES.has(val)) continue; // skip invalid enum values
    }
    // amount must be a valid decimal
    if (col === 'amount') {
      if (!/^\d+(\.\d{1,2})?$/.test(val) || parseFloat(val) <= 0) continue;
    }
    setClauses.push(`${col} = $${p++}`);
    params.push(val);
  }

  // Merge metadata keys using jsonb_set chain
  if (metaSets.length > 0) {
    let jsonbExpr = 'COALESCE(metadata, \'{}\'::jsonb)';
    for (const { key, val } of metaSets) {
      jsonbExpr = `jsonb_set(${jsonbExpr}, '{${key}}', $${p++}::jsonb)`;
      params.push(JSON.stringify(val));
    }
    setClauses.push(`metadata = ${jsonbExpr}`);
  }

  if (setClauses.length === 1) return; // only updated_at — no-op

  await pool.query(
    `UPDATE documents SET ${setClauses.join(', ')} WHERE id = $1`,
    params,
  );

  logger.info({ documentId, applied: directSets.map((s) => s.col) }, 'Policy engine: automatic fields applied');
}

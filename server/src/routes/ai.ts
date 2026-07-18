/**
 * AI Routes — /api/ai/*
 *
 * Settings CRUD, connectivity test, health check, validation,
 * document job management, and log retrieval.
 *
 *   GET  /api/ai/settings                  — read current settings (+ field policies)
 *   PUT  /api/ai/settings                  — update settings (syncs ai_field_policies)
 *   POST /api/ai/settings/test-connection  — verify provider connectivity
 *   GET  /api/ai/settings/validate         — structured settings validation report
 *   GET  /api/ai/health                    — lightweight health check (DB + provider)
 *   GET  /api/ai/logs                      — paginated AI processing log
 *   GET  /api/ai/documents/:id             — get AI job status + result
 *   POST /api/ai/documents/:id/retry       — re-queue a failed/pending job
 *   POST /api/ai/documents/:id/accept      — accept one or all suggestions
 *   POST /api/ai/documents/:id/reject      — reject one or all suggestions
 *
 * Security invariant: api_key_encrypted is NEVER returned to the frontend.
 *   The frontend receives only api_key_set: boolean.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { pool }                                         from '../db/index';
import { AppError }                                     from '../middleware/errorHandler';
import { logger }                                       from '../logger';
import { createProvider, loadProviderConfig, queueDocument } from '../ai';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

type PolicyValue   = 'automatic' | 'review' | 'suggestion';
type ProviderValue = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama';

const VALID_POLICIES  = new Set<string>(['automatic', 'review', 'suggestion']);
const VALID_PROVIDERS = new Set<string>(['openai', 'anthropic', 'gemini', 'openrouter', 'ollama']);

function isPolicy(v: unknown): v is PolicyValue {
  return typeof v === 'string' && VALID_POLICIES.has(v);
}
function isProvider(v: unknown): v is ProviderValue {
  return typeof v === 'string' && VALID_PROVIDERS.has(v);
}

/** Strip the api_key_encrypted column; add a safe api_key_set flag. */
function sanitiseRow(row: Record<string, unknown>) {
  const { api_key_encrypted, ...safe } = row;
  return { ...safe, api_key_set: api_key_encrypted != null && api_key_encrypted !== '' };
}

/** Ensure the ai_settings singleton row exists (idempotent). */
async function ensureSettingsRow() {
  await pool.query(`INSERT INTO ai_settings (id) VALUES (1) ON CONFLICT DO NOTHING`);
}

/** Ensure the ai_field_policies singleton row exists (idempotent, best-effort). */
async function ensureFieldPoliciesRow() {
  try {
    await pool.query(`INSERT INTO ai_field_policies (id) VALUES (1) ON CONFLICT DO NOTHING`);
  } catch {
    // Table may not exist in pre-migration environments — silently skip
  }
}

// ── GET /api/ai/settings ──────────────────────────────────────────────────────

router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSettingsRow();
    await ensureFieldPoliciesRow();

    // Read main settings
    const { rows: settingsRows } = await pool.query<Record<string, unknown>>(
      `SELECT * FROM ai_settings WHERE id = 1`,
    );
    if (settingsRows.length === 0) {
      throw new AppError(500, 'AI_SETTINGS_MISSING', 'AI settings row not found');
    }

    // Read field policies (migration 0006) — overrides the columns on ai_settings
    let fieldPolicies: Record<string, unknown> = {};
    try {
      const { rows: policyRows } = await pool.query<Record<string, unknown>>(
        `SELECT policy_category, policy_branch, policy_invoice_date,
                policy_invoice_number, policy_supplier, policy_tax, policy_currency
           FROM ai_field_policies WHERE id = 1`,
      );
      if (policyRows.length > 0) fieldPolicies = policyRows[0];
    } catch {
      // ai_field_policies not yet created — use ai_settings columns as fallback
    }

    const merged = { ...settingsRows[0], ...fieldPolicies };
    res.json(sanitiseRow(merged));
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/ai/settings ──────────────────────────────────────────────────────

router.put('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSettingsRow();
    await ensureFieldPoliciesRow();

    const b = req.body as Record<string, unknown>;

    // ── Build SET clause for ai_settings ─────────────────────────────────────
    const sets: string[] = ['updated_at = now()'];
    const params: unknown[] = [];
    let p = 1;

    function addParam(col: string, val: unknown) {
      sets.push(`${col} = $${p++}`);
      params.push(val);
    }

    if (typeof b.enabled              === 'boolean') addParam('enabled', b.enabled);
    if (typeof b.process_after_upload === 'boolean') addParam('process_after_upload', b.process_after_upload);
    if (typeof b.assistant_enabled    === 'boolean') addParam('assistant_enabled', b.assistant_enabled);

    if (isProvider(b.provider)) addParam('provider', b.provider);
    if (typeof b.model === 'string' && b.model.trim()) addParam('model', b.model.trim());
    if (typeof b.base_url === 'string') addParam('base_url', b.base_url.trim() || null);

    // API key: empty string = clear; non-empty = store; omitted = preserve
    if (typeof b.api_key === 'string') {
      if (b.api_key === '') {
        addParam('api_key_encrypted', null);
      } else {
        addParam('api_key_encrypted', b.api_key);
        logger.info({ col: 'api_key_encrypted' }, 'AI API key updated');
      }
    }

    if (typeof b.confidence_threshold === 'number') {
      const t = Math.round(b.confidence_threshold);
      if (t < 50 || t > 100) {
        throw new AppError(400, 'INVALID_THRESHOLD', 'confidence_threshold must be 50–100');
      }
      addParam('confidence_threshold', t);
    }

    if (isPolicy(b.approval_policy))       addParam('approval_policy',       b.approval_policy);

    // Keep field policy columns on ai_settings in sync (backwards compat)
    if (isPolicy(b.policy_category))       addParam('policy_category',       b.policy_category);
    if (isPolicy(b.policy_branch))         addParam('policy_branch',         b.policy_branch);
    if (isPolicy(b.policy_invoice_date))   addParam('policy_invoice_date',   b.policy_invoice_date);
    if (isPolicy(b.policy_invoice_number)) addParam('policy_invoice_number', b.policy_invoice_number);
    if (isPolicy(b.policy_supplier))       addParam('policy_supplier',       b.policy_supplier);
    if (isPolicy(b.policy_tax))            addParam('policy_tax',            b.policy_tax);
    if (isPolicy(b.policy_currency))       addParam('policy_currency',       b.policy_currency);

    if (typeof b.log_enabled     === 'boolean') addParam('log_enabled',     b.log_enabled);
    if (typeof b.store_prompts   === 'boolean') addParam('store_prompts',   b.store_prompts);
    if (typeof b.store_responses === 'boolean') addParam('store_responses', b.store_responses);
    if (typeof b.max_log_entries === 'number')  addParam('max_log_entries', Math.max(0, Math.round(b.max_log_entries)));

    // ── Update ai_settings ────────────────────────────────────────────────────
    let settingsRow: Record<string, unknown>;
    if (sets.length > 1) {
      const { rows } = await pool.query<Record<string, unknown>>(
        `UPDATE ai_settings SET ${sets.join(', ')} WHERE id = 1 RETURNING *`,
        params,
      );
      settingsRow = rows[0];
    } else {
      const { rows } = await pool.query<Record<string, unknown>>(
        'SELECT * FROM ai_settings WHERE id = 1',
      );
      settingsRow = rows[0];
    }

    // ── Sync field policies → ai_field_policies (migration 0006) ─────────────
    const fieldPolicySets: string[] = ['updated_at = now()'];
    const fpParams: unknown[]       = [];
    let fp = 1;

    function addFpParam(col: string, val: unknown) {
      fieldPolicySets.push(`${col} = $${fp++}`);
      fpParams.push(val);
    }

    if (isPolicy(b.policy_category))       addFpParam('policy_category',       b.policy_category);
    if (isPolicy(b.policy_branch))         addFpParam('policy_branch',         b.policy_branch);
    if (isPolicy(b.policy_invoice_date))   addFpParam('policy_invoice_date',   b.policy_invoice_date);
    if (isPolicy(b.policy_invoice_number)) addFpParam('policy_invoice_number', b.policy_invoice_number);
    if (isPolicy(b.policy_supplier))       addFpParam('policy_supplier',       b.policy_supplier);
    if (isPolicy(b.policy_tax))            addFpParam('policy_tax',            b.policy_tax);
    if (isPolicy(b.policy_currency))       addFpParam('policy_currency',       b.policy_currency);

    if (fieldPolicySets.length > 1) {
      try {
        await pool.query(
          `UPDATE ai_field_policies SET ${fieldPolicySets.join(', ')} WHERE id = 1`,
          fpParams,
        );
      } catch {
        // Table may not exist in pre-migration environment — silently skip
      }
    }

    // ── Return merged response ────────────────────────────────────────────────
    let fieldPolicies: Record<string, unknown> = {};
    try {
      const { rows: policyRows } = await pool.query<Record<string, unknown>>(
        `SELECT policy_category, policy_branch, policy_invoice_date,
                policy_invoice_number, policy_supplier, policy_tax, policy_currency
           FROM ai_field_policies WHERE id = 1`,
      );
      if (policyRows.length > 0) fieldPolicies = policyRows[0];
    } catch { /* pre-migration */ }

    res.json(sanitiseRow({ ...settingsRow, ...fieldPolicies }));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ai/settings/test-connection ─────────────────────────────────────

router.post('/settings/test-connection', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { config, settings } = await loadProviderConfig(pool);

    if (!settings.enabled) {
      res.json({ ok: false, error: 'AI is disabled. Enable it in General settings first.' });
      return;
    }
    if (!config.apiKey) {
      res.json({ ok: false, error: 'No API key configured. Save an API key first.' });
      return;
    }

    const provider = createProvider(config);
    await provider.initialize();
    const result = await provider.healthCheck();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/settings/validate ────────────────────────────────────────────

/**
 * Returns a structured validation report for the current AI settings.
 * Does NOT call the provider — purely validates configuration completeness.
 */
router.get('/settings/validate', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSettingsRow();
    const { rows } = await pool.query<{
      enabled:              boolean;
      provider:             string;
      model:                string;
      api_key_encrypted:    string | null;
      base_url:             string | null;
      confidence_threshold: number;
      approval_policy:      string;
    }>(
      `SELECT enabled, provider, model, api_key_encrypted,
              base_url, confidence_threshold, approval_policy
         FROM ai_settings WHERE id = 1`,
    );

    const s = rows[0];
    if (!s) {
      res.json({ valid: false, errors: ['AI settings row not found'] });
      return;
    }

    const errors:   string[] = [];
    const warnings: string[] = [];

    if (!s.enabled) warnings.push('AI is currently disabled');
    if (!s.api_key_encrypted) errors.push('No API key configured');
    if (!s.model.trim()) errors.push('Model name is required');
    if (!VALID_PROVIDERS.has(s.provider)) errors.push(`Unknown provider: ${s.provider}`);
    if (s.confidence_threshold < 50 || s.confidence_threshold > 100) {
      errors.push('Confidence threshold must be between 50 and 100');
    }
    if (s.provider === 'ollama' && !s.base_url) {
      warnings.push('Ollama typically requires a Base URL (e.g. http://localhost:11434)');
    }

    res.json({
      valid:    errors.length === 0,
      errors,
      warnings,
      summary: {
        enabled:              s.enabled,
        provider:             s.provider,
        model:                s.model,
        api_key_set:          s.api_key_encrypted != null && s.api_key_encrypted !== '',
        confidence_threshold: s.confidence_threshold,
        approval_policy:      s.approval_policy,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/health ────────────────────────────────────────────────────────

/**
 * Lightweight health check: verifies DB connectivity and returns a summary
 * of the AI subsystem state.  Does NOT call the external provider.
 * Use POST /api/ai/settings/test-connection for provider connectivity.
 */
router.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Database round-trip
    const { rows: dbRows } = await pool.query<{ now: Date }>(
      'SELECT now()',
    );
    const dbOk = dbRows.length > 0;

    // Count pending/processing jobs
    const { rows: jobRows } = await pool.query<{
      pending:    string;
      processing: string;
      failed:     string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending')    AS pending,
         COUNT(*) FILTER (WHERE status = 'processing') AS processing,
         COUNT(*) FILTER (WHERE status = 'failed')     AS failed
       FROM ai_document_jobs`,
    );

    const jobs = jobRows[0] ?? { pending: '0', processing: '0', failed: '0' };

    // AI settings summary (no API key)
    const { rows: settingsRows } = await pool.query<{
      enabled:   boolean;
      provider:  string;
      model:     string;
    }>(
      `SELECT enabled, provider, model FROM ai_settings WHERE id = 1`,
    );
    const settings = settingsRows[0] ?? null;

    res.json({
      ok: dbOk,
      database: dbOk ? 'connected' : 'error',
      ai: {
        enabled:  settings?.enabled ?? false,
        provider: settings?.provider ?? null,
        model:    settings?.model    ?? null,
      },
      jobs: {
        pending:    parseInt(jobs.pending,    10),
        processing: parseInt(jobs.processing, 10),
        failed:     parseInt(jobs.failed,     10),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/logs ──────────────────────────────────────────────────────────

/**
 * Paginated retrieval of AI processing logs from the ai_logs table.
 * Query params:
 *   page       (default: 1)
 *   pageSize   (default: 50, max: 200)
 *   documentId (optional — filter by document)
 *   status     (optional — 'success' | 'failed' | 'skipped')
 */
router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page     = Math.max(1, parseInt(String(req.query.page     ?? '1'),    10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(String(req.query.pageSize ?? '50'), 10) || 50));
    const offset   = (page - 1) * pageSize;

    const filters: string[]  = [];
    const params:  unknown[] = [];
    let   p = 1;

    if (typeof req.query.documentId === 'string' && req.query.documentId) {
      filters.push(`document_id = $${p++}`);
      params.push(req.query.documentId);
    }
    if (typeof req.query.status === 'string' && ['success', 'failed', 'skipped'].includes(req.query.status)) {
      filters.push(`status = $${p++}`);
      params.push(req.query.status);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Count total
    const { rows: countRows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM ai_logs ${where}`,
      params,
    );
    const total = parseInt(countRows[0]?.count ?? '0', 10);

    // Fetch page
    const { rows } = await pool.query<Record<string, unknown>>(
      `SELECT id, document_id, provider, model, status,
              processing_time_ms, error, created_at
         FROM ai_logs
         ${where}
         ORDER BY created_at DESC
         LIMIT $${p++} OFFSET $${p++}`,
      [...params, pageSize, offset],
    );
    // prompt and response are intentionally excluded from list view
    // (they can be large; accessible per-row if needed in future)

    res.json({
      data:     rows,
      total,
      page,
      pageSize,
      pages:    Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/documents/:id ─────────────────────────────────────────────────

router.get('/documents/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query<Record<string, unknown>>(
      `SELECT id, document_id, status, result, error, attempts, created_at, updated_at
         FROM ai_document_jobs WHERE document_id = $1`,
      [id],
    );
    if (rows.length === 0) {
      res.json(null);
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ai/documents/:id/retry ─────────────────────────────────────────

router.post('/documents/:id/retry', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { rows: docRows } = await pool.query<{ id: string }>(
      'SELECT id FROM documents WHERE id = $1', [id],
    );
    if (docRows.length === 0) {
      throw new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${id} not found`);
    }

    await queueDocument(id, pool);

    const { rows } = await pool.query<Record<string, unknown>>(
      'SELECT * FROM ai_document_jobs WHERE document_id = $1', [id],
    );
    res.json(rows[0] ?? null);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ai/documents/:id/accept ────────────────────────────────────────

router.post('/documents/:id/accept', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id }    = req.params;
    const { fields } = req.body as { fields?: string[] };
    await acceptOrReject(id, fields ?? [], 'accepted', pool);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ai/documents/:id/reject ────────────────────────────────────────

router.post('/documents/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id }    = req.params;
    const { fields } = req.body as { fields?: string[] };
    await acceptOrReject(id, fields ?? [], 'rejected', pool);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ── Accept / reject helper ────────────────────────────────────────────────────

const EXTRACTABLE_FIELDS = new Set([
  'supplier', 'invoice_number', 'invoice_date', 'currency',
  'subtotal', 'vat', 'total', 'document_type', 'summary',
]);

async function acceptOrReject(
  documentId: string,
  fields:     string[],
  action:     'accepted' | 'rejected',
  pool_:      typeof pool,
): Promise<void> {
  const { rows } = await pool_.query<{ result: Record<string, unknown> | null }>(
    'SELECT result FROM ai_document_jobs WHERE document_id = $1 AND status = $2',
    [documentId, 'completed'],
  );

  if (rows.length === 0 || !rows[0].result) {
    throw new AppError(404, 'AI_JOB_NOT_FOUND',
      `No completed AI job found for document ${documentId}`);
  }

  const result       = rows[0].result as Record<string, Record<string, unknown>>;
  const targetFields = fields.length > 0
    ? fields.filter((f) => EXTRACTABLE_FIELDS.has(f))
    : [...EXTRACTABLE_FIELDS];

  const directSets: { col: string; val: string }[] = [];
  const metaSets:   { key: string; val: string }[] = [];

  const FIELD_MAP: Record<string, { col: string; meta?: string }> = {
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

  const VALID_TYPES = new Set([
    'invoice', 'receipt', 'bank_statement',
    'credit_note', 'debit_note', 'po', 'attachment',
  ]);

  for (const f of targetFields) {
    const fieldData = result[f];
    if (!fieldData || fieldData.value == null) continue;

    const value   = String(fieldData.value);
    const mapping = FIELD_MAP[f];
    if (!mapping) continue;

    result[f] = { ...fieldData, action };

    if (action === 'accepted') {
      if (mapping.meta) {
        metaSets.push({ key: mapping.meta, val: value });
      } else {
        if (mapping.col === 'type'   && !VALID_TYPES.has(value)) continue;
        if (mapping.col === 'amount' && (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) <= 0)) continue;
        directSets.push({ col: mapping.col, val: value });
      }
    }
  }

  // Apply accepted values to the document
  if (action === 'accepted' && (directSets.length > 0 || metaSets.length > 0)) {
    const setClauses: string[] = ['updated_at = now()'];
    const params: unknown[]    = [documentId];
    let p = 2;

    for (const { col, val } of directSets) {
      setClauses.push(`${col} = $${p++}`);
      params.push(val);
    }
    if (metaSets.length > 0) {
      let jsonbExpr = 'COALESCE(metadata, \'{}\'::jsonb)';
      for (const { key, val } of metaSets) {
        jsonbExpr = `jsonb_set(${jsonbExpr}, '{${key}}', $${p++}::jsonb)`;
        params.push(JSON.stringify(val));
      }
      setClauses.push(`metadata = ${jsonbExpr}`);
    }

    await pool_.query(
      `UPDATE documents SET ${setClauses.join(', ')} WHERE id = $1`, params,
    );

    logger.info({ documentId, accepted: targetFields }, 'AI suggestions accepted and applied');
  }

  // Persist the updated result (with action labels)
  await pool_.query(
    'UPDATE ai_document_jobs SET result = $2::jsonb, updated_at = now() WHERE document_id = $1',
    [documentId, JSON.stringify(result)],
  );
}

export default router;

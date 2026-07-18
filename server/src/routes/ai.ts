/**
 * AI Routes — /api/ai/*
 *
 * Phase 1: Settings CRUD + connectivity test stub.
 *   GET  /api/ai/settings                  — read current settings
 *   PUT  /api/ai/settings                  — update settings
 *   POST /api/ai/settings/test-connection  — verify provider connectivity
 *
 * Security invariant: api_key_encrypted is NEVER returned to the frontend.
 *   The frontend receives only api_key_set: boolean.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { pool }                       from '../db/index';
import { AppError }                   from '../middleware/errorHandler';
import { logger }                     from '../logger';
import { createProvider, loadProviderConfig } from '../ai';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

type PolicyValue = 'automatic' | 'review' | 'suggestion';
type ProviderValue = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama';

const VALID_POLICIES   = new Set<string>(['automatic', 'review', 'suggestion']);
const VALID_PROVIDERS  = new Set<string>(['openai', 'anthropic', 'gemini', 'openrouter', 'ollama']);

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

/** Ensure the singleton row exists (idempotent). */
async function ensureRow() {
  await pool.query(
    `INSERT INTO ai_settings (id) VALUES (1) ON CONFLICT DO NOTHING`,
  );
}

// ── GET /api/ai/settings ──────────────────────────────────────────────────────

router.get('/settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureRow();
    const { rows } = await pool.query<Record<string, unknown>>(
      `SELECT * FROM ai_settings WHERE id = 1`,
    );
    if (rows.length === 0) throw new AppError(500, 'AI_SETTINGS_MISSING', 'AI settings row not found');
    res.json(sanitiseRow(rows[0]));
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/ai/settings ──────────────────────────────────────────────────────

router.put('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureRow();

    const b = req.body as Record<string, unknown>;

    // Build SET clause dynamically from allowed fields
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
        // Never log the key value
        addParam('api_key_encrypted', b.api_key);
        logger.info({ col: 'api_key_encrypted' }, 'AI API key updated');
      }
    }

    if (typeof b.confidence_threshold === 'number') {
      const t = Math.round(b.confidence_threshold);
      if (t < 50 || t > 100) throw new AppError(400, 'INVALID_THRESHOLD', 'confidence_threshold must be 50–100');
      addParam('confidence_threshold', t);
    }

    if (isPolicy(b.approval_policy))       addParam('approval_policy',       b.approval_policy);
    if (isPolicy(b.policy_category))       addParam('policy_category',       b.policy_category);
    if (isPolicy(b.policy_branch))         addParam('policy_branch',         b.policy_branch);
    if (isPolicy(b.policy_invoice_date))   addParam('policy_invoice_date',   b.policy_invoice_date);
    if (isPolicy(b.policy_invoice_number)) addParam('policy_invoice_number', b.policy_invoice_number);
    if (isPolicy(b.policy_supplier))       addParam('policy_supplier',       b.policy_supplier);
    if (isPolicy(b.policy_tax))            addParam('policy_tax',            b.policy_tax);
    if (isPolicy(b.policy_currency))       addParam('policy_currency',       b.policy_currency);

    if (typeof b.log_enabled      === 'boolean') addParam('log_enabled',      b.log_enabled);
    if (typeof b.store_prompts    === 'boolean') addParam('store_prompts',    b.store_prompts);
    if (typeof b.store_responses  === 'boolean') addParam('store_responses',  b.store_responses);
    if (typeof b.max_log_entries  === 'number')  addParam('max_log_entries',  Math.max(0, Math.round(b.max_log_entries)));

    if (sets.length === 1) {
      // Nothing changed — return current settings
      const { rows } = await pool.query<Record<string, unknown>>(
        'SELECT * FROM ai_settings WHERE id = 1',
      );
      res.json(sanitiseRow(rows[0]));
      return;
    }

    const { rows } = await pool.query<Record<string, unknown>>(
      `UPDATE ai_settings SET ${sets.join(', ')} WHERE id = 1 RETURNING *`,
      params,
    );

    res.json(sanitiseRow(rows[0]));
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ai/settings/test-connection ─────────────────────────────────────

/**
 * Tests connectivity to the configured AI provider via the provider abstraction.
 * Phase 2: routes through createProvider() → provider.healthCheck().
 */
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

export default router;

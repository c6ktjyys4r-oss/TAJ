/**
 * AI Settings route tests (Phase 13)
 *
 * Unit-level integration tests: the express router is exercised end-to-end,
 * but the pg pool and ai/* modules are replaced with vi.mock() so no real
 * database or network connection is required.
 *
 * Covers:
 *   GET  /api/ai/settings          — response shape, security invariants
 *   PUT  /api/ai/settings          — field persistence, input validation
 *   POST /api/ai/settings/test-connection — connectivity probe paths
 */

// ── Module mocks (vi.mock is hoisted by vitest's transformer) ─────────────────

vi.mock('../db/index', () => ({
  pool: {
    connect: vi.fn(),
    query:   vi.fn(),
    end:     vi.fn(),
  },
  db: {},
}));

// Minimal ai module mocks — we test the route layer, not the AI engine itself
vi.mock('../ai', async (importOriginal) => {
  const original = await importOriginal<typeof import('../ai')>();
  return {
    ...original,
    createProvider:     vi.fn(),
    loadProviderConfig: vi.fn(),
    queueDocument:      vi.fn(),
    cancelJob:          vi.fn(),
  };
});

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { pool } from '../db/index';
import { loadProviderConfig } from '../ai';
import aiRouter from '../routes/ai';

const poolQuery = pool.query as ReturnType<typeof vi.fn>;

// ── App ───────────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/api/ai', aiRouter);

// ── Default settings row returned by GET ─────────────────────────────────────

const DEFAULT_SETTINGS_ROW = {
  id: 1,
  enabled: false,
  process_after_upload: false,
  assistant_enabled: true,
  provider: 'openai',
  model: 'gpt-4o-mini',
  api_key_encrypted: null,
  base_url: null,
  confidence_threshold: 90,
  approval_policy: 'review',
  log_enabled: false,
  store_prompts: false,
  store_responses: false,
  max_log_entries: 1000,
  temperature: 0.1,
  max_tokens: 1024,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const DEFAULT_FIELD_POLICIES_ROW = {
  policy_category:       'review',
  policy_branch:         'review',
  policy_invoice_date:   'review',
  policy_invoice_number: 'review',
  policy_supplier:       'review',
  policy_tax:            'review',
  policy_currency:       'review',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Set up pool.query to return responses in sequence.
 * Any call beyond the provided responses returns { rows: [] }.
 */
function setupQuerySequence(responses: (Record<string, unknown> | Record<string, unknown>[])[]) {
  let i = 0;
  poolQuery.mockImplementation(async () => {
    const resp = responses[i++];
    if (!resp) return { rows: [] };
    if (Array.isArray(resp)) return { rows: resp };
    return { rows: [resp] };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── GET /api/ai/settings ──────────────────────────────────────────────────────

describe('GET /api/ai/settings', () => {
  it('returns a settings object with expected shape', async () => {
    setupQuerySequence([
      [],                          // ensureSettingsRow INSERT ON CONFLICT
      [],                          // ensureFieldPoliciesRow INSERT ON CONFLICT
      DEFAULT_SETTINGS_ROW,        // SELECT * FROM ai_settings
      DEFAULT_FIELD_POLICIES_ROW,  // SELECT FROM ai_field_policies
    ]);

    const res = await request(app).get('/api/ai/settings').expect(200);
    const body = res.body as Record<string, unknown>;

    expect(body.id).toBe(1);
    expect(body.enabled).toBe(false);
    expect(body.provider).toBe('openai');
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.confidence_threshold).toBe(90);
  });

  it('never returns api_key_encrypted — only api_key_set flag', async () => {
    const rowWithKey = { ...DEFAULT_SETTINGS_ROW, api_key_encrypted: 'sk-secret-key' };
    setupQuerySequence([[], [], rowWithKey, DEFAULT_FIELD_POLICIES_ROW]);

    const res = await request(app).get('/api/ai/settings').expect(200);
    const body = res.body as Record<string, unknown>;

    expect(body).not.toHaveProperty('api_key_encrypted');
    expect(body.api_key_set).toBe(true);
    expect(JSON.stringify(body)).not.toContain('sk-secret-key');
  });

  it('returns api_key_set: false when key is null', async () => {
    setupQuerySequence([[], [], DEFAULT_SETTINGS_ROW, DEFAULT_FIELD_POLICIES_ROW]);

    const res = await request(app).get('/api/ai/settings').expect(200);
    expect(res.body.api_key_set).toBe(false);
  });

  it('returns temperature and max_tokens fields (Phase 4)', async () => {
    setupQuerySequence([[], [], DEFAULT_SETTINGS_ROW, DEFAULT_FIELD_POLICIES_ROW]);

    const res = await request(app).get('/api/ai/settings').expect(200);
    expect(res.body).toHaveProperty('temperature');
    expect(res.body).toHaveProperty('max_tokens');
    expect(res.body.temperature).toBeCloseTo(0.1, 2);
    expect(res.body.max_tokens).toBe(1024);
  });
});

// ── PUT /api/ai/settings ──────────────────────────────────────────────────────

describe('PUT /api/ai/settings', () => {
  /** Minimal happy-path mock: two ensures + UPDATE RETURNING + field-policy read. */
  function setupPutSuccess(updatedRow: Record<string, unknown> = DEFAULT_SETTINGS_ROW) {
    setupQuerySequence([
      [],            // ensureSettingsRow
      [],            // ensureFieldPoliciesRow
      updatedRow,    // UPDATE ai_settings RETURNING *
      [],            // UPDATE ai_field_policies
      DEFAULT_FIELD_POLICIES_ROW, // SELECT FROM ai_field_policies
    ]);
  }

  it('accepts a partial update and returns 200', async () => {
    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, enabled: true });

    const res = await request(app)
      .put('/api/ai/settings')
      .send({ enabled: true })
      .expect(200);

    expect(res.body.enabled).toBe(true);
  });

  it('never returns api_key_encrypted in PUT response', async () => {
    const rowWithKey = { ...DEFAULT_SETTINGS_ROW, api_key_encrypted: 'sk-updated-key' };
    setupPutSuccess(rowWithKey);

    const res = await request(app)
      .put('/api/ai/settings')
      .send({ api_key: 'sk-updated-key' })
      .expect(200);

    expect(res.body).not.toHaveProperty('api_key_encrypted');
    expect(res.body.api_key_set).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain('sk-updated-key');
  });

  it('marks api_key_set: false when api_key is cleared', async () => {
    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, api_key_encrypted: null });

    const res = await request(app)
      .put('/api/ai/settings')
      .send({ api_key: '' })
      .expect(200);

    expect(res.body.api_key_set).toBe(false);
  });

  it('validates confidence_threshold — rejects 49 (below 50)', async () => {
    setupQuerySequence([[], []]);
    await request(app)
      .put('/api/ai/settings')
      .send({ confidence_threshold: 49 })
      .expect(400);
  });

  it('validates confidence_threshold — rejects 101 (above 100)', async () => {
    setupQuerySequence([[], []]);
    await request(app)
      .put('/api/ai/settings')
      .send({ confidence_threshold: 101 })
      .expect(400);
  });

  it('accepts confidence_threshold at boundary values 50 and 100', async () => {
    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, confidence_threshold: 50 });
    await request(app)
      .put('/api/ai/settings')
      .send({ confidence_threshold: 50 })
      .expect(200);

    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, confidence_threshold: 100 });
    await request(app)
      .put('/api/ai/settings')
      .send({ confidence_threshold: 100 })
      .expect(200);
  });

  // ── Phase 4: temperature ────────────────────────────────────────────────────

  it('accepts temperature within 0.0–2.0', async () => {
    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, temperature: 0.7 });
    const res = await request(app)
      .put('/api/ai/settings')
      .send({ temperature: 0.7 })
      .expect(200);
    expect(res.body.temperature).toBeCloseTo(0.7, 2);
  });

  it('rejects temperature below 0', async () => {
    setupQuerySequence([[], []]);
    await request(app)
      .put('/api/ai/settings')
      .send({ temperature: -0.1 })
      .expect(400);
  });

  it('rejects temperature above 2', async () => {
    setupQuerySequence([[], []]);
    await request(app)
      .put('/api/ai/settings')
      .send({ temperature: 2.1 })
      .expect(400);
  });

  it('accepts temperature at boundary values 0.0 and 2.0', async () => {
    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, temperature: 0.0 });
    await request(app)
      .put('/api/ai/settings')
      .send({ temperature: 0.0 })
      .expect(200);

    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, temperature: 2.0 });
    await request(app)
      .put('/api/ai/settings')
      .send({ temperature: 2.0 })
      .expect(200);
  });

  // ── Phase 4: max_tokens ─────────────────────────────────────────────────────

  it('accepts max_tokens within 1–8192', async () => {
    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, max_tokens: 2048 });
    const res = await request(app)
      .put('/api/ai/settings')
      .send({ max_tokens: 2048 })
      .expect(200);
    expect(res.body.max_tokens).toBe(2048);
  });

  it('rejects max_tokens below 1 (zero)', async () => {
    setupQuerySequence([[], []]);
    await request(app)
      .put('/api/ai/settings')
      .send({ max_tokens: 0 })
      .expect(400);
  });

  it('rejects max_tokens above 8192', async () => {
    setupQuerySequence([[], []]);
    await request(app)
      .put('/api/ai/settings')
      .send({ max_tokens: 8193 })
      .expect(400);
  });

  it('accepts max_tokens at boundary values 1 and 8192', async () => {
    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, max_tokens: 1 });
    await request(app)
      .put('/api/ai/settings')
      .send({ max_tokens: 1 })
      .expect(200);

    setupPutSuccess({ ...DEFAULT_SETTINGS_ROW, max_tokens: 8192 });
    await request(app)
      .put('/api/ai/settings')
      .send({ max_tokens: 8192 })
      .expect(200);
  });
});

// ── POST /api/ai/settings/test-connection ─────────────────────────────────────

describe('POST /api/ai/settings/test-connection', () => {
  it('returns ok:false when AI is disabled', async () => {
    (loadProviderConfig as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      config:   { provider: 'openai', model: 'gpt-4o-mini', apiKey: 'sk-key', baseUrl: null, temperature: 0.1, maxTokens: 1024 },
      settings: { ...DEFAULT_SETTINGS_ROW, enabled: false },
    });

    const res = await request(app)
      .post('/api/ai/settings/test-connection')
      .send({})
      .expect(200);

    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  it('returns ok:false when no API key is configured', async () => {
    (loadProviderConfig as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      config:   { provider: 'openai', model: 'gpt-4o-mini', apiKey: null, baseUrl: null, temperature: 0.1, maxTokens: 1024 },
      settings: { ...DEFAULT_SETTINGS_ROW, enabled: true, api_key_encrypted: null },
    });

    const res = await request(app)
      .post('/api/ai/settings/test-connection')
      .send({})
      .expect(200);

    expect(res.body.ok).toBe(false);
    expect(res.body.error).toContain('key');
  });
});

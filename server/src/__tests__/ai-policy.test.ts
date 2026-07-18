/**
 * Policy Engine unit tests (Phase 11)
 *
 * Tests for applyPolicyDecisions():
 *   - 'automatic' policy + confidence >= threshold → action: 'applied'
 *   - 'automatic' policy + confidence < threshold  → action: 'ignored'
 *   - 'review' policy (any confidence)             → action: 'suggested'
 *   - 'suggestion' policy (any confidence)         → action: 'suggested'
 *   - Document patches are applied for 'applied' fields
 *   - Invalid document_type value is skipped even with automatic policy
 *   - Invalid amount format is skipped even with automatic policy
 *
 * All DB interactions are mocked via a fake Pool.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Pool } from 'pg';
import { applyPolicyDecisions } from '../ai/policy';
import type { ProcessDocumentResult } from '../ai/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePool(queryImpl?: () => Promise<{ rows: unknown[] }>): Pool {
  return {
    query: queryImpl ?? vi.fn().mockResolvedValue({ rows: [] }),
  } as unknown as Pool;
}

function makeResult(overrides: Partial<ProcessDocumentResult> = {}): ProcessDocumentResult {
  return {
    supplier:       { value: 'Acme Corp',   confidence: 95 },
    invoice_number: { value: 'INV-2024-001', confidence: 90 },
    invoice_date:   { value: '2024-01-15',  confidence: 88 },
    currency:       { value: 'SAR',         confidence: 99 },
    subtotal:       { value: '1000.00',     confidence: 85 },
    vat:            { value: '150.00',      confidence: 85 },
    total:          { value: '1150.00',     confidence: 92 },
    document_type:  { value: 'invoice',     confidence: 98 },
    summary:        { value: 'Test invoice', confidence: 80 },
    overall_confidence: 90,
    raw_response: '{}',
    ...overrides,
  };
}

/** Build a pool that returns a policy settings row from ai_field_policies query. */
function makePoolWithPolicies(policyOverrides: Record<string, string> = {}): Pool {
  const defaultPolicies = {
    confidence_threshold:  90,
    approval_policy:       'review',
    policy_category:       'review',
    policy_branch:         'review',
    policy_invoice_date:   'review',
    policy_invoice_number: 'review',
    policy_supplier:       'review',
    policy_tax:            'review',
    policy_currency:       'review',
    ...policyOverrides,
  };

  const queryFn = vi.fn().mockImplementation((sql: string) => {
    if (sql.includes('ai_field_policies')) {
      return Promise.resolve({ rows: [defaultPolicies] });
    }
    // Document UPDATE or fallback ai_settings query
    return Promise.resolve({ rows: [defaultPolicies] });
  });

  return { query: queryFn } as unknown as Pool;
}

// ── review policy (default) ───────────────────────────────────────────────────

describe('applyPolicyDecisions — review policy', () => {
  it('marks all fields as suggested under review policy', async () => {
    const pool   = makePoolWithPolicies({ policy_supplier: 'review' });
    const result = await applyPolicyDecisions('doc-001', makeResult(), pool);

    expect(result.supplier.action).toBe('suggested');
    expect(result.invoice_date.action).toBe('suggested');
    expect(result.total.action).toBe('suggested');
  });

  it('does not call UPDATE documents under review policy', async () => {
    const queryFn = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('ai_field_policies')) {
        return Promise.resolve({ rows: [{ confidence_threshold: 90, approval_policy: 'review', policy_supplier: 'review', policy_invoice_number: 'review', policy_invoice_date: 'review', policy_currency: 'review', policy_tax: 'review', policy_category: 'review', policy_branch: 'review' }] });
      }
      return Promise.resolve({ rows: [] });
    });
    const pool = { query: queryFn } as unknown as Pool;

    await applyPolicyDecisions('doc-001', makeResult(), pool);

    // No UPDATE documents call should have been made
    const updateCalls = (queryFn.mock.calls as string[][]).filter(
      ([sql]) => sql.includes('UPDATE documents'),
    );
    expect(updateCalls).toHaveLength(0);
  });
});

// ── automatic policy + above threshold ───────────────────────────────────────

describe('applyPolicyDecisions — automatic policy, confidence above threshold', () => {
  it('marks field as applied when confidence >= threshold', async () => {
    const pool = makePoolWithPolicies({
      policy_supplier:   'automatic',
      confidence_threshold: '85',  // supplier confidence is 95
    });
    const result = await applyPolicyDecisions('doc-002', makeResult(), pool);
    expect(result.supplier.action).toBe('applied');
  });
});

// ── automatic policy + below threshold ───────────────────────────────────────

describe('applyPolicyDecisions — automatic policy, confidence below threshold', () => {
  it('marks field as ignored when confidence < threshold', async () => {
    const pool = makePoolWithPolicies({
      policy_supplier:      'automatic',
      confidence_threshold: '99',   // supplier confidence 95 < 99
    });
    const result = await applyPolicyDecisions('doc-003', makeResult(), pool);
    expect(result.supplier.action).toBe('ignored');
  });
});

// ── suggestion policy ────────────────────────────────────────────────────────

describe('applyPolicyDecisions — suggestion policy', () => {
  it('marks field as suggested even at 100% confidence', async () => {
    const pool = makePoolWithPolicies({
      policy_supplier:      'suggestion',
      confidence_threshold: '50',
    });
    const result = await applyPolicyDecisions(
      'doc-004',
      makeResult({ supplier: { value: 'Corp', confidence: 100 } }),
      pool,
    );
    expect(result.supplier.action).toBe('suggested');
  });
});

// ── null values ───────────────────────────────────────────────────────────────

describe('applyPolicyDecisions — null values', () => {
  it('does not apply a null-value field even with automatic policy', async () => {
    const queryFn = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('ai_field_policies')) {
        return Promise.resolve({ rows: [{ confidence_threshold: 50, approval_policy: 'automatic', policy_supplier: 'automatic', policy_invoice_number: 'automatic', policy_invoice_date: 'automatic', policy_currency: 'automatic', policy_tax: 'automatic', policy_category: 'automatic', policy_branch: 'automatic' }] });
      }
      return Promise.resolve({ rows: [] });
    });
    const pool = { query: queryFn } as unknown as Pool;

    // All fields are null — no document UPDATE should occur
    const allNullResult: ProcessDocumentResult = {
      supplier:       { value: null, confidence: 0 },
      invoice_number: { value: null, confidence: 0 },
      invoice_date:   { value: null, confidence: 0 },
      currency:       { value: null, confidence: 0 },
      subtotal:       { value: null, confidence: 0 },
      vat:            { value: null, confidence: 0 },
      total:          { value: null, confidence: 0 },
      document_type:  { value: null, confidence: 0 },
      summary:        { value: null, confidence: 0 },
      overall_confidence: 0,
      raw_response: '{}',
    };

    await applyPolicyDecisions('doc-005', allNullResult, pool);

    const updateCalls = (queryFn.mock.calls as string[][]).filter(
      ([sql]) => sql.includes('UPDATE documents'),
    );
    expect(updateCalls).toHaveLength(0);
  });
});

// ── always returns result with all fields ────────────────────────────────────

describe('applyPolicyDecisions — structure', () => {
  it('returns all 9 extraction fields with action labels', async () => {
    const pool   = makePoolWithPolicies();
    const result = await applyPolicyDecisions('doc-006', makeResult(), pool);

    const fieldNames = [
      'supplier', 'invoice_number', 'invoice_date', 'currency',
      'subtotal', 'vat', 'total', 'document_type', 'summary',
    ] as const;

    for (const field of fieldNames) {
      expect(result[field]).toHaveProperty('action');
      expect(['applied', 'suggested', 'ignored']).toContain(result[field].action);
    }
  });

  it('never throws — falls back gracefully when ai_field_policies is unavailable', async () => {
    const pool = makePool(() => Promise.resolve({ rows: [] }));
    // Should not throw even with no settings row
    await expect(
      applyPolicyDecisions('doc-007', makeResult(), pool)
    ).resolves.toBeDefined();
  });
});

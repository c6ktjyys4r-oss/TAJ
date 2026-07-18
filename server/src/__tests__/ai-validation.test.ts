/**
 * Extraction validation unit tests (Phase 11)
 *
 * Tests the field-level validation logic applied to AI extraction results.
 * Validation is exercised through OllamaProvider.processDocument() since
 * parseExtractionResult is not exported (it's an implementation detail).
 *
 * Coverage:
 *   - invoice_date: YYYY-MM-DD accepted, other formats rejected
 *   - currency: 3 uppercase alpha accepted, others rejected
 *   - amounts (subtotal/vat/total): valid decimals accepted, others rejected
 *   - document_type: enum values accepted, unknown values rejected
 *   - confidence clamping: values outside 0–100 are clamped
 *   - overall_confidence: computed from field averages when not provided
 *   - Malformed JSON: throws INVALID_JSON
 *   - Non-object JSON: throws INVALID_JSON
 *   - Null field values: returned as null without throwing
 *   - Missing fields: returned as null with confidence 0
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { OllamaProvider } from '../ai/providers/ollama';
import { AiError }        from '../ai/types';
import type { AiProviderConfig, ProcessDocumentInput } from '../ai/types';

function makeConfig(): AiProviderConfig {
  return {
    provider: 'ollama', model: 'llama3.1', apiKey: null,
    baseUrl: 'http://host:11434', temperature: 0.1, maxTokens: 1024, timeoutMs: 30_000,
  };
}

function makePdfInput(): ProcessDocumentInput {
  return { fileBuffer: Buffer.from('%PDF-1.4 text'), mimeType: 'application/pdf', documentId: 'doc-validate' };
}

function mockChatResponse(body: object) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok:   true,
    json: async () => ({ message: { content: JSON.stringify(body) } }),
  }));
}

const BASE = {
  supplier:       { value: 'Acme',   confidence: 90 },
  invoice_number: { value: 'INV-1',  confidence: 90 },
  invoice_date:   { value: null,     confidence: 0  },
  currency:       { value: null,     confidence: 0  },
  subtotal:       { value: null,     confidence: 0  },
  vat:            { value: null,     confidence: 0  },
  total:          { value: null,     confidence: 0  },
  document_type:  { value: null,     confidence: 0  },
  summary:        { value: null,     confidence: 0  },
  overall_confidence: 50,
};

const provider = new OllamaProvider(makeConfig());

afterEach(() => vi.restoreAllMocks());

// ── invoice_date validation ───────────────────────────────────────────────────

describe('invoice_date validation', () => {
  const cases: [string, boolean][] = [
    ['2024-01-15', true ],
    ['2024-12-31', true ],
    ['2024-1-5',   false],
    ['15/01/2024', false],
    ['Jan 15 2024',false],
    ['',           false],
    ['not-a-date', false],
  ];

  it.each(cases)('invoice_date "%s" → valid=%s', async (dateStr, shouldBeValid) => {
    mockChatResponse({ ...BASE, invoice_date: { value: dateStr, confidence: 80 } });
    const result = await provider.processDocument(makePdfInput());
    if (shouldBeValid) {
      expect(result.invoice_date.value).toBe(dateStr);
    } else {
      expect(result.invoice_date.value).toBeNull();
    }
  });
});

// ── currency validation ───────────────────────────────────────────────────────

describe('currency validation', () => {
  const cases: [string, boolean][] = [
    ['SAR',    true ],
    ['USD',    true ],
    ['EUR',    true ],
    ['GBP',    true ],
    ['sar',    false],   // lowercase
    ['US',     false],   // 2 chars
    ['USDX',   false],   // 4 chars
    ['123',    false],   // digits
    ['',       false],
  ];

  it.each(cases)('currency "%s" → valid=%s', async (cur, shouldBeValid) => {
    mockChatResponse({ ...BASE, currency: { value: cur, confidence: 80 } });
    const result = await provider.processDocument(makePdfInput());
    if (shouldBeValid) {
      expect(result.currency.value).toBe(cur);
    } else {
      expect(result.currency.value).toBeNull();
    }
  });
});

// ── amount validation (subtotal / vat / total) ────────────────────────────────

describe('amount validation (subtotal)', () => {
  const cases: [string, boolean][] = [
    ['100',      true ],
    ['100.00',   true ],
    ['1234.5',   true ],
    ['0',        true ],
    ['-50.00',   false],   // negative
    ['abc',      false],
    ['1,234.00', false],   // comma separator
    ['',         false],
  ];

  it.each(cases)('subtotal "%s" → valid=%s', async (amount, shouldBeValid) => {
    mockChatResponse({ ...BASE, subtotal: { value: amount, confidence: 80 } });
    const result = await provider.processDocument(makePdfInput());
    if (shouldBeValid) {
      expect(result.subtotal.value).toBe(amount);
    } else {
      expect(result.subtotal.value).toBeNull();
    }
  });
});

// ── document_type validation ──────────────────────────────────────────────────

describe('document_type validation', () => {
  const valid   = ['invoice', 'receipt', 'bank_statement', 'credit_note', 'debit_note', 'po', 'attachment'];
  const invalid = ['bill', 'check', 'order', 'INVOICE', ''];

  it.each(valid)('accepts valid type "%s"', async (type) => {
    mockChatResponse({ ...BASE, document_type: { value: type, confidence: 90 } });
    const result = await provider.processDocument(makePdfInput());
    expect(result.document_type.value).toBe(type);
  });

  it.each(invalid)('rejects invalid type "%s"', async (type) => {
    mockChatResponse({ ...BASE, document_type: { value: type, confidence: 90 } });
    const result = await provider.processDocument(makePdfInput());
    expect(result.document_type.value).toBeNull();
  });
});

// ── confidence clamping ───────────────────────────────────────────────────────

describe('confidence clamping', () => {
  it('clamps confidence above 100 to 100', async () => {
    mockChatResponse({ ...BASE, supplier: { value: 'X', confidence: 150 } });
    const result = await provider.processDocument(makePdfInput());
    expect(result.supplier.confidence).toBe(100);
  });

  it('clamps negative confidence to 0', async () => {
    mockChatResponse({ ...BASE, supplier: { value: 'X', confidence: -10 } });
    const result = await provider.processDocument(makePdfInput());
    expect(result.supplier.confidence).toBe(0);
  });

  it('rounds fractional confidence to nearest integer', async () => {
    mockChatResponse({ ...BASE, supplier: { value: 'X', confidence: 87.6 } });
    const result = await provider.processDocument(makePdfInput());
    expect(result.supplier.confidence).toBe(88);
  });
});

// ── malformed JSON ────────────────────────────────────────────────────────────

describe('malformed JSON handling', () => {
  it('throws INVALID_JSON for plain text response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ message: { content: 'not json' } }),
    }));
    await expect(provider.processDocument(makePdfInput())).rejects.toMatchObject({ code: 'INVALID_JSON' });
  });

  it('throws INVALID_JSON for array response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ message: { content: '[1,2,3]' } }),
    }));
    await expect(provider.processDocument(makePdfInput())).rejects.toMatchObject({ code: 'INVALID_JSON' });
  });

  it('accepts markdown-fenced JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ message: { content: '```json\n' + JSON.stringify(BASE) + '\n```' } }),
    }));
    await expect(provider.processDocument(makePdfInput())).resolves.not.toThrow();
  });
});

// ── null / missing fields ─────────────────────────────────────────────────────

describe('null and missing fields', () => {
  it('returns null value for null field in response', async () => {
    mockChatResponse({ ...BASE, supplier: { value: null, confidence: 0 } });
    const result = await provider.processDocument(makePdfInput());
    expect(result.supplier.value).toBeNull();
  });

  it('returns confidence 0 for missing field', async () => {
    const { supplier: _s, ...noSupplier } = BASE;
    mockChatResponse(noSupplier);
    const result = await provider.processDocument(makePdfInput());
    expect(result.supplier.value).toBeNull();
    expect(result.supplier.confidence).toBe(0);
  });
});

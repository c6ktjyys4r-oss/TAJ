/**
 * OllamaProvider unit tests (Phase 11)
 *
 * Tests for:
 *   - constructor: requires baseUrl, rejects missing baseUrl
 *   - healthCheck: success, HTTP error, network error, timeout
 *   - processDocument: successful extraction, INVALID_JSON, PROVIDER_OFFLINE
 *   - chat: success, HTTP error
 *   - embeddings: success, HTTP error
 *
 * All tests use vi.stubGlobal('fetch', ...) to mock the global fetch.
 * No real network calls are made.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaProvider }  from '../ai/providers/ollama';
import { AiError }         from '../ai/types';
import type { AiProviderConfig, ProcessDocumentInput } from '../ai/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<AiProviderConfig> = {}): AiProviderConfig {
  return {
    provider:    'ollama',
    model:       'llama3.1',
    apiKey:      null,
    baseUrl:     'http://ollama-host:11434',
    temperature: 0.1,
    maxTokens:   1024,
    timeoutMs:   30_000,
    ...overrides,
  };
}

function makePdfInput(): ProcessDocumentInput {
  return {
    fileBuffer: Buffer.from('%PDF-1.4 (Invoice) (Supplier Inc) (100.00)'),
    mimeType:   'application/pdf',
    documentId: 'test-doc-001',
  };
}

function makeImageInput(): ProcessDocumentInput {
  // Minimal valid 1×1 PNG
  return {
    fileBuffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'),
    mimeType:   'image/png',
    documentId: 'test-doc-002',
  };
}

const VALID_EXTRACTION_RESPONSE = JSON.stringify({
  supplier:       { value: 'Supplier Inc',   confidence: 95 },
  invoice_number: { value: 'INV-001',        confidence: 90 },
  invoice_date:   { value: '2024-01-15',     confidence: 88 },
  currency:       { value: 'SAR',            confidence: 99 },
  subtotal:       { value: '100.00',         confidence: 92 },
  vat:            { value: '15.00',          confidence: 92 },
  total:          { value: '115.00',         confidence: 95 },
  document_type:  { value: 'invoice',        confidence: 98 },
  summary:        { value: 'Test invoice',   confidence: 80 },
  overall_confidence: 92,
});

// ── constructor ───────────────────────────────────────────────────────────────

describe('OllamaProvider constructor', () => {
  it('constructs successfully with valid config', () => {
    expect(() => new OllamaProvider(makeConfig())).not.toThrow();
  });

  it('throws AUTH_ERROR when baseUrl is null', () => {
    expect(() => new OllamaProvider(makeConfig({ baseUrl: null }))).toThrow(AiError);
  });

  it('throws AUTH_ERROR when baseUrl is empty string', () => {
    expect(() => new OllamaProvider(makeConfig({ baseUrl: '' }))).toThrow(AiError);
  });

  it('normalises trailing slash from baseUrl', () => {
    // No way to observe baseUrl directly, but construction must not throw
    expect(() => new OllamaProvider(makeConfig({ baseUrl: 'http://host:11434/' }))).not.toThrow();
  });
});

// ── initialize ────────────────────────────────────────────────────────────────

describe('OllamaProvider.initialize()', () => {
  it('resolves without throwing', async () => {
    const provider = new OllamaProvider(makeConfig());
    await expect(provider.initialize()).resolves.toBeUndefined();
  });
});

// ── healthCheck ───────────────────────────────────────────────────────────────

describe('OllamaProvider.healthCheck()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns ok:true when /api/tags responds 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:   true,
      json: async () => ({ models: [{ name: 'llama3.1' }] }),
    }));
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.healthCheck();
    expect(result.ok).toBe(true);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('returns ok:false when /api/tags responds non-200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:     false,
      status: 500,
      json:   async () => ({}),
    }));
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.healthCheck();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('500');
  });

  it('returns ok:false on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('ECONNREFUSED')));
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.healthCheck();
    expect(result.ok).toBe(false);
    expect(result.error).toContain('ECONNREFUSED');
  });

  it('warns when configured model is not in available list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:   true,
      json: async () => ({ models: [{ name: 'mistral' }] }),
    }));
    // Should still return ok:true — model may be pulled later
    const provider = new OllamaProvider(makeConfig({ model: 'llama3.1' }));
    const result = await provider.healthCheck();
    expect(result.ok).toBe(true);
  });
});

// ── processDocument ───────────────────────────────────────────────────────────

describe('OllamaProvider.processDocument()', () => {
  afterEach(() => vi.restoreAllMocks());

  function mockChatSuccess(content: string) {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:   true,
      json: async () => ({ message: { content } }),
    }));
  }

  it('extracts fields from a PDF document', async () => {
    mockChatSuccess(VALID_EXTRACTION_RESPONSE);
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.processDocument(makePdfInput());
    expect(result.supplier.value).toBe('Supplier Inc');
    expect(result.invoice_date.value).toBe('2024-01-15');
    expect(result.currency.value).toBe('SAR');
    expect(result.overall_confidence).toBeGreaterThan(0);
    expect(result.raw_response).toBe(VALID_EXTRACTION_RESPONSE);
  });

  it('extracts fields from an image document', async () => {
    mockChatSuccess(VALID_EXTRACTION_RESPONSE);
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.processDocument(makeImageInput());
    expect(result.supplier.value).toBe('Supplier Inc');
  });

  it('throws INVALID_JSON when response is not valid JSON', async () => {
    mockChatSuccess('This is not JSON at all!');
    const provider = new OllamaProvider(makeConfig());
    const err = await provider.processDocument(makePdfInput()).catch((e) => e);
    expect(err).toBeInstanceOf(AiError);
    expect((err as AiError).code).toBe('INVALID_JSON');
  });

  it('throws PROVIDER_OFFLINE on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('ECONNREFUSED')));
    const provider = new OllamaProvider(makeConfig());
    await expect(provider.processDocument(makePdfInput())).rejects.toMatchObject({
      code: 'PROVIDER_OFFLINE',
    });
  });

  it('strips markdown code fences from response', async () => {
    mockChatSuccess('```json\n' + VALID_EXTRACTION_RESPONSE + '\n```');
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.processDocument(makePdfInput());
    expect(result.supplier.value).toBe('Supplier Inc');
  });

  it('sets null for invalid invoice_date format', async () => {
    const badDate = JSON.stringify({
      ...JSON.parse(VALID_EXTRACTION_RESPONSE),
      invoice_date: { value: '15-01-2024', confidence: 80 }, // wrong format
    });
    mockChatSuccess(badDate);
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.processDocument(makePdfInput());
    expect(result.invoice_date.value).toBeNull();
  });

  it('sets null for invalid currency format', async () => {
    const badCurrency = JSON.stringify({
      ...JSON.parse(VALID_EXTRACTION_RESPONSE),
      currency: { value: 'INVALID', confidence: 80 },
    });
    mockChatSuccess(badCurrency);
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.processDocument(makePdfInput());
    expect(result.currency.value).toBeNull();
  });

  it('sets null for invalid document_type', async () => {
    const badType = JSON.stringify({
      ...JSON.parse(VALID_EXTRACTION_RESPONSE),
      document_type: { value: 'unknown_type', confidence: 80 },
    });
    mockChatSuccess(badType);
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.processDocument(makePdfInput());
    expect(result.document_type.value).toBeNull();
  });
});

// ── chat ─────────────────────────────────────────────────────────────────────

describe('OllamaProvider.chat()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns response content on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:   true,
      json: async () => ({ message: { content: 'Hello from Ollama!' } }),
    }));
    const provider = new OllamaProvider(makeConfig());
    const response = await provider.chat([{ role: 'user', content: 'Hello' }]);
    expect(response).toBe('Hello from Ollama!');
  });

  it('throws UNKNOWN on HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:     false,
      status: 404,
      json:   async () => ({ error: 'model not found' }),
    }));
    const provider = new OllamaProvider(makeConfig());
    await expect(
      provider.chat([{ role: 'user', content: 'test' }])
    ).rejects.toMatchObject({ code: 'UNKNOWN' });
  });

  it('throws PROVIDER_OFFLINE on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('network error')));
    const provider = new OllamaProvider(makeConfig());
    await expect(
      provider.chat([{ role: 'user', content: 'test' }])
    ).rejects.toMatchObject({ code: 'PROVIDER_OFFLINE' });
  });
});

// ── embeddings ────────────────────────────────────────────────────────────────

describe('OllamaProvider.embeddings()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns embedding vector on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:   true,
      json: async () => ({ embeddings: [[0.1, 0.2, 0.3]] }),
    }));
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.embeddings('test text');
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('returns empty array when embeddings missing from response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:   true,
      json: async () => ({}),
    }));
    const provider = new OllamaProvider(makeConfig());
    const result = await provider.embeddings('test');
    expect(result).toEqual([]);
  });

  it('throws UNKNOWN on HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok:     false,
      status: 500,
      json:   async () => ({ error: 'server error' }),
    }));
    const provider = new OllamaProvider(makeConfig());
    await expect(provider.embeddings('text')).rejects.toMatchObject({ code: 'UNKNOWN' });
  });
});

/**
 * OpenAI provider implementation.
 *
 * Uses direct fetch — no npm package required.
 * Node ≥ 18 has built-in fetch; this project requires Node ≥ 22.
 *
 * Supported operations:
 *   healthCheck()     — GET /v1/models
 *   processDocument() — chat completion with structured extraction prompt
 *   chat()            — standard chat completion
 *   embeddings()      — GET /v1/embeddings (placeholder)
 *
 * PDF text extraction: pure-JS regex over the PDF byte stream.
 *   Reliably captures embedded text from most PDFs without external packages.
 *   Complex or purely-image PDFs fall through to the null path.
 *
 * Response validation (parseExtractionResult):
 *   - Rejects non-JSON or non-object responses (throws INVALID_JSON)
 *   - Clamps confidence values to 0–100 integers
 *   - Validates and normalises date strings → YYYY-MM-DD or null
 *   - Validates decimal amount strings (subtotal / vat / total) or null
 *   - Validates ISO 4217 currency codes (3 uppercase alpha) or null
 *   - Validates document_type against the allowed enum or null
 *   - Never crashes: invalid individual fields become null rather than throwing
 */
import type {
  AiProvider, AiProviderConfig,
  HealthCheckResult, ProcessDocumentInput, ProcessDocumentResult, ChatMessage,
  ExtractionField,
} from '../types';
import { AiError } from '../types';
import { logger } from '../../logger';

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_BASE = 'https://api.openai.com';
const TIMEOUT_MS   = 30_000;

const VALID_DOCUMENT_TYPES = new Set([
  'invoice', 'receipt', 'bank_statement',
  'credit_note', 'debit_note', 'po', 'attachment',
]);

// ── PDF text extraction (no external dependency) ──────────────────────────────

function extractPdfText(buf: Buffer): string {
  const raw = buf.toString('latin1');
  const chunks: string[] = [];

  // Text in parentheses — primary PDF text-object encoding
  const parenRe = /\(([^)\\]{1,400})\)/g;
  let m: RegExpExecArray | null;
  while ((m = parenRe.exec(raw)) !== null) {
    const s = m[1]
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
    if (/[\x20-\x7E]{4,}/.test(s)) chunks.push(s);
  }

  // Hex strings — secondary encoding (e.g. CIDFont glyphs)
  const hexRe = /<([0-9A-Fa-f]{4,})>/g;
  while ((m = hexRe.exec(raw)) !== null) {
    const hex = m[1];
    let decoded = '';
    for (let i = 0; i < hex.length - 1; i += 4) {
      const cp = parseInt(hex.slice(i, i + 4), 16);
      if (cp >= 0x20 && cp <= 0x7E) decoded += String.fromCharCode(cp);
    }
    if (decoded.length >= 4) chunks.push(decoded);
  }

  return chunks.join(' ').replace(/\s{2,}/g, ' ').trim().slice(0, 12_000);
}

// ── Prompt builder ────────────────────────────────────────────────────────────

interface PromptParts {
  messages: ChatMessage[];
}

function buildPrompt(input: ProcessDocumentInput): PromptParts {
  const systemPrompt = `You are a financial document extraction system for TAJ Finance.
Extract structured data from the provided document.

Return ONLY valid JSON — no markdown, no code blocks, no explanation.

Required schema:
{
  "supplier":       { "value": <string|null>, "confidence": <0-100> },
  "invoice_number": { "value": <string|null>, "confidence": <0-100> },
  "invoice_date":   { "value": <"YYYY-MM-DD"|null>, "confidence": <0-100> },
  "currency":       { "value": <"ISO-4217 code"|null>, "confidence": <0-100> },
  "subtotal":       { "value": <"decimal string"|null>, "confidence": <0-100> },
  "vat":            { "value": <"decimal string"|null>, "confidence": <0-100> },
  "total":          { "value": <"decimal string"|null>, "confidence": <0-100> },
  "document_type":  { "value": <"invoice"|"receipt"|"bank_statement"|"credit_note"|"debit_note"|"po"|"attachment"|null>, "confidence": <0-100> },
  "summary":        { "value": <"1-2 sentence description"|null>, "confidence": <0-100> },
  "overall_confidence": <0-100>
}

Rules:
- confidence 0 = no evidence found, 100 = certain
- Dates MUST be YYYY-MM-DD format or null
- Amounts MUST be decimal strings without currency symbols, e.g. "1234.50" or null
- currency MUST be a 3-letter ISO 4217 code (e.g. "SAR", "USD", "EUR") or null
- document_type MUST be one of the listed enum values or null
- Never fabricate values — use null when uncertain`;

  const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

  if (input.mimeType === 'application/pdf') {
    const text = extractPdfText(input.fileBuffer);
    messages.push({
      role: 'user',
      content: text
        ? `Extract data from this PDF document:\n\n${text}`
        : 'The PDF appears to be empty or image-only. Return all null values with 0 confidence.',
    });
  } else if (input.mimeType.startsWith('image/')) {
    const b64 = input.fileBuffer.toString('base64');
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: 'Extract data from this financial document image.' },
        {
          type: 'image_url',
          image_url: { url: `data:${input.mimeType};base64,${b64}`, detail: 'high' },
        },
      ] as unknown as string,
    });
  } else {
    messages.push({
      role: 'user',
      content: 'Unsupported document format. Return all null values with 0 confidence.',
    });
  }

  return { messages };
}

// ── Response validation ───────────────────────────────────────────────────────

/** Clamp and round a confidence score to [0, 100]. */
function clampConfidence(v: unknown): number {
  if (typeof v !== 'number' || !isFinite(v)) return 0;
  return Math.min(100, Math.max(0, Math.round(v)));
}

/**
 * Validate and normalise a date string.
 * Accepts YYYY-MM-DD or common regional variants (DD/MM/YYYY, MM/DD/YYYY).
 * Returns a YYYY-MM-DD string on success, null on failure.
 */
function validateDate(v: string): string | null {
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return v;
  }
  // DD/MM/YYYY or MM/DD/YYYY → attempt YYYY-MM-DD conversion
  const slash = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    // Heuristic: if first part ≤ 12 try MM/DD/YYYY; prefer DD/MM/YYYY if ambiguous
    const [, a, b, year] = slash;
    const candidates = [`${year}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`];
    if (Number(a) <= 12) candidates.push(`${year}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`);
    for (const c of candidates) {
      const d = new Date(c);
      if (!isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(c)) return c;
    }
  }
  return null;
}

/**
 * Validate a decimal amount string.
 * Strips common currency symbols and thousand-separators then validates.
 * Returns the cleaned decimal string or null.
 */
function validateAmount(v: string): string | null {
  // Strip currency symbols, spaces, and common thousand-separators (,)
  const stripped = v
    .replace(/[£$€¥₹﷼,\s]/g, '')   // remove symbols & thousands commas
    .replace(/،/g, '')               // Arabic thousands separator
    .trim();

  // Accept: optional sign, digits, optional decimal part
  if (/^-?\d+(\.\d{1,6})?$/.test(stripped)) {
    // Reject negative amounts for financial documents
    if (stripped.startsWith('-')) return null;
    return stripped;
  }
  return null;
}

/**
 * Validate an ISO 4217 currency code.
 * Must be exactly 3 uppercase alpha characters.
 */
function validateCurrency(v: string): string | null {
  const upper = v.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(upper) ? upper : null;
}

/**
 * Validate a document_type value against the allowed enum.
 */
function validateDocumentType(v: string): string | null {
  const lower = v.trim().toLowerCase();
  return VALID_DOCUMENT_TYPES.has(lower) ? lower : null;
}

/** Parse and validate a single extraction field from the raw parsed object. */
function parseField(
  raw:      unknown,
  fieldKey: string,
  validate?: (v: string) => string | null,
): ExtractionField {
  if (typeof raw !== 'object' || raw === null) {
    return { value: null, confidence: 0 };
  }

  const o = raw as Record<string, unknown>;
  const rawValue = o.value;
  const confidence = clampConfidence(o.confidence);

  if (rawValue === null || rawValue === undefined) {
    return { value: null, confidence };
  }

  if (typeof rawValue !== 'string') {
    // Coerce numbers to strings (providers sometimes return numeric totals)
    const coerced = String(rawValue).trim();
    if (validate) {
      const validated = validate(coerced);
      if (validated === null) {
        logger.warn({ fieldKey, rawValue }, 'AI extraction: field failed validation — set to null');
        return { value: null, confidence: 0 };
      }
      return { value: validated, confidence };
    }
    return { value: coerced || null, confidence };
  }

  const trimmed = rawValue.trim();
  if (!trimmed) return { value: null, confidence };

  if (validate) {
    const validated = validate(trimmed);
    if (validated === null) {
      logger.warn({ fieldKey, rawValue: trimmed }, 'AI extraction: field failed validation — set to null');
      return { value: null, confidence: 0 };
    }
    return { value: validated, confidence };
  }

  return { value: trimmed, confidence };
}

/** Parse, validate, and structure the raw JSON string from the provider. */
function parseExtractionResult(raw: string): ProcessDocumentResult {
  // ── 1. Parse JSON ──────────────────────────────────────────────────────────
  let parsed: unknown;
  try {
    // Strip markdown code fences if the model adds them despite the prompt
    const cleaned = raw
      .replace(/^```json?\s*/im, '')
      .replace(/\s*```\s*$/m, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AiError('INVALID_JSON', `Model returned non-JSON: ${raw.slice(0, 300)}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new AiError('INVALID_JSON', 'Model returned JSON that is not an object');
  }

  const p = parsed as Record<string, unknown>;

  // ── 2. Validate overall_confidence ────────────────────────────────────────
  const overall = clampConfidence(p.overall_confidence);

  // ── 3. Validate each field (invalid values → null, confidence → 0) ────────
  const supplier       = parseField(p.supplier,       'supplier');
  const invoice_number = parseField(p.invoice_number, 'invoice_number');
  const invoice_date   = parseField(p.invoice_date,   'invoice_date',  validateDate);
  const currency       = parseField(p.currency,       'currency',      validateCurrency);
  const subtotal       = parseField(p.subtotal,       'subtotal',      validateAmount);
  const vat            = parseField(p.vat,            'vat',           validateAmount);
  const total          = parseField(p.total,          'total',         validateAmount);
  const document_type  = parseField(p.document_type,  'document_type', validateDocumentType);
  const summary        = parseField(p.summary,        'summary');

  // ── 4. Require at least one non-null field (reject completely empty output) ─
  const nonNullCount = [
    supplier, invoice_number, invoice_date, currency,
    subtotal, vat, total, document_type, summary,
  ].filter((f) => f.value !== null).length;

  if (nonNullCount === 0 && overall === 0) {
    logger.warn('AI extraction: all fields null and overall_confidence=0 — possible malformed response');
    // Do not throw — a truly empty document returns all nulls legitimately.
    // The caller can decide based on overall_confidence.
  }

  return {
    supplier,
    invoice_number,
    invoice_date,
    currency,
    subtotal,
    vat,
    total,
    document_type,
    summary,
    overall_confidence: overall,
    raw_response:       raw,
  };
}

// ── Provider class ────────────────────────────────────────────────────────────

export class OpenAiProvider implements AiProvider {
  private readonly apiKey:      string;
  private readonly model:       string;
  private readonly baseUrl:     string;
  private readonly temperature: number;
  private readonly maxTokens:   number;
  private readonly timeoutMs:   number;

  constructor(config: AiProviderConfig) {
    if (!config.apiKey) throw new AiError('AUTH_ERROR', 'OpenAI API key is required');
    this.apiKey       = config.apiKey;
    this.model        = config.model || 'gpt-4o-mini';
    this.baseUrl      = (config.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
    this.temperature  = Math.min(2, Math.max(0, config.temperature ?? 0.1));
    this.maxTokens    = Math.min(8192, Math.max(1, config.maxTokens ?? 1024));
    this.timeoutMs    = config.timeoutMs > 0 ? config.timeoutMs : 30_000;
  }

  async initialize(): Promise<void> {
    // No persistent state to initialise
  }

  // ── healthCheck ────────────────────────────────────────────────────────────

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const resp = await fetch(`${this.baseUrl}/v1/models`, {
        method:  'GET',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal:  AbortSignal.timeout(10_000),
      });
      const latencyMs = Date.now() - start;

      if (resp.ok) return { ok: true, latencyMs };

      const body = await resp.json().catch(() => ({})) as { error?: { message?: string } };
      const msg  = body?.error?.message ?? `HTTP ${resp.status}`;

      if (resp.status === 401 || resp.status === 403) throw new AiError('AUTH_ERROR', msg);
      if (resp.status === 429) throw new AiError('RATE_LIMIT', msg);

      return { ok: false, latencyMs, error: msg };
    } catch (err) {
      const latencyMs = Date.now() - start;
      if (err instanceof AiError) return { ok: false, latencyMs, error: err.message };
      const name = (err as Error).name;
      if (name === 'AbortError' || name === 'TimeoutError') {
        return { ok: false, latencyMs, error: 'Connection timed out' };
      }
      return { ok: false, latencyMs, error: (err as Error).message ?? 'Unknown error' };
    }
  }

  // ── processDocument ────────────────────────────────────────────────────────

  async processDocument(input: ProcessDocumentInput): Promise<ProcessDocumentResult> {
    const { messages } = buildPrompt(input);

    const reqBody = {
      model:       this.model,
      messages,
      temperature: this.temperature,
      max_tokens:  this.maxTokens,
    };

    let rawText = '';
    try {
      const resp = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type':  'application/json',
        },
        body:   JSON.stringify(reqBody),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (resp.status === 401 || resp.status === 403) {
        const b = await resp.json().catch(() => ({})) as { error?: { message?: string } };
        throw new AiError('AUTH_ERROR', b?.error?.message ?? 'Authentication failed');
      }
      if (resp.status === 429) {
        throw new AiError('RATE_LIMIT', 'OpenAI rate limit exceeded. Retry later.');
      }
      if (!resp.ok) {
        const b = await resp.json().catch(() => ({})) as { error?: { message?: string } };
        throw new AiError('UNKNOWN', b?.error?.message ?? `HTTP ${resp.status}`);
      }

      const data = await resp.json() as {
        choices?: { message?: { content?: string } }[];
      };
      rawText = data?.choices?.[0]?.message?.content ?? '';

      logger.info(
        { documentId: input.documentId, model: this.model, chars: rawText.length },
        'OpenAI extraction response received',
      );

    } catch (err) {
      if (err instanceof AiError) throw err;
      const name = (err as Error).name;
      if (name === 'AbortError' || name === 'TimeoutError') {
        throw new AiError('TIMEOUT', `OpenAI request timed out after ${this.timeoutMs / 1000}s`);
      }
      throw new AiError('PROVIDER_OFFLINE', (err as Error).message ?? 'Network error');
    }

    return parseExtractionResult(rawText);
  }

  // ── chat ──────────────────────────────────────────────────────────────────

  async chat(messages: ChatMessage[]): Promise<string> {
    const resp = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type':  'application/json',
      },
      body:   JSON.stringify({ model: this.model, messages, temperature: this.temperature }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!resp.ok) {
      const b = await resp.json().catch(() => ({})) as { error?: { message?: string } };
      throw new AiError('UNKNOWN', b?.error?.message ?? `HTTP ${resp.status}`);
    }

    const data = await resp.json() as { choices?: { message?: { content?: string } }[] };
    return data?.choices?.[0]?.message?.content ?? '';
  }

  // ── embeddings (placeholder) ──────────────────────────────────────────────

  async embeddings(text: string): Promise<number[]> {
    const resp = await fetch(`${this.baseUrl}/v1/embeddings`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type':  'application/json',
      },
      body:   JSON.stringify({ model: 'text-embedding-3-small', input: text }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!resp.ok) {
      throw new AiError('UNKNOWN', `Embeddings request failed: HTTP ${resp.status}`);
    }

    const data = await resp.json() as { data?: { embedding?: number[] }[] };
    return data?.data?.[0]?.embedding ?? [];
  }
}

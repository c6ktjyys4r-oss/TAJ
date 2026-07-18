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
 *   This is intentionally lightweight (no external package).
 *   It reliably captures most embedded text from simple PDFs.
 *   For complex PDFs, Phase N+ can integrate pdf-parse.
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

// ── PDF text extraction (no external dependency) ──────────────────────────────

function extractPdfText(buf: Buffer): string {
  const raw = buf.toString('latin1');
  const chunks: string[] = [];

  // Text in parentheses — primary PDF text object encoding
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
    // Only keep runs that contain printable ASCII
    if (/[\x20-\x7E]{4,}/.test(s)) chunks.push(s);
  }

  // Hex strings — secondary encoding
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

// ── Document-to-prompt ────────────────────────────────────────────────────────

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
- Dates must be YYYY-MM-DD or null
- Amounts must be decimal strings without currency symbols (e.g. "1234.50") or null
- document_type must be one of the listed enum values
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
        { type: 'image_url', image_url: { url: `data:${input.mimeType};base64,${b64}`, detail: 'high' } },
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

function isExtractionField(v: unknown): v is ExtractionField {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (o.value === null || typeof o.value === 'string') &&
         typeof o.confidence === 'number';
}

function parseExtractionResult(raw: string): ProcessDocumentResult {
  let parsed: unknown;
  try {
    // Strip markdown code fences if the model adds them despite the prompt
    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AiError('INVALID_JSON', `Model returned non-JSON: ${raw.slice(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new AiError('INVALID_JSON', 'Model returned JSON that is not an object');
  }

  const p = parsed as Record<string, unknown>;

  const field = (key: string): ExtractionField => {
    const f = p[key];
    if (isExtractionField(f)) return f;
    return { value: null, confidence: 0 };
  };

  const overall = typeof p.overall_confidence === 'number'
    ? Math.min(100, Math.max(0, p.overall_confidence))
    : 0;

  return {
    supplier:           field('supplier'),
    invoice_number:     field('invoice_number'),
    invoice_date:       field('invoice_date'),
    currency:           field('currency'),
    subtotal:           field('subtotal'),
    vat:                field('vat'),
    total:              field('total'),
    document_type:      field('document_type'),
    summary:            field('summary'),
    overall_confidence: overall,
    raw_response:       raw,
  };
}

// ── Provider class ────────────────────────────────────────────────────────────

export class OpenAiProvider implements AiProvider {
  private readonly apiKey:  string;
  private readonly model:   string;
  private readonly baseUrl: string;

  constructor(config: AiProviderConfig) {
    if (!config.apiKey) throw new AiError('AUTH_ERROR', 'OpenAI API key is required');
    this.apiKey  = config.apiKey;
    this.model   = config.model || 'gpt-4o-mini';
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
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

      if (resp.status === 401 || resp.status === 403) {
        throw new AiError('AUTH_ERROR', msg);
      }
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

    const body = {
      model:       this.model,
      messages,
      temperature: 0,
      max_tokens:  1024,
    };

    let rawText = '';
    try {
      const resp = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type':  'application/json',
        },
        body:   JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
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

      logger.info({ documentId: input.documentId, model: this.model, chars: rawText.length },
        'OpenAI extraction response received');

    } catch (err) {
      if (err instanceof AiError) throw err;
      const name = (err as Error).name;
      if (name === 'AbortError' || name === 'TimeoutError') {
        throw new AiError('TIMEOUT', `OpenAI request timed out after ${TIMEOUT_MS / 1000}s`);
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
      body: JSON.stringify({ model: this.model, messages, temperature: 0.7 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
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
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!resp.ok) {
      throw new AiError('UNKNOWN', `Embeddings request failed: HTTP ${resp.status}`);
    }

    const data = await resp.json() as { data?: { embedding?: number[] }[] };
    return data?.data?.[0]?.embedding ?? [];
  }
}

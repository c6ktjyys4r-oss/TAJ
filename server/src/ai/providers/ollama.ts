/**
 * Ollama provider implementation.
 *
 * Connects to any Ollama instance via a configurable base URL.
 * Do NOT hardcode localhost — base URL MUST come from config.baseUrl.
 *
 * Operations:
 *   initialize()      — validate config (requires baseUrl)
 *   healthCheck()     — GET /api/tags (lists available models)
 *   processDocument() — chat completion with structured extraction prompt
 *   chat()            — POST /api/chat (Ollama native chat API)
 *   embeddings()      — POST /api/embed (Ollama native embeddings)
 *
 * PDF extraction:  pure-JS regex approach (no external deps) — same as OpenAI provider.
 * Image support:   vision-capable models receive base64-encoded image data inline.
 *
 * Streaming-ready: all calls use non-streaming paths but are structured so
 * that adding `stream: true` + an async iterator in a future pass requires
 * only localised changes here — no upstream API surface changes.
 *
 * Error mapping:
 *   Connection refused / network error  → PROVIDER_OFFLINE
 *   Timeout (AbortSignal)               → TIMEOUT
 *   Non-JSON / invalid extraction JSON  → INVALID_JSON
 *   HTTP 4xx/5xx from Ollama            → UNKNOWN (with status code)
 */
import type {
  AiProvider,
  AiProviderConfig,
  HealthCheckResult,
  ProcessDocumentInput,
  ProcessDocumentResult,
  ChatMessage,
  ExtractionField,
} from '../types';
import { AiError } from '../types';
import { logger }  from '../../logger';

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 60_000; // Ollama local inference is slower than cloud APIs

const VALID_DOCUMENT_TYPES = new Set([
  'invoice', 'receipt', 'bank_statement',
  'credit_note', 'debit_note', 'po', 'attachment',
]);

// ── PDF text extraction (no external dependency) ──────────────────────────────
// Identical strategy to the OpenAI provider — shared logic kept local to avoid
// a circular lib dependency.

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

interface OllamaChatMessage {
  role:    'system' | 'user' | 'assistant';
  content: string | OllamaContentPart[];
}

interface OllamaContentPart {
  type:       'text' | 'image_url';
  text?:      string;
  image_url?: { url: string };
}

const SYSTEM_PROMPT = `You are a financial document extraction system for TAJ Finance.
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
  "summary":        { "value": <string|null>, "confidence": <0-100> },
  "overall_confidence": <0-100>
}

Rules:
- invoice_date must be YYYY-MM-DD or null
- currency must be an ISO 4217 code (e.g. SAR, USD, EUR) or null
- subtotal, vat, total must be decimal strings (e.g. "1234.50") or null
- document_type must be one of the listed values or null
- confidence is an integer 0–100 reflecting extraction certainty
- overall_confidence is the average of all field confidences
- Do not include any text outside the JSON object`;

function buildMessages(input: ProcessDocumentInput): OllamaChatMessage[] {
  const isImage = input.mimeType.startsWith('image/');

  if (isImage) {
    // Vision path: send base64-encoded image
    const b64 = input.fileBuffer.toString('base64');
    const dataUrl = `data:${input.mimeType};base64,${b64}`;

    return [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: dataUrl } },
          { type: 'text', text: 'Extract the financial data from this document image.' },
        ],
      },
    ];
  }

  // PDF / text path: extract text and send as user message
  const text = extractPdfText(input.fileBuffer);
  const userContent = text.length > 0
    ? `Extract financial data from the following document text:\n\n${text}`
    : 'The document appears to have no extractable text content. Return all fields as null with confidence 0.';

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: userContent },
  ];
}

// ── Response parsing ──────────────────────────────────────────────────────────

function parseField(raw: unknown, fieldName: string): ExtractionField {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { value: null, confidence: 0 };
  }
  const obj = raw as Record<string, unknown>;
  const confidence = Math.max(0, Math.min(100, Math.round(Number(obj['confidence']) || 0)));

  let value = obj['value'] != null ? String(obj['value']) : null;

  // Field-specific validation
  if (value !== null) {
    switch (fieldName) {
      case 'invoice_date':
        value = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
        break;
      case 'currency':
        value = /^[A-Z]{3}$/.test(value) ? value : null;
        break;
      case 'subtotal':
      case 'vat':
      case 'total':
        value = /^\d+(\.\d{1,2})?$/.test(value) ? value : null;
        break;
      case 'document_type':
        value = VALID_DOCUMENT_TYPES.has(value) ? value : null;
        break;
    }
  }

  return { value, confidence };
}

function parseExtractionResult(rawText: string): ProcessDocumentResult {
  let parsed: unknown;
  try {
    // Strip any accidental markdown code fences
    const clean = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new AiError('INVALID_JSON', `Ollama returned non-JSON: ${rawText.slice(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new AiError('INVALID_JSON', 'Ollama extraction result is not a JSON object');
  }

  const obj = parsed as Record<string, unknown>;

  const supplier       = parseField(obj['supplier'],       'supplier');
  const invoice_number = parseField(obj['invoice_number'], 'invoice_number');
  const invoice_date   = parseField(obj['invoice_date'],   'invoice_date');
  const currency       = parseField(obj['currency'],       'currency');
  const subtotal       = parseField(obj['subtotal'],       'subtotal');
  const vat            = parseField(obj['vat'],            'vat');
  const total          = parseField(obj['total'],          'total');
  const document_type  = parseField(obj['document_type'],  'document_type');
  const summary        = parseField(obj['summary'],        'summary');

  const fields = [supplier, invoice_number, invoice_date, currency, subtotal, vat, total, document_type, summary];
  const computedConfidence = Math.round(
    fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length,
  );

  const rawOverall = Number(obj['overall_confidence']);
  const overall_confidence = Number.isFinite(rawOverall)
    ? Math.max(0, Math.min(100, Math.round(rawOverall)))
    : computedConfidence;

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
    overall_confidence,
    raw_response: rawText,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class OllamaProvider implements AiProvider {
  private readonly baseUrl: string;
  private readonly model:   string;
  private readonly temperature: number;
  private readonly maxTokens:   number;
  private readonly timeoutMs:   number;

  constructor(config: AiProviderConfig) {
    if (!config.baseUrl) {
      throw new AiError(
        'PROVIDER_OFFLINE',
        'Ollama requires a base URL — set it in AI Settings (e.g. http://your-ollama-host:11434)',
      );
    }
    // Normalise: strip trailing slash
    this.baseUrl     = config.baseUrl.replace(/\/+$/, '');
    this.model       = config.model || 'llama3.1';
    this.temperature = config.temperature ?? 0.1;
    this.maxTokens   = config.maxTokens   ?? 1024;
    this.timeoutMs   = DEFAULT_TIMEOUT_MS;
  }

  // ── initialize ─────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    // Validate that baseUrl is set (already checked in constructor)
    logger.info({ provider: 'ollama', baseUrl: this.baseUrl, model: this.model }, 'Ollama provider initialised');
  }

  // ── healthCheck ────────────────────────────────────────────────────────────

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const resp = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(10_000),
      });

      const latencyMs = Date.now() - start;

      if (!resp.ok) {
        return { ok: false, latencyMs, error: `Ollama /api/tags returned HTTP ${resp.status}` };
      }

      const data = await resp.json() as { models?: { name: string }[] };
      const modelNames = (data.models ?? []).map((m) => m.name);
      const modelAvailable = modelNames.some((n) => n === this.model || n.startsWith(`${this.model}:`));

      if (!modelAvailable && modelNames.length > 0) {
        logger.warn(
          { model: this.model, available: modelNames },
          'Ollama: configured model not in available list — inference may still work if pulled',
        );
      }

      return { ok: true, latencyMs };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const msg = (err as Error).message ?? 'Unknown error';
      if (msg.includes('timeout') || msg.includes('TimeoutError')) {
        return { ok: false, latencyMs, error: 'Ollama health check timed out (10 s)' };
      }
      return { ok: false, latencyMs, error: `Cannot reach Ollama at ${this.baseUrl}: ${msg}` };
    }
  }

  // ── processDocument ────────────────────────────────────────────────────────

  async processDocument(input: ProcessDocumentInput): Promise<ProcessDocumentResult> {
    const messages = buildMessages(input);

    let rawText: string;
    try {
      rawText = await this._chat(messages);
    } catch (err) {
      if (err instanceof AiError) throw err;
      throw new AiError('PROVIDER_OFFLINE', (err as Error).message ?? 'Ollama network error');
    }

    logger.debug({ documentId: input.documentId, model: this.model, chars: rawText.length }, 'Ollama extraction raw response received');

    return parseExtractionResult(rawText);
  }

  // ── chat (public AiProvider interface) ────────────────────────────────────

  async chat(messages: ChatMessage[]): Promise<string> {
    return this._chat(messages as OllamaChatMessage[]);
  }

  // ── embeddings ─────────────────────────────────────────────────────────────

  async embeddings(text: string): Promise<number[]> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}/api/embed`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ model: this.model, input: text }),
        signal:  AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      const msg = (err as Error).message ?? '';
      if (msg.includes('timeout') || msg.includes('TimeoutError')) {
        throw new AiError('TIMEOUT', `Ollama embeddings timed out after ${this.timeoutMs} ms`);
      }
      throw new AiError('PROVIDER_OFFLINE', msg);
    }

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({})) as { error?: string };
      throw new AiError('UNKNOWN', body.error ?? `Ollama /api/embed HTTP ${resp.status}`);
    }

    const data = await resp.json() as { embeddings?: number[][] };
    return data.embeddings?.[0] ?? [];
  }

  // ── internal chat implementation ───────────────────────────────────────────
  // Separated so processDocument can call it without going through the public
  // ChatMessage[] interface, which doesn't allow OllamaContentPart arrays.

  private async _chat(messages: OllamaChatMessage[]): Promise<string> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          model:    this.model,
          messages,
          stream:   false,
          options: {
            temperature: this.temperature,
            num_predict: this.maxTokens,
          },
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      const msg = (err as Error).message ?? '';
      if (msg.includes('timeout') || msg.includes('TimeoutError')) {
        throw new AiError('TIMEOUT', `Ollama chat timed out after ${this.timeoutMs} ms`);
      }
      throw new AiError('PROVIDER_OFFLINE', `Cannot reach Ollama at ${this.baseUrl}: ${msg}`);
    }

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({})) as { error?: string };
      throw new AiError('UNKNOWN', body.error ?? `Ollama /api/chat HTTP ${resp.status}`);
    }

    const data = await resp.json() as { message?: { content?: string }; error?: string };

    if (data.error) {
      throw new AiError('UNKNOWN', data.error);
    }

    return data.message?.content ?? '';
  }
}

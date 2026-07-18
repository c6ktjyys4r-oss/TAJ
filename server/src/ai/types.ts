/**
 * AI subsystem — core types.
 *
 * Every provider implements AiProvider.
 * The factory returns an AiProvider; callers never depend on concrete classes.
 */

// ── Provider config (loaded from ai_settings row) ────────────────────────────

export interface AiProviderConfig {
  provider:    'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama';
  model:       string;
  apiKey:      string | null;
  baseUrl:     string | null;
  temperature: number;   // 0.0–2.0; 0.1 default for deterministic extraction
  maxTokens:   number;   // 1–8192; 1024 default
}

// ── Extraction ────────────────────────────────────────────────────────────────

/** A single extracted field with a confidence score (0–100). */
export interface ExtractionField {
  value:      string | null;
  confidence: number;
}

/** Structured extraction result for a financial document. */
export interface ProcessDocumentResult {
  supplier:           ExtractionField;
  invoice_number:     ExtractionField;
  invoice_date:       ExtractionField;  // YYYY-MM-DD when present
  currency:           ExtractionField;  // ISO 4217 code
  subtotal:           ExtractionField;  // decimal string
  vat:                ExtractionField;  // decimal string
  total:              ExtractionField;  // decimal string
  document_type:      ExtractionField;  // one of the document_type enum values
  summary:            ExtractionField;  // 1–2 sentence description
  overall_confidence: number;           // 0–100
  raw_response:       string;           // raw JSON string from the provider
}

// ── Provider interface ────────────────────────────────────────────────────────

export interface ProcessDocumentInput {
  fileBuffer: Buffer;
  mimeType:   string;
  documentId: string;
}

export interface HealthCheckResult {
  ok:         boolean;
  latencyMs:  number;
  error?:     string;
}

export interface ChatMessage {
  role:    'system' | 'user' | 'assistant';
  content: string;
}

/**
 * AiProvider — the contract every provider must satisfy.
 *
 * initialize()      — validate config, set up any internal state.
 * healthCheck()     — lightweight connectivity + auth probe.
 * processDocument() — extract structured data from a file buffer.
 * chat()            — single conversational turn.
 * embeddings()      — placeholder for future semantic search (Phase N+).
 */
export interface AiProvider {
  initialize():                                          Promise<void>;
  healthCheck():                                         Promise<HealthCheckResult>;
  processDocument(input: ProcessDocumentInput):          Promise<ProcessDocumentResult>;
  chat(messages: ChatMessage[]):                         Promise<string>;
  embeddings(text: string):                              Promise<number[]>;
}

// ── Errors ────────────────────────────────────────────────────────────────────

export type AiErrorCode =
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'INVALID_JSON'
  | 'PROVIDER_OFFLINE'
  | 'AUTH_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'UNKNOWN';

export class AiError extends Error {
  readonly code: AiErrorCode;

  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.name = 'AiError';
    this.code = code;
  }
}

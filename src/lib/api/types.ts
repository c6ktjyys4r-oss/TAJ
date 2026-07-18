/**
 * API layer types — mirror the backend schema exactly.
 *
 * These are the shapes that come back from the TAJ Finance API server.
 * Do NOT import from here in UI components; import from src/lib/api/index.ts.
 */

// ── Enums (match server/src/db/schema.ts) ─────────────────────────────────────

export type DocumentType =
  | 'invoice'
  | 'receipt'
  | 'bank_statement'
  | 'credit_note'
  | 'debit_note'
  | 'po'
  | 'attachment';

export type DocumentStatus = 'uploaded' | 'classified' | 'matched' | 'archived';

// ── Document ──────────────────────────────────────────────────────────────────

/**
 * A document record as returned by GET /api/documents or GET /api/documents/:id.
 *
 * `file_path`  uuid (string) referencing document_files.id; null if no file attached.
 * `file_size`  byte count as integer; null if no file attached.
 * `amount`     stored as a decimal string to preserve precision; parse with Number() where needed.
 * `created_at` / `updated_at`  ISO 8601 datetime strings.
 */
export interface ApiDocument {
  id:         string;
  type:       DocumentType;
  vendor:     string | null;
  date:       string | null;     // YYYY-MM-DD
  amount:     string | null;     // decimal string, e.g. "1234.50"
  currency:   string;            // ISO 4217, default "SAR"
  status:     DocumentStatus;
  file_path:  string | null;     // uuid → document_files.id
  file_name:  string | null;
  file_size:  number | null;     // bytes (integer)
  mime_type:  string | null;
  metadata:   Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── List response (legacy — kept for any callers that still use it) ────────────

export interface ApiListResponse<T> {
  data:   T[];
  total:  number;
  limit:  number;
  offset: number;
}

// ── Paginated response ────────────────────────────────────────────────────────

/**
 * Returned by GET /api/documents with page/pageSize params.
 * The browser receives only the requested page — never the full table.
 */
export interface ApiPaginatedResponse<T> {
  items:       T[];
  totalCount:  number;
  currentPage: number;
  pageSize:    number;
  totalPages:  number;
}

// ── Upload ────────────────────────────────────────────────────────────────────

/** Returned by POST /api/upload. */
export interface UploadResult {
  document: ApiDocument;
  file: {
    name:       string;
    size:       number;  // bytes
    mime:       string;
    storageKey: string;  // uuid of the document_files row
  };
}

// ── Health ────────────────────────────────────────────────────────────────────

/** Returned by GET /api/health. */
export interface HealthResponse {
  status:    'ok';
  db:        'connected' | 'disconnected';
  latencyMs: number;
}

// ── Error ─────────────────────────────────────────────────────────────────────

/** Shape of all non-2xx JSON error bodies from the backend. */
export interface ApiErrorBody {
  error:   string;   // machine-readable code, e.g. "DOCUMENT_NOT_FOUND"
  message: string;   // human-readable description
  code:    number;   // HTTP status code (mirrors the HTTP status)
}

// ── Allocation ────────────────────────────────────────────────────────────────

/**
 * A single allocation row returned by GET|PUT /api/documents/:id/allocations.
 *
 * `amount` is a decimal string (e.g. "1234.50") — use Number() or parseFloat()
 * when arithmetic is needed.
 */
export interface ApiAllocation {
  id:          string;
  document_id: string;
  branch:      string;
  amount:      string;   // decimal string, e.g. "500.00"
  created_at:  string;   // ISO 8601
  updated_at:  string;   // ISO 8601
}

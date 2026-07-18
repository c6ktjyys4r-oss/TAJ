/**
 * Typed API methods for /api/documents.
 *
 * All list/get/create/update/delete operations are here.
 * File streaming is handled via fileUrl() — returns a URL the browser
 * can navigate to directly (no additional fetch needed for download).
 */
import { api, BASE_URL } from './client';
import type { ApiDocument, ApiPaginatedResponse, DocumentType, DocumentStatus } from './types';

// ── Request / response types ──────────────────────────────────────────────────

export interface ListDocumentsParams {
  type?:     DocumentType;
  status?:   DocumentStatus;
  /** Case-insensitive substring search across file_name and vendor. */
  search?:   string;
  /** 1-based page number. Default: 1. */
  page?:     number;
  /** Rows per page (1–100). Default: 20. */
  pageSize?: number;
}

export interface CreateDocumentBody {
  type:      DocumentType;
  vendor?:   string;
  date?:     string;    // YYYY-MM-DD
  amount?:   string;    // decimal string
  currency?: string;    // ISO 4217, default "SAR"
  status?:   DocumentStatus;
  metadata?: Record<string, unknown>;
}

export type UpdateDocumentBody = Partial<CreateDocumentBody>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildQuery(params: ListDocumentsParams): string {
  const q = new URLSearchParams();
  if (params.type     !== undefined) q.set('type',     params.type);
  if (params.status   !== undefined) q.set('status',   params.status);
  if (params.search)                 q.set('search',   params.search);
  if (params.page     !== undefined) q.set('page',     String(params.page));
  if (params.pageSize !== undefined) q.set('pageSize', String(params.pageSize));
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

// ── API surface ───────────────────────────────────────────────────────────────

export const documentsApi = {
  /**
   * List documents with server-side pagination and optional search.
   * Only the requested page is transferred — never the full table.
   *
   *   documentsApi.list({ page: 1, pageSize: 20, search: 'SABB' })
   */
  list(params: ListDocumentsParams = {}): Promise<ApiPaginatedResponse<ApiDocument>> {
    return api.get(`/api/documents${buildQuery(params)}`);
  },

  /**
   * Fetch a single document by ID.
   */
  get(id: string): Promise<ApiDocument> {
    return api.get(`/api/documents/${encodeURIComponent(id)}`);
  },

  /**
   * Create a document record without a file.
   * Use uploadApi.upload() to attach a file in the same step.
   */
  create(body: CreateDocumentBody): Promise<ApiDocument> {
    return api.post('/api/documents', body);
  },

  /**
   * Partially update a document (PATCH semantics — only supplied fields change).
   */
  update(id: string, body: UpdateDocumentBody): Promise<ApiDocument> {
    return api.patch(`/api/documents/${encodeURIComponent(id)}`, body);
  },

  /**
   * Delete a document and its associated file atomically.
   */
  delete(id: string): Promise<void> {
    return api.delete(`/api/documents/${encodeURIComponent(id)}`);
  },

  /**
   * Returns the URL to stream the file attached to a document.
   * The browser can use this as an `href`, `src`, or `window.open` target.
   * No fetch is issued; the browser streams directly from the backend.
   */
  fileUrl(id: string): string {
    return `${BASE_URL}/api/documents/${encodeURIComponent(id)}/file`;
  },
};

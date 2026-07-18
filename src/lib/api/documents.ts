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

export type SortBy =
  | 'date' | 'file_name' | 'vendor' | 'file_size'
  | 'created_at' | 'status' | 'type';

export type SortOrder = 'asc' | 'desc';

export interface ListDocumentsParams {
  /** Tab-level single-value type filter (e.g. 'invoice' when Invoices tab is active). */
  type?:      DocumentType;
  /** Tab-level single-value status filter (e.g. 'uploaded' for Unclassified tab). */
  status?:    DocumentStatus;
  /** FilterPanel multi-select status filter — combined with `status` via AND. */
  statuses?:  DocumentStatus[];
  /** FilterPanel multi-select type filter — combined with `type` via AND. */
  types?:     DocumentType[];
  /** Case-insensitive substring search across file_name and vendor. */
  search?:    string;
  /** Column to sort by. Default: 'date'. */
  sortBy?:    SortBy;
  /** Sort direction. Default: 'desc'. */
  sortOrder?: SortOrder;
  /** 1-based page number. Default: 1. */
  page?:      number;
  /** Rows per page (1–100). Default: 20. */
  pageSize?:  number;
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
  if (params.type      !== undefined) q.set('type',      params.type);
  if (params.status    !== undefined) q.set('status',    params.status);
  // Arrays — append once per value so Express parses them as string[]
  params.statuses?.forEach((s) => q.append('statuses', s));
  params.types?.forEach((t)    => q.append('types',    t));
  if (params.search)                  q.set('search',    params.search);
  if (params.sortBy)                  q.set('sortBy',    params.sortBy);
  if (params.sortOrder)               q.set('sortOrder', params.sortOrder);
  if (params.page      !== undefined) q.set('page',      String(params.page));
  if (params.pageSize  !== undefined) q.set('pageSize',  String(params.pageSize));
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

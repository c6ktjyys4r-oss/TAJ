/**
    * Typed API methods for /api/documents.
    *
    * All list/get/create/update/delete operations are here.
    * File streaming is handled via fileUrl() — returns a URL the browser
    * can navigate to directly (no additional fetch needed for download).
    */
    import { api, BASE_URL } from './client';
    import type { ApiDocument, ApiListResponse, DocumentType, DocumentStatus } from './types';

    // ── Request / response types ──────────────────────────────────────────────────

    export interface ListDocumentsParams {
    type?:   DocumentType;
    status?: DocumentStatus;
    /** Max rows to return (1–100). Default: 50. */
    limit?:  number;
    /** Rows to skip for pagination. Default: 0. */
    offset?: number;
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
    if (params.type   !== undefined) q.set('type',   params.type);
    if (params.status !== undefined) q.set('status', params.status);
    if (params.limit  !== undefined) q.set('limit',  String(params.limit));
    if (params.offset !== undefined) q.set('offset', String(params.offset));
    const qs = q.toString();
    return qs ? `?${qs}` : '';
    }

    // ── API surface ───────────────────────────────────────────────────────────────

    export const documentsApi = {
    /**
     * List documents with optional filtering and pagination.
     *
     *   documentsApi.list({ type: 'invoice', limit: 20, offset: 0 })
     */
    list(params: ListDocumentsParams = {}): Promise<ApiListResponse<ApiDocument>> {
      return api.get(`/api/documents${buildQuery(params)}`);
    },

    /**
     * Fetch a single document by ID.
     *
     *   documentsApi.get('uuid-here')
     */
    get(id: string): Promise<ApiDocument> {
      return api.get(`/api/documents/${encodeURIComponent(id)}`);
    },

    /**
     * Create a document record without a file.
     * Use uploadApi.upload() to attach a file in the same step.
     *
     *   documentsApi.create({ type: 'invoice', vendor: 'SABB' })
     */
    create(body: CreateDocumentBody): Promise<ApiDocument> {
      return api.post('/api/documents', body);
    },

    /**
     * Partially update a document (PATCH semantics — only supplied fields change).
     *
     *   documentsApi.update(id, { status: 'classified', vendor: 'NCB' })
     */
    update(id: string, body: UpdateDocumentBody): Promise<ApiDocument> {
      return api.patch(`/api/documents/${encodeURIComponent(id)}`, body);
    },

    /**
     * Delete a document and its associated file atomically.
     *
     *   await documentsApi.delete(id)
     */
    delete(id: string): Promise<void> {
      return api.delete(`/api/documents/${encodeURIComponent(id)}`);
    },

    /**
     * Returns the URL to stream the file attached to a document.
     * The browser can use this as an `href`, `src`, or `window.open` target.
     * No fetch is issued; the browser streams directly from the backend.
     *
     *   <a href={documentsApi.fileUrl(doc.id)} download>Download</a>
     */
    fileUrl(id: string): string {
      return `${BASE_URL}/api/documents/${encodeURIComponent(id)}/file`;
    },
    };
    
/**
 * Public API layer — TAJ Finance frontend.
 *
 * Import from this barrel rather than individual modules:
 *
 *   import { documentsApi, uploadApi, ApiError } from '../lib/api';
 *   import type { ApiDocument, UploadResult }    from '../lib/api';
 *
 * Nothing in pages / components / hooks should import from deeper paths.
 */

// ── Values ────────────────────────────────────────────────────────────────────
export { api, ApiError, BASE_URL } from './client';
export { documentsApi }            from './documents';
export { uploadApi }               from './upload';
export { healthApi }               from './health';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  DocumentType,
  DocumentStatus,
  ApiDocument,
  ApiListResponse,
  ApiPaginatedResponse,
  UploadResult,
  HealthResponse,
  ApiErrorBody,
} from './types';

export type {
  ListDocumentsParams,
  CreateDocumentBody,
  UpdateDocumentBody,
  SortBy,
  SortOrder,
} from './documents';

export type { UploadFileParams } from './upload';

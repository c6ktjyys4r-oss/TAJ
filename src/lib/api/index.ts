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
export { allocationsApi }          from './allocations';
export { reportsApi }              from './reports';

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
  ApiAllocation,
  ReportFilters,
  ReportKpis,
  ReportCategoryRow,
  ReportBranchRow,
  ReportSummary,
  ReportBranchesResponse,
} from './types';

export type { AllocationInput } from './allocations';

export type {
  ListDocumentsParams,
  CreateDocumentBody,
  UpdateDocumentBody,
  SortBy,
  SortOrder,
} from './documents';

export type { UploadFileParams } from './upload';

export { aiSettingsApi } from './ai';

export type {
  AiProvider,
  ApprovalPolicy,
  FieldPolicy,
  AiSettingsResponse,
  UpdateAiSettingsBody,
  TestConnectionResult,
  AiJobStatus,
  AiExtractionField,
  AiExtractionResult,
  AiJobResponse,
  AcceptRejectBody,
} from './types';

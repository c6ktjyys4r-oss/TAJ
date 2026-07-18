/**
 * Typed API method for POST /api/upload.
 *
 * Handles multipart/form-data construction and delegates to the core client.
 * The backend stores the file atomically in PostgreSQL alongside the document
 * record — no separate step is needed.
 */
import { api } from './client';
import type { UploadResult, DocumentType } from './types';

// ── Request types ─────────────────────────────────────────────────────────────

/**
 * Batch defaults applied to every new document created during a single
 * upload session. Supplied by the Batch Upload dialog before upload begins.
 *
 * branch and accountingMonth are required in the UI but optional here so
 * single-file uploads without the dialog can still call upload() normally.
 */
export interface BatchDefaults {
  /** Branch name, stored as metadata.defaultBranch (e.g. "Riyadh HQ"). */
  branch: string;
  /** Accounting month in YYYY-MM format (e.g. "2024-10"). */
  accountingMonth: string;
  /** Document category. Sets documents.type. */
  category?: DocumentType;
  /** Free-text notes, stored as metadata.notes. */
  notes?: string;
}

export interface UploadFileParams {
  /** The File object from a file-input or drag-and-drop event. */
  file: File;
  /**
   * Attach the file to an existing document.
   * If omitted, a new document is created using the batch defaults.
   * Any previous file on the document is replaced atomically.
   */
  documentId?: string;
  /**
   * Batch defaults to apply when creating a new document.
   * Ignored when documentId is provided.
   */
  defaults?: BatchDefaults;
}

// ── API surface ───────────────────────────────────────────────────────────────

export const uploadApi = {
  /**
   * Upload a file to the backend.
   *
   * Creates a new document using batch defaults when `documentId` is omitted.
   * Replaces the existing file when `documentId` is provided.
   *
   * Accepted types: PDF, JPEG, PNG — max 10 MB (enforced server-side).
   *
   * @example
   *   // With batch defaults
   *   const { document } = await uploadApi.upload({
   *     file,
   *     defaults: { branch: 'Riyadh HQ', accountingMonth: '2024-10', category: 'invoice' },
   *   });
   *
   *   // Replace file on existing document
   *   const { document } = await uploadApi.upload({ file, documentId: doc.id });
   */
  upload({ file, documentId, defaults }: UploadFileParams): Promise<UploadResult> {
    const form = new FormData();
    form.append('file', file);

    if (documentId !== undefined) {
      form.append('documentId', documentId);
    }

    // Append batch defaults only for new documents (no documentId)
    if (defaults && documentId === undefined) {
      form.append('branch',          defaults.branch);
      form.append('accountingMonth', defaults.accountingMonth);
      if (defaults.category) form.append('category', defaults.category);
      if (defaults.notes)    form.append('notes',    defaults.notes);
    }

    return api.upload<UploadResult>('/api/upload', form);
  },
};

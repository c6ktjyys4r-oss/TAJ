/**
    * Typed API method for POST /api/upload.
    *
    * Handles multipart/form-data construction and delegates to the core client.
    * The backend stores the file atomically in PostgreSQL alongside the document
    * record — no separate step is needed.
    */
    import { api } from './client';
    import type { UploadResult } from './types';

    // ── Request type ──────────────────────────────────────────────────────────────

    export interface UploadFileParams {
    /** The File object from a file-input or drag-and-drop event. */
    file: File;
    /**
     * Attach the file to an existing document.
     * If omitted, a new document of type "attachment" is created automatically.
     * Any previous file on the document is replaced atomically.
     */
    documentId?: string;
    }

    // ── API surface ───────────────────────────────────────────────────────────────

    export const uploadApi = {
    /**
     * Upload a file to the backend.
     *
     * Creates a new document (type: "attachment") when `documentId` is omitted.
     * Replaces the existing file when `documentId` is provided.
     *
     * Accepted types: PDF, JPEG, PNG — max 10 MB (enforced server-side).
     *
     * @example
     *   const { document, file } = await uploadApi.upload({ file: selectedFile });
     *   const { document }       = await uploadApi.upload({ file, documentId: doc.id });
     */
    upload({ file, documentId }: UploadFileParams): Promise<UploadResult> {
      const form = new FormData();
      form.append('file', file);
      if (documentId !== undefined) {
        form.append('documentId', documentId);
      }
      return api.upload<UploadResult>('/api/upload', form);
    },
    };
    
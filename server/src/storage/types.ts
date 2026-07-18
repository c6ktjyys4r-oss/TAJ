/**
    * Storage abstraction layer.
    *
    * Business logic depends only on these interfaces.
    * Swap the concrete implementation (PostgreSQL <-> S3/R2/GCS) in
    * src/storage/index.ts without touching any call site.
    */

    export interface FileUpload {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    }

    export interface StoredFileMetadata {
    /**
     * Opaque reference used to retrieve or delete the file.
     * PostgreSQL provider: UUID of the `document_files` row.
     * Future S3/R2 provider: object key in the bucket.
     */
    storageKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    }

    export interface StoredFile extends StoredFileMetadata {
    content: Buffer;
    }

    export interface StorageProvider {
    /**
     * Persist a file. Returns metadata including the opaque storageKey.
     * Callers are responsible for transactional consistency with domain records.
     */
    put(file: FileUpload): Promise<StoredFileMetadata>;

    /** Retrieve file content and metadata by storageKey. Throws ENOENT if not found. */
    get(storageKey: string): Promise<StoredFile>;

    /**
     * Remove a stored file.
     * Resolves silently when the key does not exist (safe for rollback flows).
     */
    remove(storageKey: string): Promise<void>;
    }
    
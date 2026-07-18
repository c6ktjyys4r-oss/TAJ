import type { Pool } from 'pg';
    import type { FileUpload, StoredFile, StoredFileMetadata, StorageProvider } from './types';

    /**
    * PostgreSQL-backed StorageProvider.
    *
    * Files are stored as `bytea` in the `document_files` table.
    * The upload route manages the DB transaction that wraps both the file insert
    * and the document record insert, giving atomic consistency without any
    * additional rollback logic.
    */
    export class PostgresStorageProvider implements StorageProvider {
    constructor(private readonly pool: Pool) {}

    async put(file: FileUpload): Promise<StoredFileMetadata> {
      const { rows } = await this.pool.query<{
        id: string;
        file_name: string;
        mime_type: string;
        file_size: string;
      }>(
        `INSERT INTO document_files (file_name, mime_type, file_size, content)
         VALUES ($1, $2, $3, $4)
         RETURNING id, file_name, mime_type, file_size`,
        [file.originalName, file.mimeType, file.sizeBytes, file.buffer],
      );
      const row = rows[0]!;
      return {
        storageKey:   row.id,
        originalName: row.file_name,
        mimeType:     row.mime_type,
        sizeBytes:    Number(row.file_size),
      };
    }

    async get(storageKey: string): Promise<StoredFile> {
      const { rows } = await this.pool.query<{
        id: string;
        file_name: string;
        mime_type: string;
        file_size: string;
        content: Buffer;
      }>(
        `SELECT id, file_name, mime_type, file_size, content
         FROM document_files
         WHERE id = $1`,
        [storageKey],
      );

      if (!rows[0]) {
        const err = new Error(`File not found for storage key: ${storageKey}`);
        (err as NodeJS.ErrnoException).code = 'ENOENT';
        throw err;
      }

      const row = rows[0];
      return {
        storageKey:   row.id,
        originalName: row.file_name,
        mimeType:     row.mime_type,
        sizeBytes:    Number(row.file_size),
        content:      row.content,
      };
    }

    async remove(storageKey: string): Promise<void> {
      await this.pool.query('DELETE FROM document_files WHERE id = $1', [storageKey]);
      // Resolves silently whether or not the row existed.
    }
    }
    
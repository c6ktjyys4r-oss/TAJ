import { pool } from '../db/index';
    import { PostgresStorageProvider } from './postgres-provider';
    import type { StorageProvider } from './types';

    export type { FileUpload, StoredFile, StoredFileMetadata, StorageProvider } from './types';

    let _provider: StorageProvider | null = null;

    /**
    * Returns the application-wide StorageProvider singleton.
    *
    * Currently backed by PostgreSQL (`document_files` table).
    * To migrate to S3/R2/GCS: implement StorageProvider, construct it here,
    * and no other file needs to change.
    */
    export function getStorageProvider(): StorageProvider {
    if (!_provider) {
      _provider = new PostgresStorageProvider(pool);
    }
    return _provider;
    }

    /** Override the provider — used in tests to inject a mock. */
    export function setStorageProvider(provider: StorageProvider): void {
    _provider = provider;
    }

    /** Reset to null — call between tests to force re-initialisation. */
    export function resetStorageProvider(): void {
    _provider = null;
    }
    
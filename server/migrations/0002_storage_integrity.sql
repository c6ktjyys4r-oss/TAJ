-- Migration 0002: Storage integrity constraints
    --
    -- Applies three DDL changes to enforce relational integrity that was
    -- previously managed only by convention:
    --
    --   1. documents.file_path   text  → uuid
    --      Enables a true FK to document_files.id (both uuid).
    --      USING clause safely casts any stored UUID strings; NULL rows stay NULL.
    --
    --   2. documents.file_size   text  → integer
    --      File size is a count of bytes — it must never be stored as text.
    --
    --   3. UNIQUE (documents.file_path)
    --      Enforces one-file-per-document at the database level.
    --      NULL is excluded from uniqueness, so documents without a file coexist.
    --
    --   4. FK documents.file_path → document_files(id)  ON DELETE SET NULL
    --      Prevents dangling references: if a document_files row is ever deleted
    --      directly (e.g. by a DBA), the referencing documents.file_path is set
    --      to NULL rather than left pointing at a ghost row.
    --      The forward direction (document deleted → file deleted) is handled by
    --      the application DELETE transaction, which runs both DELETEs atomically.

    ALTER TABLE documents
    ALTER COLUMN file_path TYPE uuid
      USING CASE WHEN file_path IS NOT NULL THEN file_path::uuid ELSE NULL END;

    ALTER TABLE documents
    ALTER COLUMN file_size TYPE integer
      USING CASE WHEN file_size IS NOT NULL THEN file_size::integer ELSE NULL END;

    ALTER TABLE documents
    ADD CONSTRAINT documents_file_path_unique UNIQUE (file_path);

    ALTER TABLE documents
    ADD CONSTRAINT documents_file_path_fkey
      FOREIGN KEY (file_path)
      REFERENCES document_files(id)
      ON DELETE SET NULL;
    
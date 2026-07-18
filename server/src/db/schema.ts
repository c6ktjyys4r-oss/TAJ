import {
    customType,
    date,
    decimal,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    } from 'drizzle-orm/pg-core';

    // ── Custom types ─────────────────────────────────────────────────────────────

    const bytea = customType<{ data: Buffer; driverData: Buffer }>({
    dataType() { return 'bytea'; },
    fromDriver(value) { return value as Buffer; },
    });

    // ── Enums ────────────────────────────────────────────────────────────────────

    export const documentTypeEnum = pgEnum('document_type', [
    'invoice', 'receipt', 'bank_statement',
    'credit_note', 'debit_note', 'po', 'attachment',
    ]);

    export const documentStatusEnum = pgEnum('document_status', [
    'uploaded', 'classified', 'matched', 'archived',
    ]);

    // ── Tables ───────────────────────────────────────────────────────────────────

    /**
    * document_files — stores uploaded file bytes (PostgreSQL-backed storage).
    *
    * Intentionally separated from `documents` so queries on the documents
    * table never load file content.
    *
    * Relationship ownership:
    *   `documents.file_path` (uuid FK) → `document_files.id`
    *
    * Forward cascade (document → file): enforced by the application DELETE
    * transaction (both rows deleted atomically in one BEGIN/COMMIT).
    *
    * Reverse protection (file → document): ON DELETE SET NULL on the FK means
    * a direct `document_files` deletion (e.g. by a DBA) sets
    * `documents.file_path = NULL` rather than leaving a dangling UUID.
    */
    export const documentFiles = pgTable('document_files', {
    id:        uuid('id').primaryKey().defaultRandom(),
    fileName:  text('file_name').notNull(),
    mimeType:  text('mime_type').notNull(),
    fileSize:  integer('file_size').notNull(),
    content:   bytea('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    });

    /**
    * documents — core entity of the TAJ Finance platform.
    *
    * file_path: uuid FK → document_files(id)
    *   - UNIQUE: enforces one file per document at the database level.
    *   - ON DELETE SET NULL: prevents dangling references if a file row is
    *     ever deleted outside the application transaction.
    *   - NULL is allowed: documents without an attached file are valid.
    *
    * file_size: integer — count of bytes; never stored as text.
    */
    export const documents = pgTable('documents', {
    id:         uuid('id').primaryKey().defaultRandom(),
    type:       documentTypeEnum('type').notNull(),
    vendor:     text('vendor'),
    date:       date('date'),
    amount:     decimal('amount', { precision: 15, scale: 2 }),
    currency:   text('currency').notNull().default('SAR'),
    status:     documentStatusEnum('status').notNull().default('uploaded'),
    file_path:  uuid('file_path')
                  .unique()
                  .references(() => documentFiles.id, { onDelete: 'set null' }),
    file_name:  text('file_name'),
    file_size:  integer('file_size'),
    mime_type:  text('mime_type'),
    metadata:   jsonb('metadata').default({}),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    });

    // ── Types ─────────────────────────────────────────────────────────────────────

    export type Document     = typeof documents.$inferSelect;
    export type NewDocument  = typeof documents.$inferInsert;
    export type DocumentFile = typeof documentFiles.$inferSelect;
    
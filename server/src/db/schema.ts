import { pgEnum, pgTable, uuid, text, decimal, date, timestamp, jsonb } from 'drizzle-orm/pg-core';

// ── Enums ────────────────────────────────────────────────────────────────────

export const documentTypeEnum = pgEnum('document_type', [
  'invoice',
  'receipt',
  'bank_statement',
  'credit_note',
  'debit_note',
  'po',
  'attachment',
]);

export const documentStatusEnum = pgEnum('document_status', [
  'uploaded',
  'classified',
  'matched',
  'archived',
]);

// ── Tables ───────────────────────────────────────────────────────────────────

/**
 * documents — core entity of the TAJ Finance platform.
 *
 * Every other module (Classification, Bank Matching, Reports, AI, Archive)
 * derives from this table. See ARCHITECTURE_BIBLE.md Principle 1–2.
 */
export const documents = pgTable('documents', {
  id:         uuid('id').primaryKey().defaultRandom(),
  type:       documentTypeEnum('type').notNull(),
  vendor:     text('vendor'),
  date:       date('date'),
  amount:     decimal('amount', { precision: 15, scale: 2 }),
  currency:   text('currency').notNull().default('SAR'),
  status:     documentStatusEnum('status').notNull().default('uploaded'),
  file_path:  text('file_path'),
  file_name:  text('file_name'),
  file_size:  text('file_size'),
  mime_type:  text('mime_type'),
  metadata:   jsonb('metadata').default({}),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Types ────────────────────────────────────────────────────────────────────

export type Document    = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

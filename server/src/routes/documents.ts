import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, or, count, ilike, inArray, asc, desc, SQL } from 'drizzle-orm';
import { z } from 'zod';
import { db, pool } from '../db/index';
import { documents, documentTypeEnum, documentStatusEnum } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ── Validation schemas ────────────────────────────────────────────────────────

const documentTypes    = documentTypeEnum.enumValues;
const documentStatuses = documentStatusEnum.enumValues;

const createDocumentSchema = z.object({
  type:     z.enum(documentTypes),
  vendor:   z.string().trim().optional(),
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  amount:   z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a positive decimal').optional(),
  currency: z.string().length(3).default('SAR'),
  status:   z.enum(documentStatuses).default('uploaded'),
  metadata: z.record(z.unknown()).optional(),
});

const updateDocumentSchema = createDocumentSchema.partial();

const SORT_COLUMNS = {
  date:       documents.date,
  file_name:  documents.file_name,
  vendor:     documents.vendor,
  file_size:  documents.file_size,
  created_at: documents.created_at,
  status:     documents.status,
  type:       documents.type,
} as const;

type SortableKey = keyof typeof SORT_COLUMNS;

const listQuerySchema = z.object({
  // Tab-level single filters (existing)
  type:      z.enum(documentTypes).optional(),
  status:    z.enum(documentStatuses).optional(),
  // FilterPanel multi-select filters — Express may send one value (string) or many (string[])
  statuses:  z.preprocess(
    (v) => v === undefined ? undefined : Array.isArray(v) ? v : [v],
    z.array(z.enum(documentStatuses)).optional(),
  ),
  types: z.preprocess(
    (v) => v === undefined ? undefined : Array.isArray(v) ? v : [v],
    z.array(z.enum(documentTypes)).optional(),
  ),
  search:    z.string().trim().optional(),
  sortBy:    z.enum(['date','file_name','vendor','file_size','created_at','status','type']).default('date'),
  sortOrder: z.enum(['asc','desc']).default('desc'),
  page:      z.coerce.number().int().min(1).default(1),
  pageSize:  z.coerce.number().int().min(1).max(100).default(20),
});

// ── GET /api/documents ────────────────────────────────────────────────────────

/**
 * Returns a page of documents with server-computed pagination metadata.
 * Never loads the entire table into memory — LIMIT/OFFSET is applied at
 * the database level alongside a parallel COUNT(*) query.
 *
 * Optional `search` param performs a case-insensitive ILIKE match against
 * file_name and vendor — the only text fields available without a schema change.
 *
 * Response shape:
 *   { items, totalCount, currentPage, pageSize, totalPages }
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = listQuerySchema.safeParse(req.query);
    if (!query.success) {
      throw new AppError(400, 'INVALID_QUERY', query.error.errors[0]?.message ?? 'Invalid query parameters');
    }
    const { type, status, statuses, types, search, sortBy, sortOrder, page, pageSize } = query.data;
    const offset = (page - 1) * pageSize;

    // Build WHERE conditions — tab filters (single value) AND panel filters (multi-value)
    const conditions: SQL[] = [];
    if (type)              conditions.push(eq(documents.type,     type));
    if (status)            conditions.push(eq(documents.status,   status));
    if (statuses?.length)  conditions.push(inArray(documents.status, statuses));
    if (types?.length)     conditions.push(inArray(documents.type,   types));
    if (search) {
      const term = `%${search}%`;
      conditions.push(
        or(
          ilike(documents.file_name, term),
          ilike(documents.vendor,    term),
        ) as SQL,
      );
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // ORDER BY — resolved at SQL level, never in-memory
    const col     = SORT_COLUMNS[sortBy as SortableKey];
    const orderBy = sortOrder === 'asc' ? asc(col) : desc(col);

    // Run COUNT and paginated SELECT in parallel — neither loads the full table
    const [countResult, items] = await Promise.all([
      db.select({ value: count() }).from(documents).where(where),
      db.select().from(documents).where(where).orderBy(orderBy).limit(pageSize).offset(offset),
    ]);

    const totalCount = Number(countResult[0]?.value ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    res.json({ items, totalCount, currentPage: page, pageSize, totalPages });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/documents/:id ────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${id} not found`);
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/documents ───────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = createDocumentSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(400, 'INVALID_BODY', body.error.errors[0]?.message ?? 'Invalid request body');
    }
    const [created] = await db.insert(documents).values(body.data).returning();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/documents/:id ──────────────────────────────────────────────────

router.patch('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!existing) throw new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${id} not found`);

    const body = updateDocumentSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(400, 'INVALID_BODY', body.error.errors[0]?.message ?? 'Invalid request body');
    }
    if (Object.keys(body.data).length === 0) {
      throw new AppError(400, 'EMPTY_UPDATE', 'Request body must contain at least one field to update');
    }

    const [updated] = await db
      .update(documents)
      .set({ ...body.data, updated_at: new Date() })
      .where(eq(documents.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/documents/:id ─────────────────────────────────────────────────

/**
 * Deletes the document record and its associated stored file atomically.
 * Both rows are removed in a single transaction — no orphaned files or records.
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!existing) throw new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${id} not found`);

    const storageKey = existing.file_path;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM documents WHERE id = $1', [id]);
      if (storageKey) {
        await client.query('DELETE FROM document_files WHERE id = $1', [storageKey]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => { /* ignore */ });
      throw err;
    } finally {
      client.release();
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

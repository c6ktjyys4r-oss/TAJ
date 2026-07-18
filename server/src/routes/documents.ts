import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, count, SQL } from 'drizzle-orm';
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

const listQuerySchema = z.object({
  type:     z.enum(documentTypes).optional(),
  status:   z.enum(documentStatuses).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ── GET /api/documents ────────────────────────────────────────────────────────

/**
 * Returns a page of documents with server-computed pagination metadata.
 * Never loads the entire table into memory — LIMIT/OFFSET is applied at
 * the database level alongside a parallel COUNT(*) query.
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
    const { type, status, page, pageSize } = query.data;
    const offset = (page - 1) * pageSize;

    // Build WHERE conditions
    const conditions: SQL[] = [];
    if (type)   conditions.push(eq(documents.type,   type));
    if (status) conditions.push(eq(documents.status, status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Run COUNT and paginated SELECT in parallel — neither loads the full table
    const [countResult, items] = await Promise.all([
      db.select({ value: count() }).from(documents).where(where),
      db.select().from(documents).where(where).limit(pageSize).offset(offset),
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

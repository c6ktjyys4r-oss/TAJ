import { Router, Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index';
import { documents, documentTypeEnum, documentStatusEnum } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ── Validation schemas ────────────────────────────────────────────────────────

const documentTypes = documentTypeEnum.enumValues;
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
  type:   z.enum(documentTypes).optional(),
  status: z.enum(documentStatuses).optional(),
  limit:  z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ── GET /api/documents ────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = listQuerySchema.safeParse(req.query);
    if (!query.success) {
      throw new AppError(400, 'INVALID_QUERY', query.error.errors[0]?.message ?? 'Invalid query parameters');
    }
    const { type, status, limit, offset } = query.data;

    // Build dynamic where clause
    let rows = await db.select().from(documents);

    // Filter in JS for simplicity (table is small in Sprint 2; use SQL predicates in Sprint 3+)
    if (type)   rows = rows.filter(r => r.type === type);
    if (status) rows = rows.filter(r => r.status === status);

    const total = rows.length;
    const data  = rows.slice(offset, offset + limit);

    res.json({ data, total, limit, offset });
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

    // Verify exists
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

router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!existing) throw new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${id} not found`);

    await db.delete(documents).where(eq(documents.id, id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

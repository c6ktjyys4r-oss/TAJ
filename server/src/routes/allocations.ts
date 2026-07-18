/**
 * Allocations routes — /api/documents/:id/allocations
 *
 * An allocation records how much of an expense is assigned to a given branch.
 * A document may have zero, one, or many allocations.
 *
 * Endpoints:
 *   GET    /api/documents/:id/allocations  — list all allocations for a document
 *   PUT    /api/documents/:id/allocations  — atomically replace all allocations
 *   DELETE /api/documents/:id/allocations  — remove all allocations for a document
 *
 * Validation invariant (PUT only):
 *   If documents.amount IS NOT NULL →
 *     SUM(body.allocations[*].amount) must equal documents.amount exactly
 *     (compared as rounded decimals to avoid floating-point drift).
 *
 * Backward compatibility:
 *   Documents with no allocations continue to work unchanged.
 *   Existing document CRUD endpoints are not modified.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { eq }                                       from 'drizzle-orm';
import { z }                                        from 'zod';
import { db }                                       from '../db/index';
import { documents, allocations }                   from '../db/schema';
import { AppError }                                 from '../middleware/errorHandler';

const router = Router({ mergeParams: true }); // gives access to :id from parent

// ── Validation schema ─────────────────────────────────────────────────────────

const allocationItemSchema = z.object({
  branch: z
    .string()
    .trim()
    .min(1, 'branch must not be empty'),
  amount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      'amount must be a positive decimal with at most 2 decimal places',
    ),
});

const setAllocationsSchema = z.object({
  allocations: z
    .array(allocationItemSchema)
    .min(1, 'allocations must contain at least one entry'),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fetch document or throw 404. */
async function requireDocument(id: string) {
  const [doc] = await db
    .select({ id: documents.id, amount: documents.amount })
    .from(documents)
    .where(eq(documents.id, id));
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${id} not found`);
  return doc;
}

/**
 * Validate that the sum of allocation amounts equals the document total.
 * Only enforced when documents.amount is non-null.
 * Uses cent-level integer comparison to avoid floating-point drift.
 */
function validateSum(
  items:     { amount: string }[],
  docAmount: string | null,
): void {
  if (docAmount === null) return; // no total set — skip sum check

  const docCents  = Math.round(parseFloat(docAmount)    * 100);
  const sumCents  = items.reduce((acc, a) => acc + Math.round(parseFloat(a.amount) * 100), 0);

  if (sumCents !== docCents) {
    const sumStr = (sumCents  / 100).toFixed(2);
    const totStr = (docCents  / 100).toFixed(2);
    throw new AppError(
      422,
      'ALLOCATION_SUM_MISMATCH',
      `Allocation amounts sum to ${sumStr} but the document total is ${totStr}`,
    );
  }
}

// ── GET /api/documents/:id/allocations ───────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await requireDocument(id);

    const rows = await db
      .select()
      .from(allocations)
      .where(eq(allocations.document_id, id));

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/documents/:id/allocations ───────────────────────────────────────
//
// Atomically replaces all existing allocations with the supplied set.
// Validates that allocation amounts sum to the document total (when set).

router.put('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const doc    = await requireDocument(id);

    const parsed = setAllocationsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        400,
        'INVALID_BODY',
        parsed.error.errors[0]?.message ?? 'Invalid request body',
      );
    }

    validateSum(parsed.data.allocations, doc.amount);

    // Atomic replace: delete existing → insert new, all in one transaction.
    let inserted: (typeof allocations.$inferSelect)[] = [];

    await db.transaction(async (tx) => {
      await tx.delete(allocations).where(eq(allocations.document_id, id));

      inserted = await tx
        .insert(allocations)
        .values(
          parsed.data.allocations.map((a) => ({
            document_id: id,
            branch:      a.branch,
            amount:      a.amount,
          })),
        )
        .returning();
    });

    res.json(inserted);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/documents/:id/allocations ────────────────────────────────────

router.delete('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await requireDocument(id);
    await db.delete(allocations).where(eq(allocations.document_id, id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

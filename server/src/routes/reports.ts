/**
 * Reports routes — /api/reports
 *
 * Allocation-aware expense summaries for the Reports page.
 *
 * Endpoints:
 *   GET /api/reports/summary  — KPIs, expenses by category, expenses by branch
 *   GET /api/reports/branches — distinct branch names (for filter dropdown)
 *
 * Allocation-aware rules:
 *   No branch filter:   KPIs + byCategory use documents.amount directly.
 *                       byBranch always uses allocations grouped by branch.
 *   With branch filter: KPIs + byCategory use allocations.amount for that
 *                       branch only. Docs without an allocation for that branch
 *                       are excluded.
 *   Single-branch docs (1 allocation) and multi-branch docs (N allocations)
 *   are handled identically — amounts always flow through the allocations table
 *   for branch-level reporting.
 */
import { NextFunction, Request, Response, Router } from 'express';
import { sql }                                     from 'drizzle-orm';
import { z }                                       from 'zod';
import { db }                                      from '../db/index';
import { AppError }                                from '../middleware/errorHandler';

const router = Router();

// ── Validation ────────────────────────────────────────────────────────────────

const CATEGORY_VALUES = [
  'invoice', 'receipt', 'bank_statement',
  'credit_note', 'debit_note', 'po', 'attachment',
] as const;

const summaryQuerySchema = z.object({
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateFrom must be YYYY-MM-DD')
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateTo must be YYYY-MM-DD')
    .optional(),
  branch:   z.string().trim().min(1).optional(),
  category: z.enum(CATEGORY_VALUES).optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function toFixed2(v: unknown): string {
  return parseFloat(String(v ?? '0')).toFixed(2);
}

function toInt(v: unknown): number {
  return parseInt(String(v ?? '0'), 10);
}

// ── GET /api/reports/summary ─────────────────────────────────────────────────

router.get(
  '/summary',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = summaryQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(
          400,
          'INVALID_QUERY',
          parsed.error.errors[0]?.message ?? 'Invalid query parameters',
        );
      }

      const { dateFrom, dateTo, branch, category } = parsed.data;

      // Reusable condition fragments (safe — only injected when non-null)
      const dateFromSql = dateFrom
        ? sql`AND d.date >= ${dateFrom}::date`
        : sql``;
      const dateToSql = dateTo
        ? sql`AND d.date <= ${dateTo}::date`
        : sql``;
      const catSql = category
        ? sql`AND d.type::text = ${category}`
        : sql``;

      if (branch) {
        // ── Branch-filtered path ───────────────────────────────────────────
        // Amounts come from allocations.amount for the requested branch.

        const kpiResult = await db.execute(sql`
          SELECT
            COALESCE(SUM(a.amount), 0)::numeric  AS total_expenses,
            COUNT(DISTINCT d.id)::bigint          AS document_count
          FROM documents d
          JOIN allocations a
            ON a.document_id = d.id
           AND a.branch      = ${branch}
          WHERE d.amount IS NOT NULL
          ${dateFromSql}
          ${dateToSql}
          ${catSql}
        `);

        const kr            = (kpiResult.rows[0] ?? {}) as Record<string, unknown>;
        const totalExpenses = parseFloat(String(kr.total_expenses ?? '0'));
        const documentCount = toInt(kr.document_count);
        const averageExpense =
          documentCount > 0 ? totalExpenses / documentCount : 0;

        const catResult = await db.execute(sql`
          SELECT
            d.type::text                           AS category,
            COALESCE(SUM(a.amount), 0)::numeric    AS amount,
            COUNT(DISTINCT d.id)::bigint           AS count
          FROM documents d
          JOIN allocations a
            ON a.document_id = d.id
           AND a.branch      = ${branch}
          WHERE d.amount IS NOT NULL
          ${dateFromSql}
          ${dateToSql}
          ${catSql}
          GROUP BY d.type
          ORDER BY SUM(a.amount) DESC NULLS LAST
        `);

        const branchResult = await db.execute(sql`
          SELECT
            a.branch,
            COALESCE(SUM(a.amount), 0)::numeric    AS amount,
            COUNT(DISTINCT d.id)::bigint           AS count
          FROM documents d
          JOIN allocations a
            ON a.document_id = d.id
           AND a.branch      = ${branch}
          WHERE d.amount IS NOT NULL
          ${dateFromSql}
          ${dateToSql}
          ${catSql}
          GROUP BY a.branch
          ORDER BY SUM(a.amount) DESC NULLS LAST
        `);

        res.json({
          kpis: {
            totalExpenses:  totalExpenses.toFixed(2),
            documentCount,
            averageExpense: averageExpense.toFixed(2),
          },
          byCategory: (catResult.rows as Record<string, unknown>[]).map((r) => ({
            category: String(r.category ?? ''),
            amount:   toFixed2(r.amount),
            count:    toInt(r.count),
          })),
          byBranch: (branchResult.rows as Record<string, unknown>[]).map((r) => ({
            branch: String(r.branch ?? ''),
            amount: toFixed2(r.amount),
            count:  toInt(r.count),
          })),
        });

      } else {
        // ── No branch filter ───────────────────────────────────────────────
        // KPIs + byCategory use documents.amount directly.
        // byBranch uses allocations.amount grouped by branch.

        const kpiResult = await db.execute(sql`
          SELECT
            COALESCE(SUM(d.amount), 0)::numeric  AS total_expenses,
            COUNT(*)::bigint                     AS document_count
          FROM documents d
          WHERE d.amount IS NOT NULL
          ${dateFromSql}
          ${dateToSql}
          ${catSql}
        `);

        const kr            = (kpiResult.rows[0] ?? {}) as Record<string, unknown>;
        const totalExpenses = parseFloat(String(kr.total_expenses ?? '0'));
        const documentCount = toInt(kr.document_count);
        const averageExpense =
          documentCount > 0 ? totalExpenses / documentCount : 0;

        const catResult = await db.execute(sql`
          SELECT
            d.type::text                          AS category,
            COALESCE(SUM(d.amount), 0)::numeric   AS amount,
            COUNT(*)::bigint                     AS count
          FROM documents d
          WHERE d.amount IS NOT NULL
          ${dateFromSql}
          ${dateToSql}
          ${catSql}
          GROUP BY d.type
          ORDER BY SUM(d.amount) DESC NULLS LAST
        `);

        const branchResult = await db.execute(sql`
          SELECT
            a.branch,
            COALESCE(SUM(a.amount), 0)::numeric  AS amount,
            COUNT(DISTINCT d.id)::bigint         AS count
          FROM documents d
          JOIN allocations a ON a.document_id = d.id
          WHERE d.amount IS NOT NULL
          ${dateFromSql}
          ${dateToSql}
          ${catSql}
          GROUP BY a.branch
          ORDER BY SUM(a.amount) DESC NULLS LAST
        `);

        res.json({
          kpis: {
            totalExpenses:  totalExpenses.toFixed(2),
            documentCount,
            averageExpense: averageExpense.toFixed(2),
          },
          byCategory: (catResult.rows as Record<string, unknown>[]).map((r) => ({
            category: String(r.category ?? ''),
            amount:   toFixed2(r.amount),
            count:    toInt(r.count),
          })),
          byBranch: (branchResult.rows as Record<string, unknown>[]).map((r) => ({
            branch: String(r.branch ?? ''),
            amount: toFixed2(r.amount),
            count:  toInt(r.count),
          })),
        });
      }
    } catch (err) {
      next(err);
    }
  },
);

// ── GET /api/reports/branches ────────────────────────────────────────────────

router.get(
  '/branches',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await db.execute(sql`
        SELECT DISTINCT branch
        FROM allocations
        ORDER BY branch
      `);
      res.json({
        branches: (result.rows as Record<string, unknown>[]).map((r) =>
          String(r.branch ?? ''),
        ),
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

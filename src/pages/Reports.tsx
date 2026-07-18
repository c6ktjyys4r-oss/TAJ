/**
 * Reports page — Sprint: Reports Foundation (MVP)
 *
 * Shows allocation-aware expense KPIs and breakdowns.
 * Filters: Date From, Date To, Branch, Category.
 * No charts, no exports, no AI — tables and cards only.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { PageTitle }  from '../components/ui/Typography';
import { Card }       from '../components/ui/Card';
import { reportsApi } from '../lib/api';
import type {
  ReportFilters,
  ReportSummary,
  DocumentType,
} from '../lib/api';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  invoice:       'Invoice',
  receipt:       'Receipt',
  bank_statement:'Bank Statement',
  credit_note:   'Credit Note',
  debit_note:    'Debit Note',
  po:            'Purchase Order',
  attachment:    'Attachment',
};

const CATEGORY_OPTIONS: DocumentType[] = [
  'invoice', 'receipt', 'bank_statement',
  'credit_note', 'debit_note', 'po', 'attachment',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(amount: string, currency = 'SAR'): string {
  const n = parseFloat(amount);
  if (isNaN(n)) return '—';
  return n.toLocaleString('en-SA', {
    style:                 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface KpiCardProps {
  label:    string;
  value:    string;
  sub?:     string;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, loading }) => (
  <Card className="p-5 flex flex-col gap-1">
    <span className="text-xs font-medium text-ink-400 uppercase tracking-wide">
      {label}
    </span>
    {loading ? (
      <div className="h-8 w-32 rounded bg-surface-100 animate-pulse mt-1" />
    ) : (
      <span className="text-2xl font-semibold text-ink-900 tabular-nums">
        {value}
      </span>
    )}
    {sub && !loading && (
      <span className="text-xs text-ink-400">{sub}</span>
    )}
  </Card>
);

// ── Main component ────────────────────────────────────────────────────────────

export const Reports: React.FC = () => {
  // ── Filter state ────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<ReportFilters>({});
  const [draftFilters, setDraftFilters] = useState<ReportFilters>({});

  // ── Data state ──────────────────────────────────────────────────────────────
  const [summary, setSummary]         = useState<ReportSummary | null>(null);
  const [branches, setBranches]       = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // ── Fetch branches once on mount ────────────────────────────────────────────
  useEffect(() => {
    reportsApi.branches()
      .then((r) => setBranches(r.branches))
      .catch(() => { /* silently ignore — dropdown just stays empty */ });
  }, []);

  // ── Fetch summary whenever applied filters change ───────────────────────────
  const fetchSummary = useCallback(async (f: ReportFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.summary(f);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data.');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary(filters);
  }, [filters, fetchSummary]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleApply = () => setFilters({ ...draftFilters });

  const handleReset = () => {
    setDraftFilters({});
    setFilters({});
  };

  const kpis = summary?.kpis;

  return (
    <div className="space-y-6">
      <PageTitle>Reports</PageTitle>

      {/* ── Filter panel ───────────────────────────────────────────────────── */}
      <Card className="p-4">
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500" htmlFor="rpt-date-from">
              Date From
            </label>
            <input
              id="rpt-date-from"
              type="date"
              value={draftFilters.dateFrom ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  dateFrom: e.target.value || undefined,
                }))
              }
              className="h-9 rounded-md border border-border bg-white px-3 text-sm text-ink-900
                         focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500" htmlFor="rpt-date-to">
              Date To
            </label>
            <input
              id="rpt-date-to"
              type="date"
              value={draftFilters.dateTo ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  dateTo: e.target.value || undefined,
                }))
              }
              className="h-9 rounded-md border border-border bg-white px-3 text-sm text-ink-900
                         focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          {/* Branch */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500" htmlFor="rpt-branch">
              Branch
            </label>
            <select
              id="rpt-branch"
              value={draftFilters.branch ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  branch: e.target.value || undefined,
                }))
              }
              className="h-9 rounded-md border border-border bg-white px-3 text-sm text-ink-900
                         focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-500" htmlFor="rpt-category">
              Category
            </label>
            <select
              id="rpt-category"
              value={draftFilters.category ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({
                  ...f,
                  category: (e.target.value as DocumentType) || undefined,
                }))
              }
              className="h-9 rounded-md border border-border bg-white px-3 text-sm text-ink-900
                         focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="">All categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleApply}
            className="h-8 px-4 rounded-md bg-gold-500 text-white text-sm font-medium
                       hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-500
                       transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="h-8 px-4 rounded-md border border-border bg-white text-sm text-ink-600
                       hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-gold-500
                       transition-colors"
          >
            Reset
          </button>
        </div>
      </Card>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Expenses"
          value={kpis ? formatAmount(kpis.totalExpenses) : '—'}
          loading={loading}
        />
        <KpiCard
          label="Number of Documents"
          value={kpis ? kpis.documentCount.toLocaleString() : '—'}
          loading={loading}
        />
        <KpiCard
          label="Average Expense"
          value={kpis ? formatAmount(kpis.averageExpense) : '—'}
          loading={loading}
        />
      </div>

      {/* ── Breakdown tables ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Expenses by Category */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-ink-800">Expenses by Category</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 rounded bg-surface-100 animate-pulse" />
              ))}
            </div>
          ) : !summary || summary.byCategory.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink-400 text-center">
              No data for the selected filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 text-xs font-medium text-ink-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-right">Documents</th>
                  <th className="px-5 py-3 text-right">Amount (SAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.byCategory.map((row) => (
                  <tr key={row.category} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink-800">
                      {CATEGORY_LABELS[row.category] ?? row.category}
                    </td>
                    <td className="px-5 py-3 text-right text-ink-600 tabular-nums">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-ink-900 tabular-nums">
                      {formatAmount(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Expenses by Branch */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-ink-800">Expenses by Branch</h2>
            <p className="text-xs text-ink-400 mt-0.5">
              Based on allocation amounts. Documents without allocations are not included.
            </p>
          </div>
          {loading ? (
            <div className="p-5 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 rounded bg-surface-100 animate-pulse" />
              ))}
            </div>
          ) : !summary || summary.byBranch.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink-400 text-center">
              No allocation data for the selected filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 text-xs font-medium text-ink-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Branch</th>
                  <th className="px-5 py-3 text-right">Documents</th>
                  <th className="px-5 py-3 text-right">Amount (SAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.byBranch.map((row) => (
                  <tr key={row.branch} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink-800">
                      {row.branch}
                    </td>
                    <td className="px-5 py-3 text-right text-ink-600 tabular-nums">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-ink-900 tabular-nums">
                      {formatAmount(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

      </div>
    </div>
  );
};

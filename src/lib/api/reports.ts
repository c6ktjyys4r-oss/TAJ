/**
 * Typed API methods for /api/reports.
 *
 * Provides allocation-aware expense summaries with optional filters.
 */
import { api } from './client';
import type { ReportFilters, ReportSummary, ReportBranchesResponse } from './types';

function buildQuery(filters: ReportFilters): string {
  const q = new URLSearchParams();
  if (filters.dateFrom) q.set('dateFrom', filters.dateFrom);
  if (filters.dateTo)   q.set('dateTo',   filters.dateTo);
  if (filters.branch)   q.set('branch',   filters.branch);
  if (filters.category) q.set('category', filters.category);
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

export const reportsApi = {
  /**
   * Fetch KPI cards, expenses by category, and expenses by branch.
   * All totals are allocation-aware.
   */
  summary(filters: ReportFilters = {}): Promise<ReportSummary> {
    return api.get(`/api/reports/summary${buildQuery(filters)}`);
  },

  /**
   * Fetch distinct branch names from allocations (for the branch filter dropdown).
   */
  branches(): Promise<ReportBranchesResponse> {
    return api.get('/api/reports/branches');
  },
};

/**
 * Typed API methods for /api/documents/:id/allocations.
 *
 * Usage:
 *   import { allocationsApi } from '../lib/api';
 *
 *   const list = await allocationsApi.list(docId);
 *   const rows = await allocationsApi.set(docId, [
 *     { branch: 'hq',   amount: '500.00' },
 *     { branch: 'north', amount: '300.00' },
 *   ]);
 *   await allocationsApi.clear(docId);
 */
import { api }              from './client';
import type { ApiAllocation } from './types';

export interface AllocationInput {
  /** Branch identifier (e.g. 'hq', 'north'). */
  branch: string;
  /** Positive decimal string with at most 2 decimal places (e.g. '1234.50'). */
  amount: string;
}

export const allocationsApi = {
  /**
   * Return all allocations for a document.
   * Returns an empty array when the document has no allocations.
   */
  list(documentId: string): Promise<ApiAllocation[]> {
    return api.get(`/api/documents/${encodeURIComponent(documentId)}/allocations`);
  },

  /**
   * Atomically replace all allocations for a document.
   *
   * The server validates:
   *   – Each amount is a positive decimal.
   *   – SUM(amounts) == document.amount  (only when document.amount is set).
   *
   * Returns the full list of saved allocations.
   */
  set(documentId: string, items: AllocationInput[]): Promise<ApiAllocation[]> {
    return api.put(
      `/api/documents/${encodeURIComponent(documentId)}/allocations`,
      { allocations: items },
    );
  },

  /**
   * Remove all allocations for a document.
   * Safe to call on a document that has no allocations.
   */
  clear(documentId: string): Promise<void> {
    return api.delete(`/api/documents/${encodeURIComponent(documentId)}/allocations`);
  },
};

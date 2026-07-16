import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface SortableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortFn?: (a: T, b: T) => number;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface SortableTableProps<T> {
  columns: SortableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
}

export function SortableTable<T extends Record<string, unknown>>({
  columns, data, keyExtractor, onRowClick, emptyMessage = 'No data', className, defaultSort
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSort?.dir ?? 'asc');

  const handleSort = (col: SortableColumn<T>) => {
    if (!col.sortable && !col.sortFn) return;
    if (sortKey === col.key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(col.key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (col.sortFn) { cmp = col.sortFn(a, b); }
      else {
        const av = String(a[sortKey] ?? '').toLowerCase();
        const bv = String(b[sortKey] ?? '').toLowerCase();
        cmp = av < bv ? -1 : av > bv ? 1 : 0;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  return (
    <div className={clsx('w-full overflow-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => {
              const isSortable = col.sortable !== false && (col.sortFn !== undefined || true);
              const isActive = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => isSortable && handleSort(col)}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide select-none',
                    isSortable && 'cursor-pointer hover:text-ink-primary',
                    isActive && 'text-gold-600',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {isSortable && (
                      isActive
                        ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        : <ChevronsUpDown size={12} className="opacity-40" />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-ink-muted">{emptyMessage}</td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-border/60 last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-gold-50 transition-colors duration-100'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-4 py-3 text-ink-primary',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

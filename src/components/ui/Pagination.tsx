import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginationProps {
  page: number;         // 1-based
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  page, totalPages, totalItems, pageSize = 10, onChange, className
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems ?? totalPages * pageSize);

  return (
    <div className={clsx('flex items-center justify-between px-4 py-3 border-t border-border', className)}>
      {totalItems !== undefined && (
        <p className="text-xs text-ink-muted">
          Showing <span className="font-medium text-ink-primary">{start}–{end}</span> of{' '}
          <span className="font-medium text-ink-primary">{totalItems}</span> results
        </p>
      )}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-border text-ink-muted hover:border-gold-300 hover:text-gold-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-2 text-ink-muted text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={clsx(
                'w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150',
                p === page
                  ? 'bg-gold-500 text-white'
                  : 'text-ink-secondary hover:bg-gold-50 hover:text-gold-600'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg border border-border text-ink-muted hover:border-gold-300 hover:text-gold-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

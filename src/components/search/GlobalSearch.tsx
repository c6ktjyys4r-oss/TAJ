import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, BarChart2, GitMerge, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface SearchResult {
  id: string;
  type: 'document' | 'report' | 'transaction';
  title: string;
  subtitle: string;
  to: string;
}

const ALL_RESULTS: SearchResult[] = [
  { id: 'D1', type: 'document',    title: 'Invoice_AlRajhi_Oct2024.pdf',  subtitle: 'Invoice · Al Rajhi Cement · Classified',     to: '/documents' },
  { id: 'D2', type: 'document',    title: 'SABB_Statement_Oct2024.pdf',   subtitle: 'Statement · SABB · Needs Review',             to: '/documents' },
  { id: 'D3', type: 'document',    title: 'Receipt_0893.jpg',             subtitle: 'Receipt · Unclassified',                     to: '/documents' },
  { id: 'R1', type: 'report',      title: 'Q4 Financial Summary',         subtitle: 'Quarterly · 2024-10-15 · Ready',             to: '/reports'   },
  { id: 'R2', type: 'report',      title: 'October Bank Reconciliation',  subtitle: 'Monthly · 2024-10-14 · Ready',               to: '/reports'   },
  { id: 'T1', type: 'transaction', title: 'Wire Transfer — Unknown',      subtitle: 'SAR 45,200 · SABB · 2024-10-12',             to: '/bank-matching' },
  { id: 'T2', type: 'transaction', title: 'Direct Debit — Utilities',     subtitle: 'SAR 3,750 · SABB · 2024-10-10',             to: '/bank-matching' },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  document:    FileText,
  report:      BarChart2,
  transaction: GitMerge,
};

const TYPE_LABELS: Record<string, string> = {
  document: 'Document', report: 'Report', transaction: 'Transaction',
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setActiveIdx(0); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const results = query.length > 0
    ? ALL_RESULTS.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[activeIdx]) {
      navigate(results[activeIdx].to); onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-float overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKey}
            placeholder="Search documents, reports, transactions…"
            className="flex-1 text-sm text-ink-primary placeholder-ink-muted focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-ink-muted hover:text-ink-primary">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-ink-muted bg-gray-100 border border-gray-200 rounded">Esc</kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {results.map((r, i) => {
              const Icon = TYPE_ICONS[r.type];
              return (
                <button
                  key={r.id}
                  onClick={() => { navigate(r.to); onClose(); }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    i === activeIdx ? 'bg-gold-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="w-8 h-8 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-gold-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-primary truncate">{r.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{r.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-ink-muted">{TYPE_LABELS[r.type]}</span>
                    <ArrowRight size={12} className="text-ink-muted" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-ink-muted">
            No results for "<span className="font-medium text-ink-primary">{query}</span>"
          </div>
        )}

        {!query && (
          <div className="px-4 py-4">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Quick Jump</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Documents', to: '/documents', icon: FileText },
                { label: 'Reports', to: '/reports', icon: BarChart2 },
                { label: 'Bank Matching', to: '/bank-matching', icon: GitMerge },
              ].map(({ label, to, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => { navigate(to); onClose(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-border text-xs font-medium text-ink-secondary hover:border-gold-300 hover:text-gold-600 hover:bg-gold-50 transition-colors"
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex gap-4 text-[10px] text-ink-muted">
          <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1">Enter</kbd> select</span>
          <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

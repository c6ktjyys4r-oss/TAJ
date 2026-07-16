import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from './Badge';
import { Button } from './Button';

export interface FilterOption { value: string; label: string; count?: number; }

export interface FilterGroup {
  key: string;
  label: string;
  type: 'multiselect' | 'singleselect';
  options: FilterOption[];
}

export type FilterState = Record<string, string[]>;

interface FilterPanelProps {
  groups: FilterGroup[];
  value: FilterState;
  onChange: (state: FilterState) => void;
  onClear: () => void;
  className?: string;
}

const activeCount = (state: FilterState) =>
  Object.values(state).reduce((sum, arr) => sum + arr.length, 0);

export const FilterPanel: React.FC<FilterPanelProps> = ({
  groups, value, onChange, onClear, className
}) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const count = activeCount(value);

  const toggle = (groupKey: string, optVal: string) => {
    const current = value[groupKey] ?? [];
    const next = current.includes(optVal)
      ? current.filter((v) => v !== optVal)
      : [...current, optVal];
    onChange({ ...value, [groupKey]: next });
  };

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium transition-all duration-150',
          count > 0
            ? 'border-gold-400 bg-gold-50 text-gold-700'
            : 'border-border text-ink-secondary hover:border-gold-300'
        )}
      >
        <Filter size={14} />
        Filter
        {count > 0 && (
          <span className="w-4 h-4 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-72 bg-white border border-border rounded-2xl shadow-float overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-ink-primary">Filters</span>
              {count > 0 && (
                <button onClick={onClear} className="text-xs text-red-500 font-medium hover:text-red-600 flex items-center gap-1">
                  <X size={11} /> Clear all
                </button>
              )}
            </div>

            {/* Groups */}
            <div className="max-h-96 overflow-y-auto divide-y divide-border/60">
              {groups.map((group) => {
                const isExpanded = expanded[group.key] !== false;
                const selected = value[group.key] ?? [];
                return (
                  <div key={group.key} className="py-2">
                    <button
                      onClick={() => setExpanded((e) => ({ ...e, [group.key]: !isExpanded }))}
                      className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wide hover:text-ink-primary transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        {group.label}
                        {selected.length > 0 && (
                          <Badge variant="gold" size="sm">{selected.length}</Badge>
                        )}
                      </span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {isExpanded && (
                      <div className="mt-1 px-2 space-y-0.5">
                        {group.options.map((opt) => {
                          const checked = selected.includes(opt.value);
                          return (
                            <button
                              key={opt.value}
                              onClick={() => toggle(group.key, opt.value)}
                              className={clsx(
                                'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors',
                                checked
                                  ? 'bg-gold-50 text-gold-700'
                                  : 'text-ink-secondary hover:bg-gray-50 hover:text-ink-primary'
                              )}
                            >
                              <div className={clsx(
                                'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                                checked ? 'border-gold-500 bg-gold-500' : 'border-gray-300'
                              )}>
                                {checked && (
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                              <span className="flex-1 text-left font-medium">{opt.label}</span>
                              {opt.count !== undefined && (
                                <span className="text-xs text-ink-muted">{opt.count}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-3">
              <Button onClick={() => setOpen(false)} className="w-full" size="sm">
                Apply Filters {count > 0 && `(${count})`}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

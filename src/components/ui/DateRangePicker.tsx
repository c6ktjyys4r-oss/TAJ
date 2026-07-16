import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface DateRange { from: string; to: string; }

interface DateRangePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  placeholder?: string;
  className?: string;
}

const PRESETS: { label: string; range: DateRange }[] = [
  { label: 'This month',     range: { from: '2024-10-01', to: '2024-10-31' } },
  { label: 'Last 3 months',  range: { from: '2024-08-01', to: '2024-10-31' } },
  { label: 'This quarter',   range: { from: '2024-10-01', to: '2024-12-31' } },
  { label: 'This year',      range: { from: '2024-01-01', to: '2024-12-31' } },
  { label: 'Last year',      range: { from: '2023-01-01', to: '2023-12-31' } },
];

function fmt(d: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value, onChange, placeholder = 'Select date range', className
}) => {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value?.from ?? '');
  const [to, setTo]     = useState(value?.to   ?? '');

  const label = value ? `${fmt(value.from)} – ${fmt(value.to)}` : placeholder;

  const apply = () => {
    if (from && to) { onChange({ from, to }); setOpen(false); }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setFrom(''); setTo('');
  };

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-gold-400',
          value ? 'border-gold-300 bg-gold-50 text-gold-700' : 'border-border text-ink-secondary hover:border-gold-300'
        )}
      >
        <Calendar size={14} className="shrink-0" />
        <span>{label}</span>
        {value
          ? <X size={12} onClick={clear} className="ml-1 hover:text-red-500 transition-colors" />
          : <ChevronDown size={12} className="ml-1" />
        }
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 w-80 bg-white border border-border rounded-2xl shadow-float p-4 space-y-4">
            {/* Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setFrom(p.range.from); setTo(p.range.to); onChange(p.range); setOpen(false); }}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                    value?.from === p.range.from && value?.to === p.range.to
                      ? 'border-gold-400 bg-gold-50 text-gold-700'
                      : 'border-border text-ink-secondary hover:border-gold-300 hover:bg-gold-50'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom range */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Custom Range</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-ink-secondary block mb-1">From</label>
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border px-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-secondary block mb-1">To</label>
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                    className="w-full h-8 rounded-lg border border-border px-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400" />
                </div>
              </div>
              <button
                onClick={apply}
                disabled={!from || !to}
                className="w-full h-8 rounded-lg bg-gold-500 text-white text-sm font-medium disabled:opacity-40 hover:bg-gold-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

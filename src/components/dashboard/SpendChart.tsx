import React from 'react';
import { Card, CardHeader } from '../ui/Card';

interface Category { name: string; amount: number; color: string; }

const DATA: Category[] = [
  { name: 'Vendor Invoices', amount: 128500, color: '#C9A84C' },
  { name: 'Bank Fees',       amount: 14200,  color: '#A68730' },
  { name: 'Receipts',        amount: 28900,  color: '#E8C97A' },
  { name: 'Contracts',       amount: 85000,  color: '#8B6914' },
  { name: 'Utilities',       amount: 12400,  color: '#F0DFA0' },
];

const total = DATA.reduce((s, d) => s + d.amount, 0);

/** Minimal SVG sparkline — a smooth cubic path through normalised values */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 80, H = 30;
  const xs = values.map((_, i) => (i / (values.length - 1)) * W);
  const ys = values.map((v) => H - ((v - min) / range) * (H - 6) - 3);

  // Cubic bezier through all points
  const d = xs.reduce((acc, x, i) => {
    if (i === 0) return `M${x},${ys[i]}`;
    const px = xs[i - 1], py = ys[i - 1];
    const cpx = (px + x) / 2;
    return `${acc} C${cpx},${py} ${cpx},${ys[i]} ${x},${ys[i]}`;
  }, '');

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      {/* Fill under curve */}
      <path d={`${d} L${W},${H} L0,${H} Z`} fill={color} opacity={0.12} />
      <path d={d} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

// Monthly mock values per category
const MONTHLY: number[][] = [
  [18000, 22000, 19500, 24000, 21000, 23900],
  [2100, 2400, 1800, 2200, 2600, 3100],
  [4200, 5100, 3800, 4900, 5500, 5400],
  [14000, 13500, 15000, 14200, 13800, 14500],
  [1800, 2100, 2000, 2200, 2100, 2200],
];

function fmt(n: number) {
  if (n >= 1000) return `SAR ${(n / 1000).toFixed(0)}K`;
  return `SAR ${n}`;
}

export const SpendChart: React.FC = () => (
  <Card padding="md">
    <CardHeader title="Spend by Category" subtitle="This month · SAR" />
    <div className="mt-4 space-y-3">
      {DATA.map((cat, i) => {
        const pct = (cat.amount / total) * 100;
        return (
          <div key={cat.name} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-ink-secondary truncate">{cat.name}</span>
                <span className="text-xs font-semibold text-ink-primary ml-2">{fmt(cat.amount)}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
            <div className="shrink-0">
              <Sparkline values={MONTHLY[i]} color={cat.color} />
            </div>
          </div>
        );
      })}
    </div>
    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
      <span className="text-xs text-ink-muted">Total</span>
      <span className="text-sm font-bold font-serif text-ink-primary">{fmt(total)}</span>
    </div>
  </Card>
);

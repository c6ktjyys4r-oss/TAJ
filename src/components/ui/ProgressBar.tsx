import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'success' | 'info';
  animated?: boolean;
  className?: string;
}

const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2.5' };
const colors = {
  gold:    'from-gold-400 to-gold-600',
  success: 'from-emerald-400 to-emerald-600',
  info:    'from-blue-400 to-blue-600',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, label, showValue = false, size = 'md', variant = 'gold', animated = false, className
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-ink-secondary">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-ink-primary">{clamped}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className={clsx(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
            colors[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

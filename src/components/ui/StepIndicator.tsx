import React from 'react';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Step { label: string; description?: string; }

interface StepIndicatorProps {
  steps: Step[];
  current: number; // 0-based
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, current, className }) => (
  <div className={clsx('flex items-start gap-0', className)}>
    {steps.map((step, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200',
                done   && 'border-gold-500 bg-gold-500 text-white',
                active && 'border-gold-500 bg-white text-gold-600',
                !done && !active && 'border-gray-200 bg-gray-50 text-ink-muted'
              )}
            >
              {done ? <Check size={14} /> : i + 1}
            </div>
            <p className={clsx('text-xs mt-1 text-center max-w-[64px] leading-tight',
              active ? 'text-gold-600 font-semibold' : done ? 'text-ink-secondary' : 'text-ink-muted'
            )}>
              {step.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={clsx(
              'flex-1 h-0.5 mt-4 mx-1 rounded-full transition-all duration-300',
              i < current ? 'bg-gold-400' : 'bg-gray-200'
            )} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

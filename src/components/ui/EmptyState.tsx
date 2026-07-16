import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: React.ReactNode };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { wrap: 'py-8',  icon: 'w-10 h-10', title: 'text-sm', desc: 'text-xs' },
  md: { wrap: 'py-12', icon: 'w-14 h-14', title: 'text-base', desc: 'text-sm' },
  lg: { wrap: 'py-16', icon: 'w-16 h-16', title: 'text-lg',  desc: 'text-sm' },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon, title, description, action, className, size = 'md'
}) => {
  const s = sizes[size];
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center', s.wrap, className)}>
      {icon && (
        <div className={clsx('rounded-2xl bg-gold-50 flex items-center justify-center mb-4 text-gold-400', s.icon)}>
          {icon}
        </div>
      )}
      <p className={clsx('font-semibold text-ink-primary font-serif', s.title)}>{title}</p>
      {description && (
        <p className={clsx('text-ink-muted mt-1 max-w-xs leading-relaxed', s.desc)}>{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" icon={action.icon} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

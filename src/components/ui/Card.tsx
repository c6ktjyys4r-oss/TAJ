import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  onClick,
  padding = 'md',
}) => (
  <div
    onClick={onClick}
    className={clsx(
      'bg-white border border-border rounded-xl shadow-card',
      hover && 'cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-gold-200',
      paddings[padding],
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title, subtitle, action
}) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-base font-semibold text-ink-primary">{title}</h3>
      {subtitle && <p className="text-sm text-ink-secondary mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="ml-4">{action}</div>}
  </div>
);

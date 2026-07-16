import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-600',
  gold:    'bg-gold-100 text-gold-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger:  'bg-red-50 text-red-600',
  info:    'bg-blue-50 text-blue-700',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  gold:    'bg-gold-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
};

export const Badge: React.FC<BadgeProps> = ({
  children, variant = 'default', size = 'md', dot = false, className
}) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
      variants[variant],
      className
    )}
  >
    {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
    {children}
  </span>
);

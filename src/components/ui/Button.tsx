import React from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gold-500 text-white hover:bg-gold-600 active:bg-gold-700 shadow-sm',
  secondary:
    'bg-white text-ink-primary border border-border hover:border-gold-400 hover:text-gold-600 hover:bg-gold-50',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-gold-50 hover:text-gold-600',
  danger:
    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={clsx(
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant],
      sizes[size],
      className
    )}
  >
    {loading && (
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    )}
    {!loading && icon && <span className="shrink-0">{icon}</span>}
    {children && <span>{children}</span>}
  </button>
);

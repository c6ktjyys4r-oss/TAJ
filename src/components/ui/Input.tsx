import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leadingIcon,
  trailingIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          {...props}
          className={clsx(
            'w-full h-9 rounded-lg border bg-white text-sm text-ink-primary placeholder-ink-muted',
            'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400',
            error ? 'border-red-300' : 'border-border',
            leadingIcon ? 'pl-9' : 'pl-3',
            trailingIcon ? 'pr-9' : 'pr-3',
            className
          )}
        />
        {trailingIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {trailingIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
};

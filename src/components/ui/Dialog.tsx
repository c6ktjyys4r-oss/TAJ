import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

export const Dialog: React.FC<DialogProps> = ({
  open, onClose, title, description, children, footer, size = 'md'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, open);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-float',
          'animate-in fade-in zoom-in-95 duration-200',
          sizes[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 id="dialog-title" className="text-lg font-semibold text-ink-primary font-serif">{title}</h2>
            {description && <p className="text-sm text-ink-secondary mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="ml-4 p-1 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-gray-100 transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        {children && <div className="px-6 py-4">{children}</div>}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export { Button };

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

const SWIPE_THRESHOLD = 80; // px rightward swipe to dismiss

export const SlideOver: React.FC<SlideOverProps> = ({
  open, onClose, title, subtitle, children, footer, width = 'md'
}) => {
  const touchStartX = useRef<number>(0);
  const panelRef    = useRef<HTMLDivElement>(null);

  // Keyboard close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Swipe-to-dismiss (right swipe closes panel)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) onClose();
  };

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 overflow-hidden transition-all duration-300',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={clsx(
          'absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Panel */}
      <div
        className={clsx('absolute inset-y-0 right-0 flex w-full', widths[width])}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          ref={panelRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={clsx(
            'relative flex flex-col w-full bg-white shadow-float transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-ink-primary font-serif">{title}</h2>
              {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="ml-4 p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-gray-100 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2 flex-wrap">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

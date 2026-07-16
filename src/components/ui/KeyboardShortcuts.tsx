import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ShortcutGroup {
  section: string;
  items: { keys: string[]; description: string }[];
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    section: 'Navigation',
    items: [
      { keys: ['g', 'd'], description: 'Go to Dashboard' },
      { keys: ['g', 'o'], description: 'Go to Documents' },
      { keys: ['g', 'r'], description: 'Go to Reports' },
      { keys: ['g', 'b'], description: 'Go to Bank Matching' },
      { keys: ['g', 's'], description: 'Go to Settings' },
    ],
  },
  {
    section: 'Actions',
    items: [
      { keys: ['⌘', 'k'], description: 'Open global search' },
      { keys: ['u'], description: 'Upload document' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close panel / modal' },
    ],
  },
  {
    section: 'Table Navigation',
    items: [
      { keys: ['j'], description: 'Next row' },
      { keys: ['k'], description: 'Previous row' },
      { keys: ['Enter'], description: 'Open selected row' },
    ],
  },
];

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-float overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-gold-500" />
            <h2 className="text-base font-semibold font-serif text-ink-primary">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-ink-muted" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
          {SHORTCUTS.map((group) => (
            <div key={group.section}>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">{group.section}</p>
              <div className="space-y-2">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-ink-secondary">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          <kbd className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-ink-primary bg-gray-100 border border-gray-200 rounded-md min-w-[1.75rem] justify-center">
                            {k}
                          </kbd>
                          {ki < item.keys.length - 1 && <span className="text-xs text-ink-muted">then</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-6 py-3">
          <p className="text-xs text-ink-muted text-center">Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">?</kbd> anywhere to toggle this panel</p>
        </div>
      </div>
    </div>
  );
};

/** Drop-in trigger button for the shortcuts overlay */
export const ShortcutsButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={clsx(
          'fixed bottom-6 left-6 z-30 flex items-center gap-1.5 px-3 py-2 rounded-xl',
          'bg-white border border-border shadow-md text-xs font-medium text-ink-muted',
          'hover:border-gold-300 hover:text-gold-600 transition-all duration-150'
        )}
        title="Keyboard shortcuts (?)"
      >
        <Keyboard size={13} />
        <kbd className="text-[10px]">?</kbd>
      </button>
      <KeyboardShortcuts open={open} onClose={() => setOpen(false)} />
    </>
  );
};

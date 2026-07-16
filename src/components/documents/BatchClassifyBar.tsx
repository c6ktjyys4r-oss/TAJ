import React, { useState } from 'react';
import { Layers, ChevronDown, X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

const TYPES = ['Invoice', 'Receipt', 'Statement', 'Contract', 'Other'];

interface BatchClassifyBarProps {
  count: number;
  onClear: () => void;
  onClassify: (type: string) => void;
}

export const BatchClassifyBar: React.FC<BatchClassifyBarProps> = ({ count, onClear, onClassify }) => {
  const [typeOpen, setTypeOpen] = useState(false);
  const [done, setDone] = useState(false);

  const handleClassify = (type: string) => {
    setTypeOpen(false);
    onClassify(type);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <div className={clsx(
      'fixed bottom-16 left-1/2 -translate-x-1/2 z-30',
      'flex items-center gap-3 px-5 py-3 rounded-2xl shadow-float',
      'bg-ink-primary text-white border border-white/10',
      'transition-all duration-300'
    )}>
      {done ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <Check size={16} />
          <span className="text-sm font-medium">Classified successfully</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-gold-400" />
            <span className="text-sm font-semibold">
              {count} document{count !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="w-px h-5 bg-white/20" />

          {/* Classify dropdown */}
          <div className="relative">
            <button
              onClick={() => setTypeOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-primary text-sm font-semibold transition-colors"
            >
              Classify as
              <ChevronDown size={13} />
            </button>
            {typeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setTypeOpen(false)} />
                <div className="absolute bottom-full mb-2 left-0 z-20 w-40 bg-white border border-border rounded-xl shadow-float py-1 overflow-hidden">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleClassify(t)}
                      className="w-full text-left px-4 py-2 text-sm text-ink-secondary hover:bg-gold-50 hover:text-gold-700 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={<X size={13} />}
            onClick={onClear}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            Clear
          </Button>
        </>
      )}
    </div>
  );
};

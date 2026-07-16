import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Check } from 'lucide-react';
import { clsx } from 'clsx';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface ExportButtonProps {
  filename?: string;
  formats?: ExportFormat[];
  className?: string;
}

const ICONS: Record<ExportFormat, React.ElementType> = {
  csv:  FileText,
  xlsx: FileSpreadsheet,
  pdf:  FileText,
};

const LABELS: Record<ExportFormat, string> = {
  csv:  'Export CSV',
  xlsx: 'Export Excel',
  pdf:  'Export PDF',
};

export const ExportButton: React.FC<ExportButtonProps> = ({
  filename = 'export',
  formats = ['csv', 'xlsx'],
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<ExportFormat | null>(null);

  const handleExport = (fmt: ExportFormat) => {
    setDone(fmt);
    setOpen(false);
    // Simulate file download
    const blob = new Blob([`TAJ Finance Export — ${filename}.${fmt}\n(mock data)`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDone(null), 2000);
  };

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 h-9 px-3 rounded-lg border text-sm font-medium transition-all duration-150',
          done ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-border text-ink-secondary hover:border-gold-300 hover:text-gold-600'
        )}
      >
        {done ? <Check size={14} /> : <Download size={14} />}
        {done ? 'Downloaded' : 'Export'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white border border-border rounded-xl shadow-float py-1 overflow-hidden">
            {formats.map((fmt) => {
              const Icon = ICONS[fmt];
              return (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-secondary hover:bg-gold-50 hover:text-gold-700 transition-colors"
                >
                  <Icon size={14} /> {LABELS[fmt]}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

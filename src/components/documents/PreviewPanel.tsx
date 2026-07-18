/**
 * PreviewPanel — inline document review workspace.
 *
 * Rendered beside the document list (not as a modal/overlay).
 * Supports:
 *   - PDF / image preview
 *   - Inline category selector (auto-saves on change)
 *   - Inline branch selector (stored in metadata.branch, auto-saves)
 *   - Previous / Next navigation through the current visible list
 *   - Closing without a page reload
 */

import React, { useState } from 'react';
import {
  X, FileText, FileSpreadsheet, File, Tag,
  ChevronLeft, ChevronRight, Loader2, GitBranch,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge }        from '../ui/Badge';
import { toast }        from '../ui/Toast';
import { documentsApi, ApiError } from '../../lib/api';
import type { DocumentType }      from '../../lib/api';
import type { DocumentRecord }    from './DocumentDetailPanel';

// ── Static option lists ───────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'invoice',        label: 'Invoice'      },
  { value: 'receipt',        label: 'Receipt'      },
  { value: 'bank_statement', label: 'Statement'    },
  { value: 'credit_note',    label: 'Credit Note'  },
  { value: 'debit_note',     label: 'Debit Note'   },
  { value: 'po',             label: 'PO'            },
  { value: 'attachment',     label: 'Attachment'   },
];

const TYPE_LABELS: Record<DocumentType, string> = Object.fromEntries(
  TYPE_OPTIONS.map(({ value, label }) => [value, label])
) as Record<DocumentType, string>;

const BRANCH_OPTIONS = [
  { value: '',           label: '— None —'      },
  { value: 'hq',         label: 'HQ'            },
  { value: 'north',      label: 'North Region'  },
  { value: 'south',      label: 'South Region'  },
  { value: 'east',       label: 'East Region'   },
  { value: 'west',       label: 'West Region'   },
  { value: 'central',    label: 'Central Region'},
];

// ── Status → badge variant ────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'default'> = {
  Classified:    'success',
  'Needs Review': 'warning',
  Unclassified:  'default',
  Archived:      'default',
};

// ── Row patch type (passed to onRowUpdated) ───────────────────────────────────

export interface RowPatch {
  type?:        string;                      // display label (e.g. 'Invoice')
  rawType?:     DocumentType;
  rawMetadata?: Record<string, unknown>;
}

// ── File preview ──────────────────────────────────────────────────────────────

function FilePreview({ doc }: { doc: DocumentRecord }) {
  const url  = documentsApi.fileUrl(doc.id);
  const name = doc.name.toLowerCase();

  if (doc.size === '—') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-ink-muted">
        <FileText size={32} className="opacity-30" aria-hidden="true" />
        <p className="text-xs">No file attached</p>
      </div>
    );
  }

  if (name.endsWith('.pdf')) {
    return (
      <iframe
        key={doc.id}
        src={url}
        title={`Preview of ${doc.name}`}
        className="w-full h-full border-0"
        aria-label={`PDF preview: ${doc.name}`}
      />
    );
  }

  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) {
    return (
      <img
        key={doc.id}
        src={url}
        alt={`Preview of ${doc.name}`}
        className="w-full h-full object-contain"
      />
    );
  }

  const Icon =
    doc.type === 'Invoice' || doc.type === 'Statement' ? FileSpreadsheet
    : doc.type === 'Receipt' ? File
    : FileText;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-100 flex items-center justify-center">
        <Icon size={28} className="text-gold-500" aria-hidden="true" />
      </div>
      <p className="text-[10px] text-ink-muted">Preview not available</p>
    </div>
  );
}

// ── Reusable inline select ────────────────────────────────────────────────────

interface InlineSelectProps {
  label:    React.ReactNode;
  value:    string;
  options:  { value: string; label: string }[];
  saving:   boolean;
  onChange: (val: string) => void;
}

function InlineSelect({ label, value, options, saving, onChange }: InlineSelectProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {saving && (
          <Loader2 size={11} className="animate-spin text-ink-muted shrink-0" aria-hidden="true" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={saving}
          className={clsx(
            'text-xs font-medium rounded-full px-2.5 py-0.5',
            'border border-border bg-surface text-ink-primary',
            'cursor-pointer appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-0',
            'transition-opacity duration-150 max-w-[140px]',
            saving && 'opacity-50 cursor-wait',
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PreviewPanelProps {
  doc:          DocumentRecord;
  rawType:      DocumentType;
  rawMetadata:  Record<string, unknown>;
  hasPrev:      boolean;
  hasNext:      boolean;
  onPrev:       () => void;
  onNext:       () => void;
  onClose:      () => void;
  onRowUpdated: (id: string, patch: RowPatch) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  doc, rawType, rawMetadata,
  hasPrev, hasNext, onPrev, onNext,
  onClose, onRowUpdated,
}) => {
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingBranch,   setSavingBranch]   = useState(false);

  const currentBranch = typeof rawMetadata.branch === 'string' ? rawMetadata.branch : '';

  // ── Auto-save: category ───────────────────────────────────────────────────

  const handleCategoryChange = async (newRawType: string) => {
    const type = newRawType as DocumentType;
    if (type === rawType || savingCategory) return;
    setSavingCategory(true);
    try {
      await documentsApi.update(doc.id, { type });
      toast.success('Category updated');
      onRowUpdated(doc.id, {
        type:    TYPE_LABELS[type] ?? type,
        rawType: type,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update category';
      toast.error(msg);
    } finally {
      setSavingCategory(false);
    }
  };

  // ── Auto-save: branch (stored in metadata.branch) ─────────────────────────

  const handleBranchChange = async (newBranch: string) => {
    if (newBranch === currentBranch || savingBranch) return;
    setSavingBranch(true);
    const updatedMetadata = { ...rawMetadata, branch: newBranch || null };
    try {
      await documentsApi.update(doc.id, { metadata: updatedMetadata });
      toast.success('Branch updated');
      onRowUpdated(doc.id, { rawMetadata: updatedMetadata });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update branch';
      toast.error(msg);
    } finally {
      setSavingBranch(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0 gap-2">
        {/* Prev / Next */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous document"
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              hasPrev
                ? 'text-ink-muted hover:text-ink-primary hover:bg-gray-100'
                : 'text-ink-muted/30 cursor-not-allowed',
            )}
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next document"
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              hasNext
                ? 'text-ink-muted hover:text-ink-primary hover:bg-gray-100'
                : 'text-ink-muted/30 cursor-not-allowed',
            )}
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold text-ink-primary truncate leading-snug"
            title={doc.name}
          >
            {doc.name}
          </p>
          <p className="text-[9px] text-ink-muted uppercase tracking-wide">Quick Review</p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close preview panel"
          className="shrink-0 p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-gray-100 transition-colors"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {/* ── File preview ── */}
      <div className="shrink-0 bg-gray-50 border-b border-border" style={{ height: 240 }}>
        <FilePreview doc={doc} />
      </div>

      {/* ── Metadata + inline editors ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* File name */}
        <div>
          <p className="text-[10px] text-ink-muted uppercase tracking-wide mb-0.5">File name</p>
          <p className="text-xs font-medium text-ink-primary break-all leading-relaxed">{doc.name}</p>
        </div>

        <div className="h-px bg-border" />

        {/* Category — inline select, auto-saves */}
        <InlineSelect
          label={<><Tag size={11} aria-hidden="true" /> Category</>}
          value={rawType}
          options={TYPE_OPTIONS}
          saving={savingCategory}
          onChange={handleCategoryChange}
        />

        {/* Branch — inline select, auto-saves (stored in metadata) */}
        <InlineSelect
          label={<><GitBranch size={11} aria-hidden="true" /> Branch</>}
          value={currentBranch}
          options={BRANCH_OPTIONS}
          saving={savingBranch}
          onChange={handleBranchChange}
        />

        <div className="h-px bg-border" />

        {/* Status — read-only */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-muted shrink-0">Status</span>
          <Badge variant={STATUS_VARIANT[doc.status] ?? 'default'} size="sm">
            {doc.status}
          </Badge>
        </div>

        {/* Vendor — read-only, only when present */}
        {doc.vendor !== '—' && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-ink-muted shrink-0">Vendor</span>
            <span className="text-xs font-medium text-ink-secondary text-right truncate max-w-[150px]">
              {doc.vendor}
            </span>
          </div>
        )}

        {/* Date — read-only */}
        {doc.date && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-ink-muted shrink-0">Date</span>
            <span className="text-xs font-medium text-ink-secondary">{doc.date}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * PreviewPanel — inline document review workspace.
 *
 * Rendered beside the document list (not as a modal/overlay).
 * Supports:
 *   - PDF / image preview
 *   - Inline category selector (auto-saves on change)
 *   - Inline branch selector (stored in metadata.branch, auto-saves)
 *   - Allocation editor: split expense across branches (explicit Save)
 *   - Previous / Next navigation through the current visible list
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, FileText, FileSpreadsheet, File, Tag,
  ChevronLeft, ChevronRight, Loader2, GitBranch,
  Plus, Trash2, Layers, Calendar, Hash, AlignLeft,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge }           from '../ui/Badge';
import { toast }           from '../ui/Toast';
import { documentsApi, allocationsApi, ApiError } from '../../lib/api';
import type { DocumentType } from '../../lib/api';
import type { DocumentRecord } from './DocumentDetailPanel';

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

/** All selectable branches — also used for allocations (no "None" entry). */
const BRANCH_OPTIONS = [
  { value: '',        label: '— None —'      },
  { value: 'hq',     label: 'HQ'            },
  { value: 'north',  label: 'North Region'  },
  { value: 'south',  label: 'South Region'  },
  { value: 'east',   label: 'East Region'   },
  { value: 'west',   label: 'West Region'   },
  { value: 'central',label: 'Central Region'},
];

/** Branch options for allocation rows — "None" is not a valid allocation branch. */
const ALLOC_BRANCH_OPTIONS = BRANCH_OPTIONS.filter(b => b.value !== '');

// ── Status → badge variant ────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'default'> = {
  Classified:    'success',
  'Needs Review': 'warning',
  Unclassified:  'default',
  Archived:      'default',
};

// ── Row patch type (passed to onRowUpdated) ───────────────────────────────────

export interface RowPatch {
  type?:        string;
  rawType?:     DocumentType;
  rawMetadata?: Record<string, unknown>;
  /** Display date string (shown in the list row). */
  date?:        string;
  /** Raw YYYY-MM-DD from documents.date; null when unset. */
  rawDate?:     string | null;
}

// ── Allocation draft row ──────────────────────────────────────────────────────

interface DraftRow {
  /** Stable local key — NOT the server-side UUID (draft rows use a counter). */
  key:    string;
  branch: string;
  amount: string; // raw text value from the input
}

let _draftCounter = 0;
function nextKey(): string { return `draft-${++_draftCounter}`; }

// ── Amount helpers ────────────────────────────────────────────────────────────

/** Parse a decimal string to integer cents. NaN / non-positive → 0. */
function toCents(s: string): number {
  const v = parseFloat(s);
  return Number.isFinite(v) && v > 0 ? Math.round(v * 100) : 0;
}

const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

function isValidAmount(s: string): boolean {
  return AMOUNT_RE.test(s) && parseFloat(s) > 0;
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

// ── Reusable inline select (category / branch auto-save) ──────────────────────

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

// ── AllocationEditor ──────────────────────────────────────────────────────────

interface AllocationEditorProps {
  docId:     string;
  rawAmount: string | null; // documents.amount decimal string, or null
}

function AllocationEditor({ docId, rawAmount }: AllocationEditorProps) {
  const [draft,   setDraft]   = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [dirty,   setDirty]   = useState(false);

  // ── Fetch existing allocations whenever the document changes ────────────────

  useEffect(() => {
    let active = true;
    setLoading(true);
    setDraft([]);
    setDirty(false);
    allocationsApi.list(docId)
      .then((rows) => {
        if (!active) return;
        setDraft(
          rows.map((r) => ({ key: r.id, branch: r.branch, amount: r.amount }))
        );
      })
      .catch(() => { if (active) toast.error('Failed to load allocations'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [docId]);

  // ── Derived amounts (cent math to avoid floating-point drift) ───────────────

  const docCents       = rawAmount !== null ? Math.round(parseFloat(rawAmount) * 100) : null;
  const allocCents     = draft.reduce((sum, r) => sum + toCents(r.amount), 0);
  const remainingCents = docCents !== null ? docCents - allocCents : null;

  // ── Row validation ──────────────────────────────────────────────────────────

  const rowsAllValid = draft.every(
    (r) => r.branch !== '' && isValidAmount(r.amount)
  );

  const canSave =
    !saving &&
    dirty &&
    (draft.length === 0 || rowsAllValid) &&
    (remainingCents === null || remainingCents === 0);

  // ── Draft mutations ─────────────────────────────────────────────────────────

  const addRow = useCallback(() => {
    setDraft((prev) => [
      ...prev,
      { key: nextKey(), branch: 'hq', amount: '' },
    ]);
    setDirty(true);
  }, []);

  const removeRow = useCallback((key: string) => {
    setDraft((prev) => prev.filter((r) => r.key !== key));
    setDirty(true);
  }, []);

  const updateRow = useCallback((key: string, field: 'branch' | 'amount', val: string) => {
    setDraft((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: val } : r))
    );
    setDirty(true);
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (draft.length === 0) {
        await allocationsApi.clear(docId);
        toast.success('Allocations cleared');
      } else {
        const saved = await allocationsApi.set(
          docId,
          draft.map((r) => ({
            branch: r.branch,
            amount: parseFloat(r.amount).toFixed(2),
          })),
        );
        // Sync keys to server-returned IDs so future edits are stable
        setDraft(saved.map((r) => ({ key: r.id, branch: r.branch, amount: r.amount })));
        toast.success('Allocations saved');
      }
      setDirty(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save allocations';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [canSave, docId, draft]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const remainingLabel =
    remainingCents === null      ? '—'
    : remainingCents === 0       ? '0.00'
    : (remainingCents / 100).toFixed(2);

  const remainingColor =
    remainingCents === null  ? 'text-ink-muted'
    : remainingCents === 0   ? 'text-emerald-600'
    : remainingCents < 0     ? 'text-red-500'
    : 'text-amber-500';

  return (
    <div className="space-y-2.5">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
          <Layers size={12} aria-hidden="true" />
          Allocations
        </span>
        <button
          onClick={addRow}
          disabled={saving || loading}
          aria-label="Add allocation row"
          className={clsx(
            'flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full',
            'border border-border text-ink-muted',
            'hover:text-gold-600 hover:border-gold-300 hover:bg-gold-50 transition-colors',
            (saving || loading) && 'opacity-40 cursor-not-allowed',
          )}
        >
          <Plus size={10} aria-hidden="true" />
          Add
        </button>
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={14} className="animate-spin text-ink-muted" aria-hidden="true" />
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && draft.length === 0 && (
        <p className="text-[11px] text-ink-muted italic py-1">
          No allocations yet — click Add to split this expense.
        </p>
      )}

      {/* ── Draft rows ── */}
      {!loading && draft.length > 0 && (
        <div className="space-y-1.5">
          {draft.map((row) => {
            const amtInvalid = row.amount !== '' && !isValidAmount(row.amount);
            return (
              <div key={row.key} className="flex items-center gap-1.5">

                {/* Branch selector */}
                <select
                  value={row.branch}
                  onChange={(e) => updateRow(row.key, 'branch', e.target.value)}
                  disabled={saving}
                  aria-label="Allocation branch"
                  className={clsx(
                    'flex-1 min-w-0 text-[11px] rounded-lg px-2 py-1',
                    'border border-border bg-surface text-ink-primary',
                    'focus:outline-none focus:ring-1 focus:ring-gold-300',
                    'appearance-none cursor-pointer transition-opacity',
                    saving && 'opacity-50 cursor-wait',
                  )}
                >
                  {ALLOC_BRANCH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* Amount input */}
                <input
                  type="text"
                  inputMode="decimal"
                  value={row.amount}
                  onChange={(e) => updateRow(row.key, 'amount', e.target.value)}
                  disabled={saving}
                  placeholder="0.00"
                  aria-label="Allocation amount"
                  className={clsx(
                    'w-20 shrink-0 text-[11px] text-right rounded-lg px-2 py-1',
                    'border bg-surface text-ink-primary',
                    'focus:outline-none focus:ring-1 focus:ring-gold-300',
                    'transition-colors placeholder:text-ink-muted/50',
                    amtInvalid ? 'border-red-400 bg-red-50' : 'border-border',
                    saving && 'opacity-50 cursor-wait',
                  )}
                />

                {/* Remove */}
                <button
                  onClick={() => removeRow(row.key)}
                  disabled={saving}
                  aria-label="Remove allocation row"
                  className={clsx(
                    'shrink-0 p-1 rounded-lg text-ink-muted',
                    'hover:text-red-500 hover:bg-red-50 transition-colors',
                    saving && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <Trash2 size={11} aria-hidden="true" />
                </button>

              </div>
            );
          })}
        </div>
      )}

      {/* ── Totals ── */}
      {!loading && (
        <div className="rounded-lg bg-gray-50 border border-border px-3 py-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-muted">Total Allocated</span>
            <span className="text-[11px] font-medium text-ink-primary tabular-nums">
              {(allocCents / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-muted">Remaining</span>
            <span className={clsx('text-[11px] font-semibold tabular-nums', remainingColor)}>
              {remainingLabel}
            </span>
          </div>
        </div>
      )}

      {/* ── Save button ── */}
      {!loading && (
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={clsx(
            'w-full flex items-center justify-center gap-1.5',
            'text-[11px] font-semibold py-1.5 rounded-lg transition-colors',
            canSave
              ? 'bg-gold-500 hover:bg-gold-600 text-white cursor-pointer'
              : 'bg-gray-100 text-ink-muted/50 cursor-not-allowed',
          )}
        >
          {saving ? (
            <><Loader2 size={11} className="animate-spin" aria-hidden="true" /> Saving…</>
          ) : (
            'Save Allocations'
          )}
        </button>
      )}

    </div>
  );
}

// ── PreviewPanel component ────────────────────────────────────────────────────

interface PreviewPanelProps {
  doc:          DocumentRecord;
  rawType:      DocumentType;
  rawMetadata:  Record<string, unknown>;
  rawAmount:    string | null;
  rawDate:      string | null;
  hasPrev:      boolean;
  hasNext:      boolean;
  onPrev:       () => void;
  onNext:       () => void;
  onClose:      () => void;
  onRowUpdated: (id: string, patch: RowPatch) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  doc, rawType, rawMetadata, rawAmount, rawDate,
  hasPrev, hasNext, onPrev, onNext,
  onClose, onRowUpdated,
}) => {
  // ── Derived current values from props ──────────────────────────────────────
  const currentBranch = typeof rawMetadata.branch === 'string' ? rawMetadata.branch : '';
  const currentRef    = typeof rawMetadata.reference_number === 'string' ? rawMetadata.reference_number : '';
  const currentNotes  = typeof rawMetadata.notes === 'string' ? rawMetadata.notes : '';

  // ── Saving flags ───────────────────────────────────────────────────────────
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingBranch,   setSavingBranch]   = useState(false);
  const [savingDate,     setSavingDate]     = useState(false);
  const [savingRef,      setSavingRef]      = useState(false);
  const [savingNotes,    setSavingNotes]    = useState(false);

  // ── Local editable state — reset when doc.id changes (Prev / Next) ─────────
  const [localDate,  setLocalDate]  = useState(rawDate  ?? '');
  const [localRef,   setLocalRef]   = useState(currentRef);
  const [localNotes, setLocalNotes] = useState(currentNotes);

  useEffect(() => {
    setLocalDate(rawDate ?? '');
    setLocalRef(
      typeof rawMetadata.reference_number === 'string' ? rawMetadata.reference_number : ''
    );
    setLocalNotes(
      typeof rawMetadata.notes === 'string' ? rawMetadata.notes : ''
    );
  // Intentionally depend only on doc.id so mid-edit state isn't clobbered
  // when a sibling field saves and rawMetadata flows back via onRowUpdated.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id]);

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

  // ── Auto-save: date (documents.date, YYYY-MM-DD) ──────────────────────────

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // '' when cleared
    setLocalDate(newDate);
    if (!newDate || newDate === rawDate) return;
    setSavingDate(true);
    try {
      await documentsApi.update(doc.id, { date: newDate });
      toast.success('Date updated');
      onRowUpdated(doc.id, { date: newDate, rawDate: newDate });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update date';
      toast.error(msg);
      setLocalDate(rawDate ?? ''); // revert on error
    } finally {
      setSavingDate(false);
    }
  };

  // ── Auto-save: reference number (stored in metadata.reference_number) ──────

  const handleRefSave = async () => {
    const trimmed = localRef.trim();
    if (trimmed === currentRef || savingRef) return;
    setSavingRef(true);
    const updatedMetadata = { ...rawMetadata, reference_number: trimmed || null };
    try {
      await documentsApi.update(doc.id, { metadata: updatedMetadata });
      toast.success('Reference updated');
      onRowUpdated(doc.id, { rawMetadata: updatedMetadata });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update reference';
      toast.error(msg);
      setLocalRef(currentRef); // revert on error
    } finally {
      setSavingRef(false);
    }
  };

  // ── Auto-save: notes (stored in metadata.notes) ───────────────────────────

  const handleNotesSave = async () => {
    const trimmed = localNotes.trim();
    if (trimmed === currentNotes || savingNotes) return;
    setSavingNotes(true);
    const updatedMetadata = { ...rawMetadata, notes: trimmed || null };
    try {
      await documentsApi.update(doc.id, { metadata: updatedMetadata });
      toast.success('Notes updated');
      onRowUpdated(doc.id, { rawMetadata: updatedMetadata });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update notes';
      toast.error(msg);
      setLocalNotes(currentNotes); // revert on error
    } finally {
      setSavingNotes(false);
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

      {/* ── Metadata + editors ── */}
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

        {/* Date — native date picker, auto-saves on change */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
            <Calendar size={11} aria-hidden="true" /> Date
          </span>
          <div className="flex items-center gap-1.5">
            {savingDate && (
              <Loader2 size={11} className="animate-spin text-ink-muted shrink-0" aria-hidden="true" />
            )}
            <input
              type="date"
              value={localDate}
              onChange={handleDateChange}
              disabled={savingDate}
              aria-label="Document date"
              className={clsx(
                'text-xs rounded-full px-2.5 py-0.5',
                'border border-border bg-surface text-ink-primary',
                'focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-0',
                'transition-opacity duration-150',
                savingDate && 'opacity-50 cursor-wait',
              )}
            />
          </div>
        </div>

        {/* Reference # — text input, auto-saves on blur or Enter */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
            <Hash size={11} aria-hidden="true" /> Ref #
          </span>
          <div className="flex items-center gap-1.5">
            {savingRef && (
              <Loader2 size={11} className="animate-spin text-ink-muted shrink-0" aria-hidden="true" />
            )}
            <input
              type="text"
              value={localRef}
              onChange={(e) => setLocalRef(e.target.value)}
              onBlur={handleRefSave}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              disabled={savingRef}
              placeholder="—"
              aria-label="Reference number"
              className={clsx(
                'text-xs text-right rounded-full px-2.5 py-0.5 w-28',
                'border border-border bg-surface text-ink-primary placeholder:text-ink-muted/40',
                'focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-0',
                'transition-opacity duration-150',
                savingRef && 'opacity-50 cursor-wait',
              )}
            />
          </div>
        </div>

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

        {/* Amount — read-only, shown when set */}
        {rawAmount !== null && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-ink-muted shrink-0">Amount</span>
            <span className="text-xs font-medium text-ink-secondary tabular-nums">
              {parseFloat(rawAmount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Notes — textarea, auto-saves on blur */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <AlignLeft size={11} aria-hidden="true" /> Notes
            </span>
            {savingNotes && (
              <Loader2 size={11} className="animate-spin text-ink-muted" aria-hidden="true" />
            )}
          </div>
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleNotesSave}
            disabled={savingNotes}
            placeholder="Add a note…"
            rows={3}
            aria-label="Document notes"
            className={clsx(
              'w-full text-xs rounded-lg px-2.5 py-1.5 resize-none',
              'border border-border bg-surface text-ink-primary placeholder:text-ink-muted/40',
              'focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-0',
              'transition-opacity duration-150',
              savingNotes && 'opacity-50 cursor-wait',
            )}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Allocation editor */}
        <AllocationEditor docId={doc.id} rawAmount={rawAmount} />

      </div>
    </div>
  );
};

/**
 * UploadModal — 2-step Batch Upload workflow.
 *
 * Step 1 "select":   Drag & drop / browse files. Existing UI preserved exactly.
 * Step 2 "defaults": Batch Defaults form (Branch, Accounting Month, Category, Notes).
 *                    Shown after the user confirms file selection, before upload begins.
 *
 * Upload only starts after the user fills in required batch defaults and clicks
 * "Upload N files". Cancelling at any point before that creates nothing.
 * Progress indicators are preserved — once upload starts, step reverts to
 * "select" so the existing file-list progress UI is visible.
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  Upload, X, FileText, FileSpreadsheet, File,
  CheckCircle, AlertCircle, Camera, ArrowLeft, ArrowRight,
  Building2, CalendarDays, Tag, StickyNote,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Dialog }      from '../ui/Dialog';
import { Button }      from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge }       from '../ui/Badge';
import { useT }        from '../../hooks/useT';
import { uploadApi }   from '../../lib/api';
import type { BatchDefaults } from '../../lib/api/upload';
import type { DocumentType }  from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadFile {
  id:       string;
  file:     File;
  progress: number;
  status:   'pending' | 'uploading' | 'done' | 'error';
  error?:   string;
}

type Step = 'select' | 'defaults';

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOWED = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const MAX_MB = 20;

const CATEGORY_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'invoice',        label: 'Invoice' },
  { value: 'receipt',        label: 'Receipt' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'credit_note',    label: 'Credit Note' },
  { value: 'debit_note',     label: 'Debit Note' },
  { value: 'po',             label: 'Purchase Order' },
  { value: 'attachment',     label: 'Attachment' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getIcon(type: string) {
  if (type.includes('pdf'))   return <FileText size={16} className="text-red-500" />;
  if (type.includes('sheet')) return <FileSpreadsheet size={16} className="text-emerald-600" />;
  return <File size={16} className="text-gold-500" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface UploadModalProps { open: boolean; onClose: () => void; }

export const UploadModal: React.FC<UploadModalProps> = ({ open, onClose }) => {
  const t = useT();

  // File list state
  const [files, setFiles]       = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [allDone, setAllDone]   = useState(false);

  // Step state
  const [step, setStep]         = useState<Step>('select');

  // Batch defaults state
  const [defaults, setDefaults] = useState<{
    branch:          string;
    accountingMonth: string;
    category:        DocumentType | '';
    notes:           string;
  }>({ branch: '', accountingMonth: '', category: '', notes: '' });

  // Validation errors for required fields
  const [errors, setErrors] = useState<{ branch?: string; accountingMonth?: string }>({});

  // Hidden file-input ref (preserves browse button support)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File management ─────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const next: UploadFile[] = Array.from(incoming)
      .filter((f) => {
        const validType = ALLOWED.includes(f.type) || f.type.startsWith('image/');
        const validSize = f.size <= MAX_MB * 1024 * 1024;
        return validType && validSize;
      })
      .map((f) => ({
        id:       `${f.name}-${Date.now()}`,
        file:     f,
        progress: 0,
        status:   'pending' as const,
      }));
    setFiles((prev) => [...prev, ...next]);
    setAllDone(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  // ── Step navigation ─────────────────────────────────────────────────────────

  const goToDefaults = () => {
    if (files.filter((f) => f.status === 'pending').length === 0) return;
    setErrors({});
    setStep('defaults');
  };

  const goBackToSelect = () => setStep('select');

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: { branch?: string; accountingMonth?: string } = {};
    if (!defaults.branch.trim())
      next.branch = t('upload.batch.branch.required', 'Branch is required');
    if (!defaults.accountingMonth.trim())
      next.accountingMonth = t('upload.batch.month.required', 'Accounting month is required');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── Upload ──────────────────────────────────────────────────────────────────

  const startUpload = () => {
    if (!validate()) return;

    const batchDefaults: BatchDefaults = {
      branch:          defaults.branch.trim(),
      accountingMonth: defaults.accountingMonth,
      category:        defaults.category || undefined,
      notes:           defaults.notes.trim() || undefined,
    };

    // Revert to the file-list step so progress indicators are visible
    setStep('select');

    const pending = files.filter((f) => f.status === 'pending');
    let settled = 0;

    pending.forEach((uf) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uf.id ? { ...f, status: 'uploading', progress: 50 } : f,
        ),
      );

      uploadApi
        .upload({ file: uf.file, defaults: batchDefaults })
        .then(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uf.id ? { ...f, progress: 100, status: 'done' } : f,
            ),
          );
          settled += 1;
          if (settled === pending.length) setAllDone(true);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Upload failed';
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uf.id ? { ...f, status: 'error', error: msg } : f,
            ),
          );
          settled += 1;
          if (settled === pending.length) setAllDone(true);
        });
    });
  };

  // ── Close & reset ────────────────────────────────────────────────────────────

  const handleClose = () => {
    // Don't close while uploads are in progress
    const isUploading = files.some((f) => f.status === 'uploading');
    if (isUploading) return;
    setFiles([]);
    setAllDone(false);
    setStep('select');
    setDefaults({ branch: '', accountingMonth: '', category: '', notes: '' });
    setErrors({});
    onClose();
  };

  // ── Derived counts ────────────────────────────────────────────────────────────

  const pendingCount   = files.filter((f) => f.status === 'pending').length;
  const doneCount      = files.filter((f) => f.status === 'done').length;
  const isUploading    = files.some((f) => f.status === 'uploading');

  const statusLabel = (status: UploadFile['status']) => {
    if (status === 'done')      return t('upload.done');
    if (status === 'error')     return t('upload.error');
    if (status === 'uploading') return t('upload.uploading');
    return t('upload.ready');
  };

  const statusBadge = (status: UploadFile['status']): 'success' | 'danger' | 'gold' | 'default' => {
    if (status === 'done')      return 'success';
    if (status === 'error')     return 'danger';
    if (status === 'uploading') return 'gold';
    return 'default';
  };

  // ── Shared field class ────────────────────────────────────────────────────────

  const fieldCls = (hasError?: boolean) =>
    clsx(
      'w-full h-9 rounded-lg border bg-white text-sm text-ink-primary',
      'placeholder-ink-muted px-3',
      'transition-all duration-150 focus:outline-none focus:ring-2',
      'focus:ring-gold-400 focus:border-gold-400',
      hasError ? 'border-red-300' : 'border-border',
    );

  // ── Render ────────────────────────────────────────────────────────────────────

  // ── Step 1: File selection ──────────────────────────────────────────────────
  const selectContent = (
    <>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={t('upload.dragHere')}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        className={clsx(
          'relative flex flex-col items-center justify-center gap-2',
          'rounded-xl border-2 border-dashed p-8 text-center cursor-pointer',
          'transition-colors duration-150',
          dragging
            ? 'border-gold-400 bg-gold-50'
            : 'border-border hover:border-gold-300 hover:bg-gold-50/40',
        )}
      >
        <Upload size={24} className="text-gold-400" aria-hidden="true" />
        <p className="text-sm font-medium text-ink-primary">{t('upload.dragHere')}</p>
        <p className="text-xs text-ink-muted">{t('upload.description')}</p>

        {/* Camera shortcut (mobile) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = () => addFiles(input.files);
            input.click();
          }}
          className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-gold-600 transition-colors"
        >
          <Camera size={12} aria-hidden="true" />
          {t('upload.takePhoto')}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.xlsx"
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
          aria-hidden="true"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {doneCount > 0 && (
            <p className="text-xs text-emerald-600 font-medium" role="status" aria-live="polite">
              {t('upload.filesOf')
                .replace('{done}',   String(doneCount))
                .replace('{total}',  String(files.length))
                .replace('{plural}', files.length > 1 ? 's' : '')}
            </p>
          )}
          {files.map((uf) => (
            <div
              key={uf.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-border"
            >
              <span className="shrink-0" aria-hidden="true">{getIcon(uf.file.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-ink-primary truncate">
                    {uf.file.name}
                  </span>
                  <Badge size="sm" variant={statusBadge(uf.status)}>
                    {statusLabel(uf.status)}
                  </Badge>
                </div>
                <p className="text-[10px] text-ink-muted mt-0.5">{formatBytes(uf.file.size)}</p>
                {uf.status === 'uploading' && (
                  <ProgressBar value={uf.progress} size="sm" className="mt-1.5" />
                )}
                {uf.status === 'error' && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} aria-hidden="true" />
                    {uf.error}
                  </p>
                )}
              </div>
              {uf.status !== 'uploading' && (
                <button
                  onClick={() => removeFile(uf.id)}
                  aria-label={`Remove ${uf.file.name}`}
                  className="shrink-0 text-ink-muted hover:text-red-500 transition-colors p-1 touch-target"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
              {uf.status === 'done' && (
                <CheckCircle size={16} className="text-emerald-500 shrink-0" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  const selectFooter = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
        {t('action.cancel')}
      </Button>
      {allDone ? (
        <Button onClick={handleClose} icon={<CheckCircle size={14} aria-hidden="true" />}>
          {t('action.done')}
        </Button>
      ) : (
        <Button
          onClick={goToDefaults}
          disabled={pendingCount === 0}
          icon={<ArrowRight size={14} aria-hidden="true" />}
        >
          {t('upload.batch.continue', 'Continue')}
          {pendingCount > 0 && ` · ${pendingCount} file${pendingCount > 1 ? 's' : ''}`}
        </Button>
      )}
    </>
  );

  // ── Step 2: Batch defaults form ─────────────────────────────────────────────
  const defaultsContent = (
    <div className="space-y-4">
      {/* File count summary */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-50 border border-gold-100">
        <Upload size={14} className="text-gold-500 shrink-0" aria-hidden="true" />
        <p className="text-sm text-gold-700 font-medium">
          {pendingCount} file{pendingCount !== 1 ? 's' : ''} selected
          {' '}· {t('upload.batch.hint', 'These defaults will apply to every document in this batch.')}
        </p>
      </div>

      {/* Branch — required */}
      <div className="flex flex-col gap-1">
        <label htmlFor="batch-branch" className="text-sm font-medium text-ink-primary flex items-center gap-1.5">
          <Building2 size={13} className="text-ink-muted" aria-hidden="true" />
          {t('upload.batch.branch', 'Default Branch')}
          <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>
        </label>
        <input
          id="batch-branch"
          type="text"
          placeholder={t('upload.batch.branch.placeholder', 'e.g. Riyadh HQ')}
          value={defaults.branch}
          onChange={(e) => {
            setDefaults((d) => ({ ...d, branch: e.target.value }));
            if (errors.branch) setErrors((er) => ({ ...er, branch: undefined }));
          }}
          className={fieldCls(!!errors.branch)}
          autoFocus
          autoComplete="off"
        />
        {errors.branch && (
          <p className="text-xs text-red-500">{errors.branch}</p>
        )}
      </div>

      {/* Accounting Month — required */}
      <div className="flex flex-col gap-1">
        <label htmlFor="batch-month" className="text-sm font-medium text-ink-primary flex items-center gap-1.5">
          <CalendarDays size={13} className="text-ink-muted" aria-hidden="true" />
          {t('upload.batch.month', 'Accounting Month')}
          <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>
        </label>
        <input
          id="batch-month"
          type="month"
          value={defaults.accountingMonth}
          onChange={(e) => {
            setDefaults((d) => ({ ...d, accountingMonth: e.target.value }));
            if (errors.accountingMonth) setErrors((er) => ({ ...er, accountingMonth: undefined }));
          }}
          className={fieldCls(!!errors.accountingMonth)}
        />
        {errors.accountingMonth && (
          <p className="text-xs text-red-500">{errors.accountingMonth}</p>
        )}
      </div>

      {/* Category — optional */}
      <div className="flex flex-col gap-1">
        <label htmlFor="batch-category" className="text-sm font-medium text-ink-primary flex items-center gap-1.5">
          <Tag size={13} className="text-ink-muted" aria-hidden="true" />
          {t('upload.batch.category', 'Default Category')}
          <span className="text-xs text-ink-muted font-normal ml-1">
            ({t('upload.batch.optional', 'optional')})
          </span>
        </label>
        <select
          id="batch-category"
          value={defaults.category}
          onChange={(e) =>
            setDefaults((d) => ({ ...d, category: e.target.value as DocumentType | '' }))
          }
          className={fieldCls()}
        >
          <option value="">{t('upload.batch.category.placeholder', 'No default — keep as Attachment')}</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Notes — optional */}
      <div className="flex flex-col gap-1">
        <label htmlFor="batch-notes" className="text-sm font-medium text-ink-primary flex items-center gap-1.5">
          <StickyNote size={13} className="text-ink-muted" aria-hidden="true" />
          {t('upload.batch.notes', 'Notes')}
          <span className="text-xs text-ink-muted font-normal ml-1">
            ({t('upload.batch.optional', 'optional')})
          </span>
        </label>
        <textarea
          id="batch-notes"
          rows={2}
          placeholder={t('upload.batch.notes.placeholder', 'Notes shared across all documents in this batch')}
          value={defaults.notes}
          onChange={(e) => setDefaults((d) => ({ ...d, notes: e.target.value }))}
          className={clsx(
            fieldCls(),
            'h-auto resize-none py-2 leading-snug',
          )}
        />
      </div>
    </div>
  );

  const defaultsFooter = (
    <>
      <Button
        variant="secondary"
        onClick={goBackToSelect}
        icon={<ArrowLeft size={14} aria-hidden="true" />}
      >
        {t('upload.batch.back', 'Back')}
      </Button>
      <Button
        onClick={startUpload}
        icon={<Upload size={14} aria-hidden="true" />}
      >
        {t('upload.batch.upload', 'Upload')}
        {` ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`}
      </Button>
    </>
  );

  // ── Dialog title/description per step ────────────────────────────────────────

  const dialogTitle = step === 'defaults'
    ? t('upload.batch.title', 'Batch Defaults')
    : t('upload.title');

  const dialogDescription = step === 'defaults'
    ? t('upload.batch.description', 'Set shared metadata applied to every document in this upload.')
    : t('upload.description');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={dialogTitle}
      description={dialogDescription}
      size="md"
      footer={step === 'defaults' ? defaultsFooter : selectFooter}
    >
      {step === 'select'   ? selectContent   : null}
      {step === 'defaults' ? defaultsContent : null}
    </Dialog>
  );
};

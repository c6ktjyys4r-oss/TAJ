import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, FileSpreadsheet, File, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { clsx } from 'clsx';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { useT } from '../../hooks/useT';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const MAX_MB  = 20;

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

interface UploadModalProps { open: boolean; onClose: () => void; }

export const UploadModal: React.FC<UploadModalProps> = ({ open, onClose }) => {
  const t = useT();
  const [files, setFiles]     = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const next: UploadFile[] = Array.from(incoming)
      .filter((f) => {
        const validType = ALLOWED.includes(f.type) || f.type.startsWith('image/');
        const validSize = f.size <= MAX_MB * 1024 * 1024;
        return validType && validSize;
      })
      .map((f) => ({ id: `${f.name}-${Date.now()}`, file: f, progress: 0, status: 'pending' as const }));
    setFiles((prev) => [...prev, ...next]);
    setAllDone(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const startUpload = () => {
    if (files.length === 0) return;
    const pending = files.filter((f) => f.status === 'pending');
    pending.forEach((uf) => {
      setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, status: 'uploading' } : f));
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 18 + 7;
        if (progress >= 100) {
          clearInterval(interval);
          setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, progress: 100, status: 'done' } : f));
          setAllDone(true);
        } else {
          setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, progress } : f));
        }
      }, 200);
    });
  };

  const handleClose = () => {
    setFiles([]);
    setAllDone(false);
    onClose();
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const doneCount    = files.filter((f) => f.status === 'done').length;

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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={t('upload.title')}
      description={t('upload.description')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>{t('action.cancel')}</Button>
          {!allDone
            ? <Button onClick={startUpload} disabled={files.length === 0 || pendingCount === 0} icon={<Upload size={14} aria-hidden="true" />}>
                {t('action.upload')}{pendingCount > 0 ? ` ${pendingCount} file${pendingCount > 1 ? 's' : ''}` : ''}
              </Button>
            : <Button onClick={handleClose} icon={<CheckCircle size={14} aria-hidden="true" />}>
                {t('action.done')}
              </Button>
          }
        </>
      }
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-150',
          dragging ? 'border-gold-400 bg-gold-50' : 'border-border hover:border-gold-300'
        )}
      >
        <Upload size={24} className="mx-auto text-ink-muted mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-ink-primary">{t('upload.dragHere')}</p>

        <div className="flex justify-center gap-3 mt-4">
          {/* Browse files */}
          <label className="inline-flex cursor-pointer">
            <span className="sr-only">Browse files</span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xlsx"
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            <span className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium text-ink-secondary hover:border-gold-300 hover:text-ink-primary transition-colors">
              Browse
            </span>
          </label>

          {/* Camera (mobile) */}
          <label className="inline-flex cursor-pointer sm:hidden">
            <span className="sr-only">{t('upload.takePhoto')}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium text-ink-secondary hover:border-gold-300 hover:text-ink-primary transition-colors">
              <Camera size={14} aria-hidden="true" /> {t('upload.takePhoto')}
            </span>
          </label>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {doneCount > 0 && (
            <p className="text-xs text-emerald-600 font-medium" role="status" aria-live="polite">
              {t('upload.filesOf')
                .replace('{done}', String(doneCount))
                .replace('{total}', String(files.length))
                .replace('{plural}', files.length > 1 ? 's' : '')}
            </p>
          )}
          {files.map((uf) => (
            <div key={uf.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-border">
              <span className="shrink-0" aria-hidden="true">{getIcon(uf.file.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-ink-primary truncate">{uf.file.name}</span>
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
                    <AlertCircle size={10} aria-hidden="true" />{uf.error}
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
              {uf.status === 'done' && <CheckCircle size={16} className="text-emerald-500 shrink-0" aria-hidden="true" />}
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
};

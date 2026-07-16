import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, FileSpreadsheet, File, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const ALLOWED_EXT = '.pdf, .jpg, .jpeg, .png, .xlsx';
const MAX_MB = 20;

function getIcon(type: string) {
  if (type.includes('pdf')) return <FileText size={16} className="text-red-500" />;
  if (type.includes('sheet')) return <FileSpreadsheet size={16} className="text-emerald-600" />;
  return <File size={16} className="text-gold-500" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface UploadModalProps { open: boolean; onClose: () => void; }

export const UploadModal: React.FC<UploadModalProps> = ({ open, onClose }) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const next: UploadFile[] = Array.from(incoming)
      .filter((f) => {
        const validType = ALLOWED.includes(f.type);
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
  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Upload Documents"
      description="Supported formats: PDF, JPG, PNG, XLSX — up to 20 MB each"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          {!allDone
            ? <Button onClick={startUpload} disabled={files.length === 0 || pendingCount === 0} icon={<Upload size={14} />}>
                Upload {pendingCount > 0 ? `${pendingCount} file${pendingCount > 1 ? 's' : ''}` : ''}
              </Button>
            : <Button onClick={handleClose} icon={<CheckCircle size={14} />}>Done</Button>
          }
        </>
      }
    >
      {/* Drop zone */}
      <label
        className={clsx(
          'flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150',
          dragging ? 'border-gold-400 bg-gold-50' : 'border-border hover:border-gold-300 hover:bg-gold-50/40'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className={clsx(
          'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors',
          dragging ? 'bg-gold-100' : 'bg-gray-100'
        )}>
          <Upload size={22} className={dragging ? 'text-gold-600' : 'text-ink-muted'} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-ink-primary">
            Drag files here, or <span className="text-gold-600 underline">browse</span>
          </p>
          <p className="text-xs text-ink-muted mt-0.5">{ALLOWED_EXT}</p>
        </div>
        <input
          type="file"
          multiple
          accept={ALLOWED_EXT}
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {doneCount > 0 && (
            <p className="text-xs text-emerald-600 font-medium">
              {doneCount} of {files.length} file{files.length > 1 ? 's' : ''} uploaded
            </p>
          )}
          {files.map((uf) => (
            <div key={uf.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-border">
              <span className="shrink-0">{getIcon(uf.file.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-ink-primary truncate">{uf.file.name}</span>
                  <Badge
                    size="sm"
                    variant={uf.status === 'done' ? 'success' : uf.status === 'error' ? 'danger' : uf.status === 'uploading' ? 'gold' : 'default'}
                  >
                    {uf.status === 'done' ? 'Done' : uf.status === 'error' ? 'Error' : uf.status === 'uploading' ? 'Uploading' : 'Ready'}
                  </Badge>
                </div>
                <p className="text-[10px] text-ink-muted mt-0.5">{formatBytes(uf.file.size)}</p>
                {uf.status === 'uploading' && (
                  <ProgressBar value={uf.progress} size="sm" className="mt-1.5" />
                )}
                {uf.status === 'error' && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle size={10} />{uf.error}</p>
                )}
              </div>
              {uf.status !== 'uploading' && (
                <button onClick={() => removeFile(uf.id)} className="shrink-0 text-ink-muted hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              )}
              {uf.status === 'done' && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
};

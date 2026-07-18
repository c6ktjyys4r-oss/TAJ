import React, { useState } from 'react';
import {
  Download, Trash2, Tag, FileText, FileSpreadsheet, File,
  Calendar, Building2, Weight, Hash, Share2, Maximize2, X,
} from 'lucide-react';
import { SlideOver } from '../ui/SlideOver';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ClassificationFlow } from './ClassificationFlow';
import { useNotifications } from '../../hooks/useNotifications';
import { documentsApi, ApiError } from '../../lib/api';

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  status: string;
  size: string;
  date: string;
  vendor: string;
}

const statusVariant: Record<string, 'success' | 'warning' | 'default'> = {
  Classified: 'success', 'Needs Review': 'warning', Unclassified: 'default',
};

function FileIcon({ type, size = 20 }: { type: string; size?: number }) {
  const cls = 'text-gold-500';
  if (type === 'Invoice' || type === 'Statement') return <FileSpreadsheet size={size} className={cls} />;
  if (type === 'Receipt') return <File size={size} className={cls} />;
  return <FileText size={size} className={cls} />;
}

const HISTORY = [
  { ts: 'Today, 09:14', action: 'Uploaded by Admin' },
  { ts: 'Today, 09:15', action: 'AI classification attempted — 94% confidence' },
  { ts: 'Today, 09:16', action: 'Status set to Needs Review' },
];

interface DocumentDetailPanelProps {
  doc: DocumentRecord | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const DocumentDetailPanel: React.FC<DocumentDetailPanelProps> = ({ doc, onClose, onDelete }) => {
  const [classifyOpen, setClassifyOpen] = useState(false);
  const [viewerOpen, setViewerOpen]     = useState(false);
  const [downloading, setDownloading]   = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState<string | null>(null);
  const { notify } = useNotifications();

  if (!doc) return null;

  // doc is guaranteed non-null beyond this point.

  // size is '—' when file_size is null (no file attached to this document record).
  const hasFile = doc.size !== '—';

  const canShare = typeof navigator.share === 'function';

  const handleShare = async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: `TAJ Finance — ${doc.name}`,
        text: `Document: ${doc.name} | Type: ${doc.type} | Status: ${doc.status} | Vendor: ${doc.vendor}`,
        url: window.location.href,
      });
    } catch {
      // User cancelled or share failed — silent
    }
  };

  const handleClassifyClose = () => {
    setClassifyOpen(false);
    // Trigger notification if permission granted
    notify('Classification complete', {
      body: `${doc.name} has been classified successfully.`,
      tag: 'classify-complete',
    });
  };

  /**
   * Trigger a browser-native file download via anchor navigation.
   *
   * Using an anchor tag (rather than fetch + createObjectURL) avoids CORS
   * preflight on the file endpoint — the server's Content-Disposition: attachment
   * header instructs the browser to download regardless of origin.
   *
   * hasFile guards against navigating to the endpoint when no file is attached;
   * a 404 JSON response from the server would otherwise appear as a stray page
   * navigation in the current tab.
   */
  const handleDownload = () => {
    if (!hasFile || downloading) return;
    setDownloading(true);
    const a = document.createElement('a');
    a.href = documentsApi.fileUrl(doc.id);
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Reset after a brief delay — gives the user visible feedback that the
    // download was triggered before the button returns to its normal state.
    setTimeout(() => setDownloading(false), 1500);
  };

  /**
   * Confirm and delete the document.
   *
   * Guards against duplicate requests with the `deleting` flag.
   * Shows a native confirm dialog before issuing the DELETE request.
   * On success, calls onDelete(id) so the parent can remove it from state.
   * On failure, surfaces the backend error message inline.
   */
  const handleDelete = async () => {
    if (deleting) return;
    const confirmed = window.confirm(`Delete "${doc.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await documentsApi.delete(doc.id);
      onDelete?.(doc.id);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Delete failed. Please try again.';
      setDeleteError(msg);
      setDeleting(false);
    }
  };

  return (
    <>
      <SlideOver
        open={!!doc}
        onClose={onClose}
        title={doc.name}
        subtitle="Document Details"
        width="md"
        footer={
          <>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete document"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
            {canShare && (
              <Button variant="secondary" size="sm" icon={<Share2 size={13} />} onClick={handleShare} aria-label="Share document">
                Share
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={13} />}
              onClick={handleDownload}
              disabled={!hasFile || downloading}
              aria-label="Download document"
            >
              {downloading ? 'Downloading…' : 'Download'}
            </Button>
            {doc.status !== 'Classified' && (
              <Button size="sm" icon={<Tag size={13} />} onClick={() => setClassifyOpen(true)} aria-label="Classify document">
                Classify
              </Button>
            )}
          </>
        }
      >
        {/* Delete error */}
        {deleteError && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            {deleteError}
          </div>
        )}

        {/* Document preview */}
        <div className="relative w-full rounded-xl bg-gray-50 border border-border overflow-hidden mb-5 group">
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-100 flex items-center justify-center">
              <FileIcon type={doc.type} size={28} />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-ink-secondary truncate max-w-[200px]">{doc.name}</p>
              <p className="text-[10px] text-ink-muted mt-0.5">{doc.size}</p>
            </div>
          </div>
          {/* Expand button — reveals the fullscreen viewer overlay */}
          <button
            onClick={() => setViewerOpen(true)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white border border-border shadow-sm text-ink-muted hover:text-ink-primary transition-all touch-target"
            aria-label="Expand document preview"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Metadata grid */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
          {[
            { icon: <Hash size={12} />,      label: 'ID',     value: doc.id.slice(0, 8) + '…' },
            { icon: <Calendar size={12} />,  label: 'Date',   value: doc.date },
            { icon: <Building2 size={12} />, label: 'Vendor', value: doc.vendor },
            { icon: <Weight size={12} />,    label: 'Size',   value: doc.size },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="flex items-center gap-1 text-[10px] text-ink-muted uppercase tracking-wide">
                {icon} {label}
              </dt>
              <dd className="text-xs font-medium text-ink-secondary truncate">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Status badge */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs text-ink-muted">Status</span>
          <Badge variant={statusVariant[doc.status] ?? 'default'}>{doc.status}</Badge>
        </div>

        {/* Activity history */}
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-muted mb-2">Activity</p>
          <ul className="space-y-2">
            {HISTORY.map((h) => (
              <li key={h.ts} className="flex gap-2 text-xs">
                <span className="text-ink-muted w-24 shrink-0">{h.ts}</span>
                <span className="text-ink-secondary">{h.action}</span>
              </li>
            ))}
          </ul>
        </div>
      </SlideOver>

      {/* Fullscreen document viewer overlay */}
      {viewerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
          {/* Viewer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-medium truncate">{doc.name}</p>
            <div className="flex items-center gap-1">
              {canShare && (
                <button
                  onClick={handleShare}
                  aria-label="Share document"
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors touch-target"
                >
                  <Share2 size={18} aria-hidden="true" />
                </button>
              )}
              <button
                onClick={() => setViewerOpen(false)}
                aria-label="Close viewer"
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors touch-target"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Viewer body */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileIcon type={doc.type} size={40} />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">{doc.name}</p>
              <p className="text-white/50 text-sm mt-1">{doc.type} • {doc.size} • {doc.date}</p>
              <p className="text-white/40 text-xs mt-4 max-w-xs">
                Full document preview is available after the document is downloaded and opened locally.
              </p>
            </div>
            <button
              onClick={handleDownload}
              disabled={!hasFile || downloading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors touch-target"
              aria-label={`Download ${doc.name}`}
            >
              <Download size={16} aria-hidden="true" />
              {downloading ? 'Downloading…' : 'Download Document'}
            </button>
          </div>
        </div>
      )}

      <ClassificationFlow
        open={classifyOpen}
        onClose={handleClassifyClose}
        documentName={doc.name}
      />
    </>
  );
};

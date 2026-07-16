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
}

export const DocumentDetailPanel: React.FC<DocumentDetailPanelProps> = ({ doc, onClose }) => {
  const [classifyOpen, setClassifyOpen] = useState(false);
  const [viewerOpen, setViewerOpen]     = useState(false);
  const { notify } = useNotifications();

  if (!doc) return null;

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
            <Button variant="danger" size="sm" icon={<Trash2 size={13} />} aria-label="Delete document">Delete</Button>
            {canShare && (
              <Button variant="secondary" size="sm" icon={<Share2 size={13} />} onClick={handleShare} aria-label="Share document">
                Share
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={<Download size={13} />} aria-label="Download document">Download</Button>
            {doc.status !== 'Classified' && (
              <Button size="sm" icon={<Tag size={13} />} onClick={() => setClassifyOpen(true)} aria-label="Classify document">
                Classify
              </Button>
            )}
          </>
        }
      >
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
          {/* Expand button */}
          <button
            onClick={() => setViewerOpen(true)}
            aria-label="View full screen"
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-ink-muted hover:text-ink-primary hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <Maximize2 size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-5">
          <Badge variant={statusVariant[doc.status] ?? 'default'} dot size="md">{doc.status}</Badge>
          {doc.type && <Badge variant="gold">{doc.type}</Badge>}
        </div>

        {/* Metadata */}
        <div className="space-y-0">
          {[
            { icon: Building2, label: 'Vendor',      value: doc.vendor || '—' },
            { icon: Calendar,  label: 'Date',        value: doc.date },
            { icon: Weight,    label: 'File size',   value: doc.size },
            { icon: Hash,      label: 'Document ID', value: `TAJ-${doc.id.padStart(5, '0')}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center shrink-0" aria-hidden="true">
                <Icon size={14} className="text-gold-600" />
              </div>
              <div>
                <p className="text-[10px] text-ink-muted uppercase tracking-wide font-medium">{label}</p>
                <p className="text-sm font-medium text-ink-primary">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-3">Activity History</p>
          <ol className="relative border-l border-border ml-3 space-y-4" aria-label="Document activity history">
            {HISTORY.map((h, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-gold-200 border-2 border-gold-500" aria-hidden="true" />
                <p className="text-xs font-medium text-ink-primary">{h.action}</p>
                <p className="text-[10px] text-ink-muted mt-0.5">{h.ts}</p>
              </li>
            ))}
          </ol>
        </div>
      </SlideOver>

      {/* Full-screen document viewer */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing ${doc.name}`}
        >
          {/* Viewer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FileIcon type={doc.type} size={18} />
              <div>
                <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-sm">{doc.name}</p>
                <p className="text-xs text-white/50">{doc.size} — {doc.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium transition-colors touch-target"
              aria-label={`Download ${doc.name}`}
            >
              <Download size={16} aria-hidden="true" /> Download Document
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

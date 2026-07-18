import React from 'react';
import { X, FileText, FileSpreadsheet, File, Tag } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { documentsApi } from '../../lib/api';
import type { DocumentRecord } from './DocumentDetailPanel';

// ── Status → badge variant ────────────────────────────────────────────────────

const statusVariant: Record<string, 'success' | 'warning' | 'default'> = {
  Classified:    'success',
  'Needs Review': 'warning',
  Unclassified:  'default',
  Archived:      'default',
};

// ── File preview renderer ─────────────────────────────────────────────────────

function FilePreview({ doc }: { doc: DocumentRecord }) {
  const url  = documentsApi.fileUrl(doc.id);
  const name = doc.name.toLowerCase();

  // No file attached to this document record
  if (doc.size === '—') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-ink-muted">
        <FileText size={32} className="opacity-30" aria-hidden="true" />
        <p className="text-xs">No file attached</p>
      </div>
    );
  }

  // PDF — render inline via iframe (browser handles it natively)
  if (name.endsWith('.pdf')) {
    return (
      <iframe
        src={url}
        title={`Preview of ${doc.name}`}
        className="w-full h-full border-0"
        aria-label={`PDF preview: ${doc.name}`}
      />
    );
  }

  // Raster / vector image
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) {
    return (
      <img
        src={url}
        alt={`Preview of ${doc.name}`}
        className="w-full h-full object-contain"
      />
    );
  }

  // Generic placeholder — show file-type icon
  const Icon =
    doc.type === 'Invoice' || doc.type === 'Statement'
      ? FileSpreadsheet
      : doc.type === 'Receipt'
      ? File
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

// ── Component ─────────────────────────────────────────────────────────────────

interface PreviewPanelProps {
  doc: DocumentRecord | null;
  onClose: () => void;
}

/**
 * Inline preview panel — rendered beside the document list (not as an overlay).
 * Displays a file preview, the file name, current category, and current status.
 * Closing calls onClose() which sets parent state to null; no page reload.
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({ doc, onClose }) => {
  if (!doc) return null;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden h-full">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="min-w-0 flex-1 pr-2">
          <p
            className="text-sm font-semibold text-ink-primary font-serif leading-snug truncate"
            title={doc.name}
          >
            {doc.name}
          </p>
          <p className="text-[10px] text-ink-muted mt-0.5 uppercase tracking-wide">Preview</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close preview panel"
          className="shrink-0 p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-gray-100 transition-colors"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      {/* ── File preview area ── */}
      <div className="shrink-0 bg-gray-50 border-b border-border" style={{ height: 260 }}>
        <FilePreview doc={doc} />
      </div>

      {/* ── Metadata ── */}
      <div className="px-4 py-4 space-y-3">
        {/* File name (full, wrappable) */}
        <div>
          <p className="text-[10px] text-ink-muted uppercase tracking-wide mb-0.5">File name</p>
          <p className="text-xs font-medium text-ink-primary break-all leading-relaxed">{doc.name}</p>
        </div>

        <div className="h-px bg-border" />

        {/* Category */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
            <Tag size={11} aria-hidden="true" />
            Category
          </span>
          <span className="text-xs font-medium text-ink-primary text-right">{doc.type}</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-muted shrink-0">Status</span>
          <Badge variant={statusVariant[doc.status] ?? 'default'} size="sm">
            {doc.status}
          </Badge>
        </div>

        {/* Vendor — only when present */}
        {doc.vendor !== '—' && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-ink-muted shrink-0">Vendor</span>
            <span className="text-xs font-medium text-ink-secondary text-right truncate max-w-[160px]">
              {doc.vendor}
            </span>
          </div>
        )}

        {/* Date — only when present */}
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

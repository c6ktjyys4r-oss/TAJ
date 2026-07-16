import React, { useState } from 'react';
import { Download, Trash2, Tag, FileText, FileSpreadsheet, File, Calendar, Building2, Weight, Hash } from 'lucide-react';
import { SlideOver } from '../ui/SlideOver';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ClassificationFlow } from './ClassificationFlow';

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

function FileIcon({ type }: { type: string }) {
  const cls = 'text-gold-500';
  if (type === 'Invoice' || type === 'Statement') return <FileSpreadsheet size={20} className={cls} />;
  if (type === 'Receipt') return <File size={20} className={cls} />;
  return <FileText size={20} className={cls} />;
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

  if (!doc) return null;

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
            <Button variant="danger" size="sm" icon={<Trash2 size={13} />}>Delete</Button>
            <Button variant="secondary" size="sm" icon={<Download size={13} />}>Download</Button>
            {doc.status !== 'Classified' && (
              <Button size="sm" icon={<Tag size={13} />} onClick={() => setClassifyOpen(true)}>
                Classify
              </Button>
            )}
          </>
        }
      >
        {/* Preview placeholder */}
        <div className="w-full h-40 rounded-xl bg-gray-50 border border-border flex items-center justify-center mb-5">
          <FileIcon type={doc.type} />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-5">
          <Badge variant={statusVariant[doc.status] ?? 'default'} dot size="md">{doc.status}</Badge>
          {doc.type && <Badge variant="gold">{doc.type}</Badge>}
        </div>

        {/* Metadata */}
        <div className="space-y-0">
          {[
            { icon: Building2,  label: 'Vendor',    value: doc.vendor || '—' },
            { icon: Calendar,   label: 'Date',      value: doc.date },
            { icon: Weight,     label: 'File size', value: doc.size },
            { icon: Hash,       label: 'Document ID', value: `TAJ-${doc.id.padStart(5, '0')}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center shrink-0">
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
          <ol className="relative border-l border-border ml-3 space-y-4">
            {HISTORY.map((h, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-gold-200 border-2 border-gold-500" />
                <p className="text-xs font-medium text-ink-primary">{h.action}</p>
                <p className="text-[10px] text-ink-muted mt-0.5">{h.ts}</p>
              </li>
            ))}
          </ol>
        </div>
      </SlideOver>

      <ClassificationFlow
        open={classifyOpen}
        onClose={() => setClassifyOpen(false)}
        documentName={doc.name}
      />
    </>
  );
};

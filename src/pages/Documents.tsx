import React, { useState } from 'react';
import { Upload, Search, Filter, FileText, FileSpreadsheet, File } from 'lucide-react';
import { PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { UploadModal } from '../components/documents/UploadModal';
import { DocumentDetailPanel } from '../components/documents/DocumentDetailPanel';
import type { DocumentRecord } from '../components/documents/DocumentDetailPanel';

const RAW_DOCS: DocumentRecord[] = [
  { id: '1', name: 'Invoice_AlRajhi_Oct2024.pdf',   type: 'Invoice',    status: 'Classified',   size: '234 KB', date: '2024-10-15', vendor: 'Al Rajhi Cement' },
  { id: '2', name: 'SABB_Statement_Oct2024.pdf',    type: 'Statement',  status: 'Needs Review', size: '1.2 MB', date: '2024-10-14', vendor: 'SABB' },
  { id: '3', name: 'Receipt_0893.jpg',              type: 'Receipt',    status: 'Unclassified', size: '156 KB', date: '2024-10-14', vendor: '—' },
  { id: '4', name: 'Invoice_Suppliers_Sep2024.xlsx',type: 'Invoice',    status: 'Classified',   size: '87 KB',  date: '2024-10-13', vendor: 'Multiple' },
  { id: '5', name: 'Contract_2024_Q4.pdf',          type: 'Contract',   status: 'Classified',   size: '678 KB', date: '2024-10-12', vendor: 'Ministry of Finance' },
  { id: '6', name: 'Receipt_Travel_Oct.jpg',        type: 'Receipt',    status: 'Unclassified', size: '202 KB', date: '2024-10-11', vendor: '—' },
  { id: '7', name: 'Riyad_Statement_Sep2024.pdf',   type: 'Statement',  status: 'Classified',   size: '980 KB', date: '2024-10-10', vendor: 'Riyad Bank' },
];

const TABS = [
  { value: 'all',           label: 'All',           count: RAW_DOCS.length },
  { value: 'unclassified',  label: 'Unclassified',  count: RAW_DOCS.filter((d) => d.status === 'Unclassified').length },
  { value: 'invoices',      label: 'Invoices',      count: RAW_DOCS.filter((d) => d.type === 'Invoice').length },
  { value: 'receipts',      label: 'Receipts',      count: RAW_DOCS.filter((d) => d.type === 'Receipt').length },
  { value: 'statements',    label: 'Statements',    count: RAW_DOCS.filter((d) => d.type === 'Statement').length },
] as const;

type TabValue = typeof TABS[number]['value'];

const statusVariant: Record<string, 'success' | 'warning' | 'default'> = {
  Classified: 'success', 'Needs Review': 'warning', Unclassified: 'default',
};

interface Doc extends DocumentRecord { [key: string]: unknown; }
const DOCS: Doc[] = RAW_DOCS as Doc[];

function FileIcon({ type }: { type: string }) {
  const cls = 'text-gold-500';
  if (type === 'Invoice' || type === 'Statement') return <FileSpreadsheet size={15} className={cls} />;
  if (type === 'Receipt') return <File size={15} className={cls} />;
  return <FileText size={15} className={cls} />;
}

export const Documents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  const filtered = DOCS.filter((d) => {
    const tabMatch =
      activeTab === 'all'          ? true :
      activeTab === 'unclassified' ? d.status === 'Unclassified' :
      activeTab === 'invoices'     ? d.type === 'Invoice' :
      activeTab === 'receipts'     ? d.type === 'Receipt' :
      activeTab === 'statements'   ? d.type === 'Statement' : true;
    const searchMatch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.vendor.toLowerCase().includes(search.toLowerCase());
    return tabMatch && searchMatch;
  });

  const columns = [
    {
      key: 'name', header: 'Document',
      render: (row: Doc) => (
        <div className="flex items-center gap-2">
          <FileIcon type={row.type} />
          <span className="text-sm font-medium text-ink-primary truncate max-w-xs">{row.name}</span>
        </div>
      ),
    },
    { key: 'type',   header: 'Type',   render: (row: Doc) => <Badge variant="gold">{row.type}</Badge> },
    {
      key: 'status', header: 'Status',
      render: (row: Doc) => (
        <Badge variant={statusVariant[row.status] ?? 'default'} dot>{row.status}</Badge>
      ),
    },
    { key: 'vendor', header: 'Vendor' },
    { key: 'size',   header: 'Size',   align: 'right' as const },
    { key: 'date',   header: 'Date',   align: 'right' as const },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>Documents</PageTitle>
            <p className="text-sm text-ink-muted mt-1">{DOCS.length} total documents</p>
          </div>
          <Button icon={<Upload size={15} />} onClick={() => setUploadOpen(true)}>Upload</Button>
        </div>

        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        <Card padding="none">
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search documents…"
                leadingIcon={<Search size={14} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="secondary" icon={<Filter size={14} />} size="sm">Filter</Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<FileText size={22} />}
              title="No documents found"
              description="Try adjusting your search or upload new documents."
              action={{ label: 'Upload Documents', onClick: () => setUploadOpen(true), icon: <Upload size={13} /> }}
            />
          ) : (
            <Table<Doc>
              columns={columns}
              data={filtered}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => setSelectedDoc(row as DocumentRecord)}
              emptyMessage="No documents found"
            />
          )}
        </Card>
      </div>

      {/* Modals */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DocumentDetailPanel doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </>
  );
};

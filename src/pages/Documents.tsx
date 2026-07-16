import React, { useState } from 'react';
import { Upload, Search, Filter, FileText, FileSpreadsheet, File } from 'lucide-react';
import { PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';

const TABS = ['All', 'Unclassified', 'Invoices', 'Receipts', 'Statements'];

const DOCS = [
  { id: '1', name: 'Invoice_AlRajhi_Oct2024.pdf',  type: 'Invoice',    status: 'Classified',   size: '234 KB', date: '2024-10-15', vendor: 'Al Rajhi Cement' },
  { id: '2', name: 'SABB_Statement_Oct2024.pdf',    type: 'Statement',  status: 'Needs Review', size: '1.2 MB', date: '2024-10-14', vendor: 'SABB' },
  { id: '3', name: 'Receipt_0893.jpg',              type: 'Receipt',    status: 'Unclassified', size: '156 KB', date: '2024-10-14', vendor: '—' },
  { id: '4', name: 'Invoice_Suppliers_Sep2024.xlsx',type: 'Invoice',    status: 'Classified',   size: '87 KB',  date: '2024-10-13', vendor: 'Multiple' },
  { id: '5', name: 'Contract_2024_Q4.pdf',          type: 'Contract',   status: 'Classified',   size: '678 KB', date: '2024-10-12', vendor: 'Ministry of Finance' },
  { id: '6', name: 'Receipt_Travel_Oct.jpg',        type: 'Receipt',    status: 'Unclassified', size: '202 KB', date: '2024-10-11', vendor: '—' },
  { id: '7', name: 'Riyad_Statement_Sep2024.pdf',   type: 'Statement',  status: 'Classified',   size: '980 KB', date: '2024-10-10', vendor: 'Riyad Bank' },
];

const statusVariant: Record<string, 'success' | 'warning' | 'default'> = {
  Classified: 'success', 'Needs Review': 'warning', Unclassified: 'default',
};

function FileIcon({ type }: { type: string }) {
  const cls = 'text-gold-500';
  if (type === 'Invoice' || type === 'Statement') return <FileSpreadsheet size={15} className={cls} />;
  if (type === 'Receipt') return <File size={15} className={cls} />;
  return <FileText size={15} className={cls} />;
}

interface Doc {
  id: string;
  name: string;
  type: string;
  status: string;
  size: string;
  date: string;
  vendor: string;
  [key: string]: unknown;
}

const DOCS_TYPED: Doc[] = DOCS;

export const Documents: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered: Doc[] = DOCS_TYPED.filter((d) => {
    const tabMatch = activeTab === 'All'
      || (activeTab === 'Unclassified' && d.status === 'Unclassified')
      || d.type === activeTab.slice(0, -1)
      || d.type === activeTab;
    const searchMatch = d.name.toLowerCase().includes(search.toLowerCase())
      || d.vendor.toLowerCase().includes(search.toLowerCase());
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
    { key: 'type', header: 'Type', render: (row: Doc) => <Badge variant="gold">{row.type}</Badge> },
    {
      key: 'status', header: 'Status',
      render: (row: Doc) => (
        <Badge variant={statusVariant[row.status] ?? 'default'} dot>{row.status}</Badge>
      ),
    },
    { key: 'vendor', header: 'Vendor' },
    { key: 'size', header: 'Size', align: 'right' as const },
    { key: 'date', header: 'Date', align: 'right' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle>Documents</PageTitle>
          <p className="text-sm text-ink-muted mt-1">{DOCS.length} total documents</p>
        </div>
        <Button icon={<Upload size={15} />}>Upload</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === tab
                ? 'border-gold-500 text-gold-600'
                : 'border-transparent text-ink-secondary hover:text-ink-primary hover:border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
        <Table<Doc>
          columns={columns}
          data={filtered}
          keyExtractor={(row) => row.id}
          emptyMessage="No documents found"
        />
      </Card>
    </div>
  );
};

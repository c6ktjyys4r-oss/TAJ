import React, { useState, useMemo } from 'react';
import { Upload, FileText, FileSpreadsheet, File } from 'lucide-react';
import { PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { ExportButton } from '../components/ui/ExportButton';
import { FilterPanel } from '../components/ui/FilterPanel';
import type { FilterState } from '../components/ui/FilterPanel';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import type { DateRange } from '../components/ui/DateRangePicker';
import { SortableTable } from '../components/ui/SortableTable';
import { UploadModal } from '../components/documents/UploadModal';
import { DocumentDetailPanel } from '../components/documents/DocumentDetailPanel';
import type { DocumentRecord } from '../components/documents/DocumentDetailPanel';
import { BatchClassifyBar } from '../components/documents/BatchClassifyBar';

const RAW_DOCS: DocumentRecord[] = [
  { id: '1',  name: 'Invoice_AlRajhi_Oct2024.pdf',    type: 'Invoice',   status: 'Classified',   size: '234 KB', date: '2024-10-15', vendor: 'Al Rajhi Cement' },
  { id: '2',  name: 'SABB_Statement_Oct2024.pdf',     type: 'Statement', status: 'Needs Review', size: '1.2 MB', date: '2024-10-14', vendor: 'SABB' },
  { id: '3',  name: 'Receipt_0893.jpg',               type: 'Receipt',   status: 'Unclassified', size: '156 KB', date: '2024-10-14', vendor: '—' },
  { id: '4',  name: 'Invoice_Suppliers_Sep2024.xlsx', type: 'Invoice',   status: 'Classified',   size: '87 KB',  date: '2024-10-13', vendor: 'Multiple' },
  { id: '5',  name: 'Contract_2024_Q4.pdf',           type: 'Contract',  status: 'Classified',   size: '678 KB', date: '2024-10-12', vendor: 'Ministry of Finance' },
  { id: '6',  name: 'Receipt_Travel_Oct.jpg',         type: 'Receipt',   status: 'Unclassified', size: '202 KB', date: '2024-10-11', vendor: '—' },
  { id: '7',  name: 'Riyad_Statement_Sep2024.pdf',    type: 'Statement', status: 'Classified',   size: '980 KB', date: '2024-10-10', vendor: 'Riyad Bank' },
  { id: '8',  name: 'Invoice_NCB_Sep2024.pdf',        type: 'Invoice',   status: 'Classified',   size: '312 KB', date: '2024-09-28', vendor: 'NCB' },
  { id: '9',  name: 'Receipt_Office_Sep.jpg',         type: 'Receipt',   status: 'Unclassified', size: '98 KB',  date: '2024-09-25', vendor: '—' },
  { id: '10', name: 'AlRajhi_Statement_Sep2024.pdf',  type: 'Statement', status: 'Classified',   size: '1.1 MB', date: '2024-09-20', vendor: 'Al Rajhi Bank' },
  { id: '11', name: 'Invoice_Contractor_Sep.pdf',     type: 'Invoice',   status: 'Needs Review', size: '445 KB', date: '2024-09-18', vendor: 'Unknown' },
  { id: '12', name: 'Contract_Q3_Audit.pdf',          type: 'Contract',  status: 'Classified',   size: '2.1 MB', date: '2024-09-01', vendor: 'KPMG Arabia' },
];

const PAGE_SIZE = 8;

const TABS = [
  { value: 'all',          label: 'All',          count: RAW_DOCS.length },
  { value: 'unclassified', label: 'Unclassified', count: RAW_DOCS.filter((d) => d.status === 'Unclassified').length },
  { value: 'invoices',     label: 'Invoices',     count: RAW_DOCS.filter((d) => d.type === 'Invoice').length },
  { value: 'receipts',     label: 'Receipts',     count: RAW_DOCS.filter((d) => d.type === 'Receipt').length },
  { value: 'statements',   label: 'Statements',   count: RAW_DOCS.filter((d) => d.type === 'Statement').length },
] as const;
type TabValue = typeof TABS[number]['value'];

const FILTER_GROUPS = [
  {
    key: 'status', label: 'Status', type: 'multiselect' as const,
    options: [
      { value: 'Classified',   label: 'Classified',   count: RAW_DOCS.filter((d) => d.status === 'Classified').length },
      { value: 'Unclassified', label: 'Unclassified', count: RAW_DOCS.filter((d) => d.status === 'Unclassified').length },
      { value: 'Needs Review', label: 'Needs Review', count: RAW_DOCS.filter((d) => d.status === 'Needs Review').length },
    ],
  },
  {
    key: 'type', label: 'Type', type: 'multiselect' as const,
    options: [
      { value: 'Invoice',   label: 'Invoice'   },
      { value: 'Receipt',   label: 'Receipt'   },
      { value: 'Statement', label: 'Statement' },
      { value: 'Contract',  label: 'Contract'  },
    ],
  },
];

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
  const [activeTab, setActiveTab]     = useState<TabValue>('all');
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [filters, setFilters]         = useState<FilterState>({});
  const [dateRange, setDateRange]     = useState<DateRange | null>(null);
  const [page, setPage]               = useState(1);
  const [selected, setSelected]       = useState<Set<string>>(new Set());

  const filtered = useMemo(() => DOCS.filter((d) => {
    const tabMatch =
      activeTab === 'all'          ? true :
      activeTab === 'unclassified' ? d.status === 'Unclassified' :
      activeTab === 'invoices'     ? d.type === 'Invoice' :
      activeTab === 'receipts'     ? d.type === 'Receipt' :
      activeTab === 'statements'   ? d.type === 'Statement' : true;

    const statusMatch = !filters.status?.length || filters.status.includes(d.status);
    const typeMatch   = !filters.type?.length   || filters.type.includes(d.type);
    const dateMatch   = !dateRange || (d.date >= dateRange.from && d.date <= dateRange.to);

    return tabMatch && statusMatch && typeMatch && dateMatch;
  }), [activeTab, filters, dateRange]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange    = (tab: TabValue)    => { setActiveTab(tab); setPage(1); setSelected(new Set()); };
  const handleFilterChange = (f: FilterState)   => { setFilters(f); setPage(1); };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const columns = [
    {
      key: 'select', header: '', sortable: false,
      render: (row: Doc) => (
        <input
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={() => toggleSelect(row.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 accent-gold-500 cursor-pointer rounded"
          aria-label={`Select ${row.name}`}
        />
      ),
      className: 'w-8',
    },
    {
      key: 'name', header: 'Document', sortable: true,
      render: (row: Doc) => (
        <div className="flex items-center gap-2">
          <FileIcon type={row.type} />
          <span className="text-sm font-medium text-ink-primary truncate max-w-xs">{row.name}</span>
        </div>
      ),
    },
    { key: 'type',   header: 'Type',   sortable: true, render: (row: Doc) => <Badge variant="gold">{row.type}</Badge> },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (row: Doc) => <Badge variant={statusVariant[row.status] ?? 'default'} dot>{row.status}</Badge>,
    },
    { key: 'vendor', header: 'Vendor', sortable: true },
    { key: 'size',   header: 'Size',   align: 'right' as const },
    { key: 'date',   header: 'Date',   sortable: true, align: 'right' as const },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>Documents</PageTitle>
            <p className="text-sm text-ink-muted mt-1">{filtered.length} of {DOCS.length} documents</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton filename="documents" />
            <Button icon={<Upload size={15} />} onClick={() => setUploadOpen(true)}>Upload</Button>
          </div>
        </div>

        <Tabs tabs={TABS} active={activeTab} onChange={handleTabChange} />

        <Card padding="none">
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap">
            <DateRangePicker
              value={dateRange}
              onChange={(r) => { setDateRange(r); setPage(1); }}
            />
            <FilterPanel
              groups={FILTER_GROUPS}
              value={filters}
              onChange={handleFilterChange}
              onClear={() => { setFilters({}); setPage(1); }}
            />
            {(Object.values(filters).some((a) => a.length) || dateRange) && (
              <button
                onClick={() => { setFilters({}); setDateRange(null); setPage(1); }}
                className="text-xs text-red-500 font-medium hover:text-red-600 transition-colors"
              >
                Clear all filters
              </button>
            )}
            {selected.size > 0 && (
              <span className="ml-auto text-xs text-gold-600 font-medium">
                {selected.size} selected
              </span>
            )}
          </div>

          {paginated.length === 0 ? (
            <EmptyState
              icon={<FileText size={22} />}
              title="No documents found"
              description="Try adjusting your filters or upload new documents."
              action={{ label: 'Upload Documents', onClick: () => setUploadOpen(true), icon: <Upload size={13} /> }}
            />
          ) : (
            <>
              <SortableTable<Doc>
                columns={columns}
                data={paginated}
                keyExtractor={(row) => row.id}
                onRowClick={(row) => setSelectedDoc(row as DocumentRecord)}
                defaultSort={{ key: 'date', dir: 'desc' }}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onChange={setPage}
              />
            </>
          )}
        </Card>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DocumentDetailPanel doc={selectedDoc} onClose={() => setSelectedDoc(null)} />

      {/* Batch classify floating bar */}
      {selected.size > 0 && (
        <BatchClassifyBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onClassify={() => setSelected(new Set())}
        />
      )}
    </>
  );
};

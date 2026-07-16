import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Upload, FileText, FileSpreadsheet, File, GripVertical } from 'lucide-react';
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
import { useT } from '../hooks/useT';
import { clsx } from 'clsx';

// ── Data ─────────────────────────────────────────────────────────────────────

const RAW_DOCS: DocumentRecord[] = [
  { id: '1',  name: 'Invoice_AlRajhi_Oct2024.pdf',    type: 'Invoice',   status: 'Classified',   size: '234 KB', date: '2024-10-15', vendor: 'Al Rajhi Cement' },
  { id: '2',  name: 'SABB_Statement_Oct2024.pdf',     type: 'Statement', status: 'Needs Review', size: '1.2 MB', date: '2024-10-14', vendor: 'SABB' },
  { id: '3',  name: 'Receipt_0893.jpg',               type: 'Receipt',   status: 'Unclassified', size: '156 KB', date: '2024-10-14', vendor: '\u2014' },
  { id: '4',  name: 'Invoice_Suppliers_Sep2024.xlsx', type: 'Invoice',   status: 'Classified',   size: '87 KB',  date: '2024-10-13', vendor: 'Multiple' },
  { id: '5',  name: 'Contract_2024_Q4.pdf',           type: 'Contract',  status: 'Classified',   size: '678 KB', date: '2024-10-12', vendor: 'Ministry of Finance' },
  { id: '6',  name: 'Receipt_Travel_Oct.jpg',         type: 'Receipt',   status: 'Unclassified', size: '202 KB', date: '2024-10-11', vendor: '\u2014' },
  { id: '7',  name: 'Riyad_Statement_Sep2024.pdf',    type: 'Statement', status: 'Classified',   size: '980 KB', date: '2024-10-10', vendor: 'Riyad Bank' },
  { id: '8',  name: 'Invoice_NCB_Sep2024.pdf',        type: 'Invoice',   status: 'Classified',   size: '312 KB', date: '2024-09-28', vendor: 'NCB' },
  { id: '9',  name: 'Receipt_Office_Sep.jpg',         type: 'Receipt',   status: 'Unclassified', size: '98 KB',  date: '2024-09-25', vendor: '\u2014' },
  { id: '10', name: 'AlRajhi_Statement_Sep2024.pdf',  type: 'Statement', status: 'Classified',   size: '1.1 MB', date: '2024-09-20', vendor: 'Al Rajhi Bank' },
  { id: '11', name: 'Invoice_Contractor_Sep.pdf',     type: 'Invoice',   status: 'Needs Review', size: '445 KB', date: '2024-09-18', vendor: 'Unknown' },
  { id: '12', name: 'Contract_Q3_Audit.pdf',          type: 'Contract',  status: 'Classified',   size: '2.1 MB', date: '2024-09-01', vendor: 'KPMG Arabia' },
];

const PAGE_SIZE = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

type DocStatus = DocumentRecord['status'];

function statusVariant(s: DocStatus): 'success' | 'warning' | 'default' {
  if (s === 'Classified')   return 'success';
  if (s === 'Needs Review') return 'warning';
  return 'default';
}

function fileIcon(name: string) {
  if (name.endsWith('.pdf'))  return <FileText size={14} className="text-red-400" aria-hidden="true" />;
  if (name.endsWith('.xlsx')) return <FileSpreadsheet size={14} className="text-emerald-500" aria-hidden="true" />;
  return <File size={14} className="text-gold-500" aria-hidden="true" />;
}

// ── Type for table rows ───────────────────────────────────────────────────────

type Doc = DocumentRecord & { [key: string]: unknown };

// ── Draggable reorder list ────────────────────────────────────────────────────

interface DraggableRowProps {
  doc: DocumentRecord;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  hint: string;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  doc, onDragStart, onDragOver, onDrop, isDragging, isDragOver, hint,
}) => (
  <div
    draggable
    onDragStart={() => onDragStart(doc.id)}
    onDragOver={(e) => { e.preventDefault(); onDragOver(doc.id); }}
    onDrop={onDrop}
    onDragEnd={onDrop}
    className={clsx(
      'flex items-center gap-3 px-4 py-3 border-b border-border transition-all duration-150 select-none',
      isDragOver && !isDragging && 'bg-gold-50 border-gold-300',
      isDragging && 'opacity-40',
    )}
    aria-label={`${hint}: ${doc.name}`}
  >
    <button
      className="shrink-0 text-ink-muted hover:text-ink-primary cursor-grab active:cursor-grabbing p-0.5"
      aria-label={hint}
      tabIndex={-1}
    >
      <GripVertical size={16} aria-hidden="true" />
    </button>
    <span className="shrink-0">{fileIcon(doc.name)}</span>
    <span className="flex-1 text-sm font-medium text-ink-primary truncate">{doc.name}</span>
    <Badge variant={statusVariant(doc.status)} size="sm">{doc.status}</Badge>
    <span className="text-xs text-ink-muted hidden sm:block">{doc.date}</span>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

export const Documents: React.FC = () => {
  const t = useT();

  const DOCS = useMemo(() => RAW_DOCS, []);

  type TabValue = 'all' | 'unclassified' | 'invoices' | 'receipts' | 'statements';

  const TABS = useMemo(() => [
    { value: 'all'          as TabValue, label: t('docs.tab.all'),          count: DOCS.length },
    { value: 'unclassified' as TabValue, label: t('docs.tab.unclassified'), count: DOCS.filter((d) => d.status === 'Unclassified').length },
    { value: 'invoices'     as TabValue, label: t('docs.tab.invoices'),     count: DOCS.filter((d) => d.type === 'Invoice').length },
    { value: 'receipts'     as TabValue, label: t('docs.tab.receipts'),     count: DOCS.filter((d) => d.type === 'Receipt').length },
    { value: 'statements'   as TabValue, label: t('docs.tab.statements'),   count: DOCS.filter((d) => d.type === 'Statement').length },
  ], [DOCS, t]);

  const FILTER_GROUPS = useMemo(() => [
    {
      key: 'status', label: t('docs.filter.status'), type: 'multiselect' as const,
      options: [
        { value: 'Classified',   label: t('status.classified'),   count: DOCS.filter((d) => d.status === 'Classified').length },
        { value: 'Unclassified', label: t('status.unclassified'), count: DOCS.filter((d) => d.status === 'Unclassified').length },
        { value: 'Needs Review', label: t('status.needsReview'),  count: DOCS.filter((d) => d.status === 'Needs Review').length },
      ],
    },
    {
      key: 'type', label: t('docs.filter.type'), type: 'multiselect' as const,
      options: [
        { value: 'Invoice',   label: t('type.invoice')   },
        { value: 'Receipt',   label: t('type.receipt')   },
        { value: 'Statement', label: t('type.statement') },
        { value: 'Contract',  label: t('type.contract')  },
      ],
    },
  ], [DOCS, t]);

  const [activeTab, setActiveTab]     = useLocalStorage<TabValue>('taj_docs_tab', 'all');
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [filters, setFilters]         = useState<FilterState>({});
  const [dateRange, setDateRange]     = useState<DateRange | null>(null);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [page, setPage]               = useState(1);
  const [reorderMode, setReorderMode] = useState(false);
  const [docOrder, setDocOrder]       = useState<string[]>(() => RAW_DOCS.map((d) => d.id));
  const [dragId, setDragId]           = useState<string | null>(null);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);

  // Build ordered doc list from docOrder
  const orderedDocs = useMemo(() => {
    const map = new Map(DOCS.map((d) => [d.id, d]));
    return docOrder.map((id) => map.get(id)).filter((d): d is DocumentRecord => !!d);
  }, [docOrder, DOCS]);

  const filtered = useMemo(() => orderedDocs.filter((d) => {
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
  }), [orderedDocs, activeTab, filters, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange    = (tab: TabValue)    => { setActiveTab(tab); setPage(1); setSelected(new Set()); };
  const handleFilterChange = (f: FilterState)   => { setFilters(f); setPage(1); };

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Drag-to-reorder handlers ────────────────────────────────────────────

  const handleDragStart = useCallback((id: string) => setDragId(id), []);

  const handleDragOver = useCallback((id: string) => setDragOverId(id), []);

  const handleDrop = useCallback(() => {
    if (!dragId || !dragOverId || dragId === dragOverId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    setDocOrder((prev) => {
      const next  = [...prev];
      const from  = next.indexOf(dragId);
      const to    = next.indexOf(dragOverId);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, dragId);
      return next;
    });
    setDragId(null);
    setDragOverId(null);
  }, [dragId, dragOverId]);

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns = useMemo(() => [
    {
      key: 'name', header: 'Document', sortable: true,
      render: (row: Doc) => (
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={selected.has(row.id)}
            onChange={() => toggleSelect(row.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${row.name}`}
            className="shrink-0 w-4 h-4 accent-gold-500"
          />
          <span className="shrink-0">{fileIcon(row.name)}</span>
          <span className="text-sm font-medium text-ink-primary truncate max-w-xs">{row.name}</span>
        </div>
      ),
    },
    { key: 'type',   header: 'Type',   sortable: true,
      render: (row: Doc) => <Badge variant="default" size="sm">{row.type}</Badge> },
    { key: 'vendor', header: 'Vendor', sortable: true },
    { key: 'date',   header: 'Date',   sortable: true, align: 'right' as const },
    { key: 'size',   header: 'Size',   sortable: false, align: 'right' as const },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (row: Doc) => (
        <Badge variant={statusVariant(row.status as DocStatus)} dot size="sm">{row.status}</Badge>
      ),
    },
  ], [selected, toggleSelect]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>{t('page.documents.title')}</PageTitle>
            <p className="text-sm text-ink-muted mt-1">
              {t('docs.subtitle').replace('{count}', String(filtered.length)).replace('{total}', String(DOCS.length))}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setReorderMode((v) => !v); setSelected(new Set()); }}
              icon={<GripVertical size={14} aria-hidden="true" />}
            >
              {reorderMode ? t('action.exitReorder') : t('action.reorder')}
            </Button>
            <ExportButton filename="documents" />
            <Button icon={<Upload size={15} aria-hidden="true" />} onClick={() => setUploadOpen(true)}>
              {t('action.upload')}
            </Button>
          </div>
        </div>

        <Card padding="none">
          {/* Tabs */}
          <div className="px-4 pt-4">
            <Tabs tabs={TABS} active={activeTab} onChange={handleTabChange} />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border">
            <DateRangePicker value={dateRange} onChange={(r) => { setDateRange(r); setPage(1); }} />
            <FilterPanel
              groups={FILTER_GROUPS}
              value={filters}
              onChange={handleFilterChange}
              onClear={() => { setFilters({}); setPage(1); }}
            />
            {(Object.keys(filters).some((k) => (filters[k as keyof FilterState] as string[] | undefined)?.length) || dateRange) && (
              <button
                onClick={() => { setFilters({}); setDateRange(null); setPage(1); }}
                className="text-xs text-red-500 font-medium hover:text-red-600 transition-colors"
              >
                {t('action.clearFilters')}
              </button>
            )}
            {selected.size > 0 && (
              <span className="ml-auto text-xs text-gold-600 font-medium">
                {t('docs.selected').replace('{count}', String(selected.size))}
              </span>
            )}
          </div>

          {/* Reorder hint */}
          {reorderMode && (
            <div className="px-4 py-2 bg-gold-50 border-b border-gold-100 text-xs text-gold-700 font-medium">
              {t('docs.reorder.hint')}
            </div>
          )}

          {/* Content */}
          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<FileText size={22} />}
                title={t('docs.noResults')}
                description={t('docs.noResults.hint')}
                action={{ label: t('docs.noResults.cta'), onClick: () => setUploadOpen(true), icon: <Upload size={13} aria-hidden="true" /> }}
              />
            </div>
          ) : reorderMode ? (
            /* ── Drag-to-reorder view ── */
            <div role="list" aria-label={t('page.documents.title')}>
              {filtered.map((doc) => (
                <DraggableRow
                  key={doc.id}
                  doc={doc}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={dragId === doc.id}
                  isDragOver={dragOverId === doc.id}
                  hint={t('docs.reorder.dragHandle')}
                />
              ))}
            </div>
          ) : (
            /* ── Normal table + pagination ── */
            <>
              <SortableTable<Doc>
                columns={columns}
                data={paginated as Doc[]}
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

      {selected.size > 0 && !reorderMode && (
        <BatchClassifyBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onClassify={() => setSelected(new Set())}
        />
      )}
    </>
  );
};

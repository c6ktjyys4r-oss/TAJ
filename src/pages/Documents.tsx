import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Upload, FileText, FileSpreadsheet, File, GripVertical, Search, X, Eye } from 'lucide-react';
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
import { SkeletonTable } from '../components/ui/Skeleton';
import { UploadModal } from '../components/documents/UploadModal';
import { DocumentDetailPanel } from '../components/documents/DocumentDetailPanel';
import type { DocumentRecord } from '../components/documents/DocumentDetailPanel';
import { PreviewPanel } from '../components/documents/PreviewPanel';
import type { RowPatch }    from '../components/documents/PreviewPanel';
import { BatchClassifyBar } from '../components/documents/BatchClassifyBar';
import { documentsApi, ApiError } from '../lib/api';
import type { ApiDocument, DocumentType, DocumentStatus, SortBy, SortOrder } from '../lib/api';
import { useT } from '../hooks/useT';
import { clsx } from 'clsx';
import { InlineCategorySelect } from '../components/documents/InlineCategorySelect';
import { Toaster } from '../components/ui/Toast';

// ── API → UI mappers ──────────────────────────────────────────────────────────

const TYPE_LABELS: Record<DocumentType, string> = {
  invoice:        'Invoice',
  receipt:        'Receipt',
  bank_statement: 'Statement',
  credit_note:    'Credit Note',
  debit_note:     'Debit Note',
  po:             'PO',
  attachment:     'Attachment',
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  uploaded:   'Unclassified',
  classified: 'Classified',
  matched:    'Classified',
  archived:   'Archived',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1_048_576)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function apiDocToRecord(d: ApiDocument): DocumentRecord {
  return {
    id:     d.id,
    name:   d.file_name ?? `document-${d.id.slice(0, 8)}`,
    type:   TYPE_LABELS[d.type] ?? d.type,
    status: STATUS_LABELS[d.status] ?? d.status,
    size:   d.file_size !== null ? formatBytes(d.file_size) : '—',
    date:   d.date ?? d.created_at.slice(0, 10),
    vendor: d.vendor ?? '—',
  };
}

const PAGE_SIZE = 20;

// ── Tab → API param mapping ───────────────────────────────────────────────────

type TabValue = 'all' | 'unclassified' | 'invoices' | 'receipts' | 'statements';

function tabToApiParams(tab: TabValue): { type?: DocumentType; status?: DocumentStatus } {
  switch (tab) {
    case 'invoices':     return { type: 'invoice' };
    case 'receipts':     return { type: 'receipt' };
    case 'statements':   return { type: 'bank_statement' };
    case 'unclassified': return { status: 'uploaded' };
    default:             return {};
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type DocStatus = DocumentRecord['status'];
type RichRecord = DocumentRecord & { rawType: DocumentType; rawMetadata: Record<string, unknown>; rawAmount: string | null };

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
  doc:         DocumentRecord;
  onDragStart: (id: string) => void;
  onDragOver:  (id: string) => void;
  onDrop:      () => void;
  isDragging:  boolean;
  isDragOver:  boolean;
  hint:        string;
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

  // ── Remote state ──────────────────────────────────────────────────────────

  const [docs,       setDocs]       = useState<RichRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [fetchId,    setFetchId]    = useState(0);

  // ── UI state ──────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab]     = useLocalStorage<TabValue>('taj_docs_tab', 'all');
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [filters, setFilters]         = useState<FilterState>({});
  const [dateRange, setDateRange]     = useState<DateRange | null>(null);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [page, setPage]               = useState(1);
  const [reorderMode, setReorderMode] = useState(false);
  const [docOrder, setDocOrder]       = useState<string[]>([]);
  const [dragId, setDragId]           = useState<string | null>(null);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);

  // ── Search state (debounced) ──────────────────────────────────────────────

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]           = useState('');

  // Debounce: commit search and reset to page 1 after 300 ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sort state ────────────────────────────────────────────────────────────

  // sortColKey is the SortableTable column key; sortBy is the API param name.
  const COLUMN_TO_SORT: Record<string, SortBy> = {
    name:   'file_name',
    type:   'type',
    vendor: 'vendor',
    date:   'date',
    size:   'file_size',
    status: 'status',
  };

  // Reverse mapping: API sortBy → table column key (for the header indicator).
  const SORT_TO_COLUMN: Record<SortBy, string> = {
    file_name:  'name',
    type:       'type',
    vendor:     'vendor',
    date:       'date',
    file_size:  'size',
    status:     'status',
    created_at: 'date',
  };

  const [sortBy,  setSortBy]  = useState<SortBy>('date');
  const [sortDir, setSortDir] = useState<SortOrder>('desc');

  const handleTableSort = useCallback((colKey: string, dir: 'asc' | 'desc') => {
    const apiKey = COLUMN_TO_SORT[colKey] ?? 'date';
    setSortBy(apiKey);
    setSortDir(dir as SortOrder);
    setPage(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch (server-side pagination + search + sort) ────────────────────────

  const reload = useCallback(() => setFetchId((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const apiParams = tabToApiParams(activeTab);

    documentsApi
      .list({
        page,
        pageSize:  PAGE_SIZE,
        search:    search   || undefined,
        sortBy,
        sortOrder: sortDir,
        statuses:  filters.status?.length ? (filters.status as DocumentStatus[]) : undefined,
        types:     filters.type?.length   ? (filters.type   as DocumentType[])   : undefined,
        ...apiParams,
      })
      .then(({ items, totalCount: tc, totalPages: tp }) => {
        if (cancelled) return;
        const mapped = items.map((d) => ({ ...apiDocToRecord(d), rawType: d.type, rawMetadata: d.metadata, rawAmount: d.amount }));
        setDocs(mapped);
        setTotalCount(tc);
        setTotalPages(tp);
        setDocOrder(mapped.map((d) => d.id));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          err instanceof ApiError
            ? err.message
            : 'Failed to load documents. Please try again.';
        setError(msg);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [fetchId, page, activeTab, search, sortBy, sortDir, filters]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const TABS = useMemo(() => [
    { value: 'all'          as TabValue, label: t('docs.tab.all'),          count: activeTab === 'all'          ? totalCount : 0 },
    { value: 'unclassified' as TabValue, label: t('docs.tab.unclassified'), count: activeTab === 'unclassified' ? totalCount : 0 },
    { value: 'invoices'     as TabValue, label: t('docs.tab.invoices'),     count: activeTab === 'invoices'     ? totalCount : 0 },
    { value: 'receipts'     as TabValue, label: t('docs.tab.receipts'),     count: activeTab === 'receipts'     ? totalCount : 0 },
    { value: 'statements'   as TabValue, label: t('docs.tab.statements'),   count: activeTab === 'statements'   ? totalCount : 0 },
  ], [totalCount, activeTab, t]);

  // Counts reflect current page only — acceptable since full-dataset counts
  // require separate queries (a future optimisation, out of scope here).
  const FILTER_GROUPS = useMemo(() => [
    {
      key: 'status', label: t('docs.filter.status'), type: 'multiselect' as const,
      options: [
        { value: 'uploaded',   label: t('status.unclassified'), count: docs.filter((d) => d.status === 'Unclassified').length },
        { value: 'classified', label: t('status.classified'),   count: docs.filter((d) => d.status === 'Classified').length },
        { value: 'archived',   label: 'Archived',               count: docs.filter((d) => d.status === 'Archived').length },
      ],
    },
    {
      key: 'type', label: t('docs.filter.type'), type: 'multiselect' as const,
      options: [
        { value: 'invoice',        label: t('type.invoice')   },
        { value: 'receipt',        label: t('type.receipt')   },
        { value: 'bank_statement', label: t('type.statement') },
        { value: 'credit_note',    label: 'Credit Note'       },
        { value: 'debit_note',     label: 'Debit Note'        },
        { value: 'po',             label: 'PO'                },
        { value: 'attachment',     label: 'Attachment'        },
      ],
    },
  ], [docs, t]);

  // Within-page display: preserve drag-to-reorder order, then apply
  // client-side date range filter (server-side date filter is a future phase).
  const orderedDocs = useMemo(() => {
    if (docOrder.length === 0) return docs;
    const map = new Map(docs.map((d) => [d.id, d]));
    return docOrder.map((id) => map.get(id)).filter((d): d is RichRecord => !!d);
  }, [docOrder, docs]);

  // Status and type filtering is now server-side.
  // DateRange remains client-side (server-side date filter is a future phase).
  const displayDocs = useMemo(() => {
    if (!dateRange) return orderedDocs;
    return orderedDocs.filter(
      (d) => d.date >= dateRange.from && d.date <= dateRange.to,
    );
  }, [orderedDocs, dateRange]);

  // ── Preview: ID-based tracking so navigation + row-patch stay in sync ────

  const previewIndex = useMemo(
    () => (previewDocId !== null ? displayDocs.findIndex((d) => d.id === previewDocId) : -1),
    [previewDocId, displayDocs],
  );
  const previewDoc = previewIndex >= 0 ? displayDocs[previewIndex] : null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    setPage(1);
    setSelected(new Set());
  };

  const handleFilterChange = (f: FilterState) => { setFilters(f); setPage(1); };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleDragStart = useCallback((id: string) => setDragId(id), []);
  const handleDragOver  = useCallback((id: string) => setDragOverId(id), []);

  /**
   * Surgical single-row update — does NOT trigger a full list reload.
   * Saves and restores window scroll so the user's reading position is preserved.
   */
  const handleRowUpdated = useCallback((id: string, patch: RowPatch) => {
    const scrollY = window.scrollY;
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  }, []);

  const handleDrop = useCallback(() => {
    if (!dragId || !dragOverId || dragId === dragOverId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    setDocOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(dragId);
      const to   = next.indexOf(dragOverId);
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
    {
      key: 'type', header: 'Type', sortable: true,
      render: (row: Doc) => (
        <InlineCategorySelect
          docId={row.id}
          currentType={row.rawType as DocumentType}
          onSuccess={reload}
        />
      ),
    },
    { key: 'vendor', header: 'Vendor', sortable: true },
    { key: 'date',   header: 'Date',   sortable: true,  align: 'right' as const },
    { key: 'size',   header: 'Size',   sortable: false, align: 'right' as const },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (row: Doc) => (
        <Badge variant={statusVariant(row.status as DocStatus)} dot size="sm">{row.status}</Badge>
      ),
    },
    {
      key: '_preview', header: '', sortable: false, align: 'center' as const,
      render: (row: Doc) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreviewDocId(row.id);
          }}
          aria-label={`Preview ${row.name}`}
          className={clsx(
            'p-1.5 rounded-lg transition-colors touch-target',
            previewDocId === row.id
              ? 'text-gold-600 bg-gold-50'
              : 'text-ink-muted hover:text-gold-600 hover:bg-gold-50',
          )}
        >
          <Eye size={14} aria-hidden="true" />
        </button>
      ),
    },
  ], [selected, toggleSelect, setPreviewDocId, previewDocId]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>{t('page.documents.title')}</PageTitle>
            <p className="text-sm text-ink-muted mt-1">
              {t('docs.subtitle')
                .replace('{count}', String(displayDocs.length))
                .replace('{total}', String(totalCount))}
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

        {/* ── Split layout: document list + optional inline preview panel ── */}
        <div className="flex gap-4 items-start">
          {/* ── Document list ── */}
          <div className="flex-1 min-w-0">
            <Card padding="none">
              {/* Tabs */}
              <div className="px-4 pt-4">
                <Tabs tabs={TABS} active={activeTab} onChange={handleTabChange} />
              </div>

              {/* Search bar */}
              <div className="px-4 pt-3 pb-0">
                <div className="relative flex items-center">
                  <Search
                    size={15}
                    className="absolute left-3 text-ink-muted pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by filename or vendor…"
                    aria-label="Search documents"
                    className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-border bg-surface placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
                  />
                  {searchInput && (
                    <button
                      onClick={handleClearSearch}
                      aria-label="Clear search"
                      className="absolute right-3 text-ink-muted hover:text-ink-primary transition-colors"
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  )}
                </div>
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
                {(Object.keys(filters).some((k) =>
                  (filters[k as keyof FilterState] as string[] | undefined)?.length,
                ) || dateRange) && (
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

              {/* Content — loading / error / empty / list */}
              {loading ? (
                <SkeletonTable rows={6} cols={6} />
              ) : error ? (
                <div className="flex flex-col items-center gap-3 p-10">
                  <p className="text-sm text-red-600">{error}</p>
                  <Button variant="secondary" size="sm" onClick={reload}>
                    {t('action.retry', 'Try again')}
                  </Button>
                </div>
              ) : displayDocs.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={<Search size={22} />}
                    title={search ? 'No documents match your search' : t('docs.noResults')}
                    description={search ? `No results for "${search}". Try a different term.` : t('docs.noResults.hint')}
                    action={search ? {
                      label:   'Clear search',
                      onClick: handleClearSearch,
                      icon:    <X size={13} aria-hidden="true" />,
                    } : {
                      label:   t('docs.noResults.cta'),
                      onClick: () => setUploadOpen(true),
                      icon:    <Upload size={13} aria-hidden="true" />,
                    }}
                  />
                </div>
              ) : reorderMode ? (
                /* ── Drag-to-reorder view (within current page) ── */
                <div role="list" aria-label={t('page.documents.title')}>
                  {displayDocs.map((doc) => (
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
                /* ── Normal table + server-side pagination ── */
                <>
                  <SortableTable<Doc>
                    columns={columns}
                    data={displayDocs as Doc[]}
                    keyExtractor={(row) => row.id}
                    onRowClick={(row) => setSelectedDoc(row as DocumentRecord)}
                    sortKey={SORT_TO_COLUMN[sortBy]}
                    sortDir={sortDir}
                    onSort={handleTableSort}
                  />
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    pageSize={PAGE_SIZE}
                    onChange={setPage}
                  />
                </>
              )}
            </Card>
          </div>

          {/* ── Inline preview panel (list stays visible) ── */}
          {previewDoc && (
            <div className="hidden sm:block w-80 xl:w-96 shrink-0 sticky top-4">
              <PreviewPanel
                doc={previewDoc}
                rawType={previewDoc.rawType}
                rawMetadata={previewDoc.rawMetadata}
                rawAmount={previewDoc.rawAmount}
                hasPrev={previewIndex > 0}
                hasNext={previewIndex < displayDocs.length - 1}
                onPrev={() => setPreviewDocId(displayDocs[previewIndex - 1]?.id ?? null)}
                onNext={() => setPreviewDocId(displayDocs[previewIndex + 1]?.id ?? null)}
                onClose={() => setPreviewDocId(null)}
                onRowUpdated={handleRowUpdated}
              />
            </div>
          )}
        </div>
      </div>

      <UploadModal open={uploadOpen} onClose={() => { setUploadOpen(false); reload(); }} />
      <DocumentDetailPanel
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={(id) => {
          setDocs((prev) => prev.filter((d) => d.id !== id));
          setSelectedDoc(null);
          reload();
        }}
      />

      {selected.size > 0 && !reorderMode && (
        <BatchClassifyBar
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onClassify={() => setSelected(new Set())}
        />
      )}
      <Toaster />
    </>
  );
};

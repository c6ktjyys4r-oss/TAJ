import React, { useState, useMemo } from 'react';
import { Plus, BarChart2, FileText, Calendar, CheckCircle, Clock, Download } from 'lucide-react';
import { PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SortableTable } from '../components/ui/SortableTable';
import { FilterPanel } from '../components/ui/FilterPanel';
import type { FilterState } from '../components/ui/FilterPanel';
import { ExportButton } from '../components/ui/ExportButton';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { ReportWizard } from '../components/reports/ReportWizard';
import { useT } from '../hooks/useT';

interface Report {
  id: string; title: string; type: string; status: string;
  date: string; pages: number; size: string;
  [key: string]: unknown;
}

const REPORTS: Report[] = [
  { id: '1', title: 'Q4 Financial Summary',        type: 'Quarterly', status: 'Ready',      date: '2024-10-15', pages: 24,  size: '2.1 MB' },
  { id: '2', title: 'October Bank Reconciliation', type: 'Monthly',   status: 'Ready',      date: '2024-10-14', pages: 8,   size: '640 KB' },
  { id: '3', title: 'Vendor Spend Analysis',       type: 'Custom',    status: 'Processing', date: '2024-10-14', pages: 0,   size: '\u2014' },
  { id: '4', title: 'September Financial Summary', type: 'Monthly',   status: 'Ready',      date: '2024-10-01', pages: 18,  size: '1.8 MB' },
  { id: '5', title: 'Annual Audit Package 2023',   type: 'Annual',    status: 'Ready',      date: '2024-09-15', pages: 142, size: '12.4 MB' },
  { id: '6', title: 'Tax Filing Preparation Q3',   type: 'Quarterly', status: 'Ready',      date: '2024-09-01', pages: 32,  size: '3.2 MB' },
];

const FILTER_GROUPS = [
  {
    key: 'type', label: 'Type', type: 'multiselect' as const,
    options: [
      { value: 'Monthly',   label: 'Monthly'   },
      { value: 'Quarterly', label: 'Quarterly' },
      { value: 'Annual',    label: 'Annual'    },
      { value: 'Custom',    label: 'Custom'    },
    ],
  },
  {
    key: 'status', label: 'Status', type: 'multiselect' as const,
    options: [
      { value: 'Ready',      label: 'Ready'      },
      { value: 'Processing', label: 'Processing' },
    ],
  },
];

const typeVariant: Record<string, 'gold' | 'info' | 'default'> = {
  Quarterly: 'gold', Monthly: 'info', Annual: 'gold', Custom: 'default',
};

// ── Print-only report table ──────────────────────────────────────────────────

interface PrintableReportProps { reports: Report[]; t: (k: string) => string; }

const PrintableReport: React.FC<PrintableReportProps> = ({ reports, t }) => (
  <div className="hidden print:block print-report">
    {/* Header */}
    <div className="print-header">
      <div className="print-logo">
        <span>T</span>
      </div>
      <div>
        <h1 className="print-title">TAJ Finance</h1>
        <p className="print-subtitle">{t('reports.print.title')}</p>
      </div>
      <div className="print-meta">
        <p>{t('reports.print.generated')}: {new Date().toLocaleDateString('en-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>{reports.length} {t('reports.allReports').toLowerCase()}</p>
      </div>
    </div>

    {/* Table */}
    <table className="print-table">
      <thead>
        <tr>
          <th>{t('reports.print.report')}</th>
          <th>{t('reports.print.type')}</th>
          <th>{t('reports.print.status')}</th>
          <th>{t('reports.print.date')}</th>
          <th className="text-right">{t('reports.print.pages')}</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.id}>
            <td className="font-medium">{r.title}</td>
            <td>{r.type}</td>
            <td>{r.status}</td>
            <td>{r.date}</td>
            <td className="text-right">{r.pages > 0 ? r.pages : '\u2014'}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Footer */}
    <div className="print-footer">
      <span>TAJ Finance \u2014 Confidential</span>
      <span className="print-page-num" />
    </div>
  </div>
);

// ── Main page ────────────────────────────────────────────────────────────────

export const Reports: React.FC = () => {
  const t = useT();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [filters, setFilters]       = useState<FilterState>({});

  const filtered = useMemo(() => REPORTS.filter((r) => {
    const typeMatch   = !filters.type?.length   || filters.type.includes(r.type);
    const statusMatch = !filters.status?.length || filters.status.includes(r.status);
    return typeMatch && statusMatch;
  }), [filters]);

  const columns = [
    {
      key: 'title', header: 'Report', sortable: true,
      render: (r: Report) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
            <FileText size={15} className="text-gold-600" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-ink-primary">{r.title}</span>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', sortable: true,
      render: (r: Report) => <Badge variant={typeVariant[r.type] ?? 'default'}>{r.type}</Badge>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (r: Report) => r.status === 'Processing'
        ? <Badge variant="warning" dot>{t('status.processing')}</Badge>
        : <Badge variant="success" dot>{t('status.ready')}</Badge>,
    },
    { key: 'date',  header: 'Date',  sortable: true, align: 'right' as const },
    { key: 'pages', header: 'Pages', sortable: true, align: 'right' as const,
      render: (r: Report) => <span>{r.pages > 0 ? r.pages : '\u2014'}</span> },
    { key: 'size',  header: 'Size',  align: 'right' as const },
    {
      key: 'actions', header: '', sortable: false,
      render: (r: Report) => r.status === 'Processing' ? null : (
        <Button variant="ghost" size="sm" icon={<Download size={13} aria-hidden="true" />}>
          {t('action.download')}
        </Button>
      ),
    },
  ];

  const STAT_CARDS = [
    { label: t('reports.stat.total'),      value: 24, icon: BarChart2,   color: 'text-gold-600 bg-gold-50' },
    { label: t('reports.stat.thisMonth'),  value: 6,  icon: Calendar,    color: 'text-blue-600 bg-blue-50'  },
    { label: t('reports.stat.ready'),      value: 5,  icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: t('reports.stat.processing'), value: 1,  icon: Clock,       color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <>
      {/* Print-only layout */}
      <PrintableReport reports={filtered} t={t} />

      <div className="space-y-6 no-print">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>{t('page.reports.title')}</PageTitle>
            <p className="text-sm text-ink-muted mt-1">{t('reports.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton filename="reports" />
            <Button icon={<Plus size={15} aria-hidden="true" />} onClick={() => setWizardOpen(true)}>
              {t('reports.generate')}
            </Button>
          </div>
        </div>

        {/* Animated stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div>
                  <AnimatedCounter target={value} className="text-2xl font-bold text-ink-primary font-serif" />
                  <p className="text-xs text-ink-muted">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Reports table */}
        <Card padding="none">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-ink-primary">{t('reports.allReports')}</h3>
            <FilterPanel
              groups={FILTER_GROUPS}
              value={filters}
              onChange={setFilters}
              onClear={() => setFilters({})}
            />
          </div>
          <SortableTable<Report>
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.id}
            defaultSort={{ key: 'date', dir: 'desc' }}
            emptyMessage={t('reports.noMatch')}
          />
        </Card>
      </div>

      <ReportWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
};

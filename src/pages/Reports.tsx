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

interface Report {
  id: string; title: string; type: string; status: string;
  date: string; pages: number; size: string;
  [key: string]: unknown;
}

const REPORTS: Report[] = [
  { id: '1', title: 'Q4 Financial Summary',        type: 'Quarterly', status: 'Ready',      date: '2024-10-15', pages: 24,  size: '2.1 MB' },
  { id: '2', title: 'October Bank Reconciliation', type: 'Monthly',   status: 'Ready',      date: '2024-10-14', pages: 8,   size: '640 KB' },
  { id: '3', title: 'Vendor Spend Analysis',       type: 'Custom',    status: 'Processing', date: '2024-10-14', pages: 0,   size: '—' },
  { id: '4', title: 'September Financial Summary', type: 'Monthly',   status: 'Ready',      date: '2024-10-01', pages: 18,  size: '1.8 MB' },
  { id: '5', title: 'Annual Audit Package 2023',   type: 'Annual',    status: 'Ready',      date: '2024-09-15', pages: 142, size: '12.4 MB' },
  { id: '6', title: 'Tax Filing Preparation Q3',  type: 'Quarterly', status: 'Ready',      date: '2024-09-01', pages: 32,  size: '3.2 MB' },
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

export const Reports: React.FC = () => {
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
            <FileText size={15} className="text-gold-600" />
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
        ? <Badge variant="warning" dot>Processing</Badge>
        : <Badge variant="success" dot>Ready</Badge>,
    },
    { key: 'date',  header: 'Date',  sortable: true, align: 'right' as const },
    { key: 'pages', header: 'Pages', sortable: true, align: 'right' as const,
      render: (r: Report) => <span>{r.pages > 0 ? r.pages : '—'}</span> },
    { key: 'size',  header: 'Size',  align: 'right' as const },
    {
      key: 'actions', header: '', sortable: false,
      render: (r: Report) => r.status === 'Processing' ? null : (
        <Button variant="ghost" size="sm" icon={<Download size={13} />}>Download</Button>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>Reports</PageTitle>
            <p className="text-sm text-ink-muted mt-1">Generate and manage financial reports</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton filename="reports" />
            <Button icon={<Plus size={15} />} onClick={() => setWizardOpen(true)}>Generate Report</Button>
          </div>
        </div>

        {/* Animated stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Reports', value: 24, icon: BarChart2,   color: 'text-gold-600 bg-gold-50' },
            { label: 'This Month',    value: 6,  icon: Calendar,    color: 'text-blue-600 bg-blue-50'  },
            { label: 'Ready',         value: 5,  icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Processing',    value: 1,  icon: Clock,       color: 'text-amber-600 bg-amber-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
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
            <h3 className="text-sm font-semibold text-ink-primary">All Reports</h3>
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
            emptyMessage="No reports match the selected filters"
          />
        </Card>
      </div>

      <ReportWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
};

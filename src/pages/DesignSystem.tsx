import React, { useState } from 'react';
import { Check, Download, Plus, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { PageTitle, SectionTitle, Lead, Caption, GoldText } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Table } from '../components/ui/Table';
import { Tooltip } from '../components/ui/Tooltip';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StepIndicator } from '../components/ui/StepIndicator';
import { Tabs } from '../components/ui/Tabs';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { SkeletonCard, SkeletonTable, SkeletonText } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { ExportButton } from '../components/ui/ExportButton';
import { SortableTable } from '../components/ui/SortableTable';
import type { SortableColumn } from '../components/ui/SortableTable';

// ── Sample data ──────────────────────────────────────────────────────────────

const BASIC_DATA = [
  { id: '1', name: 'Invoice #001',  status: 'Classified', amount: 'SAR 12,000', date: '2024-10-01' },
  { id: '2', name: 'Receipt #042',  status: 'Pending',    amount: 'SAR 450',    date: '2024-10-02' },
  { id: '3', name: 'Statement Q3',  status: 'Review',     amount: 'SAR 98,200', date: '2024-10-03' },
];

interface SortableRow extends Record<string, unknown> {
  id: string; name: string; type: string; amount: number; date: string;
}

const SORTABLE_DATA: SortableRow[] = [
  { id: '1', name: 'Invoice_AlRajhi_Oct.pdf', type: 'Invoice',   amount: 12000, date: '2024-10-15' },
  { id: '2', name: 'SABB_Statement_Oct.pdf',  type: 'Statement', amount: 98200, date: '2024-10-14' },
  { id: '3', name: 'Receipt_0893.jpg',         type: 'Receipt',   amount: 450,   date: '2024-10-14' },
  { id: '4', name: 'Contract_Q4.pdf',          type: 'Contract',  amount: 75000, date: '2024-10-12' },
];

const SORTABLE_COLS: SortableColumn<SortableRow>[] = [
  { key: 'name',   header: 'Document', sortable: true },
  { key: 'type',   header: 'Type',     sortable: true, render: (r) => <Badge variant="gold">{r.type}</Badge> },
  {
    key: 'amount', header: 'Amount', sortable: true, align: 'right',
    sortFn: (a, b) => (a.amount as number) - (b.amount as number),
    render: (r) => <span className="font-mono text-sm">SAR {(r.amount as number).toLocaleString()}</span>,
  },
  { key: 'date', header: 'Date', sortable: true, align: 'right' },
];

const WIZARD_STEPS = [
  { label: 'Type' },
  { label: 'Vendor' },
  { label: 'Date' },
  { label: 'Confirm' },
];

const DS_TABS = [
  { value: 'all',     label: 'All',         count: 12 },
  { value: 'invoice', label: 'Invoices',    count: 5 },
  { value: 'receipt', label: 'Receipts',    count: 3 },
] as const;
type DSTab = typeof DS_TABS[number]['value'];

// ── Page ─────────────────────────────────────────────────────────────────────

export const DesignSystem: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [dsTab, setDsTab] = useState<DSTab>('all');
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <div>
        <Breadcrumbs crumbs={[{ label: 'Home', to: '/' }, { label: 'Design System' }]} />
        <PageTitle className="mt-3">Design System</PageTitle>
        <Lead className="mt-2">
          The TAJ Finance component library — the single source of visual truth.
          <GoldText> Consistent. Elegant. Premium.</GoldText>
        </Lead>
      </div>

      {/* ── Sprint 1–2 components ──────────────────────────────────────────── */}

      <section className="space-y-4">
        <SectionTitle>Colors</SectionTitle>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="space-y-1">
              <div
                className="h-10 rounded-lg"
                style={{ background: `var(--color-gold-${shade}, #C9A84C)` }}
              />
              <Caption>{shade}</Caption>
            </div>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Gold 500',      bg: 'bg-gold-500',       text: 'text-white' },
            { label: 'Surface',       bg: 'bg-surface',        text: 'text-ink-primary', border: 'border border-border' },
            { label: 'Ink Primary',   bg: 'bg-ink-primary',    text: 'text-white' },
            { label: 'Ink Secondary', bg: 'bg-ink-secondary',  text: 'text-white' },
          ].map(({ label, bg, text, border }) => (
            <div key={label} className={`flex items-center justify-center px-4 h-10 rounded-lg ${bg} ${text} ${border ?? ''} text-xs font-medium`}>
              {label}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>Typography</SectionTitle>
        <Card padding="md" className="space-y-3">
          <PageTitle>Page Title — Playfair Display Semibold</PageTitle>
          <SectionTitle>Section Title — Playfair Display Semibold</SectionTitle>
          <p className="text-base font-medium text-ink-primary">Body Large — Inter Medium 16px</p>
          <p className="text-sm text-ink-primary">Body — Inter Regular 14px</p>
          <Lead>Lead text — Inter Regular 16px text-ink-secondary, used for page descriptions.</Lead>
          <Caption>Caption — Inter Regular 12px text-ink-muted, used for helper text and metadata.</Caption>
          <GoldText>Gold accent text — used sparingly for emphasis.</GoldText>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Buttons</SectionTitle>
        <Card padding="md">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button loading>Loading</Button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm" icon={<Plus size={12} />}>Small</Button>
              <Button size="md" icon={<Download size={14} />}>Medium</Button>
              <Button size="lg" icon={<Sparkles size={16} />}>Large</Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Badges</SectionTitle>
        <Card padding="md">
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="gold" dot>Gold</Badge>
            <Badge variant="success" dot>Success</Badge>
            <Badge variant="warning" dot>Warning</Badge>
            <Badge variant="danger" dot>Danger</Badge>
            <Badge variant="info" dot>Info</Badge>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Inputs</SectionTitle>
        <Card padding="md" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Default Input" placeholder="Enter value…" />
          <Input label="With Icon" placeholder="Search…" leadingIcon={<AlertCircle size={14} />} />
          <Input label="Error State" placeholder="Enter value…" error="This field is required" />
          <Input label="With Hint" placeholder="YYYY-MM-DD" hint="Format: YYYY-MM-DD" type="date" />
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Table (legacy)</SectionTitle>
        <Card padding="none">
          <Table
            columns={[
              { key: 'name',   header: 'Name' },
              { key: 'status', header: 'Status', render: (row: Record<string, unknown>) => <Badge variant={row.status === 'Classified' ? 'success' : row.status === 'Review' ? 'warning' : 'default'}>{String(row.status)}</Badge> },
              { key: 'amount', header: 'Amount', align: 'right' },
              { key: 'date',   header: 'Date',   align: 'right' },
            ]}
            data={BASIC_DATA as Record<string, unknown>[]}
            keyExtractor={(row) => String(row.id)}
          />
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Dialog</SectionTitle>
        <Card padding="md">
          <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
        </Card>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Confirm Action"
          description="This is a sample dialog demonstrating the TAJ Finance modal pattern."
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setDialogOpen(false)} icon={<Check size={14} />}>Confirm</Button>
            </>
          }
        >
          <p className="text-sm text-ink-secondary">
            Dialog body content goes here. Keep it concise and focused on the decision the user needs to make.
          </p>
        </Dialog>
      </section>

      <section className="space-y-4">
        <SectionTitle>Tooltip</SectionTitle>
        <Card padding="md">
          <div className="flex gap-6 flex-wrap">
            {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
              <Tooltip key={pos} content={`Tooltip on ${pos}`} side={pos}>
                <Button variant="secondary" size="sm">{pos}</Button>
              </Tooltip>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Empty State</SectionTitle>
        <Card padding="none">
          <EmptyState
            icon={<FileText size={22} />}
            title="No documents found"
            description="Upload documents to get started with AI-powered classification."
            action={{ label: 'Upload Document', onClick: () => {} }}
          />
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Progress Bar</SectionTitle>
        <Card padding="md" className="space-y-4">
          <ProgressBar value={25} label="Classification" />
          <ProgressBar value={60} label="Bank Matching" variant="gold" />
          <ProgressBar value={90} label="Report Generation" variant="success" />
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Step Indicator</SectionTitle>
        <Card padding="md" className="space-y-6">
          <StepIndicator steps={WIZARD_STEPS} current={wizardStep} />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setWizardStep((s) => Math.max(0, s - 1))}>Back</Button>
            <Button size="sm" onClick={() => setWizardStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))}>Next</Button>
            <Button variant="ghost" size="sm" onClick={() => setWizardStep(0)}>Reset</Button>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Tabs</SectionTitle>
        <Card padding="md" className="space-y-4">
          <Tabs tabs={DS_TABS} active={dsTab} onChange={setDsTab} />
          <Caption>Active: {dsTab}</Caption>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Breadcrumbs</SectionTitle>
        <Card padding="md">
          <Breadcrumbs crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Documents', to: '/documents' }, { label: 'Invoice #001' }]} />
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Spacing</SectionTitle>
        <Card padding="md">
          <div className="flex items-end gap-4 flex-wrap">
            {[1, 2, 3, 4, 6, 8, 10, 12, 16].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div className="bg-gold-200 rounded" style={{ width: `${n * 4}px`, height: '24px' }} />
                <Caption>{n * 4}px</Caption>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ── Sprint 3–4 components ──────────────────────────────────────────── */}

      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-widest">Sprint 3–4 Components</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>

      <section className="space-y-4">
        <SectionTitle>Skeleton Loaders</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Caption className="mb-2">SkeletonCard</Caption>
            <SkeletonCard />
          </div>
          <div className="space-y-2">
            <Caption className="mb-2">SkeletonText</Caption>
            <Card padding="md">
              <SkeletonText lines={4} />
            </Card>
          </div>
        </div>
        <div>
          <Caption className="mb-2">SkeletonTable (5 rows)</Caption>
          <Card padding="none">
            <SkeletonTable rows={5} cols={4} />
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Sortable Table</SectionTitle>
        <Card padding="none">
          <SortableTable<SortableRow>
            columns={SORTABLE_COLS}
            data={SORTABLE_DATA}
            keyExtractor={(r) => r.id}
            defaultSort={{ key: 'date', dir: 'desc' }}
          />
        </Card>
        <Caption>Click any column header to sort. Click again to reverse. Amount uses a custom numeric sort.</Caption>
      </section>

      <section className="space-y-4">
        <SectionTitle>Pagination</SectionTitle>
        <Card padding="md">
          <Pagination
            page={page}
            totalPages={8}
            totalItems={72}
            pageSize={10}
            onChange={setPage}
          />
        </Card>
        <Caption>Current page: {page}</Caption>
      </section>

      <section className="space-y-4">
        <SectionTitle>Animated Counter</SectionTitle>
        <Card padding="md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gold-600 font-serif">
                <AnimatedCounter target={1284} suffix=" docs" />
              </p>
              <Caption className="mt-1">Total documents</Caption>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600 font-serif">
                <AnimatedCounter target={94.7} decimals={1} suffix="%" />
              </p>
              <Caption className="mt-1">Classified</Caption>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-ink-primary font-serif">
                <AnimatedCounter target={3200000} prefix="SAR " />
              </p>
              <Caption className="mt-1">Total spend</Caption>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 font-serif">
                <AnimatedCounter target={18} suffix=" pending" />
              </p>
              <Caption className="mt-1">Needs review</Caption>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionTitle>Export Button</SectionTitle>
        <Card padding="md">
          <CardHeader title="Export Button" subtitle="Supports CSV, Excel. Click to see dropdown." />
          <div className="flex items-center gap-4 flex-wrap mt-4">
            <ExportButton filename="taj-documents" formats={['csv', 'xlsx']} />
            <ExportButton filename="taj-report" formats={['csv', 'xlsx', 'pdf']} />
          </div>
        </Card>
      </section>
    </div>
  );
};

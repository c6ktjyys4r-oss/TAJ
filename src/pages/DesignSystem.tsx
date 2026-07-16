import React, { useState } from 'react';
import { Check, Download, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { PageTitle, SectionTitle, Lead, Caption, GoldText } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Table } from '../components/ui/Table';

const SAMPLE_DATA = [
  { id: '1', name: 'Invoice #001',  status: 'Classified', amount: 'SAR 12,000', date: '2024-10-01' },
  { id: '2', name: 'Receipt #042',  status: 'Pending',    amount: 'SAR 450',    date: '2024-10-02' },
  { id: '3', name: 'Statement Q3',  status: 'Review',     amount: 'SAR 98,200', date: '2024-10-03' },
];

export const DesignSystem: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-12 pb-16">
      <div>
        <PageTitle>Design System</PageTitle>
        <Lead className="mt-2">
          The TAJ Finance component library — the single source of visual truth.
          <GoldText> Consistent. Elegant. Premium.</GoldText>
        </Lead>
      </div>

      {/* Colors */}
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
            { label: 'Gold 500',       bg: 'bg-gold-500',  text: 'text-white'      },
            { label: 'Surface',        bg: 'bg-surface',   text: 'text-ink-primary', border: 'border border-border' },
            { label: 'Ink Primary',    bg: 'bg-ink-primary', text: 'text-white'     },
            { label: 'Ink Secondary',  bg: 'bg-ink-secondary', text: 'text-white'   },
          ].map(({ label, bg, text, border }) => (
            <div key={label} className={`flex items-center justify-center px-4 h-10 rounded-lg ${bg} ${text} ${border ?? ''} text-xs font-medium`}>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
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

      {/* Buttons */}
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

      {/* Badges */}
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

      {/* Inputs */}
      <section className="space-y-4">
        <SectionTitle>Inputs</SectionTitle>
        <Card padding="md" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Default Input" placeholder="Enter value…" />
          <Input label="With Icon" placeholder="Search…" leadingIcon={<AlertCircle size={14} />} />
          <Input label="Error State" placeholder="Enter value…" error="This field is required" />
          <Input label="With Hint" placeholder="YYYY-MM-DD" hint="Format: YYYY-MM-DD" type="date" />
        </Card>
      </section>

      {/* Table */}
      <section className="space-y-4">
        <SectionTitle>Table</SectionTitle>
        <Card padding="none">
          <Table
            columns={[
              { key: 'name',   header: 'Name' },
              { key: 'status', header: 'Status', render: (row: Record<string, unknown>) => <Badge variant={row.status === 'Classified' ? 'success' : row.status === 'Review' ? 'warning' : 'default'}>{String(row.status)}</Badge> },
              { key: 'amount', header: 'Amount', align: 'right' },
              { key: 'date',   header: 'Date',   align: 'right' },
            ]}
            data={SAMPLE_DATA as Record<string, unknown>[]}
            keyExtractor={(row) => String(row.id)}
          />
        </Card>
      </section>

      {/* Dialog */}
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

      {/* Spacing */}
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
    </div>
  );
};

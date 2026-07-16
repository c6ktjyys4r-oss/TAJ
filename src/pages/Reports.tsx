import React, { useState } from 'react';
import { Download, Plus, BarChart2, FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import { PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ReportWizard } from '../components/reports/ReportWizard';

const REPORTS = [
  { id: '1', title: 'Q4 Financial Summary',         type: 'Quarterly', status: 'Ready',      date: '2024-10-15', pages: 24,  size: '2.1 MB' },
  { id: '2', title: 'October Bank Reconciliation',  type: 'Monthly',   status: 'Ready',      date: '2024-10-14', pages: 8,   size: '640 KB' },
  { id: '3', title: 'Vendor Spend Analysis',        type: 'Custom',    status: 'Processing', date: '2024-10-14', pages: 0,   size: '—' },
  { id: '4', title: 'September Financial Summary',  type: 'Monthly',   status: 'Ready',      date: '2024-10-01', pages: 18,  size: '1.8 MB' },
  { id: '5', title: 'Annual Audit Package 2023',    type: 'Annual',    status: 'Ready',      date: '2024-09-15', pages: 142, size: '12.4 MB' },
  { id: '6', title: 'Tax Filing Preparation Q3',   type: 'Quarterly', status: 'Ready',      date: '2024-09-01', pages: 32,  size: '3.2 MB' },
];

const typeVariant: Record<string, 'gold' | 'info' | 'default'> = {
  Quarterly: 'gold', Monthly: 'info', Annual: 'gold', Custom: 'default',
};

export const Reports: React.FC = () => {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>Reports</PageTitle>
            <p className="text-sm text-ink-muted mt-1">Generate and manage financial reports</p>
          </div>
          <Button icon={<Plus size={15} />} onClick={() => setWizardOpen(true)}>
            Generate Report
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Reports', value: '24', icon: BarChart2,   color: 'text-gold-600 bg-gold-50' },
            { label: 'This Month',    value: '6',  icon: Calendar,    color: 'text-blue-600 bg-blue-50'  },
            { label: 'Ready',         value: '5',  icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Processing',    value: '1',  icon: Clock,       color: 'text-amber-600 bg-amber-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-ink-primary font-serif">{value}</p>
                  <p className="text-xs text-ink-muted">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Reports list */}
        <Card padding="none">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-ink-primary">All Reports</h3>
          </div>
          <div className="divide-y divide-border/60">
            {REPORTS.map((report) => (
              <div key={report.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gold-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-primary truncate">{report.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={typeVariant[report.type] ?? 'default'} size="sm">{report.type}</Badge>
                    <span className="text-xs text-ink-muted">{report.date}</span>
                    {report.pages > 0 && <span className="text-xs text-ink-muted">{report.pages} pages · {report.size}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {report.status === 'Processing' ? (
                    <Badge variant="warning" dot>Processing</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" icon={<Download size={13} />}>Download</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ReportWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
};

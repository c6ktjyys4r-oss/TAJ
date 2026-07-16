import React from 'react';
import { Sparkles, FileText, GitMerge, BarChart2, Zap, Shield, TrendingUp } from 'lucide-react';
import { PageTitle, Lead } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const CAPABILITIES = [
  {
    icon: FileText,
    title: 'Document Intelligence',
    description: 'Automatic classification and data extraction from invoices, receipts, and financial documents.',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    icon: GitMerge,
    title: 'Smart Bank Matching',
    description: 'AI-powered reconciliation that learns your patterns and improves over time.',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    icon: BarChart2,
    title: 'Report Generation',
    description: 'Automated report creation with natural language summaries and anomaly detection.',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    description: 'Forecast cash flow, detect spending trends, and surface financial insights proactively.',
    status: 'Coming Soon',
    statusVariant: 'warning' as const,
  },
  {
    icon: Shield,
    title: 'Compliance Monitor',
    description: 'Continuous monitoring for regulatory compliance and audit trail management.',
    status: 'Coming Soon',
    statusVariant: 'warning' as const,
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Build custom automation rules triggered by financial events and thresholds.',
    status: 'Coming Soon',
    statusVariant: 'warning' as const,
  },
];

const STATS = [
  { label: 'Documents Processed',  value: '4,821',  delta: '+12% this month' },
  { label: 'Auto-classified',      value: '94.7%',  delta: '+2.1% accuracy' },
  { label: 'Time Saved',           value: '127 hrs', delta: 'This quarter' },
  { label: 'AI Confidence',        value: '96.2%',  delta: 'Average score' },
];

export const AI: React.FC = () => (
  <div className="space-y-8">
    <div>
      <PageTitle>AI Intelligence</PageTitle>
      <Lead className="mt-1">TAJ's AI engine works continuously to automate your financial workflows.</Lead>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATS.map(({ label, value, delta }) => (
        <Card key={label} padding="md">
          <p className="text-2xl font-bold font-serif text-ink-primary">{value}</p>
          <p className="text-xs font-medium text-ink-secondary mt-0.5">{label}</p>
          <p className="text-xs text-gold-600 mt-1 font-medium">{delta}</p>
        </Card>
      ))}
    </div>

    {/* Capabilities */}
    <div>
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-4">AI Capabilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAPABILITIES.map(({ icon: Icon, title, description, status, statusVariant }) => (
          <Card key={title} padding="md" hover>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                <Icon size={18} className="text-gold-600" />
              </div>
              <Badge variant={statusVariant} dot size="sm">{status}</Badge>
            </div>
            <h3 className="font-semibold text-ink-primary font-serif mb-1">{title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
          </Card>
        ))}
      </div>
    </div>

    {/* Hint */}
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gold-50 border border-gold-100">
      <Sparkles size={18} className="text-gold-600 shrink-0" />
      <p className="text-sm text-ink-secondary">
        The <span className="font-medium text-gold-700">AI Assistant</span> is always available via the floating button — ask it anything about your documents, reports, or reconciliation status.
      </p>
    </div>
  </div>
);

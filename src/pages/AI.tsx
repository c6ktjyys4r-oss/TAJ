import React from 'react';
import { Sparkles, FileText, GitMerge, BarChart2, Zap, Shield, TrendingUp } from 'lucide-react';
import { PageTitle, Lead } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useT } from '../hooks/useT';

const CAPABILITIES = [
  {
    icon: FileText,
    titleKey: 'Document Intelligence',
    descriptionKey: 'Automatic classification and data extraction from invoices, receipts, and financial documents.',
    statusKey: 'status.active',
    statusVariant: 'success' as const,
  },
  {
    icon: GitMerge,
    titleKey: 'Smart Bank Matching',
    descriptionKey: 'AI-powered reconciliation that learns your patterns and improves over time.',
    statusKey: 'status.active',
    statusVariant: 'success' as const,
  },
  {
    icon: BarChart2,
    titleKey: 'Report Generation',
    descriptionKey: 'Automated report creation with natural language summaries and anomaly detection.',
    statusKey: 'status.active',
    statusVariant: 'success' as const,
  },
  {
    icon: TrendingUp,
    titleKey: 'Predictive Analytics',
    descriptionKey: 'Forecast cash flow, detect spending trends, and surface financial insights proactively.',
    statusKey: 'status.comingSoon',
    statusVariant: 'warning' as const,
  },
  {
    icon: Shield,
    titleKey: 'Compliance Monitor',
    descriptionKey: 'Continuous monitoring for regulatory compliance and audit trail management.',
    statusKey: 'status.comingSoon',
    statusVariant: 'warning' as const,
  },
  {
    icon: Zap,
    titleKey: 'Workflow Automation',
    descriptionKey: 'Build custom automation rules triggered by financial events and thresholds.',
    statusKey: 'status.comingSoon',
    statusVariant: 'warning' as const,
  },
];

const STATS = [
  { labelKey: 'ai.stat.processed',  value: '4,821',   deltaKey: '+12% this month'   },
  { labelKey: 'ai.stat.classified', value: '94.7%',   deltaKey: '+2.1% accuracy'    },
  { labelKey: 'ai.stat.timeSaved',  value: '127 hrs', deltaKey: 'This quarter'      },
  { labelKey: 'ai.stat.confidence', value: '96.2%',   deltaKey: 'Average score'     },
];

export const AI: React.FC = () => {
  const t = useT();

  return (
    <div className="space-y-8">
      <div>
        <PageTitle>{t('page.ai.title')}</PageTitle>
        <Lead className="mt-1">{t('ai.subtitle')}</Lead>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ labelKey, value, deltaKey }) => (
          <Card key={labelKey} padding="md">
            <p className="text-2xl font-bold font-serif text-ink-primary">{value}</p>
            <p className="text-xs font-medium text-ink-secondary mt-0.5">{t(labelKey)}</p>
            <p className="text-xs text-gold-600 mt-1 font-medium">{deltaKey}</p>
          </Card>
        ))}
      </div>

      {/* Capabilities */}
      <div>
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-4">
          {t('ai.capabilities')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map(({ icon: Icon, titleKey, descriptionKey, statusKey, statusVariant }) => (
            <Card key={titleKey} padding="md" hover>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center">
                  <Icon size={18} className="text-gold-600" aria-hidden="true" />
                </div>
                <Badge variant={statusVariant} dot size="sm">{t(statusKey)}</Badge>
              </div>
              <h3 className="font-semibold text-ink-primary font-serif mb-1">{titleKey}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{descriptionKey}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gold-50 border border-gold-100">
        <Sparkles size={18} className="text-gold-600 shrink-0" aria-hidden="true" />
        <p className="text-sm text-ink-secondary">
          {t('ai.hint').split('AI Assistant').map((part, i) =>
            i === 0
              ? <React.Fragment key={i}>{part}<span className="font-medium text-gold-700">AI Assistant</span></React.Fragment>
              : <React.Fragment key={i}>{part}</React.Fragment>
          )}
        </p>
      </div>
    </div>
  );
};

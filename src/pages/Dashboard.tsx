import React from 'react';
import {
  FileText, FolderOpen, GitMerge, BarChart2, Sparkles, Settings
} from 'lucide-react';
import { LaunchpadCard } from '../components/dashboard/LaunchpadCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { AISuggestions } from '../components/dashboard/AISuggestions';
import { SpendChart } from '../components/dashboard/SpendChart';
import { Card, CardHeader } from '../components/ui/Card';
import { PageTitle, Lead } from '../components/ui/Typography';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { useT } from '../hooks/useT';

export const Dashboard: React.FC = () => {
  const t = useT();

  const LAUNCHPAD = [
    { icon: <FileText size={22} />,   title: t('nav.documents'),     description: t('launchpad.documents.desc'),    to: '/documents',     badge: 12, accentColor: 'from-gold-50 to-amber-50'  },
    { icon: <FolderOpen size={22} />, title: t('status.unclassified'), description: t('launchpad.unclassified.desc'), to: '/documents',     badge: 7,  accentColor: 'from-orange-50 to-amber-50' },
    { icon: <GitMerge size={22} />,   title: t('nav.bankMatching'),  description: t('launchpad.bankMatching.desc'), to: '/bank-matching',           accentColor: 'from-violet-50 to-purple-50'},
    { icon: <BarChart2 size={22} />,  title: t('nav.reports'),       description: t('launchpad.reports.desc'),      to: '/reports',                 accentColor: 'from-blue-50 to-indigo-50'  },
    { icon: <Sparkles size={22} />,   title: t('page.ai.title'),     description: t('launchpad.ai.desc'),           to: '/ai',                      accentColor: 'from-gold-50 to-yellow-50'  },
    { icon: <Settings size={22} />,   title: t('nav.settings'),      description: t('launchpad.settings.desc'),     to: '/settings',                accentColor: 'from-gray-50 to-slate-50'   },
  ];

  const STATS = [
    { label: t('dashboard.stat.totalDocs'),  value: 4821, suffix: '',   prefix: '', decimals: 0 },
    { label: t('dashboard.stat.classified'), value: 94.7, suffix: '%',  prefix: '', decimals: 1 },
    { label: t('dashboard.stat.thisMonth'),  value: 312,  suffix: '',   prefix: '', decimals: 0 },
    { label: t('dashboard.stat.matchRate'),  value: 98.2, suffix: '%',  prefix: '', decimals: 1 },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex items-end justify-between">
        <div>
          <PageTitle>{t('dashboard.greeting')}</PageTitle>
          <Lead className="mt-1">{t('dashboard.subtitle')}</Lead>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-ink-muted">
            {new Date().toLocaleDateString('en-SA', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Gold divider */}
      <div className="gold-divider rounded-full" />

      {/* Animated stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label} padding="md">
            <AnimatedCounter
              target={s.value}
              prefix={s.prefix}
              suffix={s.suffix}
              decimals={s.decimals}
              duration={1400}
              className="text-2xl font-bold font-serif text-ink-primary"
            />
            <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Launchpad */}
      <section>
        <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-4">
          {t('dashboard.quickAccess')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {LAUNCHPAD.map((item) => (
            <LaunchpadCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* Bottom row: Activity + AI + Spend chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md">
          <CardHeader title={t('dashboard.recentActivity')} subtitle={t('dashboard.recentActivity.sub')} />
          <RecentActivity />
        </Card>

        <Card padding="md">
          <CardHeader
            title={t('dashboard.aiSuggestions')}
            subtitle={t('dashboard.aiSuggestions.sub')}
            action={
              <span className="inline-flex items-center gap-1 text-xs text-gold-600 font-medium">
                <Sparkles size={12} aria-hidden="true" /> {t('dashboard.live')}
              </span>
            }
          />
          <AISuggestions />
        </Card>

        <SpendChart />
      </div>
    </div>
  );
};

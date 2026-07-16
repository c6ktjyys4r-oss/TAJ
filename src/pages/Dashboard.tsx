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

const LAUNCHPAD = [
  { icon: <FileText size={22} />,   title: 'Documents',     description: 'Upload, classify, and manage financial documents', to: '/documents',              badge: 12, accentColor: 'from-gold-50 to-amber-50'  },
  { icon: <FolderOpen size={22} />, title: 'Unclassified',  description: 'Review documents awaiting classification',         to: '/documents',              badge: 7,  accentColor: 'from-orange-50 to-amber-50' },
  { icon: <GitMerge size={22} />,   title: 'Bank Matching', description: 'Reconcile transactions against bank statements',   to: '/bank-matching',          badge: 3,  accentColor: 'from-violet-50 to-purple-50'},
  { icon: <BarChart2 size={22} />,  title: 'Reports',       description: 'Generate and download financial reports',          to: '/reports',                           accentColor: 'from-blue-50 to-indigo-50'  },
  { icon: <Sparkles size={22} />,   title: 'AI Assistant',  description: 'Get intelligent insights and automations',         to: '/ai',                                accentColor: 'from-gold-50 to-yellow-50'  },
  { icon: <Settings size={22} />,   title: 'Settings',      description: 'Configure your workspace and preferences',         to: '/settings',                          accentColor: 'from-gray-50 to-slate-50'   },
];

const STATS = [
  { label: 'Total Documents', value: 4821, suffix: '',   prefix: '', decimals: 0 },
  { label: 'Classified',      value: 94.7, suffix: '%',  prefix: '', decimals: 1 },
  { label: 'This Month',      value: 312,  suffix: '',   prefix: '', decimals: 0 },
  { label: 'Match Rate',      value: 98.2, suffix: '%',  prefix: '', decimals: 1 },
];

export const Dashboard: React.FC = () => (
  <div className="space-y-8">
    {/* Hero */}
    <div className="flex items-end justify-between">
      <div>
        <PageTitle>Good morning, Admin</PageTitle>
        <Lead className="mt-1">Here is what is happening across your financial workspace.</Lead>
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
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {LAUNCHPAD.map((item) => (
          <LaunchpadCard key={item.title} {...item} />
        ))}
      </div>
    </section>

    {/* Bottom row: Activity + AI + Spend chart */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card padding="md">
        <CardHeader title="Recent Activity" subtitle="Last 24 hours" />
        <RecentActivity />
      </Card>

      <Card padding="md">
        <CardHeader
          title="AI Suggestions"
          subtitle="Powered by TAJ Intelligence"
          action={
            <span className="inline-flex items-center gap-1 text-xs text-gold-600 font-medium">
              <Sparkles size={12} /> Live
            </span>
          }
        />
        <AISuggestions />
      </Card>

      <SpendChart />
    </div>
  </div>
);

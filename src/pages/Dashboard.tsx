import React from 'react';
import {
  FileText, FolderOpen, GitMerge, BarChart2, Sparkles, Settings
} from 'lucide-react';
import { LaunchpadCard } from '../components/dashboard/LaunchpadCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { AISuggestions } from '../components/dashboard/AISuggestions';
import { Card, CardHeader } from '../components/ui/Card';
import { PageTitle, Lead } from '../components/ui/Typography';

const LAUNCHPAD = [
  {
    icon: <FileText size={22} />,
    title: 'Documents',
    description: 'Upload, classify, and manage financial documents',
    to: '/documents',
    badge: 12,
    accentColor: 'from-gold-50 to-amber-50',
  },
  {
    icon: <FolderOpen size={22} />,
    title: 'Unclassified',
    description: 'Review documents awaiting classification',
    to: '/documents?tab=unclassified',
    badge: 7,
    accentColor: 'from-orange-50 to-amber-50',
  },
  {
    icon: <GitMerge size={22} />,
    title: 'Bank Matching',
    description: 'Reconcile transactions against bank statements',
    to: '/bank-matching',
    badge: 3,
    accentColor: 'from-violet-50 to-purple-50',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Reports',
    description: 'Generate and download financial reports',
    to: '/reports',
    accentColor: 'from-blue-50 to-indigo-50',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'AI Assistant',
    description: 'Get intelligent insights and automations',
    to: '/ai',
    accentColor: 'from-gold-50 to-yellow-50',
  },
  {
    icon: <Settings size={22} />,
    title: 'Settings',
    description: 'Configure your workspace and preferences',
    to: '/settings',
    accentColor: 'from-gray-50 to-slate-50',
  },
];

export const Dashboard: React.FC = () => (
  <div className="space-y-8">
    {/* Hero */}
    <div className="flex items-end justify-between">
      <div>
        <PageTitle>Good morning, Admin</PageTitle>
        <Lead className="mt-1">Here's what's happening across your financial workspace.</Lead>
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

    {/* Launchpad */}
    <section>
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-4">
        Quick Access
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {LAUNCHPAD.map((item) => (
          <LaunchpadCard key={item.title} {...item} />
        ))}
      </div>
    </section>

    {/* Bottom row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  </div>
);

import React from 'react';
import { GitMerge, BarChart2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
  statusLabel: string;
}

const ACTIVITY: ActivityItem[] = [
  {
    id: '1', icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50',
    title: 'Invoice #INV-2024-0893 classified',
    subtitle: 'Automatically matched to Vendor: Al Rajhi Cement',
    timestamp: '2 min ago', status: 'success', statusLabel: 'Classified',
  },
  {
    id: '2', icon: AlertCircle, iconColor: 'text-amber-600', iconBg: 'bg-amber-50',
    title: 'Bank statement needs review',
    subtitle: 'SABB — October 2024 statement has 3 unmatched entries',
    timestamp: '14 min ago', status: 'warning', statusLabel: 'Needs Review',
  },
  {
    id: '3', icon: BarChart2, iconColor: 'text-blue-600', iconBg: 'bg-blue-50',
    title: 'Monthly report generated',
    subtitle: 'Q4 Financial Summary — ready for download',
    timestamp: '1 hr ago', status: 'info', statusLabel: 'Ready',
  },
  {
    id: '4', icon: Upload, iconColor: 'text-gold-600', iconBg: 'bg-gold-50',
    title: '12 documents uploaded',
    subtitle: 'Batch upload completed — awaiting classification',
    timestamp: '3 hr ago', status: 'info', statusLabel: 'Pending',
  },
  {
    id: '5', icon: GitMerge, iconColor: 'text-violet-600', iconBg: 'bg-violet-50',
    title: 'Bank matching completed',
    subtitle: 'Riyad Bank — September 2024: 98% match rate',
    timestamp: 'Yesterday', status: 'success', statusLabel: 'Matched',
  },
];

const badgeVariant: Record<string, 'success' | 'warning' | 'info'> = {
  success: 'success', warning: 'warning', info: 'info'
};

export const RecentActivity: React.FC = () => (
  <div className="space-y-1">
    {ACTIVITY.map((item) => {
      const Icon = item.icon;
      return (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-gold-50 transition-colors duration-150 cursor-default"
        >
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', item.iconBg)}>
            <Icon size={16} className={item.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-ink-primary truncate">{item.title}</span>
              <Badge variant={badgeVariant[item.status]} size="sm">{item.statusLabel}</Badge>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5 truncate">{item.subtitle}</p>
          </div>
          <span className="text-xs text-ink-muted shrink-0 mt-1">{item.timestamp}</span>
        </div>
      );
    })}
  </div>
);

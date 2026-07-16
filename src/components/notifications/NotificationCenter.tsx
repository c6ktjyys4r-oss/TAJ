import React, { useState } from 'react';
import {
  Bell, CheckCircle, AlertCircle, BarChart2, FileText, GitMerge, X, CheckCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';

interface Notification {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  ts: string;
  read: boolean;
  type: 'success' | 'warning' | 'info';
}

const INITIAL: Notification[] = [
  { id: '1', icon: BarChart2,   iconColor: 'text-blue-600',    iconBg: 'bg-blue-50',    title: 'Report Ready',                     body: 'Q4 Financial Summary is ready to download.',              ts: '2 min ago',  read: false, type: 'info'    },
  { id: '2', icon: AlertCircle, iconColor: 'text-amber-600',   iconBg: 'bg-amber-50',   title: 'Bank Statement Needs Review',       body: 'SABB October 2024 — 3 unmatched entries.',                ts: '14 min ago', read: false, type: 'warning' },
  { id: '3', icon: FileText,    iconColor: 'text-gold-600',    iconBg: 'bg-gold-50',    title: '7 Documents Pending Classification', body: 'AI confidence is high. Quick review recommended.',        ts: '1 hr ago',   read: false, type: 'warning' },
  { id: '4', icon: CheckCircle, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', title: 'Bank Matching Complete',            body: 'Riyad Bank September — 98% match rate.',                  ts: '3 hr ago',   read: true,  type: 'success' },
  { id: '5', icon: GitMerge,    iconColor: 'text-violet-600',  iconBg: 'bg-violet-50',  title: 'Reconciliation Finished',           body: 'Al Rajhi Bank October: 247 transactions reconciled.',     ts: 'Yesterday',  read: true,  type: 'success' },
];

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState(INITIAL);
  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications((ns) => ns.filter((n) => n.id !== id));
  const markRead = (id: string) => setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n));

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-border rounded-2xl shadow-float z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-ink-primary" />
            <span className="text-sm font-semibold text-ink-primary">Notifications</span>
            {unread > 0 && <Badge variant="gold" size="sm">{unread} new</Badge>}
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 font-medium transition-colors"
            disabled={unread === 0}
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-border/50 max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-muted">No notifications</div>
          ) : (
            notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={clsx(
                    'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gold-50 transition-colors',
                    !n.read && 'bg-gold-50/40'
                  )}
                >
                  <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', n.iconBg)}>
                    <Icon size={16} className={n.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1">
                      <p className="text-sm font-medium text-ink-primary leading-snug flex-1">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-ink-muted mt-1">{n.ts}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="shrink-0 p-0.5 text-ink-muted hover:text-red-400 transition-colors mt-0.5"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2.5 text-center">
          <button className="text-xs font-medium text-gold-600 hover:text-gold-700 transition-colors">
            View all activity
          </button>
        </div>
      </div>
    </>
  );
};

/* Bell button with badge — drop-in replacement for the TopBar bell */
export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [notifications] = useState(INITIAL);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={anchorRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-gold-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      <NotificationCenter open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} />
    </div>
  );
};

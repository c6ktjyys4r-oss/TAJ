import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart2, GitMerge, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useT } from '../../hooks/useT';

export const MobileBottomNav: React.FC = () => {
  const t = useT();

  const NAV_ITEMS = [
    { to: '/',              label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/documents',     label: t('nav.documents'), icon: FileText },
    { to: '/reports',       label: t('nav.reports'),   icon: BarChart2 },
    { to: '/bank-matching', label: t('nav.bank'),      icon: GitMerge },
    { to: '/ai',            label: t('nav.ai'),        icon: Sparkles },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-border"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors duration-150',
              isActive
                ? 'text-gold-600'
                : 'text-ink-muted hover:text-ink-primary'
            )}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} aria-hidden="true" />
                <span className={clsx('text-[10px] font-medium', isActive ? 'text-gold-600' : 'text-ink-muted')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, FileText, BarChart2,
  GitMerge, Sparkles, Settings, User, ChevronDown, LogOut, UserCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { NotificationBell } from '../notifications/NotificationCenter';
import { GlobalSearch } from '../search/GlobalSearch';

const NAV_ITEMS = [
  { to: '/',              label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/documents',     label: 'Documents',    icon: FileText },
  { to: '/reports',       label: 'Reports',      icon: BarChart2 },
  { to: '/bank-matching', label: 'Bank Matching', icon: GitMerge },
  { to: '/ai',            label: 'AI',            icon: Sparkles },
  { to: '/settings',      label: 'Settings',      icon: Settings },
];

export const TopBar: React.FC = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        {/* Gold accent line */}
        <div className="h-0.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-100" />

        <div className="flex items-center h-14 px-6 gap-6">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0 focus:outline-none"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">T</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-sm font-semibold text-ink-primary tracking-wide">TAJ</span>
              <span className="text-[9px] font-medium text-ink-muted tracking-widest uppercase">Finance</span>
            </div>
          </button>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className={clsx(
              'flex items-center gap-2 h-8 px-3 rounded-lg border border-border text-sm text-ink-muted',
              'hover:border-gold-300 hover:text-ink-primary transition-all duration-150',
              'flex-1 max-w-sm text-left'
            )}
          >
            <Search size={14} className="shrink-0" />
            <span className="flex-1">Search documents, reports…</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium text-ink-muted bg-gray-50 border border-gray-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Main Nav */}
          <nav className="flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => clsx('nav-link', isActive && 'active')}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gold-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center">
                  <User size={14} className="text-gold-600" />
                </div>
                <span className="text-sm font-medium text-ink-primary hidden sm:block">Admin</span>
                <ChevronDown size={14} className="text-ink-muted" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-float z-20 py-1 overflow-hidden">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-xs font-semibold text-ink-primary">Admin User</p>
                      <p className="text-xs text-ink-muted">admin@taj.finance</p>
                    </div>
                    {[
                      { icon: UserCircle, label: 'Profile' },
                      { icon: Settings,   label: 'Settings', to: '/settings' },
                    ].map(({ icon: Icon, label, to }) => (
                      <button
                        key={label}
                        onClick={() => { setUserMenuOpen(false); if (to) navigate(to); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-secondary hover:bg-gold-50 hover:text-ink-primary transition-colors"
                      >
                        <Icon size={14} /> {label}
                      </button>
                    ))}
                    <div className="border-t border-border mt-1 pt-1">
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global search overlay (Cmd+K) */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

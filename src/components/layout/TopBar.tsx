import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, FileText, BarChart2,
  GitMerge, Sparkles, Settings, User, ChevronDown, LogOut,
  UserCircle, Menu, X,
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
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        {/* Gold accent line */}
        <div className="h-0.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-100" aria-hidden="true" />

        <div className="flex items-center h-14 px-4 sm:px-6 gap-3 sm:gap-6">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-gray-100 transition-colors shrink-0"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg"
            aria-label="TAJ Finance — go to Dashboard"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center" aria-hidden="true">
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
            aria-label="Search documents, reports… (Cmd+K)"
            className={clsx(
              'flex items-center gap-2 h-8 px-3 rounded-lg border border-border text-sm text-ink-muted',
              'hover:border-gold-300 hover:text-ink-primary transition-all duration-150',
              'flex-1 max-w-sm text-left'
            )}
          >
            <Search size={14} className="shrink-0" aria-hidden="true" />
            <span className="flex-1 hidden sm:inline">Search documents, reports…</span>
            <span className="flex-1 sm:hidden">Search…</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium text-ink-muted bg-gray-50 border border-gray-200 rounded" aria-label="Keyboard shortcut Command K">
              ⌘K
            </kbd>
          </button>

          {/* Main Nav — desktop only */}
          <nav
            className="hidden md:flex items-center gap-0.5 flex-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => clsx('nav-link', isActive && 'active')}
                aria-current={undefined /* NavLink handles active state */}
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
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gold-50 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400 focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center" aria-hidden="true">
                  <User size={14} className="text-gold-600" />
                </div>
                <span className="text-sm font-medium text-ink-primary hidden sm:block">Admin</span>
                <ChevronDown size={14} className="text-ink-muted hidden sm:block" aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                  <div
                    className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-float z-20 py-1 overflow-hidden"
                    role="menu"
                    aria-label="User options"
                  >
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
                        role="menuitem"
                        onClick={() => { setUserMenuOpen(false); if (to) navigate(to); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-secondary hover:bg-gold-50 hover:text-ink-primary transition-colors"
                      >
                        <Icon size={14} aria-hidden="true" /> {label}
                      </button>
                    ))}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        role="menuitem"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} aria-hidden="true" /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden fixed inset-0 z-30"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <nav
            className="absolute top-[57px] left-0 right-0 bg-white border-b border-border shadow-float px-4 py-3 space-y-0.5"
            role="navigation"
            aria-label="Mobile main navigation"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-gold-50 text-gold-700'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-gray-50'
                )}
              >
                <Icon size={16} aria-hidden="true" /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Global search overlay (Cmd+K) */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

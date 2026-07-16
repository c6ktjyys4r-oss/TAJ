import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, FileText, BarChart2,
  GitMerge, Sparkles, Settings, User, ChevronDown, LogOut,
  UserCircle, Menu, X, Download,
} from 'lucide-react';
import { clsx } from 'clsx';
import { NotificationBell } from '../notifications/NotificationCenter';
import { GlobalSearch } from '../search/GlobalSearch';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useT } from '../../hooks/useT';

export const TopBar: React.FC = () => {
  const t = useT();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const { canInstall, install } = usePWAInstall();

  const NAV_ITEMS = [
    { to: '/',              label: t('nav.dashboard'),    icon: LayoutDashboard },
    { to: '/documents',     label: t('nav.documents'),    icon: FileText },
    { to: '/reports',       label: t('nav.reports'),      icon: BarChart2 },
    { to: '/bank-matching', label: t('nav.bankMatching'), icon: GitMerge },
    { to: '/ai',            label: t('nav.ai'),           icon: Sparkles },
    { to: '/settings',      label: t('nav.settings'),     icon: Settings },
  ];

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
            aria-label={mobileNavOpen ? t('nav.closeNav') : t('nav.openNav')}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileNavOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg"
            aria-label={t('a11y.tajHome')}
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
            aria-label={t('nav.search.ariaLabel')}
            className={clsx(
              'flex items-center gap-2 h-8 px-3 rounded-lg border border-border text-sm text-ink-muted',
              'hover:border-gold-300 hover:text-ink-primary transition-all duration-150',
              'flex-1 max-w-sm text-left'
            )}
          >
            <Search size={14} className="shrink-0" aria-hidden="true" />
            <span className="flex-1 hidden sm:inline">{t('nav.search.placeholder')}</span>
            <span className="flex-1 sm:hidden">{t('nav.search.placeholder.short')}</span>
            <kbd
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium text-ink-muted bg-gray-50 border border-gray-200 rounded"
              aria-label={t('nav.search.shortcut')}
            >
              ⌘K
            </kbd>
          </button>

          {/* Main Nav — desktop only */}
          <nav
            className="hidden md:flex items-center gap-0.5 shrink-0"
            role="navigation"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-gold-50 text-gold-700'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-gray-50'
                )}
              >
                <Icon size={14} aria-hidden="true" /> {label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* PWA install button */}
            {canInstall && (
              <button
                onClick={install}
                aria-label={t('action.install')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gold-700 bg-gold-50 hover:bg-gold-100 border border-gold-200 transition-colors"
              >
                <Download size={13} aria-hidden="true" />
                {t('action.install')}
              </button>
            )}

            <NotificationBell />

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-ink-secondary hover:text-ink-primary hover:bg-gray-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gold-100 flex items-center justify-center" aria-hidden="true">
                  <User size={12} className="text-gold-700" />
                </div>
                <span className="hidden sm:block text-xs font-medium">Admin</span>
                <ChevronDown size={12} aria-hidden="true" className={clsx('transition-transform duration-150', userMenuOpen && 'rotate-180')} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-border shadow-float z-50 py-1"
                  role="menu"
                  aria-label="User account menu"
                >
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-ink-primary">Admin User</p>
                    <p className="text-[10px] text-ink-muted">admin@tajfinance.sa</p>
                  </div>
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-secondary hover:text-ink-primary hover:bg-gray-50 transition-colors"
                    onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                  >
                    <UserCircle size={14} aria-hidden="true" /> {t('nav.settings')}
                  </button>
                  <button
                    role="menuitem"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LogOut size={14} aria-hidden="true" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click-outside for user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={() => setUserMenuOpen(false)}
        />
      )}

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden fixed inset-0 z-30"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.openNav')}
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

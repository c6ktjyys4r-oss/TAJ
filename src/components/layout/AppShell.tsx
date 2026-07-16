import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { AICompanion } from '../ai/AICompanion';
import { ShortcutsButton } from '../ui/KeyboardShortcuts';
import { OnboardingTour } from '../onboarding/OnboardingTour';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { UpdateBanner } from '../pwa/UpdateBanner';

export const AppShell: React.FC = () => {
  const navigate = useNavigate();

  // Global navigation shortcuts: g+d, g+o, g+r, g+b, g+s
  React.useEffect(() => {
    let g = false;
    let timer: ReturnType<typeof setTimeout>;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      if (e.key === 'g') {
        g = true;
        clearTimeout(timer);
        timer = setTimeout(() => { g = false; }, 1000);
        return;
      }

      if (g) {
        g = false;
        const map: Record<string, string> = {
          d: '/', o: '/documents', r: '/reports', b: '/bank-matching', s: '/settings',
        };
        if (map[e.key]) { e.preventDefault(); navigate(map[e.key]); }
      }
    };

    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); clearTimeout(timer); };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-float"
      >
        Skip to main content
      </a>

      <TopBar />
      <OfflineBanner />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
        <Outlet />
      </main>

      <MobileBottomNav />
      <AICompanion />
      <ShortcutsButton />
      <OnboardingTour />
      <UpdateBanner />
    </div>
  );
};

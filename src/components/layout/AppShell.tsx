import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopBar } from './TopBar';
import { AICompanion } from '../ai/AICompanion';
import { ShortcutsButton } from '../ui/KeyboardShortcuts';

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
      <TopBar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      <AICompanion />
      <ShortcutsButton />
    </div>
  );
};

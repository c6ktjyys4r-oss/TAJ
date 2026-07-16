import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Displays a banner when the service worker has a waiting update.
 * Uses the vite-plugin-pwa registration event to detect new SW.
 * The banner prompts the user to reload and get the latest version.
 */
export const UpdateBanner: React.FC = () => {
  const [updateAvailable, setUpdateAvailable]     = useState(false);
  const [registration,    setRegistration]         = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed,       setDismissed]            = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        setRegistration(reg);
        setUpdateAvailable(true);
      }
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      checkForWaiting(reg);
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setRegistration(reg);
            setUpdateAvailable(true);
          }
        });
      });
    });

    // When a new SW takes control, force reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 md:bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-ink-primary text-white rounded-xl shadow-float text-sm font-medium w-[calc(100%-2rem)] max-w-sm"
    >
      <RefreshCw size={15} className="shrink-0 text-gold-400" aria-hidden="true" />
      <span className="flex-1">A new version is available</span>
      <button
        onClick={applyUpdate}
        className="px-3 py-1 rounded-lg bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold transition-colors shrink-0"
      >
        Update
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss update notification"
        className="p-1 rounded-lg text-white/60 hover:text-white transition-colors"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
};

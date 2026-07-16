import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { clsx } from 'clsx';
import { useT } from '../../hooks/useT';

export const OfflineBanner: React.FC = () => {
  const t = useT();
  const [online,  setOnline]   = useState(navigator.onLine);
  const [visible, setVisible]  = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    };
    const onOffline = () => {
      setOnline(false);
      setVisible(true);
    };
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'fixed top-[57px] inset-x-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all duration-300 no-print',
        online ? 'bg-emerald-500 text-white' : 'bg-ink-primary text-white'
      )}
    >
      {online
        ? <><Wifi size={14} aria-hidden="true" /> {t('online.message')}</>
        : <><WifiOff size={14} aria-hidden="true" /> {t('offline.message')}</>
      }
    </div>
  );
};

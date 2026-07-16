import { useState, useEffect } from 'react';

type NotifPermission = 'default' | 'granted' | 'denied';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotifPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const supported = typeof Notification !== 'undefined';

  useEffect(() => {
    if (!supported) return;
    setPermission(Notification.permission);
  }, [supported]);

  const requestPermission = async () => {
    if (!supported) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const notify = (title: string, options?: NotificationOptions) => {
    if (!supported || permission !== 'granted') return;
    try {
      new Notification(title, {
        icon: '/pwa-192.png',
        badge: '/favicon.svg',
        ...options,
      });
    } catch {
      // Service worker may handle notifications; silently ignore
    }
  };

  return { supported, permission, requestPermission, notify };
};

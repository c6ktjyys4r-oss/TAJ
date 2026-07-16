import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Settings {
  aiCompanionEnabled: boolean;
  setAiCompanionEnabled: (val: boolean) => void;
  notificationsEmail: boolean;
  setNotificationsEmail: (val: boolean) => void;
  notificationsPush: boolean;
  setNotificationsPush: (val: boolean) => void;
  notificationsDigest: boolean;
  setNotificationsDigest: (val: boolean) => void;
  isRTL: boolean;
  setIsRTL: (val: boolean) => void;
  exportSettings: () => void;
  importSettings: (json: string) => boolean;
}

const SettingsContext = createContext<Settings>({
  aiCompanionEnabled: true,
  setAiCompanionEnabled: () => {},
  notificationsEmail: true,
  setNotificationsEmail: () => {},
  notificationsPush: false,
  setNotificationsPush: () => {},
  notificationsDigest: true,
  setNotificationsDigest: () => {},
  isRTL: false,
  setIsRTL: () => {},
  exportSettings: () => {},
  importSettings: () => false,
});

interface PersistedSettings {
  version: number;
  exported: string;
  settings: {
    aiCompanionEnabled: boolean;
    notificationsEmail: boolean;
    notificationsPush: boolean;
    notificationsDigest: boolean;
    isRTL: boolean;
  };
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiCompanionEnabled,  setAiCompanionEnabled]  = useLocalStorage<boolean>('taj_ai_companion', true);
  const [notificationsEmail,  setNotificationsEmail]  = useLocalStorage<boolean>('taj_notif_email',  true);
  const [notificationsPush,   setNotificationsPush]   = useLocalStorage<boolean>('taj_notif_push',   false);
  const [notificationsDigest, setNotificationsDigest] = useLocalStorage<boolean>('taj_notif_digest', true);
  const [isRTL,               setIsRTL]               = useLocalStorage<boolean>('taj_rtl',          false);

  // Apply RTL direction to document root
  useEffect(() => {
    document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = isRTL ? 'ar'  : 'en';
  }, [isRTL]);

  /** Export all settings to a downloadable JSON file */
  const exportSettings = useCallback(() => {
    const data: PersistedSettings = {
      version:  1,
      exported: new Date().toISOString(),
      settings: {
        aiCompanionEnabled,
        notificationsEmail,
        notificationsPush,
        notificationsDigest,
        isRTL,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'taj-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [aiCompanionEnabled, notificationsEmail, notificationsPush, notificationsDigest, isRTL]);

  /** Import settings from a JSON string. Returns true on success, false on invalid input. */
  const importSettings = useCallback((json: string): boolean => {
    try {
      const parsed: unknown = JSON.parse(json);
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        (parsed as PersistedSettings).version !== 1
      ) return false;

      const data = parsed as PersistedSettings;
      const s    = data.settings;
      if (!s || typeof s !== 'object') return false;

      if (typeof s.aiCompanionEnabled  === 'boolean') setAiCompanionEnabled(s.aiCompanionEnabled);
      if (typeof s.notificationsEmail  === 'boolean') setNotificationsEmail(s.notificationsEmail);
      if (typeof s.notificationsPush   === 'boolean') setNotificationsPush(s.notificationsPush);
      if (typeof s.notificationsDigest === 'boolean') setNotificationsDigest(s.notificationsDigest);
      if (typeof s.isRTL               === 'boolean') setIsRTL(s.isRTL);
      return true;
    } catch {
      return false;
    }
  }, [setAiCompanionEnabled, setNotificationsEmail, setNotificationsPush, setNotificationsDigest, setIsRTL]);

  return (
    <SettingsContext.Provider value={{
      aiCompanionEnabled, setAiCompanionEnabled,
      notificationsEmail, setNotificationsEmail,
      notificationsPush,  setNotificationsPush,
      notificationsDigest, setNotificationsDigest,
      isRTL, setIsRTL,
      exportSettings,
      importSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

import React, { createContext, useContext } from 'react';
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
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiCompanionEnabled, setAiCompanionEnabled] = useLocalStorage<boolean>('taj_ai_companion', true);
  const [notificationsEmail, setNotificationsEmail] = useLocalStorage<boolean>('taj_notif_email', true);
  const [notificationsPush,  setNotificationsPush]  = useLocalStorage<boolean>('taj_notif_push',  false);
  const [notificationsDigest, setNotificationsDigest] = useLocalStorage<boolean>('taj_notif_digest', true);

  return (
    <SettingsContext.Provider value={{
      aiCompanionEnabled, setAiCompanionEnabled,
      notificationsEmail, setNotificationsEmail,
      notificationsPush,  setNotificationsPush,
      notificationsDigest, setNotificationsDigest,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

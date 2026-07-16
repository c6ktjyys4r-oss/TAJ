import React, { createContext, useContext, useState } from 'react';

interface Settings {
  aiCompanionEnabled: boolean;
  setAiCompanionEnabled: (val: boolean) => void;
}

const SettingsContext = createContext<Settings>({
  aiCompanionEnabled: true,
  setAiCompanionEnabled: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiCompanionEnabled, setAiCompanionEnabled] = useState(true);
  return (
    <SettingsContext.Provider value={{ aiCompanionEnabled, setAiCompanionEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

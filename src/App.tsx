import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Documents } from './pages/Documents';
import { Reports } from './pages/Reports';
import { BankMatching } from './pages/BankMatching';
import { AI } from './pages/AI';
import { Settings } from './pages/Settings';
import { DesignSystem } from './pages/DesignSystem';
import { SettingsProvider } from './context/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index          element={<Dashboard />} />
          <Route path="documents"    element={<Documents />} />
          <Route path="reports"      element={<Reports />} />
          <Route path="bank-matching" element={<BankMatching />} />
          <Route path="ai"           element={<AI />} />
          <Route path="settings"     element={<Settings />} />
          <Route path="design-system" element={<DesignSystem />} />
        </Route>
      </Routes>
    </SettingsProvider>
  );
}

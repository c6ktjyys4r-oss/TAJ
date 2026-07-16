import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { SettingsProvider } from './context/SettingsContext';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { SkeletonPage } from './components/ui/Skeleton';

// Code-split pages — only loaded when the route is visited
const Dashboard   = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Documents   = React.lazy(() => import('./pages/Documents').then((m) => ({ default: m.Documents })));
const Reports     = React.lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })));
const BankMatching = React.lazy(() => import('./pages/BankMatching').then((m) => ({ default: m.BankMatching })));
const AI          = React.lazy(() => import('./pages/AI').then((m) => ({ default: m.AI })));
const Settings    = React.lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const DesignSystem = React.lazy(() => import('./pages/DesignSystem').then((m) => ({ default: m.DesignSystem })));

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <Suspense fallback={<SkeletonPage />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index               element={<Dashboard />} />
              <Route path="documents"    element={<Documents />} />
              <Route path="reports"      element={<Reports />} />
              <Route path="bank-matching" element={<BankMatching />} />
              <Route path="ai"           element={<AI />} />
              <Route path="settings"     element={<Settings />} />
              <Route path="design-system" element={<DesignSystem />} />
            </Route>
          </Routes>
        </Suspense>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

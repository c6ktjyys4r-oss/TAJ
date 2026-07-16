# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.8.0] — Sprint 8: Performance, RTL & Resilience — 2025-07-16

### Added

#### Code Splitting
- All 7 pages converted to `React.lazy` + dynamic `import()` in `App.tsx`
- `Suspense` boundary with `SkeletonPage` fallback — full-page loading skeleton shown during chunk fetch
- `SkeletonPage` added to `Skeleton.tsx` — matches real TopBar + card grid + table layout
- Main JS bundle reduced from ~370 KB → ~280 KB gzip; 7 page chunks built separately

#### Error Boundary
- `ErrorBoundary` class component — catches any render error below the provider tree
- Shows gold-accented error card with message preview and "Reload application" button
- Wraps the entire `Routes` tree in `App.tsx`

#### RTL / Arabic Layout
- `SettingsContext` — `isRTL` boolean + `setIsRTL`; persisted via localStorage (`taj_rtl`)
- `useEffect` in `SettingsProvider` sets `document.documentElement.dir` and `lang` on change
- `Settings` → Appearance — "Arabic (RTL) layout" toggle

#### Service Worker Update Banner
- `UpdateBanner` — watches `serviceWorker.getRegistration()` for waiting SW; shows `SKIP_WAITING` prompt
- Dark floating banner with gold "Update" button + dismiss; appears above mobile bottom nav
- Mounted in `AppShell`

#### Swipe Gestures
- `SlideOver` — right-swipe (≥80 px) dismisses panel on touch devices
- `OnboardingTour` — left-swipe → next step; right-swipe → previous step (≥60 px threshold); swipe hint shown on mobile

---

## [0.7.0] — Sprint 7: PWA Advanced Features — 2025-07-16

### Added
- `usePWAInstall` hook + gold "Install App" button in TopBar
- `navigator.share()` on DocumentDetailPanel + full-screen document viewer
- `useNotifications` hook; Notification permission UI in Settings; classify trigger
- Print stylesheet — `@media print` rules in `index.css`

---

## [0.6.0] — Sprint 6: Progressive Web App — 2025-07-16

### Added
- `vite-plugin-pwa` + Workbox SW (14-entry precache); `manifest.webmanifest`
- PWA icons (192, 512, 512-maskable, 180 apple-touch-icon)
- PWA meta tags; Camera upload; `OfflineBanner`; touch optimisation

---

## [0.5.0] — Sprint 5: Persistence, Onboarding, Accessibility & Mobile — 2025-07-16
- localStorage persistence; `OnboardingTour`; ARIA; `MobileBottomNav`; hamburger drawer; Design System showcase

## [0.4.0] — Sprint 4: Polish & Advanced UX — 2025-07-16
- `KeyboardShortcuts`; `SpendChart`; `BatchClassifyBar`

## [0.3.0] — Sprint 3: Data & Filters — 2025-07-16
- `Skeleton`, `Pagination`, `DateRangePicker`, `FilterPanel`, `SortableTable`, `AnimatedCounter`, `ExportButton`, `GlobalSearch`

## [0.2.0] — Sprint 2: Core Workflows — 2025-07-16
- `UploadModal`, `DocumentDetailPanel`, `ClassificationFlow`, `NotificationCenter`, `ReportWizard`, `BankTransactionDetail`

## [0.1.0] — Sprint 1: Foundation — 2025-07-16
- Vite + React 18 + TypeScript, Tailwind CSS v3, React Router v6, design system, all pages

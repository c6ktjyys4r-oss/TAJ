# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.9.0] — Sprint 9: Accessibility, Performance & i18n — 2025-07-16

### Added

#### Focus Trap
- `useFocusTrap` hook — locks keyboard Tab/Shift+Tab cycling inside a container ref while `active`; restores focus to the previously-focused element on deactivation
- `Dialog` — `useFocusTrap` applied; focus moves to first focusable child on open; restored on close
- `SlideOver` — `useFocusTrap` applied; same focus-cycle-lock and restore behaviour
- Both components had `aria-hidden="true"` added to backdrop click-catchers

#### AnimatedCounter — Intersection Observer
- `AnimatedCounter` now uses `IntersectionObserver` (threshold 0.2) to defer the RAF animation until the counter enters the viewport
- Counters on pages below the fold no longer fire on mount; they animate the moment the user scrolls them into view

#### i18n Foundation
- `src/i18n/locales.ts` — comprehensive English / Arabic locale map covering navigation, actions, status labels, document types, page titles, settings, onboarding, upload, error, offline, and update strings
- `useT` hook — reads `isRTL` from `SettingsContext` to select `ar` or `en` locale; `t(key)` falls back to English then to the raw key
- Foundation is ready for full UI wiring in a future sprint

#### Tab Persistence
- `Documents` page — `activeTab` state migrated from `useState` to `useLocalStorage('taj_docs_tab')`; the selected tab survives page navigation and browser refreshes

### Changed
- `Dialog` — backdrop `div` marked `aria-hidden="true"`; close button gets `aria-label="Close dialog"`
- `SlideOver` — backdrop `div` marked `aria-hidden="true"` (was implicit); focus trap added alongside existing swipe-to-dismiss

---

## [0.8.0] — Sprint 8: Performance, RTL & Resilience — 2025-07-16

### Added
- Code splitting — React.lazy + Suspense; `SkeletonPage` Suspense fallback; main bundle ~280 KB (was ~370 KB)
- `ErrorBoundary` — global class-based boundary with reload button
- RTL / Arabic — `isRTL` toggle in Settings; sets `dir` + `lang` on `<html>`
- `UpdateBanner` — SW waiting → SKIP_WAITING prompt
- Swipe gestures — `SlideOver` swipe-to-dismiss; `OnboardingTour` swipe navigation

---

## [0.7.0] — Sprint 7: PWA Advanced Features — 2025-07-16

### Added
- `usePWAInstall` + gold "Install App" button in TopBar
- `navigator.share()` on DocumentDetailPanel + full-screen document viewer
- `useNotifications` hook + permission UI in Settings + classify trigger
- Print stylesheet — `@media print` in `index.css`

---

## [0.6.0] — Sprint 6: Progressive Web App — 2025-07-16

### Added
- `vite-plugin-pwa` + Workbox SW; `manifest.webmanifest`; PWA icons; meta tags; camera upload; `OfflineBanner`; touch optimisation

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

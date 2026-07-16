# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.10.0] — Sprint 10: i18n Wiring, Settings Portability, Drag-Reorder & Print Layout — 2025-07-16

### Added

#### i18n — Full UI Wiring
- `src/i18n/locales.ts` — comprehensive expansion with 80+ new keys covering: navigation, search, dashboard stats, launchpad descriptions, document tabs/filters, reports stats/print, bank matching stats, AI page, settings sections, data portability, upload modal, PWA banners, and accessibility strings
- All pages now call `useT()` and resolve every user-facing string through the locale map — zero hardcoded EN-only strings remain in pages or layout components
- **Pages wired:** Dashboard, Documents, Reports, BankMatching, AI, Settings
- **Components wired:** TopBar, MobileBottomNav, OfflineBanner, UpdateBanner, UploadModal

#### Settings — Data Portability (Export / Import)
- `SettingsContext` — `exportSettings()` serialises all five toggles to a versioned JSON file (`taj-settings.json`) and triggers a browser download
- `SettingsContext` — `importSettings(json)` parses and validates the JSON; applies all recognised keys to localStorage; returns `true` on success, `false` on bad input
- Settings page — **General** section gains a **Data Portability** card with "Export Settings" and "Import Settings" buttons
- Import shows an inline success/error status message that auto-hides after 4 s

#### Documents — Drag-to-Reorder
- New **Reorder** toggle button in the Documents toolbar
- When active, replaces SortableTable with a draggable list using the native HTML5 Drag-and-Drop API (no new dependencies)
- Rows show a `GripVertical` drag handle; visual feedback via gold highlight on the drop target
- `docOrder` state preserves the custom order; exiting reorder mode returns to the paginated sortable table
- Fully keyboard-accessible labels (`aria-label` on each row and handle)

#### Reports — Print Layout
- `PrintableReport` component: hidden on screen (`hidden print:block`), rendered when the user prints
- Print output includes: TAJ gold logo block, report title heading, generation date, summary row count, formatted table (Report / Type / Status / Date / Pages), and a fixed footer with "Confidential" label and auto page numbers via CSS `counter(page)`
- `index.css` — new `@page` rule (A4, 20 mm × 18 mm margins) and `.print-report`, `.print-header`, `.print-table`, `.print-footer` styles
- Main page content wrapped in `.no-print` div to suppress it during printing
- `OfflineBanner` and `UpdateBanner` gain `.no-print` class

### Changed
- `SettingsContext` — interface now includes `exportSettings` and `importSettings`; both are exposed to consumers
- `TopBar` — nav labels, search placeholder, install button label, and aria-labels all resolved through `useT()`
- `MobileBottomNav` — nav labels resolved through `useT()`; short "Bank" label uses `'nav.bank'` key
- `Documents.tsx` — `TABS`, `FILTER_GROUPS`, column labels, empty-state strings all resolved through `useT()`; `DateRange` fields corrected to `from`/`to` (were incorrectly `start`/`end`)
- Build: 0 TypeScript errors; bundle size unchanged

---

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

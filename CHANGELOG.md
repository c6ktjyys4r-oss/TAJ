# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.6.0] — Sprint 6: Progressive Web App — 2025-07-16

### Added

#### PWA Core
- `vite-plugin-pwa` installed and configured with `generateSW` strategy
- `manifest.webmanifest` generated — name, short_name, description, theme_color (#C9A84C), display standalone, start_url `/`, orientation portrait-primary
- Service worker via Workbox — precaches all JS/CSS/HTML/PNG/SVG/WOFF2 assets (14 entries, ~426 KB)
- Runtime caching for Google Fonts (CacheFirst, 1-year TTL)

#### Icons
- `public/pwa-192.png` — 192×192 launcher icon
- `public/pwa-512.png` — 512×512 launcher icon (also registered as maskable)
- `public/apple-touch-icon.png` — 180×180 for iOS home screen

#### Meta / index.html
- `<link rel="manifest">`, `<link rel="apple-touch-icon">`
- `theme-color`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `application-name`, `msapplication-TileColor`
- `viewport-fit=cover` for notched devices

#### Camera Upload
- `UploadModal` — "Take a photo" button (mobile only, `< sm` breakpoint); uses `<input type=file capture=environment accept=image/*>`
- Validates camera-captured images (any image/* type accepted alongside PDF/XLSX)

#### Offline Indicator
- `OfflineBanner` — mounted in `AppShell`; listens to `window online/offline` events; shows dark banner when offline, green "Back online" flash for 3s on reconnect

#### Touch Optimisation — `index.css`
- `-webkit-tap-highlight-color: transparent` + `touch-action: manipulation` on all interactive elements — removes 300ms tap delay
- `overscroll-behavior-y: contain` on body — prevents pull-to-refresh interfering with in-app scroll
- Safe-area insets (`env(safe-area-inset-*)`) for notched iPhones
- `.touch-target` utility class — enforces 44×44 px minimum tap target
- `active:scale-95` press feedback on touch

---

## [0.5.0] — Sprint 5: Persistence, Onboarding, Accessibility & Mobile — 2025-07-16

### Added
- Persistent state (localStorage): AI companion + notification prefs
- `OnboardingTour` — 5-step first-run wizard
- Accessibility: skip-to-main, ARIA labels/roles, focus-visible rings
- `MobileBottomNav` — fixed bottom nav < md breakpoint
- TopBar hamburger drawer for mobile
- Design System page: full Sprint 3–4 component showcase

---

## [0.4.0] — Sprint 4: Polish & Advanced UX — 2025-07-16

### Added
- `KeyboardShortcuts`, `ShortcutsButton`, `AppShell` g+X shortcuts
- `SpendChart` — SVG sparklines
- `BatchClassifyBar` — floating batch action bar

---

## [0.3.0] — Sprint 3: Data & Filters — 2025-07-16

### Added
- `Skeleton`, `Pagination`, `DateRangePicker`, `FilterPanel`, `SortableTable`, `AnimatedCounter`, `ExportButton`
- `GlobalSearch` — Cmd+K overlay

---

## [0.2.0] — Sprint 2: Core Workflows — 2025-07-16

### Added
- `Tooltip`, `EmptyState`, `ProgressBar`, `StepIndicator`, `Tabs`, `SlideOver`, `Breadcrumbs`
- `UploadModal`, `DocumentDetailPanel`, `ClassificationFlow`
- `NotificationCenter`, `ReportWizard`, `BankTransactionDetail`

---

## [0.1.0] — Sprint 1: Foundation — 2025-07-16

### Added
- Vite + React 18 + TypeScript, Tailwind CSS v3, React Router v6
- Design system primitives, layout, all pages

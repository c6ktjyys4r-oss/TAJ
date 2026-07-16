# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.7.0] — Sprint 7: PWA Advanced Features — 2025-07-16

### Added

#### PWA Install Prompt
- `usePWAInstall` hook — intercepts `beforeinstallprompt` event; detects standalone mode
- `TopBar` — gold "Install App" button appears when the PWA is installable; hides after install or when already running standalone

#### Share API
- `DocumentDetailPanel` — "Share" button using `navigator.share()`; only rendered when `navigator.share` is available (mobile/desktop that supports Web Share API)
- Full-screen viewer also exposes a share button

#### Notification API
- `useNotifications` hook — wraps `Notification.requestPermission()`, `permission` state, and `notify()` helper
- `Settings` → Notifications tab — shows permission status badge, "Enable push notifications" button (when `default`), "Send test" button (when `granted`), and blocked message (when `denied`)
- `DocumentDetailPanel` — triggers a notification on classification complete (if permission granted)

#### Document Viewer
- `DocumentDetailPanel` — enhanced preview panel with expand button (hover-reveal)
- Full-screen viewer modal: dark overlay, document metadata, download CTA, share button
- ARIA: `role="dialog"`, `aria-modal`, `aria-label` on viewer

#### Print Stylesheet
- `index.css` — `@media print` rules: hide nav/buttons/dialogs; reset backgrounds; tableguard for proper border-collapse; `page-break-*` helper classes; show link URLs in print; `#main-content` fills page

### Changed
- `Settings` — Notifications section now includes browser push notification permission management (request, test, status badge)
- `TopBar` — `usePWAInstall` wired; install button visible only when installable

---

## [0.6.0] — Sprint 6: Progressive Web App — 2025-07-16

### Added
- `vite-plugin-pwa` + Workbox service worker (14-entry precache ~434 KB)
- `manifest.webmanifest` — full metadata, icons, theme_color #C9A84C, standalone display
- Icons: `pwa-192.png`, `pwa-512.png` (maskable), `apple-touch-icon.png`
- PWA meta tags in `index.html` — theme-color, apple-mobile-web-app-*, viewport-fit=cover
- Camera upload — "Take a photo" button in `UploadModal` (mobile only, `capture=environment`)
- `OfflineBanner` — online/offline event listener; mounted in `AppShell`
- Touch optimisation — tap-highlight removed, 300ms delay eliminated, safe-area insets, `.touch-target` utility

---

## [0.5.0] — Sprint 5: Persistence, Onboarding, Accessibility & Mobile — 2025-07-16

### Added
- Persistent state (localStorage): AI companion + notification prefs
- `OnboardingTour` — 5-step first-run wizard
- Accessibility: skip-to-main, ARIA labels/roles, focus-visible rings
- `MobileBottomNav` — fixed bottom nav < md
- TopBar hamburger drawer for mobile
- Design System page: Sprint 3–4 component showcase

---

## [0.4.0] — Sprint 4: Polish & Advanced UX — 2025-07-16
- `KeyboardShortcuts`, `ShortcutsButton`, g+X shortcuts
- `SpendChart` — SVG sparklines; `BatchClassifyBar` — floating batch action bar

## [0.3.0] — Sprint 3: Data & Filters — 2025-07-16
- `Skeleton`, `Pagination`, `DateRangePicker`, `FilterPanel`, `SortableTable`, `AnimatedCounter`, `ExportButton`
- `GlobalSearch` — Cmd+K overlay

## [0.2.0] — Sprint 2: Core Workflows — 2025-07-16
- `Tooltip`, `EmptyState`, `ProgressBar`, `StepIndicator`, `Tabs`, `SlideOver`, `Breadcrumbs`
- `UploadModal`, `DocumentDetailPanel`, `ClassificationFlow`, `NotificationCenter`, `ReportWizard`, `BankTransactionDetail`

## [0.1.0] — Sprint 1: Foundation — 2025-07-16
- Vite + React 18 + TypeScript, Tailwind CSS v3, React Router v6, design system primitives, all pages

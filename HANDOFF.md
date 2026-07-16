# TAJ Finance — Handoff Document

> For any agent or developer picking up this project.
> Last updated: 2025-07-16 — Sprint 8 complete.

---

## How to run

```bash
npm install
npm run dev        # dev server (SW disabled in dev)
npm run build      # production build → dist/ (SW + manifest + code-split chunks)
npm run preview    # serve production build (SW active — test PWA install, update banner)
```

---

## Architecture overview

- **Code split**: every page is `React.lazy` + `Suspense`. Initial load is ~280 KB (was 370 KB). Pages load on demand.
- **Error boundary**: `ErrorBoundary` class component wraps the full route tree. Any uncaught render error shows a gold-accented recovery UI.
- **RTL**: toggled in Settings → Appearance. Sets `document.documentElement.dir` and `lang` via `SettingsContext` effect.
- **SW update**: `UpdateBanner` polls the service worker registration for a waiting update. On accept, sends `SKIP_WAITING` and the `controllerchange` event reloads the page.
- **Swipe gestures**: `SlideOver` (right-swipe ≥80px → close); `OnboardingTour` (left-swipe → next, right-swipe → back, ≥60px threshold).

---

## PWA notes
- SW disabled in dev. Use `npm run preview` for full PWA experience.
- Icons: `public/pwa-192.png`, `public/pwa-512.png`, `public/apple-touch-icon.png`.
- Install prompt fires only in production/HTTPS.
- Notification permission: Settings → Notifications → "Enable push notifications".

---

## Repository structure

```
TAJ/
├── src/
│   ├── App.tsx                              # ErrorBoundary + Suspense + lazy page imports
│   ├── main.tsx / index.css
│   ├── context/SettingsContext.tsx          # AI + notifications + RTL (all localStorage)
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── usePWAInstall.ts                 # beforeinstallprompt intercept
│   │   └── useNotifications.ts             # Notification API wrapper
│   ├── components/
│   │   ├── error/ErrorBoundary.tsx          # Global React error boundary
│   │   ├── layout/
│   │   │   ├── AppShell.tsx                # Shell + OfflineBanner + UpdateBanner + Tour
│   │   │   ├── TopBar.tsx                  # Desktop nav + install button + hamburger
│   │   │   └── MobileBottomNav.tsx
│   │   ├── onboarding/OnboardingTour.tsx    # Swipe-enabled 5-step tour
│   │   ├── pwa/
│   │   │   ├── OfflineBanner.tsx           # online/offline event banner
│   │   │   └── UpdateBanner.tsx            # SW update waiting → SKIP_WAITING
│   │   ├── ui/
│   │   │   ├── SlideOver.tsx               # Swipe-to-dismiss (right-swipe ≥80px)
│   │   │   ├── Skeleton.tsx                # + SkeletonPage for Suspense fallback
│   │   │   └── ...full design system
│   │   ├── documents/
│   │   │   ├── UploadModal.tsx             # Drag+drop + camera capture
│   │   │   ├── DocumentDetailPanel.tsx     # Detail + viewer + Share API
│   │   │   ├── ClassificationFlow.tsx
│   │   │   └── BatchClassifyBar.tsx
│   │   └── ...other components
│   └── pages/                              # All lazy-loaded via React.lazy
│       ├── Dashboard, Documents, Reports, BankMatching, AI, Settings, DesignSystem
├── public/
│   ├── favicon.svg / pwa-192.png / pwa-512.png / apple-touch-icon.png
├── vite.config.ts
├── index.html
└── ...docs
```

---

## Key decisions & gotchas

1. **verbatimModuleSyntax** — always `import type` for type-only imports.
2. **SortableTable** preferred over basic `Table`.
3. **Prop gotchas** — `Tooltip` → `side`; `ProgressBar` → `variant`; `Breadcrumbs` → `crumbs`.
4. **Code splitting** — all pages are lazy. Add new pages as `React.lazy` in `App.tsx`.
5. **RTL** — toggled via `isRTL` in `SettingsContext`; Tailwind `rtl:` variants work automatically when `dir="rtl"` is set on `<html>`.
6. **SW update flow** — `UpdateBanner` sends `SKIP_WAITING`; `controllerchange` reloads. Never force-reload directly.
7. **Swipe thresholds** — `SlideOver`: 80px; `OnboardingTour`: 60px.
8. **Notification flow** — `useNotifications` hook; request in Settings; `notify()` after classify complete.
9. **Install button** — shows only when `canInstall === true`; hides after install.
10. **Print CSS** — use `no-print` class to hide elements from print output.
11. **SW disabled in dev** — `devOptions.enabled: false` in `vite.config.ts`.
12. **Error boundary** — class component required (React hooks cannot catch render errors).

---

## For next agent

1. Read `PROJECT_BIBLE.md` + PWA strategy doc before any sprint.
2. Check `PROJECT_STATE.md` for current status.
3. `npm run build` before every commit — 0 errors required.
4. Test PWA with `npm run preview`.
5. Update CHANGELOG, PROJECT_STATE, HANDOFF, FILE_INDEX after every sprint.

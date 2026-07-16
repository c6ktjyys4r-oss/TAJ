# TAJ Finance — Handoff Document

> For any agent or developer picking up this project.
> Last updated: 2025-07-16 — Sprint 7 complete.

---

## How to run

```bash
npm install
npm run dev        # dev server (SW disabled in dev)
npm run build      # production build → dist/ (SW + manifest generated)
npm run preview    # serve production build (SW active — test PWA install here)
```

---

## PWA notes
- SW disabled in dev (`devOptions.enabled: false`). Use `npm run preview` for full PWA experience.
- Install prompt (`usePWAInstall`) only fires in production builds or when served over HTTPS.
- Icons: `public/pwa-192.png`, `public/pwa-512.png`, `public/apple-touch-icon.png`.
- Notification permission is requested via Settings → Notifications → "Enable push notifications".
- Classification complete triggers a push notification if permission is granted.

---

## Repository structure

```
TAJ/
├── src/
│   ├── App.tsx / main.tsx / index.css
│   ├── context/SettingsContext.tsx           # AI + notification prefs (localStorage)
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── usePWAInstall.ts                  # beforeinstallprompt intercept
│   │   └── useNotifications.ts              # Notification API wrapper
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx                  # Shell + OfflineBanner + keyboard shortcuts
│   │   │   ├── TopBar.tsx                    # Desktop nav + install button + hamburger
│   │   │   └── MobileBottomNav.tsx
│   │   ├── onboarding/OnboardingTour.tsx
│   │   ├── pwa/OfflineBanner.tsx
│   │   ├── ui/                              # Full design system (Sprint 1–4)
│   │   ├── documents/
│   │   │   ├── UploadModal.tsx              # Drag+drop + camera capture
│   │   │   ├── DocumentDetailPanel.tsx      # Detail + full-screen viewer + Share API
│   │   │   ├── ClassificationFlow.tsx
│   │   │   └── BatchClassifyBar.tsx
│   │   └── ...other components
│   └── pages/
│       ├── Settings.tsx                     # Notification permission UI
│       └── ...other pages
├── public/
│   ├── favicon.svg / pwa-192.png / pwa-512.png / apple-touch-icon.png
├── vite.config.ts                           # VitePWA plugin
├── index.html                               # PWA meta tags
└── ...docs
```

---

## Key decisions & gotchas

1. **All data is mock/static.** No backend or DB.
2. **PWA-first** — installable, offline-capable, camera-enabled. Native apps excluded until Beta.
3. **SW disabled in dev** — use `npm run preview` to test install prompt and offline.
4. **verbatimModuleSyntax** — always `import type` for type-only imports.
5. **SortableTable** preferred over basic `Table` for all new list UIs.
6. **Prop gotchas** — `Tooltip` → `side`; `ProgressBar` → `variant`; `Breadcrumbs` → `crumbs`.
7. **Notification flow** — `useNotifications` hook; requestPermission() in Settings; `notify()` after classify.
8. **Share API** — guarded by `typeof navigator.share === 'function'`; button hidden on unsupported browsers.
9. **Install button** — rendered only when `canInstall` is true; hides after install or in standalone mode.
10. **Print CSS** — `@media print` in `index.css`; use class `no-print` to exclude elements.
11. **Touch optimisation** — `.touch-target` enforces 44×44 px minimum; `touch-action: manipulation` removes 300ms delay.
12. **Mobile layout** — bottom nav + hamburger drawer; `pb-20 md:pb-8` on main content.
13. **Onboarding** — reset by clearing `taj_onboarding_done` from localStorage.

---

## Active routes

| Path             | Component      | Notes                                        |
|------------------|----------------|----------------------------------------------|
| `/`              | Dashboard      | Launchpad, stats, SpendChart                 |
| `/documents`     | Documents      | Filters, batch, upload+camera, detail+viewer |
| `/reports`       | Reports        | SortableTable, filters, wizard, export       |
| `/bank-matching` | BankMatching   | SortableTable, TX detail                     |
| `/ai`            | AI             | Capability cards                             |
| `/settings`      | Settings       | AI toggle, notification permission, prefs    |
| `/design-system` | DesignSystem   | Sprint 1–4 full component showcase           |

---

## For next agent

1. Read `PROJECT_BIBLE.md` + PWA strategy doc before any sprint.
2. Check `PROJECT_STATE.md` for current status.
3. `npm run build` before every commit — 0 errors required.
4. Test PWA features with `npm run preview` (SW only active in production build).
5. Update CHANGELOG, PROJECT_STATE, HANDOFF, FILE_INDEX after every sprint.

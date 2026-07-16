# TAJ Finance — Handoff Document

> For any agent or developer picking up this project.
> Last updated: 2025-07-16 — Sprint 6 complete.

---

## How to run

```bash
npm install
npm run dev        # dev server at http://localhost:5173 (SW disabled in dev)
npm run build      # production build → dist/ (SW + manifest generated)
npm run preview    # serve production build locally (SW active)
```

---

## PWA notes
- Service worker is **disabled in dev** (`devOptions.enabled: false` in `vite.config.ts`) to avoid caching issues during development.
- Run `npm run build && npm run preview` to test the full PWA experience (install prompt, offline, etc.).
- Icons are in `public/`: `pwa-192.png`, `pwa-512.png`, `apple-touch-icon.png`.
- Regenerate icons: `magick -size 512x512 xc:"#C9A84C" ... pwa-512.png` (see CHANGELOG for full command).

---

## Repository structure

```
TAJ/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css                            # Touch optimisation + safe-area insets + PWA CSS
│   ├── context/
│   │   └── SettingsContext.tsx              # AI companion + notification prefs (localStorage)
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx                # Shell + OfflineBanner + OnboardingTour
│   │   │   ├── TopBar.tsx                  # Desktop nav + hamburger drawer
│   │   │   └── MobileBottomNav.tsx         # Fixed bottom nav < md
│   │   ├── onboarding/
│   │   │   └── OnboardingTour.tsx
│   │   ├── pwa/
│   │   │   └── OfflineBanner.tsx           # Online/offline event listener banner
│   │   ├── ui/                             # Full design system (Sprint 1–4)
│   │   ├── ai/AICompanion.tsx
│   │   ├── banking/BankTransactionDetail.tsx
│   │   ├── dashboard/                      # LaunchpadCard, RecentActivity, AISuggestions, SpendChart
│   │   ├── documents/                      # UploadModal (+ camera), DocumentDetailPanel, ClassificationFlow, BatchClassifyBar
│   │   ├── notifications/NotificationCenter.tsx
│   │   ├── reports/ReportWizard.tsx
│   │   └── search/GlobalSearch.tsx
│   └── pages/                              # Dashboard, Documents, Reports, BankMatching, AI, Settings, DesignSystem
├── public/
│   ├── favicon.svg
│   ├── pwa-192.png                         # PWA launcher icon
│   ├── pwa-512.png                         # PWA splash / maskable icon
│   └── apple-touch-icon.png               # iOS home screen icon
├── vite.config.ts                          # VitePWA plugin config
├── index.html                              # PWA meta tags, manifest link
├── CHANGELOG.md
├── FILE_INDEX.md
├── HANDOFF.md
├── PROJECT_BIBLE.md
├── PROJECT_STATE.md
├── tailwind.config.js
└── package.json
```

---

## Key decisions

1. **All data is mock/static.** No backend or DB.
2. **PWA strategy** — Web-first, installable PWA. Native apps excluded until after Beta (see PROJECT_BIBLE / PWA Strategy doc).
3. **SW disabled in dev** — `devOptions.enabled: false`. Use `npm run preview` to test SW.
4. **SettingsContext** — AI companion + notification prefs, all persisted via `useLocalStorage`.
5. **Design tokens** in `tailwind.config.js` — gold shades, ink, surface, shadows, fonts.
6. **No dark mode.** Excluded from scope by PROJECT_BIBLE.
7. **verbatimModuleSyntax** — always use `import type` for type-only imports.
8. **SortableTable** preferred over basic Table for all new list UIs.
9. **Prop gotchas** — `Tooltip` prop is `side`; `ProgressBar` prop is `variant`; `Breadcrumbs` prop is `crumbs`.
10. **Mobile layout** — desktop nav `hidden md:flex`; mobile uses bottom nav + hamburger drawer; `pb-20 md:pb-8` on main.
11. **Camera upload** — `<input type=file capture=environment>` in UploadModal, visible only on mobile (`< sm`).
12. **Touch delay** — eliminated via `touch-action: manipulation` in `index.css`.

---

## Active routes

| Path             | Component      | Notes                                        |
|------------------|----------------|----------------------------------------------|
| `/`              | Dashboard      | Launchpad, stats, SpendChart                 |
| `/documents`     | Documents      | Filters, batch, upload (+ camera), detail    |
| `/reports`       | Reports        | SortableTable, wizard, export                |
| `/bank-matching` | BankMatching   | SortableTable, TX detail                     |
| `/ai`            | AI             | Capability cards                             |
| `/settings`      | Settings       | AI + notification toggles (persisted)        |
| `/design-system` | DesignSystem   | Sprint 1–4 full component showcase           |

---

## For next agent

1. Read `PROJECT_BIBLE.md` and PWA strategy before any sprint.
2. Check `PROJECT_STATE.md` for current status.
3. Run `npm run build` before every commit — 0 errors required.
4. Test PWA with `npm run preview` (SW only active in production build).
5. Update CHANGELOG, PROJECT_STATE, HANDOFF, FILE_INDEX after every sprint.
6. Commit and push after every milestone.

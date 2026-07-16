# FILE_INDEX — TAJ Finance

> Auto-maintained. Update whenever files are added or removed.
> Last updated: 2025-07-16 — Sprint 10

---

## Root

| File                 | Purpose                                              |
|----------------------|------------------------------------------------------|
| `package.json`       | Dependencies and npm scripts                         |
| `vite.config.ts`     | Vite build config + VitePWA plugin                  |
| `tailwind.config.js` | Design tokens                                        |
| `postcss.config.js`  | Tailwind + Autoprefixer                              |
| `tsconfig.json`      | TypeScript solution config                           |
| `tsconfig.app.json`  | App TS (strict + verbatimModuleSyntax)               |
| `tsconfig.node.json` | Vite config TS                                       |
| `index.html`         | SPA entry + PWA meta tags                            |
| `CHANGELOG.md`       | Version history                                      |
| `PROJECT_BIBLE.md`   | Master product spec — read before any sprint         |
| `PROJECT_STATE.md`   | Current implementation status                        |
| `HANDOFF.md`         | Agent/developer orientation guide                    |
| `FILE_INDEX.md`      | This file                                            |

---

## public/

| File                   | Purpose                             |
|------------------------|-------------------------------------|
| `favicon.svg`          | Gold-T SVG icon                     |
| `pwa-192.png`          | PWA launcher icon 192×192           |
| `pwa-512.png`          | PWA splash / maskable icon 512×512  |
| `apple-touch-icon.png` | iOS home screen icon 180×180       |

---

## src/

| File        | Purpose                                              |
|-------------|------------------------------------------------------|
| `main.tsx`  | ReactDOM root, BrowserRouter                         |
| `App.tsx`   | ErrorBoundary + SettingsProvider + Suspense + lazy routes |
| `index.css` | Tailwind + touch + PWA + safe-area + @media print + print-report layout |

### src/i18n/

| File          | Purpose                                              |
|---------------|------------------------------------------------------|
| `locales.ts`  | EN + AR locale map; 80+ user-facing strings — ALL new strings go here first |

### src/context/

| File                  | Purpose                                                                |
|-----------------------|------------------------------------------------------------------------|
| `SettingsContext.tsx`  | AI + notifications + RTL + **exportSettings** + **importSettings**    |

### src/hooks/

| File                  | Purpose                                                         |
|-----------------------|-----------------------------------------------------------------|
| `useLocalStorage.ts`  | Generic typed localStorage getter/setter                        |
| `usePWAInstall.ts`    | beforeinstallprompt intercept + standalone detection            |
| `useNotifications.ts` | Notification API: permission, requestPermission, notify         |
| `useFocusTrap.ts`     | Keyboard focus trap for modals; restores prior focus on close   |
| `useT.ts`             | `t(key)` — resolves EN/AR locale string from `src/i18n/locales` |

### src/components/error/

| File                | Purpose                                               |
|---------------------|-------------------------------------------------------|
| `ErrorBoundary.tsx` | Global class-based boundary; reload button            |

### src/components/layout/

| File                  | Purpose                                                                        |
|-----------------------|--------------------------------------------------------------------------------|
| `AppShell.tsx`        | Main layout: TopBar + Outlet + nav shortcuts + PWA banners                    |
| `TopBar.tsx`          | Header, nav, search, install button — **all labels via useT()**               |
| `MobileBottomNav.tsx` | Bottom tab bar for mobile — **labels via useT()**                             |

### src/components/pwa/

| File               | Purpose                                                          |
|--------------------|------------------------------------------------------------------|
| `OfflineBanner.tsx`| Online/offline status banner — **messages via useT()**          |
| `UpdateBanner.tsx` | SW waiting banner; SKIP_WAITING — **messages via useT()**       |

### src/components/ui/

| File                    | Purpose / notes                                                   |
|-------------------------|-------------------------------------------------------------------|
| `Button.tsx`            | Variants: primary/secondary/ghost/danger; sizes sm/md/lg; NO `as` prop |
| `Card.tsx`              | `padding` prop; `CardHeader` subcomponent                         |
| `Badge.tsx`             | `variant`, `dot`, `size` props                                    |
| `Input.tsx`             | Labelled input                                                    |
| `Dialog.tsx`            | Modal + **focus trap** + aria-hidden backdrop                     |
| `Tooltip.tsx`           | prop: `side` (top/bottom/left/right)                              |
| `EmptyState.tsx`        | Empty state with icon and CTA                                     |
| `ProgressBar.tsx`       | prop: `variant` (gold/success/info)                               |
| `StepIndicator.tsx`     | Step wizard progress indicator                                    |
| `Tabs.tsx`              | Tab bar — underline + pill variants                               |
| `SlideOver.tsx`         | Right slide-over + **focus trap** + swipe-to-dismiss (≥80px)     |
| `Breadcrumbs.tsx`       | prop: `crumbs` (not items)                                        |
| `Skeleton.tsx`          | Placeholders + `SkeletonPage` (Suspense fallback)                 |
| `Pagination.tsx`        | Smart ellipsis pagination                                         |
| `DateRangePicker.tsx`   | Preset + custom range; **fields: `from`/`to`** (not start/end)   |
| `FilterPanel.tsx`       | Multi-select filter groups                                        |
| `SortableTable.tsx`     | Generic sortable table — preferred for data tables                |
| `AnimatedCounter.tsx`   | RAF + **IntersectionObserver** — defers until in viewport         |
| `ExportButton.tsx`      | CSV/XLSX mock export dropdown                                     |
| `KeyboardShortcuts.tsx` | ? overlay + ShortcutsButton fixed trigger                        |

### src/components/documents/

| File                        | Purpose                                                |
|-----------------------------|--------------------------------------------------------|
| `UploadModal.tsx`           | Drag+drop + camera capture — **labels via useT()**    |
| `DocumentDetailPanel.tsx`   | Detail slide-over + full-screen viewer + Share API     |
| `ClassificationFlow.tsx`    | 4-step classify wizard + notification on complete      |
| `BatchClassifyBar.tsx`      | Floating bar for batch classification                  |

### src/components/(other)

| Path                                   | Purpose                                   |
|----------------------------------------|-------------------------------------------|
| `ai/AICompanion.tsx`                   | Floating chat + panel, mock AI            |
| `banking/BankTransactionDetail.tsx`    | TX slide-over: match/flag/manual          |
| `dashboard/LaunchpadCard.tsx`          | Large nav card                            |
| `dashboard/RecentActivity.tsx`         | Activity feed                             |
| `dashboard/AISuggestions.tsx`          | AI-driven action prompts                  |
| `dashboard/SpendChart.tsx`             | SVG sparklines + category spend           |
| `notifications/NotificationCenter.tsx` | Bell + notification tray                  |
| `reports/ReportWizard.tsx`             | 4-step report generation modal            |
| `search/GlobalSearch.tsx`              | Cmd+K overlay, keyboard nav               |

### src/pages/ — all lazy-loaded

| File               | Route            | Purpose                                        |
|--------------------|------------------|------------------------------------------------|
| `Dashboard.tsx`    | `/`              | Launchpad, stats, SpendChart — **useT**        |
| `Documents.tsx`    | `/documents`     | Filters, batch, upload, **drag-to-reorder** — **useT** |
| `Reports.tsx`      | `/reports`       | Table, filters, wizard, **print layout** — **useT** |
| `BankMatching.tsx` | `/bank-matching` | Table, TX detail, stats — **useT**             |
| `AI.tsx`           | `/ai`            | Capability cards — **useT**                    |
| `Settings.tsx`     | `/settings`      | AI + RTL + notifications + **export/import** — **useT** |
| `DesignSystem.tsx` | `/design-system` | Sprint 1–4 full component showcase             |

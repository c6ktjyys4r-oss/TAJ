# FILE_INDEX — TAJ Finance

> Auto-maintained. Update whenever files are added or removed.
> Last updated: 2025-07-16 — Sprint 8

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

| File                   | Purpose                                      |
|------------------------|----------------------------------------------|
| `favicon.svg`          | Gold-T SVG icon                              |
| `pwa-192.png`          | PWA launcher icon 192×192                    |
| `pwa-512.png`          | PWA splash / maskable icon 512×512           |
| `apple-touch-icon.png` | iOS home screen icon 180×180                |

---

## src/

| File        | Purpose                                              |
|-------------|------------------------------------------------------|
| `main.tsx`  | ReactDOM root, BrowserRouter                         |
| `App.tsx`   | ErrorBoundary + SettingsProvider + Suspense + lazy routes |
| `index.css` | Tailwind, touch, PWA, safe-area, print styles        |

### src/context/

| File                  | Purpose                                                              |
|-----------------------|----------------------------------------------------------------------|
| `SettingsContext.tsx`  | AI + notifications + RTL (all localStorage-backed); sets dir/lang on html |

### src/hooks/

| File                  | Purpose                                                       |
|-----------------------|---------------------------------------------------------------|
| `useLocalStorage.ts`  | Generic typed localStorage hook                               |
| `usePWAInstall.ts`    | beforeinstallprompt intercept; standalone detection           |
| `useNotifications.ts` | Notification API: permission, requestPermission, notify       |

### src/components/error/

| File                | Purpose                                                     |
|---------------------|-------------------------------------------------------------|
| `ErrorBoundary.tsx` | Global React class-based error boundary; reload button      |

### src/components/layout/

| File                  | Purpose                                                                       |
|-----------------------|-------------------------------------------------------------------------------|
| `AppShell.tsx`        | Shell: OfflineBanner + UpdateBanner + skip-to-main + keyboard shortcuts + tour |
| `TopBar.tsx`          | Desktop nav + PWA install button + hamburger drawer (mobile)                   |
| `MobileBottomNav.tsx` | Fixed bottom nav — visible < md only                                           |

### src/components/onboarding/

| File                  | Purpose                                                              |
|-----------------------|----------------------------------------------------------------------|
| `OnboardingTour.tsx`  | 5-step first-run wizard; swipe navigation; once-per-browser          |

### src/components/pwa/

| File                | Purpose                                                     |
|---------------------|-------------------------------------------------------------|
| `OfflineBanner.tsx` | Online/offline event listener banner                        |
| `UpdateBanner.tsx`  | SW waiting → SKIP_WAITING prompt                            |

### src/components/ui/ — Design system

| File                    | Purpose                                                           |
|-------------------------|-------------------------------------------------------------------|
| `Button.tsx`            | primary/secondary/ghost/danger; sm/md/lg                         |
| `Card.tsx`              | Surface container, CardHeader                                    |
| `Input.tsx`             | Text input, label, error, hint, icons                            |
| `Badge.tsx`             | Colour-coded status with dot                                     |
| `Table.tsx`             | Basic table (legacy — prefer SortableTable)                      |
| `Dialog.tsx`            | Modal overlay                                                    |
| `Typography.tsx`        | PageTitle, SectionTitle, Lead, Caption, GoldText                 |
| `Tooltip.tsx`           | prop: `side` (top/bottom/left/right)                             |
| `EmptyState.tsx`        | Empty state with icon and CTA                                    |
| `ProgressBar.tsx`       | prop: `variant` (gold/success/info)                              |
| `StepIndicator.tsx`     | Step wizard progress indicator                                   |
| `Tabs.tsx`              | Tab bar — underline + pill variants                              |
| `SlideOver.tsx`         | Swipe-to-dismiss (≥80px right) + keyboard Escape                 |
| `Breadcrumbs.tsx`       | prop: `crumbs` (not items)                                       |
| `Skeleton.tsx`          | Loading placeholders + `SkeletonPage` (Suspense fallback)        |
| `Pagination.tsx`        | Smart ellipsis pagination                                        |
| `DateRangePicker.tsx`   | Preset + custom date range picker                                |
| `FilterPanel.tsx`       | Multi-select filter groups                                       |
| `SortableTable.tsx`     | Generic sortable table ⭐ preferred for all lists                |
| `AnimatedCounter.tsx`   | RAF counter animation                                            |
| `ExportButton.tsx`      | CSV/XLSX mock export dropdown                                    |
| `KeyboardShortcuts.tsx` | ? overlay + ShortcutsButton fixed trigger                       |

### src/components/documents/

| File                        | Purpose                                                |
|-----------------------------|--------------------------------------------------------|
| `UploadModal.tsx`           | Drag+drop + camera capture (mobile)                    |
| `DocumentDetailPanel.tsx`   | Detail slide-over + full-screen viewer + Share API     |
| `ClassificationFlow.tsx`    | 4-step classify wizard + notification on complete      |
| `BatchClassifyBar.tsx`      | Floating bar for batch classification                  |

### src/components/(other)

| Component path                         | Purpose                                   |
|----------------------------------------|-------------------------------------------|
| `ai/AICompanion.tsx`                   | Floating chat + panel, mock AI            |
| `banking/BankTransactionDetail.tsx`    | TX slide-over: match/flag/manual          |
| `dashboard/LaunchpadCard.tsx`          | Large nav card for Dashboard grid         |
| `dashboard/RecentActivity.tsx`         | Activity feed                             |
| `dashboard/AISuggestions.tsx`          | AI-driven action prompts                  |
| `dashboard/SpendChart.tsx`             | SVG sparklines + category spend           |
| `notifications/NotificationCenter.tsx` | Bell + notification tray                  |
| `reports/ReportWizard.tsx`             | 4-step report generation modal            |
| `search/GlobalSearch.tsx`              | Cmd+K overlay, keyboard nav               |

### src/pages/ — all lazy-loaded via React.lazy

| File               | Route            | Purpose                               |
|--------------------|------------------|---------------------------------------|
| `Dashboard.tsx`    | `/`              | Launchpad, stats, SpendChart          |
| `Documents.tsx`    | `/documents`     | Filters, batch, upload, detail        |
| `Reports.tsx`      | `/reports`       | Table, filters, wizard, export        |
| `BankMatching.tsx` | `/bank-matching` | Table, TX detail, stats               |
| `AI.tsx`           | `/ai`            | Capability cards                      |
| `Settings.tsx`     | `/settings`      | AI + RTL + notification permission    |
| `DesignSystem.tsx` | `/design-system` | Sprint 1–4 full component showcase    |

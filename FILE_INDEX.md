# FILE_INDEX — TAJ Finance

> Auto-maintained. Update whenever files are added or removed.
> Last updated: 2025-07-16 — Sprint 6

---

## Root

| File                 | Purpose                                              |
|----------------------|------------------------------------------------------|
| `package.json`       | Dependencies and npm scripts                         |
| `vite.config.ts`     | Vite build config + VitePWA plugin (manifest + SW)  |
| `tailwind.config.js` | Design tokens                                        |
| `postcss.config.js`  | Tailwind + Autoprefixer                              |
| `tsconfig.json`      | TypeScript solution config                           |
| `tsconfig.app.json`  | App-level TS config (strict + verbatimModuleSyntax)  |
| `tsconfig.node.json` | Vite config TS                                       |
| `index.html`         | SPA entry + PWA meta tags + manifest link            |
| `CHANGELOG.md`       | Version history                                      |
| `PROJECT_BIBLE.md`   | Master product spec — read before any sprint         |
| `PROJECT_STATE.md`   | Current implementation status                        |
| `HANDOFF.md`         | Agent/developer orientation guide                    |
| `FILE_INDEX.md`      | This file                                            |

---

## public/

| File                  | Purpose                                         |
|-----------------------|-------------------------------------------------|
| `favicon.svg`         | Gold-T mark site icon (SVG)                     |
| `pwa-192.png`         | PWA launcher icon 192×192                       |
| `pwa-512.png`         | PWA splash / maskable icon 512×512              |
| `apple-touch-icon.png`| iOS home screen icon 180×180                   |

---

## src/

| File        | Purpose                            |
|-------------|------------------------------------|
| `main.tsx`  | ReactDOM root, BrowserRouter       |
| `App.tsx`   | Route tree, SettingsProvider       |
| `index.css` | Tailwind, touch optimisation, PWA CSS, safe-area insets |

### src/context/

| File                  | Purpose                                                    |
|-----------------------|------------------------------------------------------------|
| `SettingsContext.tsx`  | AI companion + notification prefs, all localStorage-backed |

### src/hooks/

| File                | Purpose                         |
|---------------------|---------------------------------|
| `useLocalStorage.ts`| Generic typed localStorage hook |

### src/components/layout/

| File                 | Purpose                                                              |
|----------------------|----------------------------------------------------------------------|
| `AppShell.tsx`       | Shell: TopBar + OfflineBanner + main + MobileBottomNav + AI + Tour   |
| `TopBar.tsx`         | Desktop nav, GlobalSearch, hamburger drawer (mobile), user menu      |
| `MobileBottomNav.tsx`| Fixed bottom nav — visible < md only                                |

### src/components/onboarding/

| File                 | Purpose                                                      |
|----------------------|--------------------------------------------------------------|
| `OnboardingTour.tsx` | 5-step first-run wizard; once-per-browser via localStorage   |

### src/components/pwa/

| File               | Purpose                                               |
|--------------------|-------------------------------------------------------|
| `OfflineBanner.tsx`| Online/offline event listener; banner in AppShell     |

### src/components/ui/ — Design system

| File                   | Purpose                                              |
|------------------------|------------------------------------------------------|
| `Button.tsx`           | primary/secondary/ghost/danger; sm/md/lg             |
| `Card.tsx`             | Surface container, CardHeader                        |
| `Input.tsx`            | Text input, label, error, hint, icons                |
| `Badge.tsx`            | Colour-coded status with dot                         |
| `Table.tsx`            | Basic table (legacy; prefer SortableTable)           |
| `Dialog.tsx`           | Modal overlay                                        |
| `Typography.tsx`       | PageTitle, SectionTitle, Lead, Caption, GoldText     |
| `Tooltip.tsx`          | prop: `side` (top/bottom/left/right)                 |
| `EmptyState.tsx`       | Empty state with icon and CTA                        |
| `ProgressBar.tsx`      | prop: `variant` (gold/success/info)                  |
| `StepIndicator.tsx`    | Step wizard progress indicator                       |
| `Tabs.tsx`             | Tab bar — underline + pill variants                  |
| `SlideOver.tsx`        | Animated right slide-over panel                      |
| `Breadcrumbs.tsx`      | prop: `crumbs` (not items)                           |
| `Skeleton.tsx`         | Loading placeholders                                 |
| `Pagination.tsx`       | Smart ellipsis pagination                            |
| `DateRangePicker.tsx`  | Preset + custom date range picker                    |
| `FilterPanel.tsx`      | Multi-select filter groups                           |
| `SortableTable.tsx`    | Generic sortable table ⭐ preferred for all lists    |
| `AnimatedCounter.tsx`  | RAF counter animation                                |
| `ExportButton.tsx`     | CSV/XLSX mock export dropdown                        |
| `KeyboardShortcuts.tsx`| ? overlay + ShortcutsButton                         |

### src/components/ai/

| File              | Purpose                          |
|-------------------|----------------------------------|
| `AICompanion.tsx` | Floating chat + panel, mock AI   |

### src/components/banking/

| File                        | Purpose                                 |
|-----------------------------|-----------------------------------------|
| `BankTransactionDetail.tsx` | TX slide-over: match/flag/manual        |

### src/components/dashboard/

| File                | Purpose                                    |
|---------------------|--------------------------------------------|
| `LaunchpadCard.tsx` | Large nav card for Dashboard grid          |
| `RecentActivity.tsx`| Activity feed                              |
| `AISuggestions.tsx` | AI-driven action prompts                   |
| `SpendChart.tsx`    | SVG sparklines + category spend breakdown  |

### src/components/documents/

| File                      | Purpose                                         |
|---------------------------|-------------------------------------------------|
| `UploadModal.tsx`         | Drag & drop + camera capture (mobile)           |
| `DocumentDetailPanel.tsx` | Slide-over: metadata, history, classify         |
| `ClassificationFlow.tsx`  | 4-step classify wizard + AI suggestions         |
| `BatchClassifyBar.tsx`    | Floating bar for batch classification           |

### src/components/notifications/

| File                    | Purpose                        |
|-------------------------|--------------------------------|
| `NotificationCenter.tsx`| Bell + notification tray       |

### src/components/reports/

| File              | Purpose                                  |
|-------------------|------------------------------------------|
| `ReportWizard.tsx`| 4-step report generation modal           |

### src/components/search/

| File              | Purpose                                             |
|-------------------|-----------------------------------------------------|
| `GlobalSearch.tsx`| Cmd+K overlay, keyboard nav, full-text + quick jump |

### src/pages/

| File               | Route            | Purpose                               |
|--------------------|------------------|---------------------------------------|
| `Dashboard.tsx`    | `/`              | Launchpad, stats, SpendChart          |
| `Documents.tsx`    | `/documents`     | Filters, batch, upload, detail        |
| `Reports.tsx`      | `/reports`       | Table, filters, wizard, export        |
| `BankMatching.tsx` | `/bank-matching` | Table, TX detail, stats               |
| `AI.tsx`           | `/ai`            | Capability cards                      |
| `Settings.tsx`     | `/settings`      | AI + notification toggles             |
| `DesignSystem.tsx` | `/design-system` | Sprint 1–4 full component showcase    |

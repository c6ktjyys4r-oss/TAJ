# FILE_INDEX — TAJ Finance

> Auto-maintained. Update whenever files are added or removed.
> Last updated: 2025-07-16 — Sprint 4

---

## Root

| File                 | Purpose                                              |
|----------------------|------------------------------------------------------|
| `package.json`       | Dependencies and npm scripts                         |
| `vite.config.ts`     | Vite build configuration                             |
| `tailwind.config.js` | Design tokens (colours, fonts, shadows)              |
| `postcss.config.js`  | Tailwind + Autoprefixer                              |
| `tsconfig.json`      | TypeScript solution config                           |
| `tsconfig.app.json`  | App-level TS config (strict + verbatimModuleSyntax)  |
| `tsconfig.node.json` | Vite config TS config                                |
| `index.html`         | SPA entry point                                      |
| `CHANGELOG.md`       | Version history                                      |
| `PROJECT_BIBLE.md`   | Master product spec — read before any sprint         |
| `PROJECT_STATE.md`   | Current implementation status                        |
| `HANDOFF.md`         | Agent/developer orientation guide                    |
| `FILE_INDEX.md`      | This file                                            |

---

## src/

| File               | Purpose                                  |
|--------------------|------------------------------------------|
| `main.tsx`         | ReactDOM root, BrowserRouter             |
| `App.tsx`          | Route tree, SettingsProvider             |
| `index.css`        | Tailwind directives, global styles       |

### src/context/

| File                   | Purpose                                   |
|------------------------|-------------------------------------------|
| `SettingsContext.tsx`  | AI companion toggle, app-wide settings    |

### src/hooks/

| File                   | Purpose                                   |
|------------------------|-------------------------------------------|
| `useLocalStorage.ts`   | Generic typed localStorage hook           |

### src/components/layout/

| File           | Purpose                                                       |
|----------------|---------------------------------------------------------------|
| `AppShell.tsx` | Shell: TopBar + content + AI + ShortcutsButton + g+X nav     |
| `TopBar.tsx`   | Logo, GlobalSearch trigger, nav links, NotificationBell, user |

### src/components/ui/ — Design system primitives

| File                 | Purpose                                          |
|----------------------|--------------------------------------------------|
| `Button.tsx`         | primary/secondary/ghost/danger; sm/md/lg         |
| `Card.tsx`           | Surface container, CardHeader                    |
| `Input.tsx`          | Text input, label, error, hint, icons            |
| `Badge.tsx`          | Colour-coded status with dot                     |
| `Table.tsx`          | Basic generic table (legacy; prefer SortableTable)|
| `Dialog.tsx`         | Modal overlay, accessible                        |
| `Typography.tsx`     | PageTitle, SectionTitle, Lead, Caption, GoldText |
| `Tooltip.tsx`        | Hover tooltip (top/bottom/left/right)            |
| `EmptyState.tsx`     | Empty state with icon and CTA                    |
| `ProgressBar.tsx`    | Animated progress bar                            |
| `StepIndicator.tsx`  | Step wizard progress indicator                   |
| `Tabs.tsx`           | Tab bar — underline + pill variants              |
| `SlideOver.tsx`      | Animated right slide-over panel                  |
| `Breadcrumbs.tsx`    | Router-linked breadcrumb navigation              |
| `Skeleton.tsx`       | Animated loading placeholders (card/row/table)   |
| `Pagination.tsx`     | Page buttons with ellipsis and item count        |
| `DateRangePicker.tsx`| Preset + custom date range picker                |
| `FilterPanel.tsx`    | Multi-select filter groups with active count     |
| `SortableTable.tsx`  | Generic sortable table with click-header sort ⭐ |
| `AnimatedCounter.tsx`| RAF counter animation (prefix/suffix/decimals)   |
| `ExportButton.tsx`   | CSV/XLSX mock export dropdown                    |
| `KeyboardShortcuts.tsx`| ? overlay + ShortcutsButton fixed trigger      |

### src/components/ai/

| File              | Purpose                                     |
|-------------------|---------------------------------------------|
| `AICompanion.tsx` | Floating chat button + panel, mock AI       |

### src/components/banking/

| File                        | Purpose                                |
|-----------------------------|----------------------------------------|
| `BankTransactionDetail.tsx` | TX detail slide-over: match/flag/manual|

### src/components/dashboard/

| File                  | Purpose                                        |
|-----------------------|------------------------------------------------|
| `LaunchpadCard.tsx`   | Large nav card for Dashboard grid              |
| `RecentActivity.tsx`  | Activity feed                                  |
| `AISuggestions.tsx`   | AI-driven action prompts                       |
| `SpendChart.tsx`      | SVG sparklines + category spend breakdown      |

### src/components/documents/

| File                      | Purpose                                    |
|---------------------------|--------------------------------------------|
| `UploadModal.tsx`         | Drag & drop upload with progress           |
| `DocumentDetailPanel.tsx` | Slide-over: metadata, history, classify    |
| `ClassificationFlow.tsx`  | 4-step classify wizard + AI suggestions    |
| `BatchClassifyBar.tsx`    | Floating bar for batch-classifying selection|

### src/components/notifications/

| File                    | Purpose                                   |
|-------------------------|-------------------------------------------|
| `NotificationCenter.tsx`| Bell button + notification tray           |

### src/components/reports/

| File              | Purpose                                      |
|-------------------|----------------------------------------------|
| `ReportWizard.tsx`| 4-step report generation modal + progress    |

### src/components/search/

| File              | Purpose                                               |
|-------------------|-------------------------------------------------------|
| `GlobalSearch.tsx`| Cmd+K overlay, keyboard nav, full-text + quick jump   |

### src/pages/

| File               | Route            | Purpose                                         |
|--------------------|------------------|-------------------------------------------------|
| `Dashboard.tsx`    | `/`              | Launchpad, animated stats, SpendChart           |
| `Documents.tsx`    | `/documents`     | SortableTable, filters, pagination, batch       |
| `Reports.tsx`      | `/reports`       | SortableTable, filters, wizard, export          |
| `BankMatching.tsx` | `/bank-matching` | SortableTable, TX detail, stats                 |
| `AI.tsx`           | `/ai`            | Capability cards and stats                      |
| `Settings.tsx`     | `/settings`      | Config, AI companion toggle                     |
| `DesignSystem.tsx` | `/design-system` | Component showcase (dev reference)              |

### public/

| File          | Purpose               |
|---------------|-----------------------|
| `favicon.svg` | Gold-T mark site icon |

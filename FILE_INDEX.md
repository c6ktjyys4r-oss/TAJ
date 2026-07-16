# FILE_INDEX — TAJ Finance

> Auto-maintained. Update whenever files are added or removed.
> Last updated: 2025-07-16 — Sprint 2

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

| File           | Purpose                                           |
|----------------|---------------------------------------------------|
| `AppShell.tsx` | TopBar + content area + AI Companion mount        |
| `TopBar.tsx`   | Logo, search, nav links, NotificationBell, user   |

### src/components/ui/ — Design system primitives

| File               | Purpose                                         |
|--------------------|-------------------------------------------------|
| `Button.tsx`       | primary/secondary/ghost/danger; sm/md/lg        |
| `Card.tsx`         | Surface container, CardHeader                   |
| `Input.tsx`        | Text input, label, error, hint, icons           |
| `Badge.tsx`        | Colour-coded status with dot                    |
| `Table.tsx`        | Generic typed data table                        |
| `Dialog.tsx`       | Modal overlay, accessible                       |
| `Typography.tsx`   | PageTitle, SectionTitle, Lead, Caption, GoldText|
| `Tooltip.tsx`      | Hover tooltip (top/bottom/left/right)           |
| `EmptyState.tsx`   | Empty state with icon and CTA                   |
| `ProgressBar.tsx`  | Animated progress bar                           |
| `StepIndicator.tsx`| Step wizard progress indicator                  |
| `Tabs.tsx`         | Tab bar — underline + pill variants             |
| `SlideOver.tsx`    | Animated right slide-over panel                 |
| `Breadcrumbs.tsx`  | Router-linked breadcrumb navigation             |

### src/components/ai/

| File              | Purpose                                     |
|-------------------|---------------------------------------------|
| `AICompanion.tsx` | Floating chat button + panel, mock AI       |

### src/components/banking/

| File                        | Purpose                                |
|-----------------------------|----------------------------------------|
| `BankTransactionDetail.tsx` | TX detail slide-over: match/flag/manual|

### src/components/dashboard/

| File                  | Purpose                              |
|-----------------------|--------------------------------------|
| `LaunchpadCard.tsx`   | Large nav card for Dashboard grid    |
| `RecentActivity.tsx`  | Activity feed                        |
| `AISuggestions.tsx`   | AI-driven action prompts             |

### src/components/documents/

| File                    | Purpose                                   |
|-------------------------|-------------------------------------------|
| `UploadModal.tsx`       | Drag & drop upload with progress          |
| `DocumentDetailPanel.tsx`| Slide-over: metadata, history, classify  |
| `ClassificationFlow.tsx`| 4-step classify wizard + AI suggestions  |

### src/components/notifications/

| File                    | Purpose                                   |
|-------------------------|-------------------------------------------|
| `NotificationCenter.tsx`| Bell button + notification tray           |

### src/components/reports/

| File              | Purpose                                      |
|-------------------|----------------------------------------------|
| `ReportWizard.tsx`| 4-step report generation modal + progress    |

### src/pages/

| File               | Route            | Purpose                             |
|--------------------|------------------|-------------------------------------|
| `Dashboard.tsx`    | `/`              | Launchpad, activity, AI suggestions |
| `Documents.tsx`    | `/documents`     | List, upload, detail, classify      |
| `Reports.tsx`      | `/reports`       | List, stats, generate wizard        |
| `BankMatching.tsx` | `/bank-matching` | Statement cards, TX detail panel    |
| `AI.tsx`           | `/ai`            | Capability cards and stats          |
| `Settings.tsx`     | `/settings`      | Config, AI companion toggle         |
| `DesignSystem.tsx` | `/design-system` | Component showcase (dev reference)  |

### public/

| File          | Purpose               |
|---------------|-----------------------|
| `favicon.svg` | Gold-T mark site icon |

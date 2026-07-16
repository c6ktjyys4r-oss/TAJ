# FILE_INDEX — TAJ Finance

> Auto-maintained. Update whenever files are added or removed.
> Last updated: 2025-07-16

---

## Root

| File                 | Purpose                                              |
|----------------------|------------------------------------------------------|
| `package.json`       | Project dependencies and npm scripts                 |
| `vite.config.ts`     | Vite build configuration                             |
| `tailwind.config.js` | Tailwind CSS theme + custom design tokens            |
| `postcss.config.js`  | PostCSS plugins (Tailwind, Autoprefixer)             |
| `tsconfig.json`      | TypeScript compiler config                           |
| `index.html`         | SPA entry point                                      |
| `CHANGELOG.md`       | Version history                                      |
| `PROJECT_STATE.md`   | Current sprint status and implementation tracker     |
| `HANDOFF.md`         | Agent/developer handoff and orientation guide        |
| `FILE_INDEX.md`      | This file                                            |

---

## src/

| File               | Purpose                                              |
|--------------------|------------------------------------------------------|
| `main.tsx`         | ReactDOM root, BrowserRouter wrapper                 |
| `App.tsx`          | Route tree, SettingsProvider wrapper                 |
| `index.css`        | Tailwind directives, global resets, utility classes  |

### src/context/

| File                    | Purpose                                         |
|-------------------------|-------------------------------------------------|
| `SettingsContext.tsx`   | AI companion toggle, app-wide settings state    |

### src/components/layout/

| File           | Purpose                                              |
|----------------|------------------------------------------------------|
| `AppShell.tsx` | Outer shell: TopBar + main content + AI Companion    |
| `TopBar.tsx`   | Logo, global search, navigation links, user menu     |

### src/components/ui/

| File             | Purpose                                            |
|------------------|----------------------------------------------------|
| `Button.tsx`     | Primary / secondary / ghost / danger; sm/md/lg     |
| `Card.tsx`       | Surface container with optional hover + padding    |
| `Input.tsx`      | Text input with label, error, hint, icons          |
| `Badge.tsx`      | Colour-coded status labels with optional dot       |
| `Table.tsx`      | Generic typed data table with columns config       |
| `Dialog.tsx`     | Modal overlay with header, body, footer            |
| `Typography.tsx` | PageTitle, SectionTitle, Lead, Caption, GoldText   |

### src/components/ai/

| File              | Purpose                                            |
|-------------------|----------------------------------------------------|
| `AICompanion.tsx` | Floating chat button + panel, mock AI responses    |

### src/components/dashboard/

| File                  | Purpose                                        |
|-----------------------|------------------------------------------------|
| `LaunchpadCard.tsx`   | Large navigational card for the Dashboard grid |
| `RecentActivity.tsx`  | Activity feed with icons and status badges     |
| `AISuggestions.tsx`   | AI-driven action prompts with CTA links        |

### src/pages/

| File               | Route            | Purpose                                   |
|--------------------|------------------|-------------------------------------------|
| `Dashboard.tsx`    | `/`              | Launchpad, activity, AI suggestions       |
| `Documents.tsx`    | `/documents`     | Document list with tabs and search        |
| `Reports.tsx`      | `/reports`       | Report list, stats, generate action       |
| `BankMatching.tsx` | `/bank-matching` | Statement cards and pending tx review     |
| `AI.tsx`           | `/ai`            | AI capability cards and usage stats       |
| `Settings.tsx`     | `/settings`      | Workspace configuration, AI toggle        |
| `DesignSystem.tsx` | `/design-system` | Full component showcase for developers    |

### public/

| File          | Purpose               |
|---------------|-----------------------|
| `favicon.svg` | Gold-T mark site icon |

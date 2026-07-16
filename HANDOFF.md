# TAJ Finance — Handoff Document

> For any agent or developer picking up this project.
> Last updated: 2025-07-16 — Sprint 4 complete.

---

## How to run

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve production build locally
```

---

## Repository structure

```
TAJ/
├── src/
│   ├── App.tsx                              # Router root, SettingsProvider
│   ├── main.tsx                             # ReactDOM entry
│   ├── index.css                            # Global CSS + Tailwind
│   ├── context/
│   │   └── SettingsContext.tsx              # aiCompanionEnabled toggle
│   ├── hooks/
│   │   └── useLocalStorage.ts              # Generic localStorage hook
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx                # Shell: TopBar + Outlet + AI + ShortcutsButton + g+X nav
│   │   │   └── TopBar.tsx                  # Logo, GlobalSearch trigger, nav, NotificationBell, user menu
│   │   ├── ui/                             # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx                   # Basic generic table (use SortableTable for new work)
│   │   │   ├── Dialog.tsx
│   │   │   ├── Typography.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── SlideOver.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── Skeleton.tsx                # Loading states
│   │   │   ├── Pagination.tsx              # Smart ellipsis pagination
│   │   │   ├── DateRangePicker.tsx         # Preset + custom date range
│   │   │   ├── FilterPanel.tsx             # Multi-select filter groups
│   │   │   ├── SortableTable.tsx           # Click-header sort, generic typed
│   │   │   ├── AnimatedCounter.tsx         # RAF counter with easing
│   │   │   ├── ExportButton.tsx            # CSV/XLSX mock export
│   │   │   └── KeyboardShortcuts.tsx       # ? overlay + ShortcutsButton
│   │   ├── ai/
│   │   │   └── AICompanion.tsx
│   │   ├── banking/
│   │   │   └── BankTransactionDetail.tsx
│   │   ├── dashboard/
│   │   │   ├── LaunchpadCard.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── AISuggestions.tsx
│   │   │   └── SpendChart.tsx              # SVG sparklines by category
│   │   ├── documents/
│   │   │   ├── UploadModal.tsx
│   │   │   ├── DocumentDetailPanel.tsx
│   │   │   ├── ClassificationFlow.tsx
│   │   │   └── BatchClassifyBar.tsx        # Multi-select floating action bar
│   │   ├── notifications/
│   │   │   └── NotificationCenter.tsx
│   │   ├── reports/
│   │   │   └── ReportWizard.tsx
│   │   └── search/
│   │       └── GlobalSearch.tsx            # Cmd+K overlay
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Documents.tsx
│       ├── Reports.tsx
│       ├── BankMatching.tsx
│       ├── AI.tsx
│       ├── Settings.tsx
│       └── DesignSystem.tsx
├── public/favicon.svg
├── CHANGELOG.md
├── FILE_INDEX.md
├── HANDOFF.md
├── PROJECT_BIBLE.md                         # Master product spec — read first
├── PROJECT_STATE.md
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Key decisions

1. **All data is mock/static.** No backend or DB. Every list is hardcoded in components.
2. **SettingsContext** controls AI companion. Toggled from Settings > AI & Automation.
3. **Design tokens in `tailwind.config.js`** — gold shades, ink, surface, shadows, font families.
4. **Playfair Display** for all headings/titles. **Inter** for body text.
5. **No dark mode.** Excluded from scope by PROJECT_BIBLE.
6. **SlideOver** used for detail panels. **Dialog** for wizards/modals.
7. **verbatimModuleSyntax** is enabled — always use `import type` for type-only imports.
8. **SortableTable** is preferred over basic Table for all new list UIs.
9. **Keyboard shortcuts** are registered in AppShell (g+X) and in ShortcutsButton (?) via native event listeners.

---

## Active routes

| Path             | Component      | Notes                                        |
|------------------|----------------|----------------------------------------------|
| `/`              | Dashboard      | Launchpad, animated stats, SpendChart        |
| `/documents`     | Documents      | Full filters, batch classify, upload, detail |
| `/reports`       | Reports        | SortableTable, filters, wizard               |
| `/bank-matching` | BankMatching   | SortableTable, TX detail, stats              |
| `/ai`            | AI             | Capability cards                             |
| `/settings`      | Settings       | AI toggle, appearance                        |
| `/design-system` | DesignSystem   | Dev reference only                           |

---

## For next agent

1. Read `PROJECT_BIBLE.md` before any sprint.
2. Check `PROJECT_STATE.md` for current status.
3. All UI primitives live in `src/components/ui/` — use SortableTable (not Table) for new lists.
4. Use `import type` for type-only imports (verbatimModuleSyntax strict mode).
5. Run `npm run build` before every commit — 0 errors required.
6. Update CHANGELOG, PROJECT_STATE, HANDOFF, FILE_INDEX after every sprint.
7. Commit and push after every milestone.

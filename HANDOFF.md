# TAJ Finance — Handoff Document

> For any agent or developer picking up this project.
> Last updated: 2025-07-16 — Sprint 2 complete.

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
│   │   │   ├── AppShell.tsx                # Shell: TopBar + Outlet + AI Companion
│   │   │   └── TopBar.tsx                  # Logo, search, nav, NotificationBell, user menu
│   │   ├── ui/                             # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Typography.tsx
│   │   │   ├── Tooltip.tsx                 # Hover tooltip
│   │   │   ├── EmptyState.tsx              # Empty state with CTA
│   │   │   ├── ProgressBar.tsx             # Animated progress bar
│   │   │   ├── StepIndicator.tsx           # Wizard step indicator
│   │   │   ├── Tabs.tsx                    # Tab bar (underline + pill)
│   │   │   ├── SlideOver.tsx               # Animated right panel
│   │   │   └── Breadcrumbs.tsx             # Breadcrumb nav
│   │   ├── ai/
│   │   │   └── AICompanion.tsx             # Floating chat assistant
│   │   ├── banking/
│   │   │   └── BankTransactionDetail.tsx   # TX detail slide-over
│   │   ├── dashboard/
│   │   │   ├── LaunchpadCard.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── AISuggestions.tsx
│   │   ├── documents/
│   │   │   ├── UploadModal.tsx             # Drag & drop upload
│   │   │   ├── DocumentDetailPanel.tsx     # Doc detail slide-over
│   │   │   └── ClassificationFlow.tsx      # 4-step classify wizard
│   │   ├── notifications/
│   │   │   └── NotificationCenter.tsx      # Bell + notification tray
│   │   └── reports/
│   │       └── ReportWizard.tsx            # 4-step report generation
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

1. **All data is mock/static.** No backend or DB in Sprint 1–2. Every list is hardcoded in components.
2. **SettingsContext** controls AI companion. Toggled from Settings > AI & Automation.
3. **Design tokens in `tailwind.config.js`** — gold shades, ink, surface, shadows, font families.
4. **Playfair Display** for all headings/titles. **Inter** for body text.
5. **No dark mode.** Excluded from scope by PROJECT_BIBLE.
6. **SlideOver** used for all detail panels (DocumentDetailPanel, BankTransactionDetail). Dialog for wizards.
7. **verbatimModuleSyntax** is enabled — always use `import type` for type-only imports.

---

## Active routes

| Path             | Component      | Notes                          |
|------------------|----------------|--------------------------------|
| `/`              | Dashboard      | Launchpad + feeds              |
| `/documents`     | Documents      | Upload, detail panel, classify |
| `/reports`       | Reports        | Wizard on Generate button      |
| `/bank-matching` | BankMatching   | TX detail on row click         |
| `/ai`            | AI             | Capability cards               |
| `/settings`      | Settings       | AI toggle, appearance          |
| `/design-system` | DesignSystem   | Dev reference only             |

---

## For next agent

1. Read `PROJECT_BIBLE.md` before any sprint.
2. Check `PROJECT_STATE.md` for current status and deferred work.
3. All UI primitives are in `src/components/ui/` — extend, never duplicate.
4. Use `import type` for type-only imports (verbatimModuleSyntax strict mode).
5. Run `npm run build` before every commit — 0 errors required.
6. Update CHANGELOG, PROJECT_STATE, HANDOFF, FILE_INDEX after every sprint.
7. Commit and push after every milestone — repo is always in resumable state.

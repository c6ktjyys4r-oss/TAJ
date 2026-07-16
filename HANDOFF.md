# TAJ Finance — Handoff Document

> For any agent or developer picking up this project.
> Last updated: 2025-07-16

---

## How to run

```bash
npm install
npm run dev        # starts dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve production build locally
```

---

## Repository structure

```
TAJ/
├── src/
│   ├── App.tsx                         # Router root
│   ├── main.tsx                        # ReactDOM entry
│   ├── index.css                       # Global CSS + Tailwind directives
│   ├── context/
│   │   └── SettingsContext.tsx         # App-wide settings (AI companion toggle)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx            # Page shell with TopBar + Outlet
│   │   │   └── TopBar.tsx              # Logo, search, nav, user menu
│   │   ├── ui/                         # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Dialog.tsx
│   │   │   └── Typography.tsx
│   │   ├── ai/
│   │   │   └── AICompanion.tsx         # Floating chat assistant
│   │   └── dashboard/
│   │       ├── LaunchpadCard.tsx       # Large quick-access card
│   │       ├── RecentActivity.tsx      # Activity feed
│   │       └── AISuggestions.tsx      # AI-driven action prompts
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Documents.tsx
│       ├── Reports.tsx
│       ├── BankMatching.tsx
│       ├── AI.tsx
│       ├── Settings.tsx
│       └── DesignSystem.tsx           # Component showcase at /design-system
├── public/
│   └── favicon.svg
├── CHANGELOG.md
├── FILE_INDEX.md
├── HANDOFF.md
├── PROJECT_STATE.md
├── tailwind.config.js
├── vite.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## Key decisions

1. **All data is mock/static** — no backend, no DB in Sprint 1. Every list and number is hardcoded in the component or a constants array.
2. **SettingsContext controls AI companion** — `aiCompanionEnabled` boolean. Toggled from Settings > AI & Automation.
3. **Design tokens live in `tailwind.config.js`** — All gold shades, ink colours, surface, shadow names, font families defined there.
4. **Font serif = Playfair Display** — Used for all titles. Font sans = Inter for body text.
5. **No dark mode** — Explicitly excluded from Sprint 1 scope.

---

## Active routes

| Path             | Component         | Notes                              |
|------------------|-------------------|------------------------------------|
| `/`              | `Dashboard`       | Launchpad + activity + AI panel    |
| `/documents`     | `Documents`       | Supports `?tab=unclassified` query |
| `/reports`       | `Reports`         |                                    |
| `/bank-matching` | `BankMatching`    |                                    |
| `/ai`            | `AI`              |                                    |
| `/settings`      | `Settings`        | AI companion toggle lives here     |
| `/design-system` | `DesignSystem`    | Dev reference, not in main nav     |

---

## Next agent instructions

1. Read `PROJECT_BIBLE.md` before beginning any new sprint.
2. Start Sprint 2 by reviewing `PROJECT_STATE.md` for what was deferred.
3. All UI components are in `src/components/ui/` — extend, do not duplicate.
4. Run `npm run build` before every commit to catch TypeScript errors.
5. Update `CHANGELOG.md`, `PROJECT_STATE.md`, `HANDOFF.md`, and `FILE_INDEX.md` after every milestone.

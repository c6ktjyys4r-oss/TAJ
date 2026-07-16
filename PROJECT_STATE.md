# TAJ Finance — Project State

> Last updated: 2025-07-16
> Current sprint: **Sprint 5 — Persistence, Onboarding, Accessibility & Mobile** ✅ COMPLETE

---

## Status

| Area                        | Status    | Notes                                                              |
|-----------------------------|-----------|--------------------------------------------------------------------|
| Project scaffold            | ✅ Done   | Vite + React + TS + Tailwind                                       |
| Design system — primitives  | ✅ Done   | Button, Card, Input, Badge, Table, Dialog, Typography              |
| Design system — extended    | ✅ Done   | Tooltip, EmptyState, ProgressBar, StepIndicator, Tabs, SlideOver, Breadcrumbs |
| Design system — data/UX     | ✅ Done   | Skeleton, Pagination, DateRangePicker, FilterPanel, SortableTable, AnimatedCounter, ExportButton |
| Design System page          | ✅ Done   | Full Sprint 1–4 component showcase at /design-system               |
| Global layout               | ✅ Done   | TopBar (GlobalSearch, hamburger), AppShell (keyboard shortcuts, skip-to-main) |
| Dashboard                   | ✅ Done   | Launchpad + animated stats + Activity + AI + SpendChart            |
| Documents page              | ✅ Done   | SortableTable, Tabs, FilterPanel, DateRange, Pagination, Export, Upload, DetailPanel, BatchClassify |
| Reports page                | ✅ Done   | SortableTable, FilterPanel, AnimatedCounter, ExportButton, ReportWizard |
| Bank Matching page          | ✅ Done   | SortableTable, AnimatedCounter, BankTransactionDetail              |
| AI page                     | ✅ Done   | Capability cards + stats                                           |
| Settings page               | ✅ Done   | Toggles, AI companion control, persisted notification prefs        |
| AI Companion                | ✅ Done   | Floating chat, mock responses, Settings toggle                     |
| Global Search               | ✅ Done   | Cmd+K overlay, keyboard nav, full-text + quick jump                |
| Keyboard Shortcuts          | ✅ Done   | ? overlay, g+X nav, ShortcutsButton                                |
| Batch Classify              | ✅ Done   | Checkbox select + floating BatchClassifyBar with type dropdown     |
| Spend Chart                 | ✅ Done   | SVG sparklines, category breakdown                                 |
| Persistent state            | ✅ Done   | aiCompanionEnabled + notification prefs via localStorage           |
| Onboarding tour             | ✅ Done   | 5-step first-run modal using StepIndicator; once-per-browser       |
| Accessibility               | ✅ Done   | Skip-to-main, ARIA labels/roles, focus-visible rings, aria-hidden  |
| Mobile responsive           | ✅ Done   | Hamburger drawer nav, MobileBottomNav (< md breakpoint)            |
| Build passing               | ✅ Done   | 0 TypeScript errors                                                |

---

## NOT implemented (by design — Sprints 1–5 scope)
- Authentication / login
- Database / persistence (all data is static/mock; UI prefs only in localStorage)
- Real OCR / AI / LLM integration
- Real backend / API
- Dark mode

---

## Tech stack

| Layer    | Tech                                        |
|----------|---------------------------------------------|
| Frontend | React 18, TypeScript, Vite 6                |
| Styling  | Tailwind CSS v3, Inter + Playfair Display   |
| Routing  | React Router v6                             |
| Icons    | Lucide React                                |
| Utils    | clsx                                        |

---

## Git history (main)
| Commit    | Sprint | Description                            |
|-----------|--------|----------------------------------------|
| `101e506` | S1     | Foundation — scaffold, design system, pages |
| `695cb79` | S2     | Core Workflows — upload, classify, notifications, report wizard |
| `d92a49e` | S2     | docs: CHANGELOG, PROJECT_STATE, HANDOFF, FILE_INDEX |
| `101609e` | S3     | Data & Filters — sortable table, pagination, filters, global search |
| `a393e94` | S3     | docs update                            |
| `47df7af` | S4     | Polish & Advanced UX — keyboard shortcuts, sparklines, batch classify |
| `b5c5392` | S4     | docs: update for Sprint 4              |
| TBD       | S5     | Persistence, Onboarding, Accessibility & Mobile |

---

## Possible Sprint 6 scope
- Onboarding tour improvements: highlight actual UI elements (step-by-step spotlight)
- Accessibility deep pass: focus-trap in Dialog/SlideOver, skip-nav for keyboard users
- Mobile layout polish: responsive typography scale, touch-friendly spacing
- Print / PDF export of reports (window.print() + print stylesheet)
- Internationalisation stub (i18n-ready string extraction)
- Design System page: interactive prop playground for each component

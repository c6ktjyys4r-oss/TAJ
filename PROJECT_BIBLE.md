# TAJ Finance — Project Bible

> The authoritative product specification for TAJ Finance.
> All agents must read this before beginning any sprint.

---

## Product Vision

TAJ Finance is a premium financial document management platform for Saudi enterprises. It automates document classification, bank reconciliation, and financial reporting using AI — giving finance teams a single, intelligent workspace.

### Core values
- **Elegance** — White background, gold accents, Playfair + Inter typography. Premium at every interaction.
- **Trust** — Numbers must be accurate. Status must be clear. Nothing should feel hidden.
- **Speed** — The app must feel fast. Transitions smooth, actions immediate.
- **Intelligence** — AI assistance everywhere, never intrusive.

---

## Visual Identity (non-negotiable)

| Token          | Value                                     |
|----------------|-------------------------------------------|
| Background     | `#FFFFFF` white                           |
| Gold 500       | `#C9A84C` — primary accent               |
| Heading font   | Playfair Display (serif)                  |
| Body font      | Inter (sans-serif)                        |
| Border radius  | 8px cards, 12px panels, 16px modals       |
| Shadow         | Subtle, no heavy drop shadows             |
| Dark mode      | NOT required in any sprint                |
| Emojis in UI   | NEVER                                     |

---

## Application Map

| Route            | Page              | Sprint |
|------------------|-------------------|--------|
| `/`              | Dashboard         | 1 ✅   |
| `/documents`     | Documents list    | 1 ✅   |
| `/reports`       | Reports           | 1 ✅   |
| `/bank-matching` | Bank Matching     | 1 ✅   |
| `/ai`            | AI Intelligence   | 1 ✅   |
| `/settings`      | Settings          | 1 ✅   |
| `/design-system` | Design System     | 1 ✅   |

---

## Sprint Plan

### Sprint 1 — Foundation ✅ COMPLETE
See `PROJECT_STATE.md` and `CHANGELOG.md` for details.

### Sprint 2 — Core Workflows
Scope (all UI/mock only, no real backend):

1. **Document Upload Modal** — Drag & drop zone, multi-file, type validation (.pdf .jpg .xlsx .png), simulated progress, success state.
2. **Document Detail Panel** — Slide-over from document table row. Shows filename, type, vendor, date, file size, status badge, classification history, action buttons (Classify, Download, Delete).
3. **Classification Flow** — Modal wizard: Step 1 select document type → Step 2 enter vendor name → Step 3 pick date → Step 4 confirm & submit. Shows AI confidence suggestion on each step.
4. **Notification Center** — Tray from TopBar bell icon. Shows 5–8 notifications with icons, timestamps, mark-all-read button. Unread count badge on bell.
5. **Report Generation Wizard** — Modal: Step 1 pick report type → Step 2 pick date range → Step 3 select banks/accounts → Step 4 confirm. Simulated 2s generation with progress indicator.
6. **Bank Transaction Detail** — Expanded row / slide-over for a pending transaction. Shows raw bank description, amount, suggested match, "Confirm Match", "Enter Manually", "Flag for Review" actions.
7. **Reusable UX Components** — `Tooltip`, `EmptyState`, `Breadcrumbs`, `ProgressBar`, `Tabs` (generic), `StepIndicator`.
8. **Sidebar variant** — Optional collapsible left sidebar for Documents and Reports pages (left nav for sub-sections).

All pages must remain functional. Run `npm run build` before every commit. Zero TypeScript errors.

### Sprint 3 — Data & Filters (future)
- Advanced filtering panel
- Sortable table columns
- Date range picker
- Pagination
- Export to CSV/Excel

### Sprint 4 — Polish & Animation (future)
- Page transition animations
- Skeleton loaders
- Confetti/success animations
- Onboarding tour

---

## What is NEVER built (by design)
- Authentication / login screens
- Real database or API calls
- OCR or real document parsing
- Real LLM/AI integration
- Dark mode
- Business logic / real calculations
- Any backend server code

All data is static/mocked inside components.

---

## Coding standards
- TypeScript strict, zero `any`, zero unused imports
- All components in `src/components/ui/` (primitives) or `src/components/<domain>/`
- Pages in `src/pages/`
- Context in `src/context/`
- Hooks in `src/hooks/`
- Run `npm run build` before every commit
- Commit after every logical milestone (not after every file)
- Update CHANGELOG, PROJECT_STATE, HANDOFF, FILE_INDEX after every sprint

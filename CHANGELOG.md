# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.2.0] — Sprint 2: Core Workflows — 2025-07-16

### Added

#### New UI Primitives
- `Tooltip` — hover tooltip with configurable side (top/bottom/left/right)
- `EmptyState` — centred empty-state with icon, title, description, and optional CTA
- `ProgressBar` — animated progress bar (sm/md/lg, gold/success/info variants)
- `StepIndicator` — numbered step wizard indicator with done/active/pending states
- `Tabs` — generic tab bar (underline + pill variants) with optional count badges; accepts readonly arrays
- `SlideOver` — animated right-side panel with backdrop, keyboard dismiss, footer slot
- `Breadcrumbs` — breadcrumb navigation using React Router links

#### Document Workflows
- `UploadModal` — drag-and-drop file upload: multi-file, type validation (.pdf/.jpg/.png/.xlsx), simulated progress bars, done state
- `DocumentDetailPanel` — slide-over showing document metadata, activity history, Classify / Download / Delete actions
- `ClassificationFlow` — 4-step classification wizard (Type → Vendor → Date → Confirm) with AI confidence suggestions and one-click apply

#### Notification Center
- `NotificationBell` — TopBar bell replaced with live badge showing unread count
- `NotificationCenter` — dropdown tray: mark-all-read, per-notification dismiss, unread dot indicators

#### Report Generation
- `ReportWizard` — 4-step generation wizard (Type → Period → Accounts → Generate) with animated progress bar and download CTA

#### Bank Matching
- `BankTransactionDetail` — slide-over for pending transactions: Confirm Match, Enter Manually (form), Flag for Review actions

#### Hooks
- `useLocalStorage` — generic typed React hook for localStorage persistence

### Changed
- `Documents` page — replaced static tab buttons with generic `Tabs` component; added `UploadModal` wired to Upload button; row click opens `DocumentDetailPanel`; `EmptyState` for empty results
- `Reports` page — Generate Report button opens `ReportWizard`
- `BankMatching` page — pending transaction rows open `BankTransactionDetail` slide-over
- `TopBar` — static bell replaced with `NotificationBell` component

### Project
- `PROJECT_BIBLE.md` created — authoritative product spec and sprint plan for all future agents

---

## [0.1.0] — Sprint 1: Foundation — 2025-07-16

### Added
- **Project scaffold** — Vite + React 18 + TypeScript, Tailwind CSS v3, React Router v6
- **Design system tokens** — Gold palette, ink colours, surface, shadow scale, font families (Inter + Playfair Display)
- **Global CSS** — Font imports, scrollbar styling, utility classes

#### Layout
- `TopBar` — TAJ logo, expandable global search, primary navigation, notification bell, user dropdown
- `AppShell` — Sticky top bar, content area, AI Companion always mounted

#### UI Components
- `Button` — primary / secondary / ghost / danger; sm/md/lg; loading state
- `Card` + `CardHeader`
- `Input` — label, error, hint, leading/trailing icon
- `Badge` — 6 variants, dot indicator
- `Table` — generic typed columns, empty state, row click
- `Dialog` — Escape/backdrop dismiss, size variants, accessible
- `Typography` — PageTitle, SectionTitle, Lead, Caption, GoldText

#### Pages
- Dashboard — Launchpad (6 cards), Recent Activity, AI Suggestions
- Documents, Reports, Bank Matching, AI, Settings, Design System

#### AI Companion
- Floating gold button, chat panel, mock responses, Settings toggle

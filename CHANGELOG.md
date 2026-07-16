# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.3.0] — Sprint 3: Data & Filters — 2025-07-16

### Added

#### New UI Primitives
- `Skeleton` / `SkeletonText` / `SkeletonCard` / `SkeletonRow` / `SkeletonTable` — animated loading placeholders
- `Pagination` — smart ellipsis page buttons with item-count label, prev/next
- `DateRangePicker` — preset buttons (this month / 3 months / quarter / year) + custom from/to date inputs, clear button
- `FilterPanel` — collapsible multi-select filter groups with active count badge and clear-all
- `SortableTable<T>` — generic table with click-header sort (asc/desc), sort icons, full keyboard-accessible
- `AnimatedCounter` — RAF-driven ease-out-cubic counter animation with prefix / suffix / decimals
- `ExportButton` — CSV / XLSX mock download dropdown with done-state feedback

#### Global Search
- `GlobalSearch` — full-screen overlay activated via search bar (Cmd+K visual hint)
- Keyboard navigation: ↑↓ arrows, Enter to navigate, Esc to close
- Full-text search across documents, reports, and transactions
- Quick-jump shortcuts for major sections
- No-results state with query echo

### Changed
- `TopBar` — inline search input replaced with overlay trigger button (opens GlobalSearch)
- `Documents` — upgraded from basic `Table` to `SortableTable`; added `FilterPanel`, `DateRangePicker`, `Pagination`, `ExportButton`; total/filtered count shown in header
- `Dashboard` — new animated stats strip (4 counters: Total, Classified %, This Month, Match Rate)

---

## [0.2.0] — Sprint 2: Core Workflows — 2025-07-16

### Added

#### New UI Primitives
- `Tooltip`, `EmptyState`, `ProgressBar`, `StepIndicator`, `Tabs`, `SlideOver`, `Breadcrumbs`

#### Document Workflows
- `UploadModal`, `DocumentDetailPanel`, `ClassificationFlow`

#### Notification Center
- `NotificationBell`, `NotificationCenter` tray

#### Report Generation
- `ReportWizard`

#### Bank Matching
- `BankTransactionDetail`

#### Hooks
- `useLocalStorage`

### Changed
- `Documents`, `Reports`, `BankMatching` pages — wired to Sprint 2 components
- `TopBar` — static bell → `NotificationBell`

### Project
- `PROJECT_BIBLE.md` created

---

## [0.1.0] — Sprint 1: Foundation — 2025-07-16

### Added
- Vite + React 18 + TypeScript, Tailwind CSS v3, React Router v6
- Design tokens — gold palette, ink colours, shadows, fonts (Inter + Playfair Display)
- Layout: `TopBar`, `AppShell`
- UI: `Button`, `Card`, `Input`, `Badge`, `Table`, `Dialog`, `Typography`
- Pages: Dashboard, Documents, Reports, Bank Matching, AI, Settings, Design System
- AI Companion: floating chat, mock responses, Settings toggle

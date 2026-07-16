# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.4.0] — Sprint 4: Polish & Advanced UX — 2025-07-16

### Added

#### Keyboard Navigation
- `KeyboardShortcuts` — overlay with full shortcut reference (press `?` to open/close)
- `ShortcutsButton` — fixed bottom-left trigger, always mounted in AppShell
- `AppShell` — global `g+d/o/r/b/s` navigation shortcuts (go to Dashboard/Documents/Reports/Bank/Settings)

#### Spend Chart
- `SpendChart` — SVG sparklines per spend category (cubic bezier path, translucent fill + stroke), mounted in Dashboard

#### Batch Classify
- `BatchClassifyBar` — floating selection bar: type dropdown classify, done-state feedback, clear selection
- Documents page gains checkbox column + multi-select state; bar appears when any row selected

### Changed
- `Dashboard` — 3-column bottom row: Activity + AI Suggestions + SpendChart
- `Reports` — `SortableTable` + `FilterPanel` (type/status) + `AnimatedCounter` stats + `ExportButton`
- `BankMatching` — `SortableTable` for pending transactions (sort by date/amount/bank) + `AnimatedCounter` stats + Review button per row
- `AppShell` — `ShortcutsButton` mounted at shell level; keyboard nav shortcuts registered globally

---

## [0.3.0] — Sprint 3: Data & Filters — 2025-07-16

### Added
- `Skeleton` family, `Pagination`, `DateRangePicker`, `FilterPanel`, `SortableTable`, `AnimatedCounter`, `ExportButton`
- `GlobalSearch` — Cmd+K overlay, keyboard nav (↑↓ Enter Esc), full-text + quick jump

### Changed
- `TopBar` — search trigger opens GlobalSearch
- `Documents` — SortableTable, FilterPanel, DateRangePicker, Pagination, ExportButton
- `Dashboard` — animated stats strip

---

## [0.2.0] — Sprint 2: Core Workflows — 2025-07-16

### Added
- `Tooltip`, `EmptyState`, `ProgressBar`, `StepIndicator`, `Tabs`, `SlideOver`, `Breadcrumbs`
- `UploadModal`, `DocumentDetailPanel`, `ClassificationFlow`
- `NotificationBell` + `NotificationCenter` tray
- `ReportWizard`
- `BankTransactionDetail`
- `useLocalStorage`
- `PROJECT_BIBLE.md`

### Changed
- Documents, Reports, BankMatching pages wired to Sprint 2 components
- TopBar: static bell → `NotificationBell`

---

## [0.1.0] — Sprint 1: Foundation — 2025-07-16

### Added
- Vite + React 18 + TypeScript, Tailwind CSS v3, React Router v6
- Design tokens — gold palette, ink colours, shadows, fonts
- Layout: `TopBar`, `AppShell`
- UI: `Button`, `Card`, `Input`, `Badge`, `Table`, `Dialog`, `Typography`
- Pages: Dashboard, Documents, Reports, Bank Matching, AI, Settings, Design System
- AI Companion: floating chat, mock responses, Settings toggle

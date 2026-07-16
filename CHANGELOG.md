# Changelog

All notable changes to TAJ Finance are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

## [0.1.0] — Sprint 1: Foundation — 2025-07-16

### Added
- **Project scaffold** — Vite + React 18 + TypeScript, Tailwind CSS v3, React Router v6
- **Design system tokens** — Gold palette (50–900), ink colours, surface colours, shadow scale, font families (Inter + Playfair Display)
- **Global CSS** — Font imports, scrollbar styling, `gold-divider`, `nav-link` / `nav-link.active` utilities

#### Layout
- `TopBar` — TAJ logo, expandable global search, primary navigation links, notification bell, user dropdown menu
- `AppShell` — Sticky top bar, full-width content area, AI Companion always mounted

#### UI Components (Design System)
- `Button` — variants: primary / secondary / ghost / danger; sizes: sm / md / lg; loading state; icon support
- `Card` + `CardHeader` — hover variant, padding scale (none / sm / md / lg)
- `Input` — label, error, hint, leading icon, trailing icon
- `Badge` — variants: default / gold / success / warning / danger / info; dot indicator
- `Table` — generic typed columns, empty state, row click handler
- `Dialog` — keyboard dismiss (Escape), backdrop click, size variants, accessible aria attributes
- `Typography` — `PageTitle`, `SectionTitle`, `Lead`, `Caption`, `GoldText`

#### Pages
- **Dashboard** (`/`) — Launchpad grid (6 cards: Documents, Unclassified, Bank Matching, Reports, AI Assistant, Settings), Recent Activity feed, AI Suggestions panel
- **Documents** (`/documents`) — Tab filtering, search, document table with type/status badges
- **Reports** (`/reports`) — Stats row, report list with download actions, generate button
- **Bank Matching** (`/bank-matching`) — Statement cards with progress bars, pending-transaction review panel
- **AI** (`/ai`) — Capability cards (active / coming soon), stats counters
- **Settings** (`/settings`) — Sidebar navigation; General, AI & Automation, Notifications, Appearance panels with live toggles
- **Design System** (`/design-system`) — Full component showcase: colours, typography, buttons, badges, inputs, table, dialog, spacing

#### AI Companion
- Floating gold button (bottom-right)
- Chat panel — mock responses based on keyword matching
- Controlled by Settings context (`aiCompanionEnabled`)
- Never navigates away from current page

#### Context
- `SettingsContext` — `aiCompanionEnabled` state shared across app

### Infrastructure
- `tailwind.config.js` — extended theme with custom colour tokens
- `postcss.config.js` — Tailwind + Autoprefixer
- `vite.config.ts` — React plugin, sourcemaps
- `public/favicon.svg` — Gold-T mark

# TAJ Finance — Handoff Document

> For any agent or developer picking up this project.
> Last updated: 2025-07-16 — Sprint 10 complete.

---

## How to run

```bash
npm install
npm run dev        # dev server (SW disabled in dev)
npm run build      # production build → dist/
npm run preview    # serve production (SW active — test PWA install, offline, update)
```

---

## Architecture overview

- **Code split** — every page is `React.lazy`. Initial load ~298 KB. Pages load on demand.
- **ErrorBoundary** — wraps full route tree; any render crash shows recovery UI.
- **RTL** — `isRTL` in `SettingsContext` sets `document.documentElement.dir` + `lang`.
- **SW update** — `UpdateBanner` sends `SKIP_WAITING`; `controllerchange` reloads.
- **Swipe** — `SlideOver` right-swipe (≥80px) closes; `OnboardingTour` left/right swipe navigates steps.
- **Focus trap** — `useFocusTrap` locks Tab/Shift+Tab inside `Dialog` and `SlideOver`; focus restored to triggering element on close.
- **i18n** — `src/i18n/locales.ts` maps EN+AR strings; `useT()` hook selects locale from `isRTL`.
- **IntersectionObserver** — `AnimatedCounter` defers animation until element is 20% in viewport.
- **Settings portability** — `exportSettings()` downloads `taj-settings.json`; `importSettings(json)` reads and applies it.
- **Drag-to-reorder** — Documents page "Reorder" mode uses HTML5 DnD; `docOrder` state maintains order during session.

---

## Hooks reference

| Hook                 | File                          | Purpose                                                            |
|----------------------|-------------------------------|--------------------------------------------------------------------|
| `useLocalStorage`    | `hooks/useLocalStorage.ts`    | Generic typed localStorage getter/setter                          |
| `usePWAInstall`      | `hooks/usePWAInstall.ts`      | beforeinstallprompt intercept + standalone detection              |
| `useNotifications`   | `hooks/useNotifications.ts`   | Notification API: permission, requestPermission, notify           |
| `useFocusTrap`       | `hooks/useFocusTrap.ts`       | Focus loop inside container; restores prior focus on deactivation |
| `useT`               | `hooks/useT.ts`               | `t(key)` — resolves EN/AR locale string from `src/i18n/locales.ts`|

---

## Key decisions & gotchas

1. **verbatimModuleSyntax** — `import type` for type-only imports.
2. **SortableTable** preferred over basic `Table`.
3. **Prop gotchas** — `Tooltip` → `side`; `ProgressBar` → `variant`; `Breadcrumbs` → `crumbs`.
4. **Focus trap** — `useFocusTrap(ref, open)` — pass the container ref and an `active` bool. Implemented in `Dialog` and `SlideOver`; add to any new modal.
5. **Code splitting** — new pages must be added as `React.lazy` in `App.tsx`.
6. **RTL** — `Tailwind rtl:` variants work when `dir="rtl"` is on `<html>`. `useT` returns Arabic strings automatically.
7. **i18n** — add ALL new UI strings to `src/i18n/locales.ts` in both `en` and `ar` before use. Use `useT` hook to retrieve. Never hardcode user-facing strings in components.
8. **Tab persistence** — Documents `activeTab` persisted via `useLocalStorage('taj_docs_tab')`.
9. **AnimatedCounter** — only starts animating when ≥20% visible. Safe to place in any off-screen section.
10. **SW disabled in dev** — `devOptions.enabled: false`. Use `npm run preview` for full PWA.
11. **Notification flow** — `useNotifications` hook; request in Settings → Notifications.
12. **Print CSS** — `no-print` class hides elements from print; `print-report` class is shown only when printing; `@page` rule sets A4 size.
13. **Settings export/import** — format is `{ version: 1, exported: ISO-string, settings: { ... } }`. Version must be `1` or import is rejected.
14. **DateRange type** — fields are `from` and `to` (NOT `start` / `end`). See `DateRangePicker.tsx`.
15. **Button component** — has no `as` prop. For trigger-label patterns, place the `<input>` adjacent and call `.click()` from the button's `onClick`.

---

## File structure (abbreviated)

```
src/
├── App.tsx                    # ErrorBoundary + Suspense + lazy routes
├── index.css                  # Tailwind + touch + PWA + safe-area + @media print
├── i18n/locales.ts            # EN + AR locale map — 80+ keys
├── context/SettingsContext.tsx # AI + notifications + RTL + exportSettings + importSettings
├── hooks/
│   ├── useLocalStorage.ts
│   ├── usePWAInstall.ts
│   ├── useNotifications.ts
│   ├── useFocusTrap.ts
│   └── useT.ts
├── components/
│   ├── error/ErrorBoundary.tsx
│   ├── layout/ (AppShell, TopBar [useT], MobileBottomNav [useT])
│   ├── onboarding/OnboardingTour.tsx
│   ├── pwa/ (OfflineBanner [useT], UpdateBanner [useT])
│   ├── ui/ (full design system)
│   └── documents/ (UploadModal [useT], DocumentDetailPanel, ClassificationFlow, BatchClassifyBar)
└── pages/
    ├── Dashboard.tsx  [useT]
    ├── Documents.tsx  [useT + drag-to-reorder]
    ├── Reports.tsx    [useT + print layout]
    ├── BankMatching.tsx [useT]
    ├── AI.tsx         [useT]
    ├── Settings.tsx   [useT + export/import]
    └── DesignSystem.tsx
```

---

## For next agent
1. Read `PROJECT_BIBLE.md` + `PROJECT_STATE.md`.
2. `npm run build` before every commit — 0 errors required.
3. Add new UI strings to `src/i18n/locales.ts` in both `en` and `ar`.
4. New pages → add as `React.lazy` in `App.tsx`.
5. New modals → add `useFocusTrap`.
6. DateRange fields are `from`/`to` — never `start`/`end`.
7. Update all 4 doc files after every sprint.

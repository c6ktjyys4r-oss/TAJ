# TAJ Finance — Project State

> Last updated: 2025-07-16
> Current sprint: **Sprint 10 — i18n Wiring, Data Portability & Advanced UX** ✅ COMPLETE

---

## Status

| Area                              | Status    | Notes                                                                  |
|-----------------------------------|-----------|------------------------------------------------------------------------|
| Project scaffold                  | ✅ Done   | Vite + React + TS + Tailwind                                           |
| Design system                     | ✅ Done   | Full Sprint 1–4 primitives + showcase page                            |
| All pages                         | ✅ Done   | 7 pages, all lazy-loaded via React.lazy                               |
| AI Companion, Global Search       | ✅ Done   |                                                                        |
| Keyboard Shortcuts, Batch Classify| ✅ Done   |                                                                        |
| Persistent state                  | ✅ Done   | AI companion + notifications + RTL + docs tab via localStorage         |
| Onboarding tour                   | ✅ Done   | 5-step with swipe navigation                                           |
| Accessibility                     | ✅ Done   | Skip-to-main, ARIA, focus-visible, focus trap in Dialog+SlideOver     |
| Mobile responsive                 | ✅ Done   | Hamburger drawer, MobileBottomNav                                      |
| PWA — manifest + SW               | ✅ Done   | Workbox generateSW, 34-entry precache                                  |
| PWA — icons + meta tags           | ✅ Done   |                                                                        |
| Camera upload                     | ✅ Done   | `capture=environment` in UploadModal (mobile)                         |
| Offline + Update banners          | ✅ Done   | OfflineBanner + UpdateBanner (SKIP_WAITING)                           |
| Touch optimisation                | ✅ Done   | tap-highlight removed, safe-area insets, .touch-target                |
| PWA install prompt                | ✅ Done   | `usePWAInstall` + gold Install button                                 |
| Share API                         | ✅ Done   | `navigator.share()` on DocumentDetailPanel                            |
| Notification API                  | ✅ Done   | `useNotifications` + Settings permission UI                           |
| Document viewer                   | ✅ Done   | Full-screen viewer modal                                               |
| Print stylesheet                  | ✅ Done   | @media print in index.css                                             |
| Code splitting                    | ✅ Done   | React.lazy + Suspense; ~298 KB main bundle                            |
| Error boundary                    | ✅ Done   | Global class-based; reload button                                     |
| RTL / Arabic layout               | ✅ Done   | `isRTL` toggle; sets dir+lang on html element                         |
| SW update banner                  | ✅ Done   | SKIP_WAITING on accept                                                |
| Swipe gestures                    | ✅ Done   | SlideOver + OnboardingTour                                            |
| SkeletonPage                      | ✅ Done   | Suspense fallback                                                     |
| Focus trap                        | ✅ Done   | `useFocusTrap` in Dialog + SlideOver; restores focus on close         |
| IntersectionObserver counters     | ✅ Done   | AnimatedCounter defers RAF until element enters viewport              |
| i18n foundation                   | ✅ Done   | `src/i18n/locales.ts` EN+AR; `useT` hook for string resolution        |
| Tab persistence                   | ✅ Done   | Documents activeTab persisted via `useLocalStorage('taj_docs_tab')`   |
| **i18n full wiring**              | ✅ Done   | All pages + layout + components use `useT()`; 80+ locale keys         |
| **Settings export/import**        | ✅ Done   | JSON download + file import; versioned format; inline status feedback  |
| **Drag-to-reorder**               | ✅ Done   | HTML5 DnD on Documents; GripVertical handle; gold drop-target         |
| **Reports print layout**          | ✅ Done   | `PrintableReport` component; A4 CSS; TAJ header + page numbers        |
| Build passing                     | ✅ Done   | 0 TypeScript errors                                                   |

---

## NOT implemented (by design)
- Authentication / login; real backend; real OCR/AI/LLM; dark mode; native apps

---

## Tech stack

| Layer    | Tech                                         |
|----------|----------------------------------------------|
| Frontend | React 18, TypeScript, Vite 6                 |
| Styling  | Tailwind CSS v3, Inter + Playfair Display    |
| Routing  | React Router v6                              |
| Icons    | Lucide React                                 |
| PWA      | vite-plugin-pwa + Workbox                   |
| i18n     | Custom locale map + useT hook               |
| Utils    | clsx                                         |

---

## Possible Sprint 11 scope
- Performance: image lazy loading with Intersection Observer; bundle analysis with rollup-plugin-visualizer
- Document upload to object storage — integrate App Storage skill for real file persistence
- Drag-to-reorder persistence — save `docOrder` to localStorage so custom order survives page reload
- Charts export — print/export the SpendChart SVG or canvas snapshot
- Keyboard navigation in Documents drag-reorder mode (arrow keys to move rows)
- Onboarding tour i18n — wire `useT` inside OnboardingTour steps
- DesignSystem page i18n — wire `useT` in DesignSystem showcase
- BACKLOG review — address any items recorded in BACKLOG.md

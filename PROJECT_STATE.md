# TAJ Finance — Project State

> Last updated: 2025-07-16
> Current sprint: **Sprint 9 — Accessibility, Performance & i18n** ✅ COMPLETE

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
| Accessibility                     | ✅ Done   | Skip-to-main, ARIA, focus-visible, **focus trap** in Dialog+SlideOver |
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
| Code splitting                    | ✅ Done   | React.lazy + Suspense; ~280 KB main bundle                            |
| Error boundary                    | ✅ Done   | Global class-based; reload button                                     |
| RTL / Arabic layout               | ✅ Done   | `isRTL` toggle; sets dir+lang on html element                         |
| SW update banner                  | ✅ Done   | SKIP_WAITING on accept                                                |
| Swipe gestures                    | ✅ Done   | SlideOver + OnboardingTour                                            |
| SkeletonPage                      | ✅ Done   | Suspense fallback                                                     |
| **Focus trap**                    | ✅ Done   | `useFocusTrap` in Dialog + SlideOver; restores focus on close         |
| **IntersectionObserver counters** | ✅ Done   | AnimatedCounter defers RAF until element enters viewport              |
| **i18n foundation**               | ✅ Done   | `src/i18n/locales.ts` EN+AR; `useT` hook for string resolution        |
| **Tab persistence**               | ✅ Done   | Documents activeTab persisted via `useLocalStorage('taj_docs_tab')`   |
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

## Possible Sprint 10 scope
- Wire `useT` hook throughout UI — replace hardcoded English strings with `t('key')` calls across all pages and components
- Report print layout — dedicated `@media print` component for Reports page with TAJ header, page numbers, generation date footer
- Document upload to object storage — integrate App Storage skill for real file persistence
- Performance: image lazy loading with Intersection Observer; bundle analysis
- Drag-to-reorder — drag-and-drop row reordering in Documents table via native HTML5 drag events
- Settings export/import — JSON export of user preferences; import to restore on new device

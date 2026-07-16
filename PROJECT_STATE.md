# TAJ Finance — Project State

> Last updated: 2025-07-16
> Current sprint: **Sprint 8 — Performance, RTL & Resilience** ✅ COMPLETE

---

## Status

| Area                          | Status    | Notes                                                                |
|-------------------------------|-----------|----------------------------------------------------------------------|
| Project scaffold              | ✅ Done   | Vite + React + TS + Tailwind                                         |
| Design system                 | ✅ Done   | Full Sprint 1–4 primitives + showcase page                          |
| Global layout                 | ✅ Done   | TopBar, AppShell, MobileBottomNav, OfflineBanner, UpdateBanner       |
| All pages                     | ✅ Done   | Dashboard, Documents, Reports, BankMatching, AI, Settings, DesignSystem |
| AI Companion                  | ✅ Done   | Floating chat, mock responses                                        |
| Global Search                 | ✅ Done   | Cmd+K overlay                                                        |
| Keyboard Shortcuts            | ✅ Done   | ? overlay, g+X nav                                                   |
| Batch Classify                | ✅ Done   | Checkbox + floating bar                                              |
| Persistent state              | ✅ Done   | AI companion + notifications + RTL via localStorage                  |
| Onboarding tour               | ✅ Done   | 5-step first-run modal + swipe navigation                            |
| Accessibility                 | ✅ Done   | Skip-to-main, ARIA labels, focus-visible                            |
| Mobile responsive             | ✅ Done   | Hamburger drawer, MobileBottomNav                                    |
| PWA — manifest + SW           | ✅ Done   | Workbox generateSW, precache, font cache                             |
| PWA — icons                   | ✅ Done   | 192px, 512px maskable, 180px apple-touch-icon                       |
| PWA — meta tags               | ✅ Done   | theme-color, apple-*, viewport-fit=cover                            |
| Camera upload                 | ✅ Done   | `capture=environment` in UploadModal (mobile)                       |
| Offline indicator             | ✅ Done   | OfflineBanner with online/offline events                            |
| Touch optimisation            | ✅ Done   | tap-highlight removed, safe-area insets, .touch-target              |
| PWA install prompt            | ✅ Done   | `usePWAInstall` + gold Install button in TopBar                     |
| Share API                     | ✅ Done   | `navigator.share()` on DocumentDetailPanel + viewer                 |
| Notification API              | ✅ Done   | `useNotifications` hook; permission UI in Settings                  |
| Document viewer               | ✅ Done   | Full-screen viewer modal                                             |
| Print stylesheet              | ✅ Done   | @media print rules in index.css                                     |
| **Code splitting**            | ✅ Done   | React.lazy + Suspense; main bundle ~280 KB (was ~370 KB)            |
| **Error boundary**            | ✅ Done   | Global ErrorBoundary with reload button wraps Routes tree           |
| **RTL / Arabic layout**       | ✅ Done   | `isRTL` toggle in Settings → Appearance; sets dir + lang on html    |
| **SW update banner**          | ✅ Done   | `UpdateBanner` watches for waiting SW; SKIP_WAITING on accept       |
| **Swipe gestures**            | ✅ Done   | SlideOver swipe-to-dismiss; OnboardingTour swipe navigation         |
| **SkeletonPage**              | ✅ Done   | Full-page loading skeleton used as Suspense fallback                |
| Build passing                 | ✅ Done   | 0 TypeScript errors; 34 precached entries                           |

---

## NOT implemented (by design)
- Authentication / login
- Real database / backend
- Real OCR / AI / LLM integration
- Dark mode
- Native iOS / Android apps (PWA-first by design)

---

## Tech stack

| Layer    | Tech                                         |
|----------|----------------------------------------------|
| Frontend | React 18, TypeScript, Vite 6                 |
| Styling  | Tailwind CSS v3, Inter + Playfair Display    |
| Routing  | React Router v6                              |
| Icons    | Lucide React                                 |
| PWA      | vite-plugin-pwa + Workbox                   |
| Utils    | clsx                                         |

---

## Possible Sprint 9 scope
- Report print view — dedicated print layout: TAJ header, page numbers, footer with date
- Tab/panel state persistence — remember active tab/filter across navigation via localStorage
- Focus trap — keyboard focus locked inside Dialog and SlideOver when open
- Document upload to real storage — App Storage (object storage) for uploaded files
- Performance: image lazy loading, intersection observer for AnimatedCounter
- i18n foundation — extract all UI strings to a locale map; bilingual English/Arabic labels
- Drag-to-reorder — drag-and-drop row reordering in Documents table

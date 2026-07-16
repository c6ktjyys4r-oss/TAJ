# TAJ Finance — Project State

> Last updated: 2025-07-16
> Current sprint: **Sprint 7 — PWA Advanced Features** ✅ COMPLETE

---

## Status

| Area                        | Status    | Notes                                                              |
|-----------------------------|-----------|--------------------------------------------------------------------|
| Project scaffold            | ✅ Done   | Vite + React + TS + Tailwind                                       |
| Design system               | ✅ Done   | Full Sprint 1–4 primitives + showcase page                        |
| Global layout               | ✅ Done   | TopBar, AppShell, MobileBottomNav, OfflineBanner                  |
| All pages                   | ✅ Done   | Dashboard, Documents, Reports, BankMatching, AI, Settings, DesignSystem |
| AI Companion                | ✅ Done   | Floating chat, mock responses                                      |
| Global Search               | ✅ Done   | Cmd+K overlay                                                      |
| Keyboard Shortcuts          | ✅ Done   | ? overlay, g+X nav                                                 |
| Batch Classify              | ✅ Done   | Checkbox + floating bar                                            |
| Persistent state            | ✅ Done   | AI companion + notifications via localStorage                      |
| Onboarding tour             | ✅ Done   | 5-step first-run modal                                             |
| Accessibility               | ✅ Done   | Skip-to-main, ARIA labels, focus-visible                          |
| Mobile responsive           | ✅ Done   | Hamburger drawer, MobileBottomNav                                  |
| PWA — manifest + SW         | ✅ Done   | Workbox generateSW, 14-entry precache, font cache                  |
| PWA — icons                 | ✅ Done   | 192px, 512px maskable, 180px apple-touch-icon                     |
| PWA — meta tags             | ✅ Done   | theme-color, apple-*, viewport-fit=cover                          |
| Camera upload               | ✅ Done   | `capture=environment` in UploadModal (mobile)                     |
| Offline indicator           | ✅ Done   | OfflineBanner with online/offline events                          |
| Touch optimisation          | ✅ Done   | tap-highlight removed, safe-area insets, .touch-target            |
| **PWA install prompt**      | ✅ Done   | `usePWAInstall` + gold Install button in TopBar                   |
| **Share API**               | ✅ Done   | `navigator.share()` on DocumentDetailPanel + full-screen viewer    |
| **Notification API**        | ✅ Done   | `useNotifications` hook; permission UI in Settings; classify trigger |
| **Document viewer**         | ✅ Done   | Full-screen viewer modal with share + download; expand on hover    |
| **Print stylesheet**        | ✅ Done   | @media print: hides UI chrome, table styles, page-break utilities  |
| Build passing               | ✅ Done   | 0 TypeScript errors                                                |

---

## NOT implemented (by design)
- Authentication / login
- Database / real persistence (localStorage for UI prefs only)
- Real OCR / AI / LLM integration
- Real backend / API
- Dark mode
- Native iOS / Android apps (PWA replaces native — by design per PWA Strategy doc)

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

## Git history (main)
| Commit    | Sprint | Description                              |
|-----------|--------|------------------------------------------|
| `101e506` | S1     | Foundation                               |
| `695cb79` | S2     | Core Workflows                           |
| `101609e` | S3     | Data & Filters                           |
| `47df7af` | S4     | Polish & Advanced UX                     |
| `823536f` | S5     | Persistence, Onboarding, Accessibility & Mobile |
| `18bd903` | S6     | Progressive Web App                      |
| TBD       | S7     | PWA Advanced Features                    |

---

## Possible Sprint 8 scope
- Arabic / RTL support — `dir="rtl"` toggle, RTL-aware Tailwind utilities, bilingual labels
- Report print view — dedicated print layout for Reports page (TAJ header, page numbers, footer)
- Document upload to real storage — App Storage (object storage) integration
- Swipe gestures — swipe-to-dismiss SlideOver on mobile; swipe navigation in onboarding tour
- App update banner — `vite-plugin-pwa` `useRegisterSW` hook; notify user when new version available
- Performance — code-split pages via React.lazy + Suspense; skeleton placeholders during load
- Error boundary — global React ErrorBoundary with fallback UI and reload button

# TAJ Finance — Project State

> Last updated: 2025-07-16
> Current sprint: **Sprint 6 — Progressive Web App** ✅ COMPLETE

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
| **PWA — manifest**          | ✅ Done   | `manifest.webmanifest` with full metadata + icons                  |
| **PWA — service worker**    | ✅ Done   | Workbox generateSW, 14-entry precache, font runtime cache          |
| **PWA — icons**             | ✅ Done   | 192px, 512px, 512px maskable, 180px apple-touch-icon               |
| **PWA — meta tags**         | ✅ Done   | theme-color, apple-mobile-web-app-*, viewport-fit=cover            |
| **Camera upload**           | ✅ Done   | Mobile "Take a photo" button in UploadModal (capture=environment)  |
| **Offline indicator**       | ✅ Done   | OfflineBanner with online/offline event listeners                  |
| **Touch optimisation**      | ✅ Done   | tap-highlight removed, 300ms delay eliminated, safe-area insets    |
| Build passing               | ✅ Done   | 0 TypeScript errors; SW + manifest generated                       |

---

## NOT implemented (by design)
- Authentication / login
- Database / real persistence (localStorage for UI prefs only)
- Real OCR / AI / LLM integration
- Real backend / API
- Dark mode
- Native iOS / Android apps (PWA replaces native — by design)

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
| `d92a49e` | S2     | docs                                     |
| `101609e` | S3     | Data & Filters                           |
| `a393e94` | S3     | docs                                     |
| `47df7af` | S4     | Polish & Advanced UX                     |
| `b5c5392` | S4     | docs                                     |
| `823536f` | S5     | Persistence, Onboarding, Accessibility & Mobile |
| TBD       | S6     | Progressive Web App                      |

---

## Possible Sprint 7 scope
- Install prompt UI — `BeforeInstallPromptEvent` intercept + gold "Install App" button in TopBar
- Print stylesheet — `@media print` CSS for reports and documents
- Document viewer — full-screen mobile viewer for uploaded documents (image zoom, PDF embed)
- Share API — native Web Share API on document detail panel
- Notification API — request permission + show push notifications on classify complete
- i18n / Arabic RTL — right-to-left layout support (dir="rtl") for Saudi Arabic users

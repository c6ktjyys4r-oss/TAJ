# TAJ Finance

    **Financial Document Management Platform for Saudi Enterprises**

    > Automates document classification, bank reconciliation, and financial reporting using AI.

    ---

    ## Current State

    | Layer | Status | URL |
    |---|---|---|
    | Frontend | ✅ Live | https://taj-finance.onrender.com |
    | Backend | ❌ Not created | Sprint 1 required |
    | Database | ✅ Available | PostgreSQL 18, Render Virginia (alba-db) |

    The frontend is fully built (10 sprints of UI, all 7 pages, PWA-ready) but runs on mock data. Sprint 1 creates the backend foundation.

    ---

    ## Project Documentation

    | Document | Purpose |
    |---|---|
    | `ROADMAP.md` | Beta Sprint 1–7 plan — **single source of truth for future development** |
    | `GOVERNANCE.md` | Permanent development rules, architecture principles, handoff template |
    | `PROJECT_BIBLE.md` | Product vision, visual identity, technology stack |
    | `HANDOFF.md` | Latest session handoff — start here when picking up the project |

    ---

    ## Repository Structure

    ```
    TAJ/
    ├── src/                  # React frontend (Vite + TypeScript)
    │   ├── components/       # UI component library
    │   ├── pages/            # 7 route pages (all lazy-loaded)
    │   ├── context/          # SettingsContext (localStorage)
    │   ├── hooks/            # useLocalStorage, useT, usePWAInstall, ...
    │   └── i18n/             # EN + AR locale strings
    ├── public/               # Static assets, PWA icons
    ├── server/               # Backend — to be created in Sprint 1
    ├── render.yaml           # Render service configuration
    ├── ROADMAP.md            # Beta roadmap
    ├── GOVERNANCE.md         # Development rules and architecture principles
    ├── PROJECT_BIBLE.md      # Product vision and stack reference
    └── HANDOFF.md            # Latest session handoff
    ```

    ---

    ## Frontend Development

    ```bash
    npm install
    npm run dev        # dev server
    npm run build      # production build → dist/
    npm run preview    # serve production build (PWA active)
    ```

    ---

    ## Backend (Sprint 1)

    The backend will live in `server/`. See `ROADMAP.md` Sprint 1 and `GOVERNANCE.md` §7 for the full setup plan and required environment variables.

    ---

    ## Deployment

    | Service | Platform | Config |
    |---|---|---|
    | Frontend | Render Static Site | `render.yaml` |
    | Backend | Render Web Service — rootDir: `server/` | `render.yaml` (Sprint 1) |
    | Database | Render PostgreSQL (alba-db) | Managed |

    Auto-deploy on frontend: pushing to `main` triggers a deploy automatically.
    
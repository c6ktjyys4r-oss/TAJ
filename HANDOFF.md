# TAJ Finance — Handoff

    > For any agent or developer picking up this project.
    > Last updated: 2026-07-17

    ---

    ## How to Use This File

    This file always contains the most recent session handoff.
    At the end of every sprint or session, overwrite it with a new handoff following the template in `GOVERNANCE.md` §6.

    ---

    ## Current Session Record

    **Session date:** 2026-07-17
    **Sprint:** Pre-Sprint 1 — Documentation and Governance
    **Status:** COMPLETE

    ---

    ## Architecture State

    TAJ Finance is currently a frontend-only application. The React + Vite + TypeScript frontend is deployed as a Render Static Site at `https://taj-finance.onrender.com`. All 7 pages run on mock/localStorage data. No backend connection exists anywhere in the codebase.

    A PostgreSQL 18 database (`alba-db`, ID: `dpg-d8hlj3ojo6nc73cc37qg-a`) is provisioned on Render (Virginia region) and is healthy. The database is empty — no tables or schema exist yet.

    There is an unrelated orphaned Render web service named "Alba" (`srv-d8gskvurnols73c3pm30`) pointing to a deleted GitHub repo. It uses a Neon database unrelated to TAJ. Ignore it entirely.

    ---

    ## What Changed This Session

    - Created `ROADMAP.md` — Beta Sprint 1–7 plan, now the single source of truth for future development
    - Created `GOVERNANCE.md` — Permanent rules, architecture principles, core domain model, handoff template, env var registry, Render service registry
    - Updated `PROJECT_BIBLE.md` — Document-first vision, current system state, corrected technology stack
    - Updated `HANDOFF.md` — This file, restructured to match governance template
    - Updated `README.md` — Reflects current state, links to governance docs

    ---

    ## Database State

    | Table | Status | Notes |
    |---|---|---|
    | *(none)* | Not created | Sprint 1 creates the initial schema via Drizzle migration |

    ---

    ## APIs Added

    None. No backend exists yet.

    ---

    ## Remaining Work

    - [ ] Sprint 1: Create `server/` directory with Express + TypeScript + Drizzle + Zod + Pino
    - [ ] Sprint 1: Write initial Drizzle migration (documents table)
    - [ ] Sprint 1: Implement `GET /api/health` returning `{ status, db, timestamp }`
    - [ ] Sprint 1: Update `render.yaml` with a web service entry (rootDir: `server`)
    - [ ] Sprint 1: Create Render Web Service `taj-finance-api` linked to `server/`
    - [ ] Sprint 1: Set `VITE_API_URL` on the static site after backend URL is known

    ---

    ## Next Recommended Task

    **Begin Sprint 1 — Backend Foundation.**

    Create `server/` in the repository root containing:

    ```
    server/
    ├── package.json        (Node 22, pnpm, express, drizzle-orm, pg, zod, pino, typescript)
    ├── tsconfig.json       (module: CommonJS, outDir: dist, strict: true)
    └── src/
      ├── index.ts        (Express app, listens on process.env.PORT)
      ├── config.ts       (Zod env validation — exits if DATABASE_URL or CORS_ORIGIN missing)
      ├── db.ts           (Drizzle + pg Pool from DATABASE_URL)
      └── routes/
          └── health.ts   (GET /api/health → { status: "ok", db: "connected", timestamp })
    ```

    Then add a `web` service entry to `render.yaml` with `rootDir: server`.

    Full environment variable requirements: `GOVERNANCE.md` §7.
    Full sprint scope: `ROADMAP.md` Sprint 1.

    ---

    ## Risks and Known Issues

    | Risk | Detail |
    |---|---|
    | DATABASE_URL hostname | The URL on the static site uses the **external** hostname. The backend must use the **internal** hostname: `dpg-d8hlj3ojo6nc73cc37qg-a.internal`. Obtain the full internal URL from the Render database dashboard before creating the web service. |
    | render.yaml scope | Currently declares only the static site. Adding the backend requires a new `web` service block. Auto-deploy will trigger on push to `main` once configured. |
    | Empty database | No schema exists. The Drizzle migration must run before any endpoint other than `/api/health` can return real data. |
    | CORS | The backend must set `CORS_ORIGIN=https://taj-finance.onrender.com`. Without it, the frontend cannot call the API. |

    ---

    ## Verification Status

    | Check | Status |
    |---|---|
    | Frontend deployed and live | ✅ https://taj-finance.onrender.com |
    | Database available | ✅ alba-db, PostgreSQL 18, Virginia |
    | ROADMAP.md created | ✅ |
    | GOVERNANCE.md created | ✅ |
    | PROJECT_BIBLE.md updated | ✅ |
    | GitHub up to date | ✅ (this commit) |
    | Backend exists | ❌ Sprint 1 required |
    | Any API endpoint live | ❌ Sprint 1 required |
    | Database schema exists | ❌ Sprint 1 required |
    
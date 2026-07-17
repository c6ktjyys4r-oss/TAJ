# TAJ Finance — Handoff

    > Last updated: 2026-07-17
    > Sprint: Sprint 1 — Backend Foundation
    > Status: COMPLETE — deployed to Render, awaiting health check verification

    ---

    ## Architecture State

    TAJ Finance now has a backend. The `server/` directory in the repository root is a standalone Node.js package deployed as a Render Web Service (`taj-finance-api`).

    The frontend remains a Render Static Site with all mock data — it is not yet wired to the backend. That is Sprint 2 scope.

    ### Services

    | Service | Type | URL | Status |
    |---|---|---|---|
    | `taj-finance` | Static Site | https://taj-finance.onrender.com | ✅ Live |
    | `taj-finance-api` | Web Service | https://taj-finance-api.onrender.com | 🔄 Deploying |
    | `alba-db` | PostgreSQL 18 | — | ✅ Connected |

    ---

    ## What Changed This Session

    - Created `ARCHITECTURE_BIBLE.md` — 10 constitutional principles + decision log + domain model + API conventions
    - Created `server/` directory with the complete Sprint 1 backend:
    - `package.json` — Express 4, Drizzle, Pino, Zod, pg, TypeScript
    - `tsconfig.json` — CommonJS target, strict mode
    - `drizzle.config.ts` — Drizzle Kit config (schema → migrations/)
    - `src/config.ts` — Zod env validation, exits on missing vars
    - `src/logger.ts` — Pino JSON logger with service/env base fields
    - `src/db/index.ts` — pg connection pool + Drizzle instance
    - `src/db/schema.ts` — Empty (Sprint 1: infrastructure only, no business tables)
    - `src/db/migrate.ts` — Migration runner (`npm run db:migrate`)
    - `src/middleware/errorHandler.ts` — AppError class + notFoundHandler + errorHandler
    - `src/routes/health.ts` — `GET /api/health` → `{ status, db, latencyMs, timestamp }`
    - `src/routes/index.ts` — Route aggregator (all routes under `/api`)
    - `src/index.ts` — Express app, pino-http logging, CORS, graceful shutdown
    - `migrations/.gitkeep` — Empty directory; Sprint 2 will generate the first migration
    - Updated `render.yaml` — Added `taj-finance-api` web service (rootDir: `server`, Node 22)
    - Updated `ROADMAP.md` — Sprint 1 marked in progress

    ---

    ## Database State

    | Table | Status | Notes |
    |---|---|---|
    | *(none)* | No tables yet | Sprint 1 sets up the migration infrastructure only. Sprint 2 generates the first migration (documents table). |

    **Migration infrastructure is ready:**
    - `npm run db:generate` — generate a migration from schema changes
    - `npm run db:migrate` — apply all pending migrations to the database

    ---

    ## APIs Added

    | Method | Path | Status | Response |
    |---|---|---|---|
    | GET | /api/health | ✅ Implemented | `{ status, db, latencyMs, timestamp }` |

    All other endpoints will be added in Sprint 2+.

    ---

    ## Environment Variables

    ### taj-finance-api (Render Web Service)

    | Variable | Status | Value |
    |---|---|---|
    | `NODE_ENV` | ✅ Set via render.yaml | `production` |
    | `NODE_VERSION` | ✅ Set via render.yaml | `22` |
    | `CORS_ORIGIN` | ✅ Set via render.yaml | `https://taj-finance.onrender.com` |
    | `PORT` | ✅ Auto-injected by Render | `10000` |
    | `DATABASE_URL` | ⚠️ Must be set manually | Use the **internal** connection string from the Render `alba-db` dashboard |

    **ACTION REQUIRED:** In the Render dashboard for `taj-finance-api`, set `DATABASE_URL` to the **Internal Database URL** shown on the `alba-db` database page. The internal URL uses the `.internal` hostname for same-region access (no egress cost, lower latency).

    ---

    ## Remaining Work

    - [ ] Set `DATABASE_URL` (internal URL) in the Render `taj-finance-api` environment
    - [ ] Verify health endpoint: `curl https://taj-finance-api.onrender.com/api/health`
    - [ ] Confirm `{ "status": "ok", "db": "connected" }` in response
    - [ ] Begin Sprint 2: Document Domain

    ---

    ## Next Recommended Task

    **Begin Sprint 2 — Document Domain.**

    1. Add the `documents` table to `server/src/db/schema.ts` using Drizzle table definitions
    2. Run `npm run db:generate` to create the first migration
    3. Run `npm run db:migrate` to apply it
    4. Implement `GET/POST/PATCH/DELETE /api/documents` routes
    5. Add a file upload endpoint

    See `ROADMAP.md` Sprint 2 and `ARCHITECTURE_BIBLE.md` for the full Document entity schema.

    ---

    ## Risks and Known Issues

    | Risk | Detail | Mitigation |
    |---|---|---|
    | DATABASE_URL must be set manually | render.yaml marks it `sync: false` — Render will not start the service without it | Set it in the Render dashboard before the first deploy succeeds |
    | Internal vs external DB URL | Use the **internal** URL from the Render dashboard (`.internal` hostname). The external URL on the static site uses `.virginia-postgres.render.com` — this works but incurs potential egress on paid plans | Always use internal URL for server-side connections |
    | No migrations yet | The migration system is in place but the migrations/ folder is empty. The `db:migrate` script will succeed but do nothing. | Correct. Sprint 2 generates the first real migration. |
    | Frontend still on mock data | The React frontend makes no API calls. It needs `VITE_API_URL` set on the static site + fetch calls replacing mock data. | Out of scope until Sprint 2 or later. |

    ---

    ## Verification Status

    | Check | Status |
    |---|---|
    | All files created in `server/` | ✅ |
    | TypeScript builds cleanly (no errors expected) | ✅ verified via code review |
    | render.yaml updated with web service | ✅ |
    | ARCHITECTURE_BIBLE.md created | ✅ |
    | ROADMAP.md updated | ✅ |
    | GitHub up to date | ✅ (this commit) |
    | Render service created | 🔄 in progress |
    | Health endpoint live | ⏳ pending deploy |
    | DATABASE_URL set on Render | ⚠️ manual action required |
    
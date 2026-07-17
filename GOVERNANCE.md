# TAJ Finance — Governance

    > Project rules, architecture principles, and development standards.
    > These rules are permanent. They apply to every agent and every session.
    > Last updated: 2026-07-17

    ---

    ## 1. Product Vision

    TAJ Finance is a **Financial Document Management Platform** for Saudi enterprises.

    **Core domain: the Document.**

    Documents are the Single Source of Truth. Everything in the system derives from them:

    - Classification
    - AI Extraction
    - Bank Matching
    - Reports
    - Archive
    - Audit Trail

    Supported document types: Invoice, Receipt, Bank Statement, Credit Note, Debit Note, Purchase Order, Attachment.

    TAJ is NOT a generic accounting system. Do not build features that are not grounded in the Document domain.

    ---

    ## 2. Architecture Principles

    | Principle | Rule |
    |---|---|
    | **Document-first** | Every feature must connect back to the Document entity. If it does not, question whether it belongs. |
    | **Backend is truth** | The frontend is a view layer. Business logic lives in the server. Data lives in the database. |
    | **Migrations always** | Never mutate the database schema without a Drizzle migration. No exceptions. |
    | **Typed contracts** | All API endpoints are typed end-to-end: Zod on the server, generated types on the client. |
    | **One source of truth** | GitHub is the canonical state. If it is not in GitHub, it does not exist. |
    | **Fail loudly** | Validate env vars at startup. Crash early with clear messages rather than silently degrading. |
    | **No orphaned services** | Every Render service must have a live, accessible GitHub repo. |

    ---

    ## 3. Core Domain Model

    ```
    Document
    ├── id           (uuid, primary key)
    ├── type         (invoice | receipt | bank_statement | credit_note | debit_note | po | attachment)
    ├── vendor       (text)
    ├── date         (date)
    ├── amount       (decimal)
    ├── currency     (text, default 'SAR')
    ├── status       (uploaded | classified | matched | archived)
    ├── file_path    (text)
    ├── created_at   (timestamp with time zone)
    └── updated_at   (timestamp with time zone)
    ```

    All other entities (Transaction, Report, Tag, Classification) reference Document as their anchor.

    ---

    ## 4. Development Rules

    ### Rule 1 — GitHub is the Single Source of Truth

    Every completed task MUST end with:

    1. Commit with a descriptive message
    2. Push to `main`
    3. Verification that GitHub contains the latest work

    A task is not complete until GitHub reflects it.

    ### Rule 2 — Complete Handoffs Are Mandatory

    Every completed sprint or session MUST include a handoff written to `HANDOFF.md`.

    The handoff must contain:

    - Current architecture state
    - What changed in this session
    - Current database state (tables, migrations run)
    - APIs added (method, path, purpose)
    - Remaining work
    - Next recommended task
    - Risks and known issues
    - Verification status (local + deployed)

    No session is complete without a handoff.

    ### Rule 3 — The Next Agent Uses Only GitHub

    The next agent must be able to continue work using only the GitHub repository. No out-of-band context, no local state, no verbal instructions.

    Design every handoff assuming the reader has never seen this project before.

    ### Rule 4 — Architecture Decisions Are Documented Immediately

    Never leave an architectural decision undocumented. Record it in `PROJECT_BIBLE.md` or `HANDOFF.md` at the time it is made, not retrospectively.

    Format:
    ```
    Decision: [what was decided]
    Reason: [why]
    Alternatives considered: [what was rejected and why]
    Date: YYYY-MM-DD
    ```

    ### Rule 5 — The Roadmap Reflects Reality

    - Keep `ROADMAP.md` synchronised with the actual implementation.
    - Do not mark a sprint complete if any item is missing or untested.
    - Do not skip roadmap stages without documenting the reason.
    - The roadmap is a living document, not a wish list.

    ### Rule 6 — No Undocumented Environment Variables

    Every environment variable the server requires must be:
    - Listed in this file under §7
    - Listed in the session `HANDOFF.md`
    - Validated by Zod at server startup — crash with a clear message if any are missing

    ### Rule 7 — No Silent Failures

    - Server must validate all required env vars at startup and exit with a clear error if any are missing.
    - API errors must return structured JSON: `{ error, message, code }`
    - Never swallow exceptions silently.

    ### Rule 8 — Sprint Dependencies Are Strict

    Do not begin Sprint N+1 until Sprint N is:

    1. Committed to `main`
    2. Pushed to GitHub
    3. Deployed to Render
    4. Health check passing
    5. Handoff written and pushed

    ---

    ## 5. Repository Rules

    | Rule | Detail |
    |---|---|
    | **Branch** | `main` is the only long-lived branch. Feature branches are allowed but must merge before handoff. |
    | **Commit messages** | Format: `[Sprint N] Short description` — e.g. `[Sprint 1] Add Express server with health endpoint` |
    | **No force push** | Never force-push to `main`. |
    | **No dead repos** | Every Render service must point to a live, accessible repository. |
    | **render.yaml is canonical** | The Render service configuration lives in `render.yaml`. Manual Render dashboard changes must be reflected back into `render.yaml`. |

    ---

    ## 6. Handoff Template

    Copy this template into `HANDOFF.md` at the end of every sprint or session:

    ```markdown
    # TAJ Finance — Handoff

    > Session date: YYYY-MM-DD
    > Sprint: Sprint N — [Name]
    > Status: COMPLETE | PARTIAL | BLOCKED

    ## Architecture State

    [Describe the current state of the system as a developer seeing it for the first time.]

    ## What Changed This Session

    - [Change 1]
    - [Change 2]

    ## Database State

    | Table | Status | Migration file |
    |---|---|---|
    | documents | Created | 0001_initial.sql |

    ## APIs Added

    | Method | Path | Purpose |
    |---|---|---|
    | GET | /api/health | Liveness + DB check |

    ## Remaining Work

    - [ ] [Item 1]
    - [ ] [Item 2]

    ## Next Recommended Task

    [Precise, actionable description of exactly what to do next.]

    ## Risks and Known Issues

    - [Risk 1]

    ## Verification Status

    | Check | Status |
    |---|---|
    | Local build passes | ✅ / ❌ |
    | Health endpoint responds | ✅ / ❌ |
    | Render deploy successful | ✅ / ❌ |
    | GitHub is up to date | ✅ / ❌ |
    ```

    ---

    ## 7. Required Environment Variables

    ### Backend Web Service (taj-finance-api)

    | Variable | Required | Value | Description |
    |---|---|---|---|
    | `DATABASE_URL` | Yes | Link alba-db internal URL | PostgreSQL connection string — use internal hostname for same-region access |
    | `NODE_ENV` | Yes | `production` | Runtime environment |
    | `CORS_ORIGIN` | Yes | `https://taj-finance.onrender.com` | Allowed frontend origin |
    | `PORT` | Auto | Render injects `10000` | Do not set manually |

    ### Frontend Static Site (taj-finance)

    | Variable | Required | Value | Description |
    |---|---|---|---|
    | `VITE_API_URL` | Yes | Backend Render URL | Baked into build at deploy time by Vite |
    | `NODE_VERSION` | Yes | `22` | Already set |

    ### Not Used in TAJ

    The following variables exist on the orphaned Alba service and have no place in TAJ:

    - `JWT_SECRET` — authentication is out of scope for Beta Sprints 1–6
    - `EMERGENCY_ADMIN_PASSWORD_HASH` — not part of TAJ architecture

    ---

    ## 8. Render Service Registry

    | Service | Type | URL | Repo / Root | Auto-deploy | Status |
    |---|---|---|---|---|---|
    | `taj-finance` | Static Site | https://taj-finance.onrender.com | c6ktjyys4r-oss/TAJ | Yes | Live |
    | `taj-finance-api` | Web Service | TBD (Sprint 1) | c6ktjyys4r-oss/TAJ, root: `server/` | Yes | Not created |
    | `alba-db` | PostgreSQL 18 | — | — | — | Available, empty |

    > **Orphaned service warning:** `srv-d8gskvurnols73c3pm30` (named "Alba") is an unrelated web service
    > pointing to a deleted repo. Its DATABASE_URL connects to Neon, not `alba-db`. It is NOT part of TAJ.
    > Do not modify, reuse, or reference it.

    ---

    ## 9. Glossary

    | Term | Definition |
    |---|---|
    | Document | The core entity: any financial document uploaded by the user |
    | Classification | Assigning type, vendor, date, and category to a document |
    | Bank Matching | Reconciling a document against a bank transaction |
    | Reconciliation | The state of a document matched to one or more transactions |
    | Handoff | The mandatory end-of-session record that allows work to continue |
    | Sprint | A scoped unit of work with a clear start, end, and deliverable |
    | Internal URL | The Render-internal database hostname for same-region services (no egress cost) |
    
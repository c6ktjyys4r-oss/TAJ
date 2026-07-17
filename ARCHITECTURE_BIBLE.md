# TAJ Finance — Architecture Constitution

    > This document is the permanent architectural constitution of TAJ Finance.
    > These principles are non-negotiable and apply to every agent, engineer, and session.
    > Last updated: 2026-07-17

    ---

    ## The Ten Constitutional Principles

    ### Principle 1 — Document is the Core Domain

    Every business capability in TAJ revolves around `Document`.

    If a feature cannot be traced back to the Document entity, it has no place in this system.

    ### Principle 2 — Document is the Single Source of Truth

    Financial information originates from Documents.

    Other modules (Classification, Bank Matching, Reports, AI, Archive) consume Documents.

    They derive from Documents. They never become independent sources of financial truth.

    ```
    Document (source)
     ↓
    Classification → enriches Document
     ↓
    Bank Matching  → reconciles Document against Transaction
     ↓
    Reports        → aggregates Document data
     ↓
    AI             → extracts and suggests from Document
     ↓
    Archive        → stores Document long-term
    ```

    ### Principle 3 — No Duplicated Business Data

    Read models, materialised views, caches, and search indexes are permitted.

    Duplicated **ownership** of business data is not. One module owns a piece of data. Others read from it.

    ### Principle 4 — Every Feature Must Answer: "How Does This Relate to Document?"

    Before implementing any feature, ask this question.

    If the answer is unclear, the feature should not be implemented.

    ### Principle 5 — Modules Communicate Through Document

    No module owns data that belongs to another module. All inter-module data flows through the Document entity.

    ```
    AI            → reads/writes Document fields (extracted_vendor, extracted_amount)
    Bank Matching → reads Document, writes match result back to Document
    Reports       → reads Document (never owns its own ledger)
    Search        → indexes Document fields (never stores its own copy)
    Archive       → stores Document files (never creates its own records)
    ```

    ### Principle 6 — Architecture Over Convenience

    Temporary shortcuts that violate these principles are forbidden.

    "We'll fix it later" is not acceptable. An architecturally clean system maintained over time beats a convenient shortcut that compounds technical debt.

    ### Principle 7 — Every Architectural Decision Must Be Documented Immediately

    Never rely on conversation history or verbal agreement.

    GitHub documentation is the only permanent knowledge.

    Format:
    ```
    Decision: [what was decided]
    Reason:   [why — specific, not vague]
    Rejected: [what alternatives were considered and why they were rejected]
    Date:     YYYY-MM-DD
    ```

    ### Principle 8 — GitHub is the Single Source of Truth

    Every completed task requires, in order:

    1. Working code
    2. Commit (descriptive message)
    3. Push to `main`
    4. Updated documentation
    5. Updated `HANDOFF.md`

    A task is not complete until all five steps are done.

    ### Principle 9 — Every Session Ends With a Complete Handoff

    The next engineer must be able to continue using only the GitHub repository.

    No out-of-band context. No verbal briefings. No "just ask me".

    The `HANDOFF.md` file must be accurate, complete, and committed before the session ends.

    ### Principle 10 — No Sprint May Begin Until the Previous Sprint Is Complete

    A sprint is complete only when it is:

    - ✅ Implemented
    - ✅ Verified (build passes, health check responds, DB connected)
    - ✅ Committed
    - ✅ Pushed
    - ✅ Documented
    - ✅ Handed off

    Sprints are sequential. There are no parallel tracks until the system has a verified backend foundation.

    ---

    ## Architectural Decisions Log

    | Date | Decision | Reason | Rejected |
    |---|---|---|---|
    | 2026-07-17 | Express 4 + TypeScript (CommonJS) | Stable, well-typed, widely supported on Render Node runtime | Express 5 (type definitions less mature); Fastify (less familiar for team) |
    | 2026-07-17 | Drizzle ORM + drizzle-kit | Type-safe, SQL-close, lightweight migrations with explicit control | Prisma (heavier, magic migrations); raw SQL (no type safety) |
    | 2026-07-17 | Zod for env validation at startup | Fail-fast: crash with a clear message on missing/invalid config rather than undefined runtime errors | Joi (not TypeScript-native); dotenv validation (no schema) |
    | 2026-07-17 | Pino for logging | Fastest Node.js logger, JSON output, native pino-http integration | Winston (heavier, slower); console.log (no structure) |
    | 2026-07-17 | server/ subdirectory in TAJ repo | One repo, two Render services — simpler to manage; no second repo needed | Separate backend repo (more overhead, harder to keep in sync) |
    | 2026-07-17 | Render internal DB hostname | Same-region: no data egress cost, lower latency | External hostname (incurs egress on Render paid plans) |
    | 2026-07-17 | No auth in Sprint 1–6 | Focus on core Document domain first; auth adds complexity that gates nothing at this stage | JWT auth in Sprint 1 (premature; no user model yet) |

    ---

    ## Domain Model

    ```
    Document (Sprint 2)
    ├── id              uuid, PK
    ├── type            enum: invoice | receipt | bank_statement | credit_note | debit_note | po | attachment
    ├── vendor          text
    ├── date            date
    ├── amount          decimal(15,2)
    ├── currency        text, default 'SAR'
    ├── status          enum: uploaded | classified | matched | archived
    ├── file_path       text
    ├── metadata        jsonb  (extensible — Sprint 2+)
    ├── created_at      timestamptz
    └── updated_at      timestamptz

    Transaction (Sprint 4)
    ├── id              uuid, PK
    ├── document_id     uuid, FK → Document
    ├── amount          decimal(15,2)
    ├── date            date
    ├── description     text
    ├── match_status    enum: unmatched | partial | matched
    └── created_at      timestamptz
    ```

    All other entities reference `Document` directly or transitively. No entity is a source of financial truth in isolation.

    ---

    ## Backend Structure

    ```
    server/                        ← Render Web Service root
    ├── package.json
    ├── tsconfig.json
    ├── drizzle.config.ts
    ├── migrations/                ← Drizzle-generated SQL migrations
    └── src/
      ├── index.ts               ← Express app + server lifecycle
      ├── config.ts              ← Zod env validation (fail-fast at startup)
      ├── logger.ts              ← Pino structured logger
      ├── db/
      │   ├── index.ts           ← pg Pool + Drizzle instance
      │   ├── schema.ts          ← Drizzle table definitions (source of truth for DB shape)
      │   └── migrate.ts         ← Migration runner (pnpm run db:migrate)
      ├── middleware/
      │   └── errorHandler.ts    ← AppError class + global error handler
      └── routes/
          ├── index.ts           ← Route aggregator
          └── health.ts          ← GET /api/health (liveness + DB check)
    ```

    ---

    ## API Conventions

    | Convention | Rule |
    |---|---|
    | Base path | All routes under `/api` |
    | Error shape | `{ error: string, message: string, code: number }` |
    | Success shape | Resource object or `{ data: [...], total: number }` for lists |
    | HTTP methods | GET (read), POST (create), PATCH (partial update), DELETE (remove) |
    | IDs | UUID v4 everywhere |
    | Timestamps | ISO 8601 with timezone (`timestamptz`) |
    | Amounts | Stored as `decimal(15,2)`, returned as string to avoid float precision loss |
    
# TAJ Finance — Beta Roadmap

    > This document is the single source of truth for all future development until Beta.
    > Updated: 2026-07-17
    > Status: Sprint 1 not started

    ---

    ## Vision Anchor

    TAJ Finance is a **Financial Document Management Platform**.

    The core domain is the **Document**. Everything in the system derives from documents — classification, AI extraction, bank matching, reports, archive, and audit trail.

    TAJ is NOT a generic accounting system.

    ---

    ## Beta Sprint Plan

    ### Sprint 1 — Backend Foundation
    **Status: Not started**

    Establish the server, database connection, and operational baseline.

    | Item | Description |
    |---|---|
    | Express + TypeScript | Production-grade server setup |
    | PostgreSQL + Drizzle | ORM, connection pool, migrations |
    | Migrations | Schema versioning from day one |
    | Health Endpoint | `GET /api/health` — runtime + DB liveness |
    | Logging | Structured request/error logging (pino) |
    | Error Handling | Centralised error middleware, typed errors |
    | Configuration | Environment validation (zod) at startup |

    **Entry point:** `server/src/index.ts`
    **Build:** `pnpm install --no-frozen-lockfile && pnpm run build`
    **Start:** `node dist/index.js`
    **Health check path:** `/api/health`

    ---

    ### Sprint 2 — Document Domain
    **Status: Blocked on Sprint 1**

    The core entity of the entire platform.

    | Item | Description |
    |---|---|
    | Document Entity | Schema: id, type, vendor, date, amount, currency, status, created_at |
    | File Upload | Multipart upload endpoint, file validation |
    | Storage | File storage strategy (local → S3-compatible) |
    | Metadata | Extraction and storage of document metadata |
    | Document Lifecycle | States: uploaded → classified → matched → archived |

    **API surface:** `/api/documents` (CRUD + upload)

    ---

    ### Sprint 3 — Classification
    **Status: Blocked on Sprint 2**

    Categorise and organise every document.

    | Item | Description |
    |---|---|
    | Categories | Invoice, Receipt, Bank Statement, Credit Note, Debit Note, PO, Attachment |
    | Status | Pending, Classified, Rejected, Needs Review |
    | Tags | Free-form tagging system |
    | Review Workflow | Flag → Review → Approve/Reject |

    **API surface:** `/api/documents/:id/classify`, `/api/categories`, `/api/tags`

    ---

    ### Sprint 4 — Bank Matching
    **Status: Blocked on Sprint 3**

    Reconcile documents against bank transactions.

    | Item | Description |
    |---|---|
    | Import Bank Statements | CSV/OFX parser, deduplication |
    | Matching Engine | Rule-based + fuzzy matching on amount + date + vendor |
    | Reconciliation | Matched / Unmatched / Partial states |

    **API surface:** `/api/transactions`, `/api/matching`

    ---

    ### Sprint 5 — Reporting
    **Status: Blocked on Sprint 4**

    Insight layer over classified and matched data.

    | Item | Description |
    |---|---|
    | Dashboard | Aggregated KPIs: totals, pending counts, match rate |
    | Financial Reports | Period-based reports by type, vendor, category |
    | Search | Full-text + filter across documents and transactions |
    | Export | CSV and PDF export for reports |

    **API surface:** `/api/reports`, `/api/search`

    ---

    ### Sprint 6 — AI
    **Status: Blocked on Sprint 5**

    Augment every step with machine intelligence.

    | Item | Description |
    |---|---|
    | OCR Integration | Extract text from uploaded images and PDFs |
    | Data Extraction | Parse vendor, date, amount, currency from raw text |
    | Suggestions | Suggest classification, matching candidates |
    | Validation | Confidence scores; flag low-confidence extractions |

    **API surface:** `/api/ai/extract`, `/api/ai/suggest`

    ---

    ### Sprint 7 — Beta Hardening
    **Status: Blocked on Sprint 6**

    Production-ready quality gate.

    | Item | Description |
    |---|---|
    | Testing | Unit + integration tests for all API routes |
    | Security | Auth (JWT), rate limiting, input sanitisation, OWASP basics |
    | Performance | Query optimisation, indexes, response time baselines |
    | Backup | Automated DB backup policy |
    | Monitoring | Error tracking, uptime alerts |
    | Production Readiness | Final deploy checklist, runbook |

    ---

    ## Dependency Chain

    ```
    Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5 → Sprint 6 → Sprint 7
    ```

    Each sprint is fully blocked on the previous. Do not begin a sprint until the prior sprint is committed, pushed, deployed, and verified.

    ---

    ## Roadmap Rules

    - This document must be updated at the end of every sprint.
    - Do not mark a sprint complete without a commit + push + deployment verification.
    - Do not skip a sprint without documenting the reason and the architectural impact.
    - The roadmap reflects reality, not aspiration. If a sprint is incomplete, say so.
    
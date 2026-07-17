# TAJ Finance — Beta Roadmap

    > This document is the single source of truth for all future development until Beta.
    > Updated: 2026-07-17
    > Status: Sprint 1 in progress

    ---

    ## Vision Anchor

    TAJ Finance is a **Financial Document Management Platform**.

    The core domain is the **Document**. Everything in the system derives from documents — classification, AI extraction, bank matching, reports, archive, and audit trail.

    TAJ is NOT a generic accounting system.

    ---

    ## Beta Sprint Plan

    ### Sprint 1 — Backend Foundation
    **Status: In Progress — deploying to Render**

    Establish the server, database connection, and operational baseline.

    | Item | Status | Description |
    |---|---|---|
    | Express + TypeScript | ✅ | `server/src/index.ts` — Express 4, CommonJS target |
    | PostgreSQL + Drizzle | ✅ | `server/src/db/index.ts` — pg Pool + drizzle-orm |
    | Migration infrastructure | ✅ | `server/migrations/` + drizzle.config.ts + db:migrate script |
    | Configuration / env validation | ✅ | `server/src/config.ts` — Zod schema, fail-fast on startup |
    | Structured logging | ✅ | `server/src/logger.ts` — Pino JSON logger |
    | Global error handling | ✅ | `server/src/middleware/errorHandler.ts` — AppError + handler |
    | Health endpoint | ✅ | `GET /api/health` — liveness + DB connectivity check |
    | Render deployment | 🔄 | `server/` rootDir, Node 22, `render.yaml` updated |

    **Build:** `npm install && npm run build`
    **Start:** `node dist/index.js`
    **Health check path:** `/api/health`

    ---

    ### Sprint 2 — Document Domain
    **Status: Blocked on Sprint 1**

    The core entity of the entire platform.

    | Item | Description |
    |---|---|
    | Document Entity | Schema: id, type, vendor, date, amount, currency, status, file_path, created_at |
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

    ---

    ### Sprint 4 — Bank Matching
    **Status: Blocked on Sprint 3**

    Reconcile documents against bank transactions.

    | Item | Description |
    |---|---|
    | Import Bank Statements | CSV/OFX parser, deduplication |
    | Matching Engine | Rule-based + fuzzy matching on amount + date + vendor |
    | Reconciliation | Matched / Unmatched / Partial states |

    ---

    ### Sprint 5 — Reporting
    **Status: Blocked on Sprint 4**

    Insight layer over classified and matched data.

    | Item | Description |
    |---|---|
    | Dashboard | Aggregated KPIs: totals, pending counts, match rate |
    | Financial Reports | Period-based reports by type, vendor, category |
    | Search | Full-text + filter across documents and transactions |
    | Export | CSV and PDF export |

    ---

    ### Sprint 6 — AI
    **Status: Blocked on Sprint 5**

    | Item | Description |
    |---|---|
    | OCR Integration | Extract text from uploaded images and PDFs |
    | Data Extraction | Parse vendor, date, amount, currency from raw text |
    | Suggestions | Suggest classification, matching candidates |
    | Validation | Confidence scores; flag low-confidence extractions |

    ---

    ### Sprint 7 — Beta Hardening
    **Status: Blocked on Sprint 6**

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
    
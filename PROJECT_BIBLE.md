# TAJ Finance — Project Bible

    > The authoritative product specification for TAJ Finance.
    > All agents must read this before beginning any sprint.
    > Last updated: 2026-07-17

    ---

    ## Product Vision

    TAJ Finance is a **Financial Document Management Platform** for Saudi enterprises.

    **Core domain: the Document.**

    TAJ is NOT a generic accounting system. Every feature must be grounded in the document domain.

    Documents are the Single Source of Truth. Everything in the system derives from them:

    | Derived capability | Description |
    |---|---|
    | Classification | Categorising documents by type, vendor, date |
    | AI Extraction | Pulling structured data from document content |
    | Bank Matching | Reconciling documents against bank transactions |
    | Reports | Aggregating and presenting document data |
    | Archive | Long-term storage and retrieval |
    | Audit Trail | Complete history of every document action |

    Supported document types: Invoice, Receipt, Bank Statement, Credit Note, Debit Note, Purchase Order, Attachment.

    ### Core Values

    - **Elegance** — White background, gold accents, Playfair + Inter typography. Premium at every interaction.
    - **Trust** — Numbers must be accurate. Status must be clear. Nothing should feel hidden.
    - **Speed** — The app must feel fast. Transitions smooth, actions immediate.
    - **Intelligence** — AI assistance everywhere, never intrusive.

    ---

    ## Visual Identity (non-negotiable)

    | Token | Value |
    |---|---|
    | Background | `#FFFFFF` white |
    | Gold 500 | `#C9A84C` — primary accent |
    | Heading font | Playfair Display (serif) |
    | Body font | Inter (sans-serif) |
    | Border radius | 8px cards, 12px panels, 16px modals |
    | Shadow | Subtle, no heavy drop shadows |
    | Dark mode | NOT required in any sprint |
    | Emojis in UI | NEVER |

    ---

    ## Current System State (as of 2026-07-17)

    ### Frontend — Sprint 10 complete (demo phase)

    All 7 pages are built and deployed as a React + Vite + TypeScript static site at `https://taj-finance.onrender.com`. All data is mocked (localStorage). No backend connection exists yet.

    | Route | Page | Data source |
    |---|---|---|
    | `/` | Dashboard | Mock |
    | `/documents` | Documents | Mock |
    | `/reports` | Reports | Mock |
    | `/bank-matching` | Bank Matching | Mock |
    | `/ai` | AI Intelligence | Mock |
    | `/settings` | Settings | localStorage |
    | `/design-system` | Design System showcase | Static |

    ### Backend — Sprint 1 not started

    No backend exists. The `server/` directory does not yet exist in the repository. Creating it is the entire scope of Sprint 1.

    ### Database

    PostgreSQL 18 (`alba-db`) is provisioned on Render (Virginia, `dpg-d8hlj3ojo6nc73cc37qg-a`) and available. No schema exists. Migrations will be written in Sprint 1.

    ---

    ## Architecture Stack

    ### Frontend (current)

    | Layer | Technology |
    |---|---|
    | Framework | React 19 + Vite 8 + TypeScript 6 |
    | Styling | Tailwind CSS 3 |
    | Routing | React Router DOM 7 |
    | PWA | Workbox, service worker, offline support |
    | Code splitting | `React.lazy` on all 7 pages |
    | State | `SettingsContext` (localStorage via `useLocalStorage`) |
    | i18n | EN + AR via `useT()` hook and `src/i18n/locales.ts` |

    ### Backend (planned — Sprint 1)

    | Layer | Technology |
    |---|---|
    | Runtime | Node.js 22 |
    | Server | Express 5 + TypeScript |
    | ORM | Drizzle ORM |
    | Database | PostgreSQL 18 |
    | Validation | Zod (env config + request bodies) |
    | Logging | Pino (structured) |
    | Build | tsc → `dist/` |

    ### Infrastructure

    | Resource | Detail |
    |---|---|
    | Repo | `c6ktjyys4r-oss/TAJ` (GitHub) |
    | Frontend | Render Static Site — `taj-finance` |
    | Backend | Render Web Service — `taj-finance-api` (Sprint 1) |
    | Database | Render PostgreSQL — `alba-db`, Virginia |

    ---

    ## Governance and Roadmap

    All development rules, architecture principles, environment variables, and handoff requirements: **`GOVERNANCE.md`**

    Beta roadmap (Sprints 1–7): **`ROADMAP.md`**

    All agents must read both files before beginning any work.
    
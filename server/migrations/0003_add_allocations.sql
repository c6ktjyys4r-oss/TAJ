-- Migration 0003: Shared expense allocation
--
-- Introduces the allocations table so that a single expense document can be
-- split across one or more branches.  Each row records which branch receives
-- a portion of the expense and how much.
--
-- Integrity rules enforced here:
--   document_id FK → documents(id)  ON DELETE CASCADE
--     Removing a document atomically removes all its allocations.
--   CHECK (amount > 0)
--     Every allocation must carry a strictly positive amount.
--
-- Application-layer invariant (enforced in the route handler, not the DB):
--   SUM(allocations.amount) WHERE document_id = X
--     must equal documents.amount WHERE id = X
--     (only validated when documents.amount IS NOT NULL)

CREATE TABLE "allocations" (
    "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "document_id" uuid NOT NULL
                    REFERENCES "documents"("id") ON DELETE CASCADE,
    "branch"      text NOT NULL,
    "amount"      numeric(15, 2) NOT NULL,
    CONSTRAINT "allocations_amount_positive" CHECK ("amount" > 0),
    "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at"  timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "allocations_document_id_idx" ON "allocations" ("document_id");

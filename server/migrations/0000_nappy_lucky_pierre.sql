CREATE TYPE "public"."document_status" AS ENUM('uploaded', 'classified', 'matched', 'archived');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('invoice', 'receipt', 'bank_statement', 'credit_note', 'debit_note', 'po', 'attachment');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "document_type" NOT NULL,
	"vendor" text,
	"date" date,
	"amount" numeric(15, 2),
	"currency" text DEFAULT 'SAR' NOT NULL,
	"status" "document_status" DEFAULT 'uploaded' NOT NULL,
	"file_path" text,
	"file_name" text,
	"file_size" text,
	"mime_type" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

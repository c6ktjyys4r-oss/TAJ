CREATE TABLE "document_files" (
    	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    	"file_name" text NOT NULL,
    	"mime_type" text NOT NULL,
    	"file_size" integer NOT NULL,
    	"content" bytea NOT NULL,
    	"created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
    
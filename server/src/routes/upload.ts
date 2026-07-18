import { Router, Request, Response, NextFunction } from 'express';
    import multer from 'multer';
    import { pool } from '../db/index';
    import { AppError } from '../middleware/errorHandler';
    import { logger } from '../logger';

    const router = Router();

    // ── Constants ─────────────────────────────────────────────────────────────────

    /** 10 MB — reasonable cap for PostgreSQL bytea storage in Beta. */
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

    /** Accepted MIME types for this phase. */
    const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    ]);

    // ── Multer — memory storage ───────────────────────────────────────────────────

    /**
    * Files are buffered in process memory for the duration of the request.
    * They are written transactionally into PostgreSQL — no disk I/O involved.
    */
    const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError(
          415,
          'UNSUPPORTED_MEDIA_TYPE',
          `File type '${file.mimetype}' is not allowed. Accepted: PDF, JPEG, PNG`,
        ));
      }
    },
    });

    // ── POST /api/upload ──────────────────────────────────────────────────────────

    /**
    * Upload a file and attach it to a document.
    *
    * Multipart form fields:
    *   file        — required; PDF, JPEG, or PNG; max 10 MB
    *   documentId  — optional UUID of an existing document to attach the file to
    *
    * Transactional guarantee: file bytes and document record are written inside a
    * single PostgreSQL transaction. Either both succeed or neither is persisted —
    * no orphaned files, no orphaned records.
    */
    router.post(
    '/',
    upload.single('file'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.file) {
        next(new AppError(400, 'NO_FILE', 'A file must be attached under the field name "file"'));
        return;
      }

      const { documentId } = req.body as { documentId?: string };
      const file = req.file;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // ── 1. Store file bytes ────────────────────────────────────────────────
        const { rows: [fileRow] } = await client.query<{ id: string }>(
          `INSERT INTO document_files (file_name, mime_type, file_size, content)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [file.originalname, file.mimetype, file.size, file.buffer],
        );
        const storageKey = fileRow.id;

        const fileInfo = {
          name: file.originalname,
          size: file.size,
          mime: file.mimetype,
          storageKey,
        };

        if (documentId) {
          // ── 2a. Verify the document exists ───────────────────────────────────
          const { rows: [existing] } = await client.query<{
            id: string;
            file_path: string | null;
          }>('SELECT id, file_path FROM documents WHERE id = $1', [documentId]);

          if (!existing) {
            await client.query('ROLLBACK');
            client.release();
            next(new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${documentId} not found`));
            return;
          }

          const previousKey = existing.file_path;

          // ── 2b. Update document record ───────────────────────────────────────
          const { rows: [updated] } = await client.query(
            `UPDATE documents
               SET file_path  = $1,
                   file_name  = $2,
                   file_size  = $3,
                   mime_type  = $4,
                   updated_at = now()
             WHERE id = $5
             RETURNING *`,
            [storageKey, file.originalname, String(file.size), file.mimetype, documentId],
          );

          // ── 2c. Delete the superseded file bytes in the same transaction ─────
          if (previousKey) {
            await client.query('DELETE FROM document_files WHERE id = $1', [previousKey]);
            logger.info({ documentId, previousKey, storageKey }, 'Replaced stored file');
          }

          await client.query('COMMIT');
          res.json({ document: updated, file: fileInfo });
        } else {
          // ── 3. Create new document ───────────────────────────────────────────
          const { rows: [created] } = await client.query(
            `INSERT INTO documents (type, status, file_path, file_name, file_size, mime_type)
             VALUES ('attachment', 'uploaded', $1, $2, $3, $4)
             RETURNING *`,
            [storageKey, file.originalname, String(file.size), file.mimetype],
          );

          await client.query('COMMIT');
          res.status(201).json({ document: created, file: fileInfo });
        }
      } catch (err) {
        await client.query('ROLLBACK').catch(() => { /* ignore rollback errors */ });
        next(err);
      } finally {
        client.release();
      }
    },
    );

    export default router;
    
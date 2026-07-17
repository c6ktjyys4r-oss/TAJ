import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { documents } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// ── Storage configuration ─────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists at startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel',                                           // xls
  'text/csv',
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ts   = Date.now();
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 64);
    cb(null, `${ts}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', `File type '${file.mimetype}' is not supported. Allowed: PDF, JPEG, PNG, WebP, TIFF, XLSX, XLS, CSV`));
    }
  },
});

// ── POST /api/upload ──────────────────────────────────────────────────────────

/**
 * Upload a file and attach it to a document.
 *
 * Multipart form fields:
 *   file        — required; the file to upload
 *   documentId  — optional; UUID of an existing document to attach the file to
 *
 * If documentId is omitted, a new document record is created with status 'uploaded'
 * and type defaulting to 'attachment' (caller should PATCH to correct the type).
 */
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError(400, 'NO_FILE', 'A file must be attached under the field name "file"');
    }

    const { documentId } = req.body as { documentId?: string };

    const fileFields = {
      file_path:  req.file.path,
      file_name:  req.file.originalname,
      file_size:  String(req.file.size),
      mime_type:  req.file.mimetype,
      updated_at: new Date(),
    };

    if (documentId) {
      // Attach to existing document
      const [existing] = await db.select().from(documents).where(eq(documents.id, documentId));
      if (!existing) {
        // Remove the orphaned upload
        fs.unlink(req.file.path, () => { /* best-effort */ });
        throw new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${documentId} not found`);
      }

      const [updated] = await db
        .update(documents)
        .set(fileFields)
        .where(eq(documents.id, documentId))
        .returning();

      res.json({ document: updated, file: { name: req.file.originalname, size: req.file.size, mime: req.file.mimetype } });
    } else {
      // Create a new document record for this upload
      const [created] = await db
        .insert(documents)
        .values({
          type:    'attachment',
          status:  'uploaded',
          ...fileFields,
        })
        .returning();

      res.status(201).json({ document: created, file: { name: req.file.originalname, size: req.file.size, mime: req.file.mimetype } });
    }
  } catch (err) {
    // Clean up uploaded file if any db error occurred
    if (req.file) {
      fs.unlink(req.file.path, () => { /* best-effort */ });
    }
    next(err);
  }
});

export default router;

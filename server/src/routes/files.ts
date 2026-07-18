import { Router, Request, Response, NextFunction } from 'express';
    import { eq } from 'drizzle-orm';
    import { db } from '../db/index';
    import { documents } from '../db/schema';
    import { getStorageProvider } from '../storage/index';
    import { AppError } from '../middleware/errorHandler';

    const router = Router();

    /**
    * GET /api/documents/:id/file
    *
    * Download the file attached to a document.
    * Sets Content-Type and Content-Disposition so clients handle it correctly.
    */
    router.get('/:id/file', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const [doc] = await db.select().from(documents).where(eq(documents.id, id));
      if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', `Document ${id} not found`);
      if (!doc.file_path) throw new AppError(404, 'NO_FILE', `Document ${id} has no attached file`);

      const stored = await getStorageProvider().get(doc.file_path);

      res.setHeader('Content-Type', stored.mimeType);
      res.setHeader('Content-Length', stored.sizeBytes);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(stored.originalName)}"`,
      );
      res.setHeader('Cache-Control', 'private, no-cache');
      res.end(stored.content);
    } catch (err) {
      next(err);
    }
    });

    export default router;
    
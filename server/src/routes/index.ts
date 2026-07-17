import { Router } from 'express';
import healthRouter    from './health';
import documentsRouter from './documents';
import uploadRouter    from './upload';

const router = Router();

// All routes are prefixed with /api
router.use('/api', healthRouter);
router.use('/api/documents', documentsRouter);
router.use('/api/upload',    uploadRouter);

export default router;

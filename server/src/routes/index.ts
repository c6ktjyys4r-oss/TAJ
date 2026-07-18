import { Router } from 'express';
import healthRouter      from './health';
import documentsRouter   from './documents';
import filesRouter       from './files';
import uploadRouter      from './upload';
import allocationsRouter from './allocations';

const router = Router();

router.use('/api',                         healthRouter);
router.use('/api/documents',               documentsRouter);
router.use('/api/documents',               filesRouter);         // GET /:id/file
router.use('/api/upload',                  uploadRouter);
router.use('/api/documents/:id/allocations', allocationsRouter); // GET|PUT|DELETE /:id/allocations

export default router;
    
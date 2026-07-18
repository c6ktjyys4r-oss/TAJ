import { Router } from 'express';
import healthRouter      from './health';
import documentsRouter   from './documents';
import filesRouter       from './files';
import uploadRouter      from './upload';
import allocationsRouter from './allocations';
import reportsRouter     from './reports';
import aiRouter          from './ai';

const router = Router();

router.use('/api',                           healthRouter);
router.use('/api/documents',                 documentsRouter);
router.use('/api/documents',                 filesRouter);          // GET /:id/file
router.use('/api/upload',                    uploadRouter);
router.use('/api/documents/:id/allocations', allocationsRouter);   // GET|PUT|DELETE
router.use('/api/reports',                   reportsRouter);        // GET /summary, /branches
router.use('/api/ai',                        aiRouter);             // GET|PUT /settings, POST /settings/test-connection

export default router;

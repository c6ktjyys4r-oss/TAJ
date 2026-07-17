import { Router } from 'express';
    import healthRouter from './health';

    const router = Router();

    // All routes are prefixed with /api
    router.use('/api', healthRouter);

    // Sprint 2+: document routes, classification routes, etc. will be added here

    export default router;
    
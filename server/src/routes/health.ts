import { Request, Response, Router } from 'express';
    import { pool } from '../db/index';
    import { logger } from '../logger';

    const router = Router();

    /**
    * GET /api/health
    *
    * Liveness + database connectivity check.
    * Returns 200 when healthy, 503 when the database is unreachable.
    * Used by Render as the health check path.
    */
    router.get('/health', async (_req: Request, res: Response): Promise<void> => {
    const start = Date.now();

    try {
      await pool.query('SELECT 1');
      const latencyMs = Date.now() - start;

      res.json({
        status: 'ok',
        db: 'connected',
        latencyMs,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      logger.error({ err }, 'Health check: database query failed');

      res.status(503).json({
        status: 'error',
        db: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
    });

    export default router;
    
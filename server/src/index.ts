import cors from 'cors';
    import express from 'express';
    import pinoHttp from 'pino-http';
    import { config } from './config';
    import { pool } from './db/index';
    import { errorHandler, notFoundHandler } from './middleware/errorHandler';
    import { logger } from './logger';
    import routes from './routes/index';

    const app = express();

    // ── Middleware ──────────────────────────────────────────────────────────────

    // Structured HTTP request logging
    app.use(
    pinoHttp({
      logger,
      customLogLevel(_req, res, err) {
        if (err != null || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
    );

    // CORS — restrict to the deployed frontend origin
    app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
    );

    // Body parsers
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // ── Routes ──────────────────────────────────────────────────────────────────

    app.use(routes);

    // 404 — after all routes
    app.use(notFoundHandler);

    // Global error handler — must be last
    app.use(errorHandler);

    // ── Server startup ───────────────────────────────────────────────────────────

    const server = app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, env: config.NODE_ENV, cors: config.CORS_ORIGIN },
      'TAJ Finance API started',
    );
    });

    // ── Graceful shutdown ────────────────────────────────────────────────────────

    async function shutdown(signal: string): Promise<void> {
    logger.info({ signal }, 'Shutdown signal received');

    server.close(async () => {
      try {
        await pool.end();
        logger.info('Database pool closed — exiting cleanly');
      } catch (err) {
        logger.error({ err }, 'Error closing database pool');
      }
      process.exit(0);
    });

    // Force-exit after 15 s if graceful close stalls
    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 15_000).unref();
    }

    process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
    process.on('SIGINT',  () => { void shutdown('SIGINT'); });

    export default app;
    
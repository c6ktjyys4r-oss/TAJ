import { migrate } from 'drizzle-orm/node-postgres/migrator';
    import { db, pool } from './index';
    import { logger } from '../logger';

    async function runMigrations(): Promise<void> {
    logger.info('Running database migrations...');
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      logger.info('Migrations completed successfully');
    } catch (err) {
      logger.error({ err }, 'Migration failed');
      throw err;
    } finally {
      await pool.end();
    }
    }

    runMigrations().catch((err) => {
    logger.error({ err }, 'Fatal: migration runner failed');
    process.exit(1);
    });
    
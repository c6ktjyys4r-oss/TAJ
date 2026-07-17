import { drizzle } from 'drizzle-orm/node-postgres';
    import { Pool } from 'pg';
    import { config } from '../config';
    import { logger } from '../logger';

    export const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    });

    pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected PostgreSQL pool error');
    });

    export const db = drizzle(pool);
    
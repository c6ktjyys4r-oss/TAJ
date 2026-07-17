import pino from 'pino';
    import { config } from './config';

    export const logger = pino({
    level: 'info',
    base: { service: 'taj-finance-api', env: config.NODE_ENV },
    timestamp: pino.stdTimeFunctions.isoTime,
    });
    
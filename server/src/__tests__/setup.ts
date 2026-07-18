/**
    * Vitest global setup — runs before every test file.
    * Sets env vars that config.ts requires at module-load time.
    */
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test_db';
    process.env['NODE_ENV']     = 'test';
    process.env['PORT']         = '10000';
    process.env['CORS_ORIGIN']  = 'http://localhost:3000';
    
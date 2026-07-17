import { z } from 'zod';

    const envSchema = z.object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('production'),
    PORT: z.coerce.number().int().positive().default(10000),
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required — set it in the Render environment'),
    CORS_ORIGIN: z
      .string()
      .default('https://taj-finance.onrender.com'),
    });

    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
    // Intentional console.error: logger is not yet available at config load time
    console.error('\n❌  Missing or invalid environment variables:\n');
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    console.error('\nFix the above variables and restart the server.\n');
    process.exit(1);
    }

    export const config = parsed.data;
    
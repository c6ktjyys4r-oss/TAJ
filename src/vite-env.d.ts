/// <reference types="vite/client" />

    interface ImportMetaEnv {
    /**
     * Backend API base URL.
     *
     * Development  — set in .env.local (see .env.example)
     * Production   — injected by Render at build time (see render.yaml)
     *
     * Falls back to http://localhost:3000 when not set so a missing .env.local
     * never causes a hard failure in development.
     */
    readonly VITE_API_URL?: string;
    }
    
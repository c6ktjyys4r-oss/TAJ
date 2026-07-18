/**
    * Typed API method for GET /api/health.
    * Useful for connectivity checks and Render health probes.
    */
    import { api } from './client';
    import type { HealthResponse } from './types';

    export const healthApi = {
    /**
     * Check backend connectivity and database liveness.
     *
     * @example
     *   const { status, db, latencyMs } = await healthApi.check();
     */
    check(): Promise<HealthResponse> {
      return api.get<HealthResponse>('/api/health');
    },
    };
    
/**
    * Centralized API client — TAJ Finance frontend.
    *
    * Every HTTP call to the backend goes through `api` (or the typed helpers in
    * documents.ts / upload.ts / health.ts). Nothing in the application should
    * call `fetch` directly.
    *
    * Configuration:
    *   VITE_API_URL  Backend base URL, injected by Vite from the environment.
    *                 Production: https://taj-finance-api.onrender.com
    *                 Development fallback: http://localhost:3000
    */

    // ── Base URL ──────────────────────────────────────────────────────────────────

    /** Resolved once at module load; safe to import wherever needed. */
    export const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

    // ── Error type ────────────────────────────────────────────────────────────────

    /**
    * Typed error thrown for all non-2xx responses.
    *
    * `status`  — HTTP status code (e.g. 404, 422)
    * `code`    — Backend error code string (e.g. "DOCUMENT_NOT_FOUND")
    * `message` — Human-readable description from the backend
    */
    export class ApiError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(status: number, code: string, message: string) {
      super(message);
      this.name   = 'ApiError';
      this.status = status;
      this.code   = code;
    }
    }

    // ── Core request ──────────────────────────────────────────────────────────────

    async function request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${BASE_URL}${path}`;

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (networkErr) {
      // Network-level failure (offline, DNS, CORS pre-flight rejected, etc.)
      throw new ApiError(0, 'NETWORK_ERROR', (networkErr as Error).message ?? 'Network request failed');
    }

    if (!response.ok) {
      let code    = 'UNKNOWN_ERROR';
      let message = `HTTP ${response.status}`;
      try {
        const body = await response.json() as { error?: string; message?: string };
        if (body.error)   code    = body.error;
        if (body.message) message = body.message;
      } catch {
        // Non-JSON error body — keep the defaults above
      }
      throw new ApiError(response.status, code, message);
    }

    // 204 No Content (DELETE, etc.)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
    }

    // ── Public API object ─────────────────────────────────────────────────────────

    /**
    * Thin HTTP verbs over the centralized `request` function.
    * All methods set `Accept: application/json`.
    * JSON methods additionally set `Content-Type: application/json`.
    * The `upload` method omits `Content-Type` so the browser can attach the
    * multipart/form-data boundary automatically.
    */
    export const api = {
    get<T>(path: string): Promise<T> {
      return request<T>(path, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
    },

    post<T>(path: string, body: unknown): Promise<T> {
      return request<T>(path, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },

    patch<T>(path: string, body: unknown): Promise<T> {
      return request<T>(path, {
        method: 'PATCH',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },

    delete(path: string): Promise<void> {
      return request<void>(path, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
    },

    /**
     * Multipart file upload.
     * Do NOT set Content-Type manually — the browser inserts the correct
     * multipart/form-data boundary when the header is absent.
     */
    upload<T>(path: string, form: FormData): Promise<T> {
      return request<T>(path, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: form,
      });
    },
    };
    
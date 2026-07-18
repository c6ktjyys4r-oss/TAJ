/**
 * Typed API methods for /api/ai/*
 *
 * Usage:
 *   import { aiSettingsApi } from '../lib/api';
 *   const settings = await aiSettingsApi.get();
 *   await aiSettingsApi.update({ enabled: true });
 *   const result = await aiSettingsApi.testConnection();
 */
import { api } from './client';
import type {
  AiSettingsResponse,
  UpdateAiSettingsBody,
  TestConnectionResult,
  AiJobResponse,
  AcceptRejectBody,
} from './types';

export const aiSettingsApi = {
  /** GET /api/ai/settings — returns settings without the raw API key. */
  get(): Promise<AiSettingsResponse> {
    return api.get<AiSettingsResponse>('/api/ai/settings');
  },

  /** PUT /api/ai/settings — updates one or more settings fields. */
  update(body: UpdateAiSettingsBody): Promise<AiSettingsResponse> {
    return api.put<AiSettingsResponse>('/api/ai/settings', body);
  },

  /** POST /api/ai/settings/test-connection — pings the configured provider. */
  testConnection(): Promise<TestConnectionResult> {
    return api.post<TestConnectionResult>('/api/ai/settings/test-connection', {});
  },

  /** GET /api/ai/documents/:id — returns the AI job for a document. */
  getDocumentJob(documentId: string): Promise<AiJobResponse | null> {
    return api.get<AiJobResponse | null>(
      `/api/ai/documents/${encodeURIComponent(documentId)}`,
    );
  },

  /** POST /api/ai/documents/:id/retry — re-queues a failed or pending job. */
  retryDocumentJob(documentId: string): Promise<AiJobResponse> {
    return api.post<AiJobResponse>(
      `/api/ai/documents/${encodeURIComponent(documentId)}/retry`,
      {},
    );
  },

  /** POST /api/ai/documents/:id/accept — accept one or more AI suggestions. */
  acceptSuggestions(documentId: string, body: AcceptRejectBody): Promise<void> {
    return api.post<void>(
      `/api/ai/documents/${encodeURIComponent(documentId)}/accept`,
      body,
    );
  },

  /** POST /api/ai/documents/:id/reject — reject one or more AI suggestions. */
  rejectSuggestions(documentId: string, body: AcceptRejectBody): Promise<void> {
    return api.post<void>(
      `/api/ai/documents/${encodeURIComponent(documentId)}/reject`,
      body,
    );
  },

  /** POST /api/ai/documents/:id/cancel — cancel a pending or in-progress AI job. */
  cancelDocumentJob(documentId: string): Promise<AiJobResponse> {
    return api.post<AiJobResponse>(
      `/api/ai/documents/${encodeURIComponent(documentId)}/cancel`,
      {},
    );
  },
};

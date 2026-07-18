/**
 * AI subsystem — barrel export.
 *
 * Import from here rather than individual modules:
 *   import { createProvider, loadProviderConfig } from '../ai';
 *   import type { AiProvider, ProcessDocumentResult } from '../ai';
 */
export { createProvider, loadProviderConfig } from './factory';
export { queueDocument }                      from './pipeline';
export { applyPolicyDecisions }               from './policy';
export { cancelJob, getQueueStats }           from './queue';
export type {
  AiProvider,
  AiProviderConfig,
  ExtractionField,
  ProcessDocumentResult,
  ProcessDocumentInput,
  HealthCheckResult,
  ChatMessage,
  AiError,
  AiErrorCode,
} from './types';
export { AiError as AiErrorClass } from './types';
export type { ProcessDocumentResultWithActions, ExtractionFieldWithAction } from './policy';

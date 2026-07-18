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
export { cancelJob, getQueueStats, configureQueue } from './queue';
// AiError is a class (value + type); export as value so callers can do instanceof checks
export { AiError } from './types';
export type {
  AiProvider,
  AiProviderConfig,
  ExtractionField,
  ProcessDocumentResult,
  ProcessDocumentInput,
  HealthCheckResult,
  ChatMessage,
  AiErrorCode,
} from './types';
export type { ProcessDocumentResultWithActions, ExtractionFieldWithAction } from './policy';

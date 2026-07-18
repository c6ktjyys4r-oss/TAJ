/**
 * NotImplementedProvider — safe stub for providers not yet built out.
 *
 * Every method throws AiError('NOT_IMPLEMENTED', …) so calling code can
 * catch and handle gracefully without crashing the application.
 */
import type {
  AiProvider, AiProviderConfig,
  HealthCheckResult, ProcessDocumentInput, ProcessDocumentResult, ChatMessage,
} from '../types';
import { AiError } from '../types';

export class NotImplementedProvider implements AiProvider {
  private readonly name: string;

  constructor(config: AiProviderConfig) {
    this.name = config.provider;
  }

  async initialize(): Promise<void> {
    // No-op — initialization is a no-op for unimplemented providers
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      ok:        false,
      latencyMs: 0,
      error:     `Provider "${this.name}" is not yet implemented.`,
    };
  }

  async processDocument(_input: ProcessDocumentInput): Promise<ProcessDocumentResult> {
    throw new AiError('NOT_IMPLEMENTED', `Provider "${this.name}" does not support document processing yet.`);
  }

  async chat(_messages: ChatMessage[]): Promise<string> {
    throw new AiError('NOT_IMPLEMENTED', `Provider "${this.name}" does not support chat yet.`);
  }

  async embeddings(_text: string): Promise<number[]> {
    throw new AiError('NOT_IMPLEMENTED', `Provider "${this.name}" does not support embeddings yet.`);
  }
}

/**
 * Provider factory.
 *
 * createProvider(config) returns the concrete AiProvider implementation for
 * the specified provider string.  Unknown providers fall back to
 * NotImplementedProvider so new provider names never crash the application.
 *
 * loadProviderConfig(pool) reads ai_settings from the database and returns
 * an AiProviderConfig ready to pass to createProvider.
 */
import type { Pool } from 'pg';
import type { AiProvider, AiProviderConfig } from './types';
import { OpenAiProvider }          from './providers/openai';
import { NotImplementedProvider }  from './providers/not-implemented';

// ── Factory ───────────────────────────────────────────────────────────────────

export function createProvider(config: AiProviderConfig): AiProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAiProvider(config);
    case 'anthropic':
    case 'gemini':
    case 'openrouter':
    case 'ollama':
    default:
      return new NotImplementedProvider(config);
  }
}

// ── DB loader ─────────────────────────────────────────────────────────────────

interface AiSettingsRow {
  enabled:              boolean;
  provider:             string;
  model:                string;
  api_key_encrypted:    string | null;
  base_url:             string | null;
  confidence_threshold: number;
  approval_policy:      string;
  process_after_upload: boolean;
}

/** Load AI settings from the database and return a provider config. */
export async function loadProviderConfig(pool: Pool): Promise<{
  config:    AiProviderConfig;
  settings:  AiSettingsRow;
}> {
  const { rows } = await pool.query<AiSettingsRow>(
    `SELECT enabled, provider, model, api_key_encrypted, base_url,
            confidence_threshold, approval_policy, process_after_upload
       FROM ai_settings WHERE id = 1`,
  );

  const row = rows[0] ?? {
    enabled: false, provider: 'openai', model: 'gpt-4o-mini',
    api_key_encrypted: null, base_url: null,
    confidence_threshold: 90, approval_policy: 'review', process_after_upload: false,
  };

  const config: AiProviderConfig = {
    provider: row.provider as AiProviderConfig['provider'],
    model:    row.model,
    apiKey:   row.api_key_encrypted,
    baseUrl:  row.base_url,
  };

  return { config, settings: row };
}

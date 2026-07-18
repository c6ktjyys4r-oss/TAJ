/**
 * AiSettings — full AI configuration panel for Settings → AI & Automation.
 *
 * Sections:
 *   General    — enable AI, processing, assistant
 *   Provider   — provider, model, API key, base URL, test connection
 *   Processing — confidence threshold, approval policy
 *   Field Policies — per-field override of the approval policy
 *   Logging    — log retention and prompt/response storage
 *   Security   — key masking notice
 *
 * Data is fetched from GET /api/ai/settings on mount.
 * Saved via PUT /api/ai/settings on button click.
 * API key is NEVER returned from the server — only api_key_set: boolean.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain, Server, Sliders, ListChecks, BookOpen, Shield,
  CheckCircle2, XCircle, Loader2, RefreshCw, Eye, EyeOff,
  ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '../ui/Card';
import { Button }           from '../ui/Button';
import { aiSettingsApi }    from '../../lib/api/ai';
import { useSettings }      from '../../context/SettingsContext';
import type {
  AiSettingsResponse, AiProvider, ApprovalPolicy, FieldPolicy,
  TestConnectionResult,
} from '../../lib/api/types';

// ── Local types ───────────────────────────────────────────────────────────────

interface LocalSettings {
  enabled:               boolean;
  process_after_upload:  boolean;
  assistant_enabled:     boolean;
  provider:              AiProvider;
  model:                 string;
  api_key:               string;   // empty = "no change", value = update/clear
  api_key_set:           boolean;  // from server — key is stored
  base_url:              string;
  temperature:           number;   // 0.0–2.0
  max_tokens:            number;   // 1–8192
  timeout_ms:            number;   // provider API call timeout in ms
  max_retries:           number;   // max retry attempts per failed job
  parallel_workers:      number;   // max concurrent AI jobs
  confidence_threshold:  number;
  approval_policy:       ApprovalPolicy;
  policy_category:       FieldPolicy;
  policy_branch:         FieldPolicy;
  policy_invoice_date:   FieldPolicy;
  policy_invoice_number: FieldPolicy;
  policy_supplier:       FieldPolicy;
  policy_tax:            FieldPolicy;
  policy_currency:       FieldPolicy;
  log_enabled:           boolean;
  store_prompts:         boolean;
  store_responses:       boolean;
  max_log_entries:       number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PROVIDERS: { value: AiProvider; label: string; defaultModel: string }[] = [
  { value: 'openai',     label: 'OpenAI',        defaultModel: 'gpt-4o-mini'           },
  { value: 'anthropic',  label: 'Anthropic',      defaultModel: 'claude-3-5-haiku-20241022' },
  { value: 'gemini',     label: 'Google Gemini',  defaultModel: 'gemini-1.5-flash'      },
  { value: 'openrouter', label: 'OpenRouter',     defaultModel: 'openai/gpt-4o-mini'    },
  { value: 'ollama',     label: 'Ollama (local)', defaultModel: 'llama3.1'              },
];

const POLICIES: { value: ApprovalPolicy; label: string; hint: string }[] = [
  { value: 'automatic',  label: 'Automatic',        hint: 'Apply suggestions when confidence ≥ threshold'   },
  { value: 'review',     label: 'Review Required',  hint: 'Always create a suggestion for human review'     },
  { value: 'suggestion', label: 'Suggestion Only',  hint: 'Never modify the document automatically'         },
];

const FIELD_ROWS: { key: keyof LocalSettings; label: string }[] = [
  { key: 'policy_category',       label: 'Category'       },
  { key: 'policy_branch',         label: 'Branch'         },
  { key: 'policy_invoice_date',   label: 'Invoice Date'   },
  { key: 'policy_invoice_number', label: 'Invoice Number' },
  { key: 'policy_supplier',       label: 'Supplier'       },
  { key: 'policy_tax',            label: 'Tax'            },
  { key: 'policy_currency',       label: 'Currency'       },
];

const DEFAULT: LocalSettings = {
  enabled: false, process_after_upload: false, assistant_enabled: true,
  provider: 'openai', model: 'gpt-4o-mini', api_key: '', api_key_set: false, base_url: '',
  temperature: 0.1, max_tokens: 1024,
  timeout_ms: 30_000, max_retries: 3, parallel_workers: 3,
  confidence_threshold: 90, approval_policy: 'review',
  policy_category: 'review', policy_branch: 'review', policy_invoice_date: 'review',
  policy_invoice_number: 'review', policy_supplier: 'review', policy_tax: 'review', policy_currency: 'review',
  log_enabled: false, store_prompts: false, store_responses: false, max_log_entries: 1000,
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}
const ToggleRow: React.FC<ToggleRowProps> = ({ label, hint, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
    <div>
      <p className="text-sm font-medium text-ink-primary">{label}</p>
      {hint && <p className="text-xs text-ink-muted mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-10 h-5 rounded-full transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-1',
        checked ? 'bg-gold-500' : 'bg-gray-200',
      )}
    >
      <span className={clsx(
        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
        checked ? 'translate-x-5' : 'translate-x-0',
      )} />
    </button>
  </div>
);

interface SectionHeaderProps { icon: React.ReactNode; title: string; subtitle?: string }
const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-2.5 mb-4">
    <span className="mt-0.5 text-gold-500 shrink-0">{icon}</span>
    <div>
      <h3 className="text-sm font-semibold text-ink-primary">{title}</h3>
      {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const AiSettings: React.FC = () => {
  const { setAiCompanionEnabled } = useSettings();

  const [settings, setSettings]     = useState<LocalSettings>(DEFAULT);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [testing, setTesting]       = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [showKey, setShowKey]       = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data: AiSettingsResponse = await aiSettingsApi.get();
      setSettings({
        enabled:               data.enabled,
        process_after_upload:  data.process_after_upload,
        assistant_enabled:     data.assistant_enabled,
        provider:              data.provider,
        model:                 data.model,
        api_key:               '',            // never pre-fill — server never returns it
        api_key_set:           data.api_key_set,
        base_url:              data.base_url ?? '',
        temperature:           data.temperature ?? 0.1,
        max_tokens:            data.max_tokens ?? 1024,
        timeout_ms:            data.timeout_ms ?? 30_000,
        max_retries:           data.max_retries ?? 3,
        parallel_workers:      data.parallel_workers ?? 3,
        confidence_threshold:  data.confidence_threshold,
        approval_policy:       data.approval_policy,
        policy_category:       data.policy_category,
        policy_branch:         data.policy_branch,
        policy_invoice_date:   data.policy_invoice_date,
        policy_invoice_number: data.policy_invoice_number,
        policy_supplier:       data.policy_supplier,
        policy_tax:            data.policy_tax,
        policy_currency:       data.policy_currency,
        log_enabled:           data.log_enabled,
        store_prompts:         data.store_prompts,
        store_responses:       data.store_responses,
        max_log_entries:       data.max_log_entries,
      });
      // Sync the AICompanion floating button with the saved setting
      setAiCompanionEnabled(data.assistant_enabled);
    } catch {
      // Settings may not exist yet — keep defaults
    } finally {
      setLoading(false);
    }
  }, [setAiCompanionEnabled]);

  useEffect(() => { void load(); }, [load]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setTestResult(null);
    try {
      await aiSettingsApi.update({
        enabled:               settings.enabled,
        process_after_upload:  settings.process_after_upload,
        assistant_enabled:     settings.assistant_enabled,
        provider:              settings.provider,
        model:                 settings.model,
        // Only send api_key if user typed something (empty = "preserve existing")
        ...(settings.api_key !== '' ? { api_key: settings.api_key } : {}),
        base_url:              settings.base_url.trim() || null,
        temperature:           settings.temperature,
        max_tokens:            settings.max_tokens,
        timeout_ms:            settings.timeout_ms,
        max_retries:           settings.max_retries,
        parallel_workers:      settings.parallel_workers,
        confidence_threshold:  settings.confidence_threshold,
        approval_policy:       settings.approval_policy,
        policy_category:       settings.policy_category,
        policy_branch:         settings.policy_branch,
        policy_invoice_date:   settings.policy_invoice_date,
        policy_invoice_number: settings.policy_invoice_number,
        policy_supplier:       settings.policy_supplier,
        policy_tax:            settings.policy_tax,
        policy_currency:       settings.policy_currency,
        log_enabled:           settings.log_enabled,
        store_prompts:         settings.store_prompts,
        store_responses:       settings.store_responses,
        max_log_entries:       settings.max_log_entries,
      });
      // Sync floating AI companion button
      setAiCompanionEnabled(settings.assistant_enabled);
      // If user entered a new key, mark it as set and clear the field
      if (settings.api_key !== '') {
        setSettings((s) => ({ ...s, api_key: '', api_key_set: settings.api_key !== '' }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Test connection ───────────────────────────────────────────────────────

  const handleTest = async () => {
    // Save first so the test uses the latest settings
    await handleSave();
    setTesting(true);
    setTestResult(null);
    try {
      const result = await aiSettingsApi.testConnection();
      setTestResult(result);
    } catch {
      setTestResult({ ok: false, error: 'Request failed' });
    } finally {
      setTesting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const set = <K extends keyof LocalSettings>(k: K, v: LocalSettings[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));

  const inputCls = clsx(
    'w-full h-9 rounded-lg border border-border bg-white text-sm text-ink-primary placeholder-ink-muted px-3',
    'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400',
  );

  const selectCls = inputCls;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── General ─────────────────────────────────────────────────────── */}
      <Card padding="md">
        <SectionHeader icon={<Brain size={16} />} title="General" subtitle="Master switches for the AI subsystem" />
        <ToggleRow
          label="Enable AI"
          hint="Master switch — disabling this suspends all AI processing"
          checked={settings.enabled}
          onChange={(v) => set('enabled', v)}
        />
        <ToggleRow
          label="Enable AI Processing after Upload"
          hint="Automatically analyse new documents immediately after they are uploaded"
          checked={settings.process_after_upload}
          onChange={(v) => set('process_after_upload', v)}
        />
        <ToggleRow
          label="Enable AI Assistant"
          hint="Show the floating AI chat assistant across all pages"
          checked={settings.assistant_enabled}
          onChange={(v) => set('assistant_enabled', v)}
        />
      </Card>

      {/* ── Provider ────────────────────────────────────────────────────── */}
      <Card padding="md">
        <SectionHeader icon={<Server size={16} />} title="Provider" subtitle="Configure the AI model and credentials" />

        <div className="space-y-3">
          {/* Provider select */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink-primary">Provider</label>
            <div className="relative">
              <select
                value={settings.provider}
                onChange={(e) => {
                  const p = e.target.value as AiProvider;
                  const defaultModel = PROVIDERS.find((x) => x.value === p)?.defaultModel ?? '';
                  setSettings((s) => ({ ...s, provider: p, model: defaultModel }));
                  setTestResult(null);
                }}
                className={clsx(selectCls, 'pr-8 appearance-none')}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            </div>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink-primary">Model</label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => set('model', e.target.value)}
              placeholder="e.g. gpt-4o-mini"
              className={inputCls}
            />
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink-primary">API Key</label>
              {settings.api_key_set && (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={11} /> Key saved
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.api_key}
                onChange={(e) => set('api_key', e.target.value)}
                placeholder={settings.api_key_set ? 'Paste to replace saved key…' : 'sk-…'}
                autoComplete="new-password"
                className={clsx(inputCls, 'pr-10')}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary transition-colors"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[11px] text-ink-muted">
              Leave blank to keep the existing key. Clear the saved key by saving with an empty field after clicking the eye icon.
            </p>
          </div>

          {/* Temperature */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink-primary">Temperature</label>
              <span className="text-sm font-semibold text-gold-600 tabular-nums">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={settings.temperature}
              onChange={(e) => set('temperature', parseFloat(e.target.value))}
              className="w-full accent-gold-500"
              aria-label="Temperature"
            />
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-ink-muted">0.0 — deterministic</span>
              <span className="text-[10px] text-ink-muted">2.0 — creative</span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Lower values (≈ 0.1) produce consistent extractions. Raise only for generative tasks.
            </p>
          </div>

          {/* Max Tokens */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-primary">Max Tokens</p>
              <p className="text-xs text-ink-muted mt-0.5">Upper bound on the provider response length (1–8192)</p>
            </div>
            <input
              type="number"
              min={1}
              max={8192}
              step={1}
              value={settings.max_tokens}
              onChange={(e) => set('max_tokens', Math.min(8192, Math.max(1, Math.round(Number(e.target.value)))))}
              className="w-24 h-8 rounded-lg border border-border px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gold-400"
              aria-label="Max tokens"
            />
          </div>

          {/* Timeout */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-primary">Timeout</p>
              <p className="text-xs text-ink-muted mt-0.5">Provider API call timeout in milliseconds (1 000–300 000)</p>
            </div>
            <input
              type="number"
              min={1000}
              max={300000}
              step={1000}
              value={settings.timeout_ms}
              onChange={(e) => set('timeout_ms', Math.min(300_000, Math.max(1_000, Math.round(Number(e.target.value)))))}
              className="w-28 h-8 rounded-lg border border-border px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gold-400"
              aria-label="Timeout in milliseconds"
            />
          </div>

          {/* Max Retries */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-primary">Max Retries</p>
              <p className="text-xs text-ink-muted mt-0.5">Retry attempts per failed AI job (0 = no retries, max 10)</p>
            </div>
            <input
              type="number"
              min={0}
              max={10}
              step={1}
              value={settings.max_retries}
              onChange={(e) => set('max_retries', Math.min(10, Math.max(0, Math.round(Number(e.target.value)))))}
              className="w-24 h-8 rounded-lg border border-border px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gold-400"
              aria-label="Max retries"
            />
          </div>

          {/* Parallel Workers */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-primary">Parallel Workers</p>
              <p className="text-xs text-ink-muted mt-0.5">Maximum concurrent AI jobs in this process (1–20)</p>
            </div>
            <input
              type="number"
              min={1}
              max={20}
              step={1}
              value={settings.parallel_workers}
              onChange={(e) => set('parallel_workers', Math.min(20, Math.max(1, Math.round(Number(e.target.value)))))}
              className="w-24 h-8 rounded-lg border border-border px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gold-400"
              aria-label="Parallel workers"
            />
          </div>

          {/* Base URL */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink-primary">
              Base URL <span className="text-ink-muted font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={settings.base_url}
              onChange={(e) => set('base_url', e.target.value)}
              placeholder="https://api.openai.com"
              className={inputCls}
            />
            <p className="text-[11px] text-ink-muted">Override for OpenAI-compatible endpoints or Ollama.</p>
          </div>

          {/* Test connection */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="secondary"
              size="sm"
              loading={testing}
              onClick={handleTest}
              icon={<RefreshCw size={13} />}
            >
              Test Connection
            </Button>
            {testResult && !testing && (
              testResult.ok ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 size={13} />
                  Connected{testResult.latencyMs != null ? ` · ${testResult.latencyMs}ms` : ''}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <XCircle size={13} />
                  {testResult.error ?? 'Connection failed'}
                </span>
              )
            )}
          </div>
        </div>
      </Card>

      {/* ── Processing ──────────────────────────────────────────────────── */}
      <Card padding="md">
        <SectionHeader icon={<Sliders size={16} />} title="Processing" subtitle="Control when and how suggestions are applied" />

        {/* Confidence threshold */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-ink-primary">Confidence Threshold</label>
            <span className="text-sm font-semibold text-gold-600 tabular-nums">
              {settings.confidence_threshold}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={settings.confidence_threshold}
            onChange={(e) => set('confidence_threshold', Number(e.target.value))}
            className="w-full accent-gold-500"
            aria-label="Confidence threshold"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-ink-muted">50% — permissive</span>
            <span className="text-[10px] text-ink-muted">100% — strict</span>
          </div>
        </div>

        {/* Approval policy */}
        <div>
          <p className="text-sm font-medium text-ink-primary mb-2">Approval Policy</p>
          <div className="space-y-2">
            {POLICIES.map((pol) => (
              <label
                key={pol.value}
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  settings.approval_policy === pol.value
                    ? 'border-gold-400 bg-gold-50'
                    : 'border-border hover:border-gray-300',
                )}
              >
                <input
                  type="radio"
                  name="approval_policy"
                  value={pol.value}
                  checked={settings.approval_policy === pol.value}
                  onChange={() => set('approval_policy', pol.value)}
                  className="mt-0.5 accent-gold-500"
                />
                <div>
                  <p className="text-sm font-medium text-ink-primary">{pol.label}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{pol.hint}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Field Policies ──────────────────────────────────────────────── */}
      <Card padding="md">
        <SectionHeader
          icon={<ListChecks size={16} />}
          title="Field Policies"
          subtitle="Override the approval policy for individual extracted fields"
        />
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 text-xs font-medium text-ink-muted w-40">Field</th>
                {(['automatic', 'review', 'suggestion'] as FieldPolicy[]).map((p) => (
                  <th key={p} className="text-center pb-2 text-xs font-medium text-ink-muted capitalize px-2">
                    {p === 'suggestion' ? 'Suggestion Only' : p === 'automatic' ? 'Automatic' : 'Review'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELD_ROWS.map(({ key, label }) => (
                <tr key={key} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 text-sm text-ink-primary font-medium">{label}</td>
                  {(['automatic', 'review', 'suggestion'] as FieldPolicy[]).map((p) => (
                    <td key={p} className="text-center py-2.5 px-2">
                      <input
                        type="radio"
                        name={key}
                        value={p}
                        checked={(settings[key] as FieldPolicy) === p}
                        onChange={() => set(key, p as LocalSettings[typeof key])}
                        className="accent-gold-500"
                        aria-label={`${label} — ${p}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Logging ─────────────────────────────────────────────────────── */}
      <Card padding="md">
        <SectionHeader icon={<BookOpen size={16} />} title="Logging" subtitle="Control what the AI system records" />
        <ToggleRow
          label="Enable AI Log"
          hint="Record all AI processing events"
          checked={settings.log_enabled}
          onChange={(v) => set('log_enabled', v)}
        />
        <ToggleRow
          label="Store Prompt History"
          hint="Retain the prompts sent to the AI provider"
          checked={settings.store_prompts}
          onChange={(v) => set('store_prompts', v)}
        />
        <ToggleRow
          label="Store Model Responses"
          hint="Retain raw AI responses alongside extracted data"
          checked={settings.store_responses}
          onChange={(v) => set('store_responses', v)}
        />
        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-sm font-medium text-ink-primary">Maximum retained logs</p>
            <p className="text-xs text-ink-muted mt-0.5">Older entries are pruned automatically</p>
          </div>
          <input
            type="number"
            min={0}
            max={100000}
            step={100}
            value={settings.max_log_entries}
            onChange={(e) => set('max_log_entries', Math.max(0, Number(e.target.value)))}
            className="w-24 h-8 rounded-lg border border-border px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label="Maximum retained logs"
          />
        </div>
      </Card>

      {/* ── Security ────────────────────────────────────────────────────── */}
      <Card padding="md">
        <SectionHeader icon={<Shield size={16} />} title="Security" />
        <div className="space-y-2 text-sm text-ink-secondary">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>API keys are stored server-side and <strong className="text-ink-primary">never returned</strong> to the browser.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>API keys are <strong className="text-ink-primary">never written to server logs</strong> or error reports.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
            <span>Prompt and response storage is <strong className="text-ink-primary">opt-in</strong> and disabled by default.</span>
          </div>
        </div>
      </Card>

      {/* ── Save ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-2">
        <Button onClick={handleSave} loading={saving}>
          {saved ? 'Saved ✓' : 'Save AI Settings'}
        </Button>
        {saveError && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <XCircle size={13} />
            {saveError}
          </span>
        )}
      </div>

    </div>
  );
};

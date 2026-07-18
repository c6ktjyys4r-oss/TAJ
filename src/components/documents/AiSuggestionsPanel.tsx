/**
 * AiSuggestionsPanel — AI extraction review panel.
 *
 * Shown inside the PreviewPanel for any document that has or could have an
 * AI job.  Handles all states of the AI pipeline:
 *
 *   pending / processing — spinner with live polling (every 3 s)
 *   failed               — error message with Retry button
 *   completed            — per-field Accept / Reject controls
 *   no job               — empty state (AI not enabled or not yet triggered)
 *
 * After Accept / Reject actions the job is reloaded from the server so the
 * displayed actions stay in sync with what's actually stored.
 *
 * The panel is self-contained: it manages its own data fetching and never
 * mutates any parent state beyond calling onDocumentUpdated() as a signal.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Brain, Loader2, AlertCircle, CheckCircle2, XCircle,
  RefreshCw, Zap, ChevronDown, ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { aiSettingsApi } from '../../lib/api/ai';
import { toast }         from '../ui/Toast';
import type {
  AiJobResponse,
  AiExtractionResult,
  AiExtractionField,
  AiJobStatus,
} from '../../lib/api/types';

// ── Field definitions ─────────────────────────────────────────────────────────

type ExtractionKey = keyof Omit<AiExtractionResult, 'overall_confidence'>;

const FIELD_DEFS: { key: ExtractionKey; label: string }[] = [
  { key: 'supplier',       label: 'Supplier'       },
  { key: 'invoice_number', label: 'Invoice No.'    },
  { key: 'invoice_date',   label: 'Invoice Date'   },
  { key: 'currency',       label: 'Currency'       },
  { key: 'subtotal',       label: 'Subtotal'       },
  { key: 'vat',            label: 'VAT'            },
  { key: 'total',          label: 'Total'          },
  { key: 'document_type',  label: 'Document Type'  },
  { key: 'summary',        label: 'Summary'        },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface AiSuggestionsPanelProps {
  documentId: string;
  /** Called after any accept / reject action so the parent can refresh state. */
  onDocumentUpdated?: () => void;
}

// ── Confidence badge ──────────────────────────────────────────────────────────

function ConfidenceBadge({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : pct >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-600 border-red-200';

  return (
    <span className={clsx(
      'inline-flex items-center text-[10px] font-semibold tabular-nums',
      'px-1.5 py-0.5 rounded-full border',
      color,
    )}>
      {pct}%
    </span>
  );
}

// ── Single field row ──────────────────────────────────────────────────────────

interface FieldRowProps {
  label:      string;
  field:      AiExtractionField;
  fieldKey:   ExtractionKey;
  actionBusy: boolean;
  onAccept:   (key: ExtractionKey) => void;
  onReject:   (key: ExtractionKey) => void;
}

function FieldRow({ label, field, fieldKey, actionBusy, onAccept, onReject }: FieldRowProps) {
  const action = field.action ?? null;

  const displayValue = field.value ?? '—';
  const isSuggested  = action === 'suggested' || action == null;
  const isAccepted   = action === 'accepted';
  const isRejected   = action === 'rejected';
  const isApplied    = action === 'applied';

  return (
    <div className={clsx(
      'rounded-lg px-2.5 py-2 border text-[11px]',
      isAccepted ? 'bg-emerald-50 border-emerald-200'
      : isRejected ? 'bg-gray-50 border-gray-200 opacity-60'
      : isApplied ? 'bg-blue-50 border-blue-200'
      : 'bg-white border-border',
    )}>
      <div className="flex items-start justify-between gap-2">
        {/* Left: label + value */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-ink-muted font-medium uppercase tracking-wide truncate">
            {label}
          </p>
          <p className={clsx(
            'font-medium mt-0.5 break-words leading-snug',
            isRejected ? 'text-ink-muted line-through' : 'text-ink-primary',
          )}>
            {displayValue}
          </p>
        </div>

        {/* Right: confidence + action state */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <ConfidenceBadge pct={field.confidence} />

          {isApplied && (
            <span className="flex items-center gap-0.5 text-[10px] text-blue-600 font-medium">
              <Zap size={9} />
              Auto-applied
            </span>
          )}
          {isAccepted && (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
              <CheckCircle2 size={9} />
              Accepted
            </span>
          )}
          {isRejected && (
            <span className="flex items-center gap-0.5 text-[10px] text-ink-muted font-medium">
              <XCircle size={9} />
              Rejected
            </span>
          )}
        </div>
      </div>

      {/* Accept / Reject buttons — only for pending suggestions */}
      {isSuggested && (
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={() => onAccept(fieldKey)}
            disabled={actionBusy}
            aria-label={`Accept ${label}`}
            className={clsx(
              'flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
              'border-emerald-300 text-emerald-700 bg-emerald-50',
              'hover:bg-emerald-100 transition-colors',
              actionBusy && 'opacity-40 cursor-not-allowed',
            )}
          >
            <CheckCircle2 size={9} />
            Accept
          </button>
          <button
            onClick={() => onReject(fieldKey)}
            disabled={actionBusy}
            aria-label={`Reject ${label}`}
            className={clsx(
              'flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
              'border-gray-300 text-ink-muted bg-white',
              'hover:bg-gray-50 hover:text-ink-primary transition-colors',
              actionBusy && 'opacity-40 cursor-not-allowed',
            )}
          >
            <XCircle size={9} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export const AiSuggestionsPanel: React.FC<AiSuggestionsPanelProps> = ({
  documentId,
  onDocumentUpdated,
}) => {
  const [job,        setJob]        = useState<AiJobResponse | null | undefined>(undefined); // undefined = loading
  const [loadError,  setLoadError]  = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [retrying,   setRetrying]   = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(true);

  // ── Fetch job ──────────────────────────────────────────────────────────────

  const fetchJob = useCallback(async () => {
    try {
      const data = await aiSettingsApi.getDocumentJob(documentId);
      if (!activeRef.current) return;
      setJob(data);
      setLoadError(null);
    } catch {
      if (!activeRef.current) return;
      setLoadError('Failed to load AI status');
    }
  }, [documentId]);

  // ── Polling ───────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(() => {
      void fetchJob();
    }, 3_000);
  }, [fetchJob, stopPolling]);

  // ── Mount / documentId change ─────────────────────────────────────────────

  useEffect(() => {
    activeRef.current = true;
    setJob(undefined);
    setLoadError(null);
    setActionBusy(false);
    setRetrying(false);
    stopPolling();

    void fetchJob();

    return () => {
      activeRef.current = false;
      stopPolling();
    };
  }, [documentId, fetchJob, stopPolling]);

  // ── Start / stop polling based on job status ──────────────────────────────

  useEffect(() => {
    const status = job?.status;
    if (status === 'pending' || status === 'processing') {
      startPolling();
    } else {
      stopPolling();
    }
  }, [job?.status, startPolling, stopPolling]);

  // ── Retry ─────────────────────────────────────────────────────────────────

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const updated = await aiSettingsApi.retryDocumentJob(documentId);
      setJob(updated);
      startPolling();
      toast.success('AI processing re-queued');
    } catch {
      toast.error('Failed to retry AI processing');
    } finally {
      setRetrying(false);
    }
  };

  // ── Accept / Reject ───────────────────────────────────────────────────────

  const handleAccept = async (fieldKey: ExtractionKey) => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      await aiSettingsApi.acceptSuggestions(documentId, { fields: [fieldKey] });
      await fetchJob();
      onDocumentUpdated?.();
      toast.success('Suggestion accepted');
    } catch {
      toast.error('Failed to accept suggestion');
    } finally {
      setActionBusy(false);
    }
  };

  const handleReject = async (fieldKey: ExtractionKey) => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      await aiSettingsApi.rejectSuggestions(documentId, { fields: [fieldKey] });
      await fetchJob();
      toast.success('Suggestion rejected');
    } catch {
      toast.error('Failed to reject suggestion');
    } finally {
      setActionBusy(false);
    }
  };

  const handleAcceptAll = async () => {
    if (actionBusy || !job?.result) return;
    const pending = FIELD_DEFS
      .filter(({ key }) => {
        const f = job.result![key] as AiExtractionField | undefined;
        return f && (f.action === 'suggested' || f.action == null) && f.value !== null;
      })
      .map(({ key }) => key);
    if (pending.length === 0) return;

    setActionBusy(true);
    try {
      await aiSettingsApi.acceptSuggestions(documentId, { fields: pending });
      await fetchJob();
      onDocumentUpdated?.();
      toast.success(`${pending.length} suggestion${pending.length > 1 ? 's' : ''} accepted`);
    } catch {
      toast.error('Failed to accept all suggestions');
    } finally {
      setActionBusy(false);
    }
  };

  const handleRejectAll = async () => {
    if (actionBusy || !job?.result) return;
    const pending = FIELD_DEFS
      .filter(({ key }) => {
        const f = job.result![key] as AiExtractionField | undefined;
        return f && (f.action === 'suggested' || f.action == null) && f.value !== null;
      })
      .map(({ key }) => key);
    if (pending.length === 0) return;

    setActionBusy(true);
    try {
      await aiSettingsApi.rejectSuggestions(documentId, { fields: pending });
      await fetchJob();
      toast.success(`${pending.length} suggestion${pending.length > 1 ? 's' : ''} rejected`);
    } catch {
      toast.error('Failed to reject all suggestions');
    } finally {
      setActionBusy(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const status: AiJobStatus | null = job?.status ?? null;
  const result = job?.result ?? null;

  const suggestedFields = result
    ? FIELD_DEFS.filter(({ key }) => {
        const f = result[key] as AiExtractionField | undefined;
        return f && (f.action === 'suggested' || f.action == null) && f.value !== null;
      })
    : [];

  const appliedFields = result
    ? FIELD_DEFS.filter(({ key }) => {
        const f = result[key] as AiExtractionField | undefined;
        return f && f.action === 'applied';
      })
    : [];

  const reviewedFields = result
    ? FIELD_DEFS.filter(({ key }) => {
        const f = result[key] as AiExtractionField | undefined;
        return f && (f.action === 'accepted' || f.action === 'rejected');
      })
    : [];

  const hasSuggested = suggestedFields.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  // Loading skeleton
  if (job === undefined) {
    return (
      <div className="space-y-2.5">
        <SectionHeader />
        <div className="flex items-center justify-center py-4">
          <Loader2 size={14} className="animate-spin text-ink-muted" aria-hidden="true" />
        </div>
      </div>
    );
  }

  // Load error
  if (loadError) {
    return (
      <div className="space-y-2.5">
        <SectionHeader />
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />
          {loadError}
        </p>
      </div>
    );
  }

  // No job (AI not enabled or hasn't run yet)
  if (!job) {
    return (
      <div className="space-y-2.5">
        <SectionHeader />
        <p className="text-[11px] text-ink-muted italic">
          AI processing has not run for this document.
        </p>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className={clsx(
            'flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg',
            'border border-border text-ink-muted',
            'hover:text-gold-600 hover:border-gold-300 hover:bg-gold-50 transition-colors',
            retrying && 'opacity-40 cursor-not-allowed',
          )}
        >
          {retrying
            ? <><Loader2 size={11} className="animate-spin" /> Queuing…</>
            : <><RefreshCw size={11} /> Run AI Processing</>
          }
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary hover:text-gold-600 transition-colors"
        >
          <Brain size={12} aria-hidden="true" />
          AI Suggestions
          {collapsed
            ? <ChevronDown size={11} />
            : <ChevronUp   size={11} />
          }
        </button>

        {/* Overall confidence */}
        {status === 'completed' && result && (
          <ConfidenceBadge pct={result.overall_confidence} />
        )}
      </div>

      {collapsed ? null : (

        <>
          {/* ── Pending / Processing ── */}
          {(status === 'pending' || status === 'processing') && (
            <div className="flex items-center gap-2 py-2 text-[11px] text-ink-muted">
              <Loader2 size={12} className="animate-spin shrink-0" aria-hidden="true" />
              {status === 'pending' ? 'Queued — waiting to process…' : 'Processing document…'}
            </div>
          )}

          {/* ── Failed ── */}
          {status === 'failed' && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 space-y-1.5">
              <p className="flex items-center gap-1 text-[11px] text-red-600 font-medium">
                <AlertCircle size={11} />
                AI processing failed
              </p>
              {job.error && (
                <p className="text-[10px] text-red-500 break-words">{job.error}</p>
              )}
              <button
                onClick={handleRetry}
                disabled={retrying}
                className={clsx(
                  'flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                  'border-red-300 text-red-600 bg-white hover:bg-red-50 transition-colors',
                  retrying && 'opacity-40 cursor-not-allowed',
                )}
              >
                {retrying
                  ? <><Loader2 size={9} className="animate-spin" /> Queuing…</>
                  : <><RefreshCw size={9} /> Retry</>
                }
              </button>
            </div>
          )}

          {/* ── Completed ── */}
          {status === 'completed' && result && (
            <div className="space-y-2">

              {/* Accept All / Reject All — only if there are pending suggestions */}
              {hasSuggested && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAcceptAll}
                    disabled={actionBusy}
                    className={clsx(
                      'flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border',
                      'border-emerald-300 text-emerald-700 bg-emerald-50',
                      'hover:bg-emerald-100 transition-colors',
                      actionBusy && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    <CheckCircle2 size={10} />
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    disabled={actionBusy}
                    className={clsx(
                      'flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border',
                      'border-gray-300 text-ink-muted bg-white',
                      'hover:bg-gray-50 hover:text-ink-primary transition-colors',
                      actionBusy && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    <XCircle size={10} />
                    Reject All
                  </button>
                  {actionBusy && (
                    <Loader2 size={11} className="animate-spin text-ink-muted" />
                  )}
                </div>
              )}

              {/* ── Fields needing review ── */}
              {suggestedFields.length > 0 && (
                <div className="space-y-1.5">
                  {suggestedFields.map(({ key, label }) => (
                    <FieldRow
                      key={key}
                      label={label}
                      field={result[key] as AiExtractionField}
                      fieldKey={key}
                      actionBusy={actionBusy}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}

              {/* ── Auto-applied fields ── */}
              {appliedFields.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-ink-muted uppercase tracking-wide font-medium flex items-center gap-1">
                    <Zap size={9} /> Auto-applied
                  </p>
                  {appliedFields.map(({ key, label }) => (
                    <FieldRow
                      key={key}
                      label={label}
                      field={result[key] as AiExtractionField}
                      fieldKey={key}
                      actionBusy={actionBusy}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}

              {/* ── Already reviewed ── */}
              {reviewedFields.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-ink-muted uppercase tracking-wide font-medium">
                    Reviewed
                  </p>
                  {reviewedFields.map(({ key, label }) => (
                    <FieldRow
                      key={key}
                      label={label}
                      field={result[key] as AiExtractionField}
                      fieldKey={key}
                      actionBusy={actionBusy}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}

              {/* ── All done ── */}
              {!hasSuggested && appliedFields.length === 0 && reviewedFields.length === 0 && (
                <p className="text-[11px] text-ink-muted italic">
                  No extractable fields found in this document.
                </p>
              )}

              {/* ── No suggestions remaining ── */}
              {!hasSuggested && (appliedFields.length > 0 || reviewedFields.length > 0) && (
                <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={10} />
                  All suggestions reviewed
                </p>
              )}

            </div>
          )}
        </>

      )}
    </div>
  );
};

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
      <Brain size={12} aria-hidden="true" />
      AI Suggestions
    </span>
  );
}

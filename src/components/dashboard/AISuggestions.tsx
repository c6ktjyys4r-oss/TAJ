/**
 * AISuggestions — real-time AI processing status panel.
 *
 * Previously used hardcoded mock data. Now fetches live stats from
 * GET /api/ai/dashboard and surfaces actionable items based on actual
 * queue state: pending reviews, extraction failures, throughput, and confidence.
 *
 * Falls back gracefully when the API is unavailable or the AI module is
 * not configured (all counts zero → shows a neutral "no AI jobs" state).
 */
import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, AlertTriangle, CheckCircle2, Brain, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { api } from '../../lib/api/client';
import type { AiDashboardStats } from '../../lib/api/types';

const priorityStyles = {
  high:   'border-l-gold-500 bg-gold-50/50',
  medium: 'border-l-blue-400 bg-blue-50/30',
  low:    'border-l-gray-300 bg-gray-50/50',
};

interface SuggestionItem {
  id:       string;
  icon:     React.ElementType;
  title:    string;
  body:     string;
  cta:      string;
  to:       string;
  priority: 'high' | 'medium' | 'low';
}

function buildSuggestions(stats: AiDashboardStats): SuggestionItem[] {
  const items: SuggestionItem[] = [];

  const pending = (stats.pending_count ?? 0) + (stats.processing_count ?? 0) + (stats.retry_count ?? 0);
  const failed  = stats.failed_count ?? 0;
  const completed = stats.completed_count ?? 0;
  const avgConf = stats.avg_confidence ?? null;

  if (failed > 0) {
    items.push({
      id: 'failed', icon: AlertTriangle,
      title: `${failed} AI Extraction ${failed === 1 ? 'Failure' : 'Failures'}`,
      body: `${failed === 1 ? 'A document' : `${failed} documents`} could not be processed by AI. Review and retry from the Documents page.`,
      cta: 'Review Failures', to: '/documents',
      priority: 'high',
    });
  }

  if (pending > 0) {
    items.push({
      id: 'pending', icon: Brain,
      title: `${pending} ${pending === 1 ? 'Document' : 'Documents'} Pending AI Review`,
      body: `${pending === 1 ? 'One document is' : `${pending} documents are`} queued for AI extraction or awaiting your review.`,
      cta: 'Review Now', to: '/documents',
      priority: failed > 0 ? 'medium' : 'high',
    });
  }

  if (completed > 0) {
    items.push({
      id: 'completed', icon: CheckCircle2,
      title: `${completed} ${completed === 1 ? 'Document' : 'Documents'} Processed`,
      body: avgConf !== null
        ? `AI has extracted data from ${completed} ${completed === 1 ? 'document' : 'documents'} with ${Math.round(avgConf)}% average confidence.`
        : `AI has successfully extracted data from ${completed} ${completed === 1 ? 'document' : 'documents'}.`,
      cta: 'View Documents', to: '/documents',
      priority: 'low',
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'empty', icon: FileText,
      title: 'AI Processing Ready',
      body: 'Upload documents and enable AI processing in Settings to start automatic data extraction.',
      cta: 'Open Settings', to: '/settings',
      priority: 'low',
    });
  }

  return items;
}

export const AISuggestions: React.FC = () => {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState<AiDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.get<AiDashboardStats>('/api/ai/dashboard');
        if (!cancelled) setStats(data);
      } catch {
        // API unavailable or AI module not configured — show empty state
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    // Refresh every 30 s
    const interval = setInterval(() => { void load(); }, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 text-ink-muted">
        <Loader2 size={16} className="animate-spin mr-2" />
        <span className="text-xs">Loading AI status…</span>
      </div>
    );
  }

  const suggestions = buildSuggestions(stats ?? {
    pending_count: 0, processing_count: 0, retry_count: 0,
    completed_count: 0, failed_count: 0, cancelled_count: 0,
    avg_confidence: null, documents_processed: 0, provider_usage: {},
  });

  return (
    <div className="space-y-3">
      {suggestions.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.id}
            className={clsx(
              'flex items-start gap-4 p-4 rounded-xl border border-border border-l-4 transition-all duration-150 hover:shadow-card',
              priorityStyles[s.priority],
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-gold-100 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-gold-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-primary">{s.title}</p>
              <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">{s.body}</p>
            </div>
            <button
              onClick={() => navigate(s.to)}
              className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-700 whitespace-nowrap shrink-0 mt-0.5 transition-colors"
            >
              {s.cta} <ArrowRight size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

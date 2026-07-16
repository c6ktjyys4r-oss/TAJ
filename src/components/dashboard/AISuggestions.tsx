import React from 'react';
import { ArrowRight, FileText, GitMerge, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface Suggestion {
  id: string;
  icon: React.ElementType;
  title: string;
  body: string;
  cta: string;
  to: string;
  priority: 'high' | 'medium' | 'low';
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: '1', icon: BarChart2,
    title: 'Report Ready',
    body: 'Your Q4 Financial Summary has been generated and is ready for review and download.',
    cta: 'View Report', to: '/reports', priority: 'high',
  },
  {
    id: '2', icon: GitMerge,
    title: 'Bank Statement Needs Review',
    body: 'SABB October 2024 statement has 3 transactions that could not be automatically matched.',
    cta: 'Review Now', to: '/bank-matching', priority: 'high',
  },
  {
    id: '3', icon: FileText,
    title: '7 Documents Need Classification',
    body: 'Uploaded invoices and receipts are awaiting classification. AI confidence is high for most.',
    cta: 'Classify Documents', to: '/documents', priority: 'medium',
  },
];

const priorityStyles = {
  high:   'border-l-gold-500 bg-gold-50/50',
  medium: 'border-l-blue-400 bg-blue-50/30',
  low:    'border-l-gray-300 bg-gray-50/50',
};

export const AISuggestions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      {SUGGESTIONS.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.id}
            className={clsx(
              'flex items-start gap-4 p-4 rounded-xl border border-border border-l-4 transition-all duration-150 hover:shadow-card',
              priorityStyles[s.priority]
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

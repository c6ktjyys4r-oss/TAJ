import React, { useState } from 'react';
import { X, LayoutDashboard, FileText, BarChart2, GitMerge, Sparkles } from 'lucide-react';
import { StepIndicator } from '../ui/StepIndicator';
import { Button } from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const STEPS = [
  {
    label: 'Welcome',
    title: 'Welcome to TAJ Finance',
    description:
      'Your intelligent financial document management platform. In just a few seconds, we\'ll show you where everything lives.',
    icon: <Sparkles size={28} className="text-gold-500" />,
  },
  {
    label: 'Documents',
    title: 'Upload & Classify Documents',
    description:
      'Drag and drop invoices, receipts, and bank statements. AI will classify them automatically and flag anything that needs review.',
    icon: <FileText size={28} className="text-gold-500" />,
  },
  {
    label: 'Reports',
    title: 'Generate Financial Reports',
    description:
      'Build custom reports across any date range and bank account. Export to CSV or Excel in seconds.',
    icon: <BarChart2 size={28} className="text-gold-500" />,
  },
  {
    label: 'Bank Match',
    title: 'Reconcile Bank Transactions',
    description:
      'Review AI-suggested matches between your bank transactions and uploaded documents. Confirm, adjust, or flag for manual review.',
    icon: <GitMerge size={28} className="text-gold-500" />,
  },
  {
    label: 'Dashboard',
    title: "You're all set",
    description:
      'Your Dashboard shows live spend analytics, AI suggestions, and recent activity. Use Cmd+K to search anything from anywhere.',
    icon: <LayoutDashboard size={28} className="text-gold-500" />,
  },
];

export const OnboardingTour: React.FC = () => {
  const [done, setDone] = useLocalStorage<boolean>('taj_onboarding_done', false);
  const [step, setStep] = useState(0);

  if (done) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const dismiss = () => setDone(true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-float overflow-hidden">
        {/* Gold accent top line */}
        <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-100" />

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Skip tour"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Body */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-100 flex items-center justify-center mx-auto mb-4">
            {current.icon}
          </div>

          <h2
            id="onboarding-title"
            className="text-xl font-semibold text-ink-primary font-serif mb-2"
          >
            {current.title}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">{current.description}</p>
        </div>

        {/* Step indicator */}
        <div className="px-8 pb-4">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-border">
          <button
            onClick={dismiss}
            className="text-sm text-ink-muted hover:text-ink-primary transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
            >
              {isLast ? 'Get started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

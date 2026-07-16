import React, { useState, useRef } from 'react';
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
    icon: <Sparkles size={28} className="text-gold-500" aria-hidden="true" />,
  },
  {
    label: 'Documents',
    title: 'Upload & Classify Documents',
    description:
      'Drag and drop invoices, receipts, and bank statements. AI will classify them automatically and flag anything that needs review.',
    icon: <FileText size={28} className="text-gold-500" aria-hidden="true" />,
  },
  {
    label: 'Reports',
    title: 'Generate Financial Reports',
    description:
      'Build custom reports across any date range and bank account. Export to CSV or Excel in seconds.',
    icon: <BarChart2 size={28} className="text-gold-500" aria-hidden="true" />,
  },
  {
    label: 'Bank Match',
    title: 'Reconcile Bank Transactions',
    description:
      'Review AI-suggested matches between your bank transactions and uploaded documents. Confirm, adjust, or flag for manual review.',
    icon: <GitMerge size={28} className="text-gold-500" aria-hidden="true" />,
  },
  {
    label: 'Dashboard',
    title: "You're all set",
    description:
      'Your Dashboard shows live spend analytics, AI suggestions, and recent activity. Use Cmd+K to search anything from anywhere.',
    icon: <LayoutDashboard size={28} className="text-gold-500" aria-hidden="true" />,
  },
];

const SWIPE_THRESHOLD = 60; // px

export const OnboardingTour: React.FC = () => {
  const [done, setDone] = useLocalStorage<boolean>('taj_onboarding_done', false);
  const [step, setStep] = useState(0);
  const touchStartX    = useRef<number>(0);

  if (done) return null;

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;
  const dismiss = () => setDone(true);

  const goNext = () => (isLast ? dismiss() : setStep((s) => s + 1));
  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  // Swipe left → next; swipe right → back
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -SWIPE_THRESHOLD) goNext();
    else if (delta > SWIPE_THRESHOLD && step > 0) goPrev();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} aria-hidden="true" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-float overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Gold accent top line */}
        <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-100" aria-hidden="true" />

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Skip tour"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-gray-100 transition-colors"
        >
          <X size={16} aria-hidden="true" />
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
          {/* Swipe hint — mobile only */}
          <p className="mt-3 text-[10px] text-ink-muted sm:hidden">
            Swipe left or right to navigate
          </p>
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
              <Button variant="secondary" size="sm" onClick={goPrev}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={goNext}>
              {isLast ? 'Get started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

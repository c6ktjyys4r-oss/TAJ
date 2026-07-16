import React, { useState } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { StepIndicator } from '../ui/StepIndicator';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { clsx } from 'clsx';

const STEPS = [
  { label: 'Type' },
  { label: 'Vendor' },
  { label: 'Date' },
  { label: 'Confirm' },
];

const DOC_TYPES = ['Invoice', 'Receipt', 'Bank Statement', 'Contract', 'Purchase Order', 'Expense Report', 'Other'];

const AI_SUGGESTIONS: Record<number, { text: string; confidence: number }> = {
  0: { text: 'Invoice', confidence: 94 },
  1: { text: 'Al Rajhi Cement Co.', confidence: 87 },
  2: { text: '2024-10-15', confidence: 91 },
};

interface ClassificationFlowProps {
  open: boolean;
  onClose: () => void;
  documentName?: string;
}

export const ClassificationFlow: React.FC<ClassificationFlowProps> = ({
  open, onClose, documentName = 'Document'
}) => {
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState('');
  const [done, setDone] = useState(false);

  const reset = () => { setStep(0); setDocType(''); setVendor(''); setDate(''); setDone(false); };
  const handleClose = () => { reset(); onClose(); };

  const canNext = () => {
    if (step === 0) return !!docType;
    if (step === 1) return !!vendor.trim();
    if (step === 2) return !!date;
    return true;
  };

  const next = () => {
    if (step < 3) setStep((s) => s + 1);
    else { setDone(true); }
  };

  if (done) {
    return (
      <Dialog open={open} onClose={handleClose} title="Classification Complete" size="sm"
        footer={<Button onClick={handleClose} icon={<CheckCircle size={14} />}>Done</Button>}
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-ink-primary font-serif">{documentName}</p>
            <p className="text-sm text-ink-muted mt-1">has been classified as <span className="font-semibold text-gold-600">{docType}</span></p>
          </div>
          <div className="w-full bg-gold-50 rounded-xl p-3 text-left space-y-1">
            <Row label="Type" value={docType} />
            <Row label="Vendor" value={vendor} />
            <Row label="Date" value={date} />
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Classify Document"
      description={documentName}
      size="md"
      footer={
        <>
          {step > 0 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          <Button onClick={next} disabled={!canNext()}>
            {step === 3 ? 'Confirm Classification' : 'Next'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <StepIndicator steps={STEPS} current={step} />

        {/* AI Suggestion */}
        {step < 3 && AI_SUGGESTIONS[step] && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-50 rounded-lg border border-gold-100">
            <Sparkles size={14} className="text-gold-600 shrink-0" />
            <p className="text-xs text-ink-secondary flex-1">
              AI suggests: <span className="font-semibold text-gold-700">{AI_SUGGESTIONS[step].text}</span>
            </p>
            <Badge variant="gold" size="sm">{AI_SUGGESTIONS[step].confidence}% confidence</Badge>
            <button
              className="text-xs text-gold-600 font-semibold hover:underline"
              onClick={() => {
                if (step === 0) setDocType(AI_SUGGESTIONS[0].text);
                if (step === 1) setVendor(AI_SUGGESTIONS[1].text);
                if (step === 2) setDate(AI_SUGGESTIONS[2].text);
              }}
            >
              Use
            </button>
          </div>
        )}

        {/* Step 0: Type */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-2">
            {DOC_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setDocType(type)}
                className={clsx(
                  'px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-150',
                  docType === type
                    ? 'border-gold-400 bg-gold-50 text-gold-700'
                    : 'border-border text-ink-secondary hover:border-gold-300 hover:bg-gray-50'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Vendor */}
        {step === 1 && (
          <Input
            label="Vendor / Counterparty Name"
            placeholder="e.g. Al Rajhi Cement Co."
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <Input
            label="Document Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-border">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-3">Review classification</p>
            <Row label="Document" value={documentName} />
            <Row label="Type" value={docType} />
            <Row label="Vendor" value={vendor} />
            <Row label="Date" value={date} />
          </div>
        )}
      </div>
    </Dialog>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
    <span className="text-xs text-ink-muted">{label}</span>
    <span className="text-xs font-medium text-ink-primary">{value}</span>
  </div>
);

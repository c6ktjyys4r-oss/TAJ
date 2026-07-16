import React, { useState } from 'react';
import { BarChart2, CheckCircle, Download } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { StepIndicator } from '../ui/StepIndicator';
import { ProgressBar } from '../ui/ProgressBar';
import { clsx } from 'clsx';

const STEPS = [{ label: 'Type' }, { label: 'Period' }, { label: 'Accounts' }, { label: 'Generate' }];

const REPORT_TYPES = [
  { id: 'monthly',    label: 'Monthly Summary',       desc: 'Income, expenses, and balances by month' },
  { id: 'quarterly',  label: 'Quarterly Report',       desc: 'Quarterly financial overview with trends' },
  { id: 'annual',     label: 'Annual Report',          desc: 'Full-year financial statements' },
  { id: 'reconcile',  label: 'Reconciliation Report',  desc: 'Bank reconciliation details' },
  { id: 'vendor',     label: 'Vendor Spend Analysis',  desc: 'Spending breakdown by vendor/supplier' },
  { id: 'custom',     label: 'Custom Report',          desc: 'Define your own date range and filters' },
];

const BANKS = ['SABB', 'Riyad Bank', 'Al Rajhi Bank', 'NCB', 'Banque Saudi Fransi'];

interface ReportWizardProps { open: boolean; onClose: () => void; }

export const ReportWizard: React.FC<ReportWizardProps> = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo]     = useState('2024-10-31');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [done, setDone] = useState(false);

  const reset = () => {
    setStep(0); setReportType(''); setDateFrom('2024-01-01'); setDateTo('2024-10-31');
    setSelectedBanks([]); setGenerating(false); setGenProgress(0); setDone(false);
  };
  const handleClose = () => { reset(); onClose(); };

  const toggleBank = (b: string) =>
    setSelectedBanks((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);

  const canNext = () => {
    if (step === 0) return !!reportType;
    if (step === 1) return !!dateFrom && !!dateTo;
    if (step === 2) return selectedBanks.length > 0;
    return true;
  };

  const next = () => {
    if (step < 3) { setStep((s) => s + 1); return; }
    setGenerating(true);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { clearInterval(iv); setGenProgress(100); setDone(true); setGenerating(false); }
      else setGenProgress(p);
    }, 120);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Generate Report"
      description="Configure your report parameters"
      size="md"
      footer={
        <>
          {step > 0 && !generating && !done && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>
          )}
          {done
            ? <>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button icon={<Download size={14} />}>Download Report</Button>
              </>
            : !generating && (
                <Button onClick={next} disabled={!canNext()}>
                  {step === 3 ? 'Generate' : 'Next'}
                </Button>
              )
          }
        </>
      }
    >
      <div className="space-y-6">
        <StepIndicator steps={STEPS} current={step} />

        {/* Step 0: Type */}
        {step === 0 && (
          <div className="grid grid-cols-1 gap-2">
            {REPORT_TYPES.map((rt) => (
              <button
                key={rt.id}
                onClick={() => setReportType(rt.id)}
                className={clsx(
                  'flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150',
                  reportType === rt.id
                    ? 'border-gold-400 bg-gold-50'
                    : 'border-border hover:border-gold-300 hover:bg-gray-50'
                )}
              >
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                  reportType === rt.id ? 'bg-gold-100' : 'bg-gray-100'
                )}>
                  <BarChart2 size={15} className={reportType === rt.id ? 'text-gold-600' : 'text-ink-muted'} />
                </div>
                <div>
                  <p className={clsx('text-sm font-semibold', reportType === rt.id ? 'text-gold-700' : 'text-ink-primary')}>{rt.label}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{rt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Period */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink-primary block mb-1">From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-primary block mb-1">To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['This month', 'Last 3 months', 'This quarter', 'YTD'].map((preset) => (
                <button key={preset} className="px-3 py-1 text-xs font-medium rounded-full border border-border text-ink-secondary hover:border-gold-400 hover:text-gold-600 transition-colors">
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Banks */}
        {step === 2 && (
          <div className="space-y-2">
            <p className="text-sm text-ink-secondary mb-3">Select one or more bank accounts to include</p>
            {BANKS.map((bank) => (
              <button
                key={bank}
                onClick={() => toggleBank(bank)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-150',
                  selectedBanks.includes(bank)
                    ? 'border-gold-400 bg-gold-50 text-gold-700'
                    : 'border-border text-ink-secondary hover:border-gold-300 hover:bg-gray-50'
                )}
              >
                <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                  selectedBanks.includes(bank) ? 'border-gold-500 bg-gold-500' : 'border-gray-300'
                )}>
                  {selectedBanks.includes(bank) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                {bank}
              </button>
            ))}
          </div>
        )}

        {/* Step 3 / Generating */}
        {step === 3 && (
          <div className="space-y-4">
            {!generating && !done && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-border">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-3">Report Summary</p>
                {[
                  ['Report Type', REPORT_TYPES.find((r) => r.id === reportType)?.label ?? ''],
                  ['Period', `${dateFrom} → ${dateTo}`],
                  ['Accounts', selectedBanks.join(', ')],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                    <span className="text-xs text-ink-muted">{k}</span>
                    <span className="text-xs font-medium text-ink-primary text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {generating && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-50 flex items-center justify-center">
                  <BarChart2 size={24} className="text-gold-600 animate-pulse" />
                </div>
                <div className="w-full space-y-2">
                  <ProgressBar value={genProgress} showValue animated label="Generating report…" />
                </div>
              </div>
            )}
            {done && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle size={28} className="text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-ink-primary font-serif">Report Ready</p>
                  <p className="text-sm text-ink-muted mt-1">Your report has been generated and is ready to download.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

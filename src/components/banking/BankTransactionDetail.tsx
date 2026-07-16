import React, { useState } from 'react';
import { CheckCircle, PenLine, Flag, AlertCircle, Building2, Calendar, DollarSign, Hash } from 'lucide-react';
import { SlideOver } from '../ui/SlideOver';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { clsx } from 'clsx';

export interface PendingTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  bank: string;
  suggestion: string;
}

type ActionState = 'idle' | 'manual' | 'done' | 'flagged';

interface BankTransactionDetailProps {
  tx: PendingTransaction | null;
  onClose: () => void;
}

export const BankTransactionDetail: React.FC<BankTransactionDetailProps> = ({ tx, onClose }) => {
  const [action, setAction] = useState<ActionState>('idle');
  const [manualRef, setManualRef] = useState('');
  const [manualNote, setManualNote] = useState('');

  const reset = () => { setAction('idle'); setManualRef(''); setManualNote(''); };
  const handleClose = () => { reset(); onClose(); };

  if (!tx) return null;

  const SUGGESTED_MATCHES = tx.suggestion !== 'No match found'
    ? [
        { id: 'M1', ref: tx.suggestion.replace('Possible: ', ''), confidence: 87, amount: tx.amount, date: tx.date },
      ]
    : [];

  return (
    <SlideOver
      open={!!tx}
      onClose={handleClose}
      title="Transaction Detail"
      subtitle={tx.bank}
      width="md"
      footer={
        action === 'idle' ? (
          <>
            <Button variant="ghost" size="sm" icon={<Flag size={13} />} onClick={() => setAction('flagged')}>
              Flag for Review
            </Button>
            <Button variant="secondary" size="sm" icon={<PenLine size={13} />} onClick={() => setAction('manual')}>
              Enter Manually
            </Button>
            {SUGGESTED_MATCHES.length > 0 && (
              <Button size="sm" icon={<CheckCircle size={13} />} onClick={() => setAction('done')}>
                Confirm Match
              </Button>
            )}
          </>
        ) : action === 'manual' ? (
          <>
            <Button variant="secondary" size="sm" onClick={reset}>Cancel</Button>
            <Button size="sm" disabled={!manualRef.trim()} onClick={() => setAction('done')}>Save Entry</Button>
          </>
        ) : (
          <Button onClick={handleClose} icon={<CheckCircle size={13} />}>Close</Button>
        )
      }
    >
      {/* Status banner */}
      {action === 'done' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-5">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-medium text-emerald-700">Transaction matched and recorded.</p>
        </div>
      )}
      {action === 'flagged' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-5">
          <Flag size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm font-medium text-amber-700">Transaction flagged for manual review.</p>
        </div>
      )}

      {/* Transaction metadata */}
      <div className="space-y-0 mb-6">
        {[
          { icon: Building2,    label: 'Bank',        value: tx.bank },
          { icon: Calendar,     label: 'Date',        value: tx.date },
          { icon: DollarSign,   label: 'Amount',      value: tx.amount },
          { icon: Hash,         label: 'Description', value: tx.description },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 py-3 border-b border-border/60 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center shrink-0 mt-0.5">
              <Icon size={14} className="text-gold-600" />
            </div>
            <div>
              <p className="text-[10px] text-ink-muted uppercase tracking-wide font-medium">{label}</p>
              <p className="text-sm font-medium text-ink-primary">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggested Matches */}
      {action === 'idle' && (
        <div>
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-3">AI Suggested Matches</p>
          {SUGGESTED_MATCHES.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-border">
              <AlertCircle size={16} className="text-ink-muted" />
              <p className="text-sm text-ink-muted">No automatic match found. Use "Enter Manually" to record.</p>
            </div>
          ) : (
            SUGGESTED_MATCHES.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-4 rounded-xl border border-gold-200 bg-gold-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-primary">{m.ref}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-ink-muted">{m.amount}</span>
                    <span className="text-xs text-ink-muted">·</span>
                    <span className="text-xs text-ink-muted">{m.date}</span>
                  </div>
                </div>
                <Badge variant="gold" size="sm">{m.confidence}% match</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {/* Manual entry form */}
      {action === 'manual' && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1">Manual Entry</p>
          <Input
            label="Reference / Invoice Number"
            placeholder="e.g. INV-2024-0881"
            value={manualRef}
            onChange={(e) => setManualRef(e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-ink-primary block mb-1">Notes (optional)</label>
            <textarea
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              placeholder="Add context or accounting notes…"
              rows={3}
              className={clsx(
                'w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary placeholder-ink-muted',
                'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all resize-none'
              )}
            />
          </div>
        </div>
      )}
    </SlideOver>
  );
};

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const STATEMENTS = [
  { id: '1', bank: 'SABB',       month: 'October 2024',    total: 247, matched: 244, pending: 3,  matchRate: 98.8 },
  { id: '2', bank: 'Riyad Bank', month: 'October 2024',    total: 183, matched: 183, pending: 0,  matchRate: 100 },
  { id: '3', bank: 'Al Rajhi',   month: 'October 2024',    total: 312, matched: 298, pending: 14, matchRate: 95.5 },
  { id: '4', bank: 'SABB',       month: 'September 2024',  total: 231, matched: 231, pending: 0,  matchRate: 100 },
];

const PENDING = [
  { id: 'T1', date: '2024-10-12', description: 'Wire Transfer — Unknown',   amount: 'SAR 45,200', bank: 'SABB', suggestion: 'Possible: Invoice #INV-0881' },
  { id: 'T2', date: '2024-10-10', description: 'Direct Debit — Utilities',  amount: 'SAR 3,750',  bank: 'SABB', suggestion: 'No match found' },
  { id: 'T3', date: '2024-10-08', description: 'FX Conversion USD/SAR',     amount: 'SAR 18,900', bank: 'SABB', suggestion: 'Possible: Contract #CTR-044' },
];

export const BankMatching: React.FC = () => {
  const [syncing, setSyncing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle>Bank Matching</PageTitle>
          <p className="text-sm text-ink-muted mt-1">Reconcile transactions against your financial records</p>
        </div>
        <Button
          variant="secondary"
          icon={<RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />}
          onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1800); }}
        >
          Sync Statements
        </Button>
      </div>

      {/* Statement cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATEMENTS.map((stmt) => (
          <Card key={stmt.id} padding="md" hover>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-ink-primary font-serif">{stmt.bank}</p>
                <p className="text-sm text-ink-muted">{stmt.month}</p>
              </div>
              <Badge variant={stmt.matchRate === 100 ? 'success' : stmt.matchRate >= 98 ? 'gold' : 'warning'} dot>
                {stmt.matchRate}% matched
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
                style={{ width: `${stmt.matchRate}%` }}
              />
            </div>

            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle size={13} /> {stmt.matched} matched
              </span>
              {stmt.pending > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertCircle size={13} /> {stmt.pending} pending
                </span>
              )}
              <span className="text-ink-muted ml-auto">{stmt.total} total</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending transactions */}
      <Card padding="none">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-ink-primary">Pending Review</h3>
            <p className="text-xs text-ink-muted mt-0.5">{PENDING.length} transactions need manual attention</p>
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {PENDING.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-4 py-4 hover:bg-gold-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-primary">{tx.description}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {tx.bank} · {tx.date} · <span className="italic">{tx.suggestion}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-ink-primary">{tx.amount}</p>
                <div className="flex gap-1 mt-1 justify-end">
                  <button className="px-2 py-0.5 text-xs rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium">Match</button>
                  <button className="px-2 py-0.5 text-xs rounded-md bg-gray-50 text-ink-secondary hover:bg-gray-100 transition-colors font-medium">Skip</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

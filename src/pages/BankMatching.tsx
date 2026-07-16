import React, { useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SortableTable } from '../components/ui/SortableTable';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { BankTransactionDetail } from '../components/banking/BankTransactionDetail';
import type { PendingTransaction } from '../components/banking/BankTransactionDetail';
import { useT } from '../hooks/useT';

const STATEMENTS = [
  { id: '1', bank: 'SABB',       month: 'October 2024',   total: 247, matched: 244, pending: 3,  matchRate: 98.8 },
  { id: '2', bank: 'Riyad Bank', month: 'October 2024',   total: 183, matched: 183, pending: 0,  matchRate: 100  },
  { id: '3', bank: 'Al Rajhi',   month: 'October 2024',   total: 312, matched: 298, pending: 14, matchRate: 95.5 },
  { id: '4', bank: 'SABB',       month: 'September 2024', total: 231, matched: 231, pending: 0,  matchRate: 100  },
];

interface TxRow extends PendingTransaction { [key: string]: unknown; }

const PENDING: TxRow[] = [
  { id: 'T1', date: '2024-10-12', description: 'Wire Transfer \u2014 Unknown',  amount: 'SAR 45,200', bank: 'SABB',      suggestion: 'Possible: Invoice #INV-0881' },
  { id: 'T2', date: '2024-10-10', description: 'Direct Debit \u2014 Utilities', amount: 'SAR 3,750',  bank: 'SABB',      suggestion: 'No match found' },
  { id: 'T3', date: '2024-10-08', description: 'FX Conversion USD/SAR',         amount: 'SAR 18,900', bank: 'SABB',      suggestion: 'Possible: Contract #CTR-044' },
  { id: 'T4', date: '2024-10-05', description: 'Supplier Payment',              amount: 'SAR 9,100',  bank: 'Al Rajhi', suggestion: 'Possible: Invoice #INV-0876' },
  { id: 'T5', date: '2024-10-03', description: 'Cheque Clearance',              amount: 'SAR 22,400', bank: 'Al Rajhi', suggestion: 'No match found' },
];

export const BankMatching: React.FC = () => {
  const t = useT();
  const [syncing, setSyncing]       = useState(false);
  const [selectedTx, setSelectedTx] = useState<PendingTransaction | null>(null);

  const columns = [
    {
      key: 'description', header: 'Transaction', sortable: true,
      render: (r: TxRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertCircle size={15} className="text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-primary">{r.description}</p>
            <p className="text-xs text-ink-muted italic mt-0.5">{r.suggestion}</p>
          </div>
        </div>
      ),
    },
    { key: 'bank',   header: 'Bank',   sortable: true,
      render: (r: TxRow) => <Badge variant="default">{r.bank}</Badge> },
    { key: 'date',   header: 'Date',   sortable: true, align: 'right' as const },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right' as const,
      render: (r: TxRow) => <span className="font-semibold text-ink-primary">{r.amount}</span> },
    {
      key: 'action', header: '', sortable: false, align: 'right' as const,
      render: (r: TxRow) => (
        <Button
          variant="secondary" size="sm"
          onClick={(e) => { e.stopPropagation(); setSelectedTx(r as PendingTransaction); }}
        >
          {t('bankMatching.review')}
        </Button>
      ),
    },
  ];

  const totalMatched  = STATEMENTS.reduce((s, st) => s + st.matched, 0);
  const totalPending  = STATEMENTS.reduce((s, st) => s + st.pending, 0);
  const totalTx       = STATEMENTS.reduce((s, st) => s + st.total, 0);

  const STATS = [
    { label: t('bankMatching.stat.total'),   value: totalTx,      color: 'text-ink-primary' },
    { label: t('bankMatching.stat.matched'), value: totalMatched, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('bankMatching.stat.pending'), value: totalPending, color: 'text-amber-600',   bg: 'bg-amber-50' },
    { label: t('bankMatching.stat.avgRate'), value: 98,           color: 'text-gold-600',    bg: 'bg-gold-50', suffix: '%' },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>{t('page.bankMatching.title')}</PageTitle>
            <p className="text-sm text-ink-muted mt-1">{t('bankMatching.subtitle')}</p>
          </div>
          <Button
            variant="secondary"
            icon={<RefreshCw size={14} className={syncing ? 'animate-spin' : ''} aria-hidden="true" />}
            onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1800); }}
          >
            {t('bankMatching.sync')}
          </Button>
        </div>

        {/* Animated summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value, color, bg, suffix }) => (
            <Card key={label} padding="md">
              <div className={`text-2xl font-bold font-serif mb-0.5 ${color}`}>
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <p className="text-xs text-ink-muted">{label}</p>
              {bg && <div className={`absolute inset-0 rounded-xl opacity-5 ${bg}`} aria-hidden="true" />}
            </Card>
          ))}
        </div>

        {/* Statement progress cards */}
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
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
                  style={{ width: `${stmt.matchRate}%` }}
                />
              </div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle size={13} aria-hidden="true" /> {stmt.matched} matched
                </span>
                {stmt.pending > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertCircle size={13} aria-hidden="true" /> {stmt.pending} pending
                  </span>
                )}
                <span className="text-ink-muted ml-auto">{stmt.total} total</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Sortable pending transactions */}
        <Card padding="none">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">{t('bankMatching.pendingReview')}</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                {t('bankMatching.pendingSubtitle').replace('{count}', String(PENDING.length))}
              </p>
            </div>
          </div>
          <SortableTable<TxRow>
            columns={columns}
            data={PENDING}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => setSelectedTx(r as PendingTransaction)}
            defaultSort={{ key: 'date', dir: 'desc' }}
          />
        </Card>
      </div>

      <BankTransactionDetail tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  );
};

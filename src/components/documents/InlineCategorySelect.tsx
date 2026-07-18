/**
    * InlineCategorySelect — a native <select> that immediately PATCHes
    * the document's type when the user picks a new value.
    *
    * Click propagation is stopped on the wrapper div so the table row's
    * onClick handler (which opens DocumentDetailPanel) does not fire.
    *
    * Shows a spinner while saving; shows a toast on success or error.
    */

    import React, { useState } from 'react';
    import { Loader2 } from 'lucide-react';
    import { clsx } from 'clsx';
    import { documentsApi, ApiError } from '../../lib/api';
    import type { DocumentType } from '../../lib/api';
    import { toast } from '../ui/Toast';

    // ── Option list ───────────────────────────────────────────────────────────────

    const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
    { value: 'invoice',        label: 'Invoice'     },
    { value: 'receipt',        label: 'Receipt'     },
    { value: 'bank_statement', label: 'Statement'   },
    { value: 'credit_note',    label: 'Credit Note' },
    { value: 'debit_note',     label: 'Debit Note'  },
    { value: 'po',             label: 'PO'          },
    { value: 'attachment',     label: 'Attachment'  },
    ];

    // ── Component ─────────────────────────────────────────────────────────────────

    interface InlineCategorySelectProps {
    /** UUID of the document to update. */
    docId:       string;
    /** Current raw API type value (e.g. 'invoice'), not the display label. */
    currentType: DocumentType;
    /** Called after a successful PATCH so the list can reload. */
    onSuccess:   () => void;
    }

    export const InlineCategorySelect: React.FC<InlineCategorySelectProps> = ({
    docId,
    currentType,
    onSuccess,
    }) => {
    const [saving, setSaving] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as DocumentType;
      if (newType === currentType) return;
      setSaving(true);
      try {
        await documentsApi.update(docId, { type: newType });
        toast.success('Category updated');
        onSuccess();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Failed to update category';
        toast.error(msg);
      } finally {
        setSaving(false);
      }
    };

    return (
      /* Stop click propagation so the row's onRowClick (→ detail panel) does not fire */
      <div
        className="inline-flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {saving && (
          <Loader2 size={12} className="animate-spin text-ink-muted shrink-0" aria-hidden="true" />
        )}
        <select
          value={currentType}
          onChange={handleChange}
          disabled={saving}
          aria-label="Document category"
          className={clsx(
            'text-xs font-medium rounded-full px-2.5 py-0.5',
            'border border-border bg-surface text-ink-primary',
            'cursor-pointer appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-0',
            'transition-opacity duration-150',
            saving && 'opacity-50 cursor-wait',
          )}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
    };
    
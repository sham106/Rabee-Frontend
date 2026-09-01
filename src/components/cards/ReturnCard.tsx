import React from 'react';
import { ParcelReturn } from '../../types';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ReturnCardProps {
  item: ParcelReturn;
  riderName?: string;
  onDelete?: (id: string) => void;
  showDate?: boolean;
}

export const ReturnCard: React.FC<ReturnCardProps> = ({
  item,
  riderName,
  onDelete,
  showDate = false,
}) => {
  const reasonColor: Record<string, { bg: string; text: string; border: string }> = {
    'Customer Unavailable': {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    'Customer Refused Parcel': {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
    },
    'Incorrect Address': {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
    },
    'Unable to Contact Customer': {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
    },
    'Rescheduled Delivery': {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
    },
    'Damaged Parcel': {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
    },
    Other: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
  };

  const style = reasonColor[item.return_reason] || reasonColor.Other;

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Parcel barcode</p>
          <p className="mt-1 break-all font-mono text-sm font-black tracking-wide text-slate-950 sm:text-base">{item.barcode}</p>
          {riderName && <p className="mt-1 truncate text-xs font-medium text-slate-500">Rider: <span className="font-bold text-slate-800">{riderName}</span></p>}
        </div>
        {onDelete && (
          <button type="button" onClick={() => onDelete(item.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" title="Delete return record" aria-label={`Delete return ${item.barcode}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
        <span className={`inline-flex max-w-full items-center rounded-xl border px-2.5 py-1 text-[10px] font-bold leading-tight ${style.bg} ${style.text} ${style.border}`}><span className="truncate">{item.return_reason}</span></span>
        <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600"><Clock className="h-3 w-3 text-slate-400" />{item.return_time}</span>
      </div>

      {/* Optional Note & Date */}
      {(item.notes || showDate) && (
        <div className="mt-3 flex min-w-0 flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          {item.notes ? (
            <div className="flex min-w-0 items-start gap-1.5 text-[11px] text-slate-500 italic">
              <FileText className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" />
              <span className="break-words">{item.notes}</span>
            </div>
          ) : (
            <div />
          )}

          {showDate && (
            <span className="shrink-0 text-[11px] font-semibold text-slate-400">
              {formatDate(item.return_date)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ParcelReturn } from '../../types';
import { Clock, Tag, FileText, Trash2, ShieldAlert } from 'lucide-react';
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
    <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/80 p-4 transition-all duration-200 hover:border-slate-300 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        {/* Barcode & Rider */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-slate-900">
              {item.barcode}
            </span>
            <span className={`inline-flex items-center rounded-xl border px-2 py-0.5 text-[11px] font-bold ${style.bg} ${style.text} ${style.border}`}>
              {item.return_reason}
            </span>
          </div>

          {riderName && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Rider: <span className="text-slate-800 font-semibold">{riderName}</span>
            </p>
          )}
        </div>

        {/* Time & Delete Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs text-slate-600 font-mono font-medium">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{item.return_time}</span>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              title="Delete return record"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Optional Note & Date */}
      {(item.notes || showDate) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {item.notes ? (
            <div className="flex items-start gap-1.5 text-[11px] text-slate-500 italic">
              <FileText className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" />
              <span>{item.notes}</span>
            </div>
          ) : (
            <div />
          )}

          {showDate && (
            <span className="text-[11px] text-slate-400 font-semibold">
              {formatDate(item.return_date)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

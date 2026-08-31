import React from 'react';
import { Rider, RiderDaySummary } from '../../types';
import { ChevronRight, PackageCheck, RotateCcw, User } from 'lucide-react';

interface RiderCardProps {
  rider: Rider;
  summary?: RiderDaySummary;
  allocated?: number;
  returns?: number;
  onClick?: () => void;
  actionLabel?: string;
  selected?: boolean;
}

export const RiderCard: React.FC<RiderCardProps> = ({
  rider,
  summary,
  allocated,
  returns,
  onClick,
  actionLabel = 'View Rider',
  selected = false,
}) => {
  const allocCount = summary ? summary.allocated : allocated ?? 0;
  const returnCount = summary ? summary.returns : returns ?? 0;

  const initials = rider.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2);

  const isActive = rider.status === 'active';

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-3xl border p-4 transition-all duration-200 ${
        selected
          ? 'bg-amber-50/60 border-amber-500 shadow-xs ring-1 ring-amber-500'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}`}
    >
      {/* Top / Left: Avatar & Rider Info & Status */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          {rider.avatar ? (
            <img
              src={rider.avatar}
              alt={rider.name}
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 font-extrabold text-sm border border-amber-200">
              {initials}
            </div>
          )}
          <span
            className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
              isActive ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {rider.name}
            </h4>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded-md border border-amber-200/60">
              @{rider.username || 'rider'}
            </span>
            {rider.vehicleType && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {rider.vehicleType}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Operational Statistics & Clean Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          {/* Today's Allocation */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Today's Allocated
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-black text-slate-900">
              <PackageCheck className="h-3.5 w-3.5 text-amber-600" />
              {allocCount}
            </span>
          </div>

          <span className="text-slate-200">|</span>

          {/* Today's Returns */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Today's Returns
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-black text-rose-600">
              <RotateCcw className="h-3 w-3 text-rose-500" />
              {returnCount}
            </span>
          </div>
        </div>

        {onClick && (
          <div className="flex items-center gap-1 pl-2 border-l border-slate-100 sm:border-l-0 sm:pl-0">
            <span className="text-xs font-bold text-slate-700 group-hover:text-amber-700 hidden md:inline-block transition-colors">
              {actionLabel}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

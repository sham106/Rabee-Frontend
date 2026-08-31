import React from 'react';
import { DateFilterRange } from '../../types';
import { Calendar } from 'lucide-react';

interface DateFilterProps {
  activeRange: DateFilterRange;
  onRangeChange: (range: DateFilterRange) => void;
  customDate?: string;
  onCustomDateChange?: (date: string) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  activeRange,
  onRangeChange,
  customDate,
  onCustomDateChange,
}) => {
  const ranges: { key: DateFilterRange; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 p-1 overflow-x-auto max-w-full shadow-xs">
        {ranges.map(r => {
          const isActive = activeRange === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => onRangeChange(r.key)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {activeRange === 'custom' && (
        <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-3 py-1.5 text-xs shadow-xs">
          <Calendar className="h-4 w-4 text-amber-600" />
          <input
            type="date"
            value={customDate || ''}
            onChange={e => onCustomDateChange && onCustomDateChange(e.target.value)}
            className="bg-transparent text-slate-800 font-semibold outline-none cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

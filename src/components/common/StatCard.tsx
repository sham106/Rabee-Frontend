import React from 'react';
import { formatNumber } from '../../utils/formatters';

interface StatCardProps {
  id?: string;
  label: string;
  value: number | string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'amber' | 'emerald' | 'rose' | 'indigo';
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  label,
  value,
  sublabel,
  icon,
  variant = 'default',
  onClick,
  badge,
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200/80 text-slate-900 shadow-xs',
    amber: 'bg-gradient-to-b from-amber-50/80 to-amber-100/30 border-amber-200/80 text-amber-900 shadow-xs',
    emerald: 'bg-gradient-to-b from-emerald-50/80 to-emerald-100/30 border-emerald-200/80 text-emerald-900 shadow-xs',
    rose: 'bg-gradient-to-b from-rose-50/80 to-rose-100/30 border-rose-200/80 text-rose-900 shadow-xs',
    indigo: 'bg-gradient-to-b from-indigo-50/80 to-indigo-100/30 border-indigo-200/80 text-indigo-900 shadow-xs',
  }[variant];

  const iconColors = {
    default: 'text-slate-600 bg-slate-100',
    amber: 'text-amber-700 bg-amber-100/80',
    emerald: 'text-emerald-700 bg-emerald-100/80',
    rose: 'text-rose-700 bg-rose-100/80',
    indigo: 'text-indigo-700 bg-indigo-100/80',
  }[variant];

  const displayVal = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative flex flex-col justify-between rounded-3xl p-4 sm:p-5 border transition-all duration-200 ${variantStyles} ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
            {badge}
          </span>
        )}
        {icon && !badge && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconColors}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {displayVal}
        </span>
      </div>

      {sublabel && (
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {sublabel}
        </p>
      )}
    </div>
  );
};

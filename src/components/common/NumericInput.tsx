import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface NumericInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  label?: string;
  sublabel?: string;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  unit?: string;
  autoFocus?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  id = 'numeric-input',
  value,
  onChange,
  label,
  sublabel,
  min = 0,
  max = 99999,
  step = 1,
  presets = [5, 10, 25, 50],
  unit = 'parcels',
  autoFocus = false,
}) => {
  const handleIncrement = (amount: number) => {
    const next = Math.min(max, (value || 0) + amount);
    onChange(next);
  };

  const handleDecrement = (amount: number) => {
    const next = Math.max(min, (value || 0) - amount);
    onChange(next);
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  };

  return (
    <div className="w-full space-y-3">
      {(label || sublabel) && (
        <div className="flex items-center justify-between">
          {label && <label htmlFor={id} className="text-sm font-bold text-slate-700">{label}</label>}
          {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
        </div>
      )}

      {/* Main Large Display Input Container */}
      <div className="relative flex items-center justify-between rounded-3xl bg-slate-50 border border-slate-200 p-2 shadow-xs transition-all focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
        <button
          type="button"
          onClick={() => handleDecrement(step)}
          disabled={value <= min}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-xs transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Minus className="h-6 w-6" />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value === 0 ? '' : value}
            placeholder="0"
            onChange={handleDirectInput}
            autoFocus={autoFocus}
            className="w-full bg-transparent text-center font-extrabold text-4xl sm:text-5xl text-slate-900 placeholder-slate-300 outline-none tracking-tight selection:bg-amber-500/30"
          />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-0.5">
            {unit}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleIncrement(step)}
          disabled={value >= max}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-bold transition-all hover:bg-amber-400 shadow-xs active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Quick Add Presets Pills */}
      {presets && presets.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Quick add:</span>
          {presets.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => handleIncrement(p)}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-amber-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              +{p}
            </button>
          ))}
          {value > 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer ml-auto shadow-xs"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

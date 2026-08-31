import React, { InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  hint,
  icon,
  rightElement,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          id={id}
          className={`w-full rounded-2xl bg-white border ${
            error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'
          } px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition-all focus:ring-2 ${
            icon ? 'pl-11' : ''
          } ${rightElement ? 'pr-12' : ''} ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-semibold text-rose-600 mt-1">{error}</p>}
    </div>
  );
};

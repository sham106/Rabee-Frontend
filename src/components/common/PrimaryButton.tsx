import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'amber' | 'danger' | 'success';
  size?: 'md' | 'lg' | 'sm';
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  icon,
  loading = false,
  variant = 'amber',
  size = 'lg',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer shadow-sm';

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs gap-1.5 min-h-[44px]',
    md: 'px-5 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-base gap-2.5 min-h-[52px]',
  }[size];

  const variantStyles = {
    amber:
      'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm shadow-amber-500/20 font-bold',
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-xs font-bold',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

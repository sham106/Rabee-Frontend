import React, { ButtonHTMLAttributes } from 'react';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'outline' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon,
  variant = 'outline',
  size = 'lg',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 min-h-[44px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[44px]',
    lg: 'px-5 py-3 text-base gap-2.5 min-h-[50px]',
  }[size];

  const variantStyles = {
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs font-medium',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-medium',
    soft:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 font-medium',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

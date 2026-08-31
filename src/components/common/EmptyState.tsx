import React from 'react';
import { PackageOpen } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 text-center sm:p-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800/80 text-amber-400 mb-4">
        {icon || <PackageOpen className="h-7 w-7" />}
      </div>
      <h4 className="text-base font-bold text-neutral-100">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-neutral-400 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <PrimaryButton size="sm" onClick={onAction} fullWidth={false}>
            {actionLabel}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};

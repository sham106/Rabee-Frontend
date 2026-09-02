import React from 'react';
import { UserRole } from '../../types';

const Block: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />
);

export const DashboardSkeleton: React.FC<{ role: UserRole }> = ({ role }) => {
  if (role === 'rider') {
    return (
      <div className="mx-auto max-w-xl space-y-5 pb-28" aria-label="Loading rider dashboard" role="status">
        <div className="flex items-start justify-between gap-4"><div className="space-y-2"><Block className="h-3 w-24" /><Block className="h-8 w-52" /><Block className="h-4 w-44" /></div><Block className="h-14 w-36" /></div>
        <div className="animate-pulse rounded-[2rem] bg-slate-900 p-5"><Block className="h-7 w-32 bg-white/10" /><Block className="mt-8 h-16 w-28 bg-white/10" /><Block className="mt-7 h-2 w-full bg-white/10" /></div>
        <div className="grid grid-cols-2 gap-3"><Block className="h-36 rounded-[1.5rem]" /><Block className="h-36 rounded-[1.5rem]" /></div>
        <Block className="h-16 rounded-[1.5rem] bg-amber-200/80" />
        <div className="space-y-3"><Block className="h-5 w-40" /><Block className="h-24 rounded-[1.5rem]" /></div>
        <span className="sr-only">Loading your assignments and returns</span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-28" aria-label="Loading operations dashboard" role="status">
      <div className="flex items-end justify-between"><div className="space-y-2"><Block className="h-3 w-40" /><Block className="h-10 w-72" /><Block className="h-4 w-64" /></div><Block className="hidden h-14 w-44 sm:block" /></div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.7fr)]"><div className="animate-pulse rounded-[2rem] bg-slate-900 p-7"><Block className="h-7 w-36 bg-white/10" /><Block className="mt-8 h-16 w-40 bg-white/10" /><Block className="mt-7 h-2 w-full bg-white/10" /></div><Block className="h-64 rounded-[2rem] xl:h-auto" /></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Block key={index} className="h-36 rounded-[1.5rem]" />)}</div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.65fr)]"><Block className="h-72 rounded-[2rem]" /><div className="space-y-3"><Block className="h-20" /><Block className="h-20" /><Block className="h-20" /></div></div>
      <span className="sr-only">Loading riders, allocations and returns</span>
    </div>
  );
};

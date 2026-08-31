import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { RiderCard } from '../components/cards/RiderCard';
import { formatDate, getGreeting } from '../utils/formatters';
import {
  PackagePlus,
  ClipboardCheck,
  TrendingUp,
  RotateCcw,
  Users,
  ChevronRight,
  PackageCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminHomeProps {
  onOpenAddRecords: () => void;
  onNavigateToRecords: () => void;
  onNavigateToRiders: () => void;
  onNavigateToReports: () => void;
  onSelectRiderProfile: (riderId: string) => void;
}

export const AdminHome: React.FC<AdminHomeProps> = ({
  onOpenAddRecords,
  onNavigateToRecords,
  onNavigateToRiders,
  onNavigateToReports,
  onSelectRiderProfile,
}) => {
  const { currentUser, selectedDate, todaySummary, riderSummaries, riders } = useApp();

  const isReconciled =
    todaySummary.total_received > 0 &&
    todaySummary.total_allocated > 0 &&
    todaySummary.remaining_unallocated >= 0;

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Greeting & Date Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Operations Center
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-500 font-medium">
              {currentUser?.hub || 'Nairobi Central Sorting Hub'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            {getGreeting(currentUser?.name)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Today's parcel intake, rider assignments, and return reconciliation.
          </p>
        </div>

        {/* Date Indicator Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-2xl bg-white border border-slate-200 px-4 py-2 text-xs shadow-xs">
          <Calendar className="h-4 w-4 text-amber-600" />
          <span className="text-slate-800 font-bold font-mono">
            {formatDate(selectedDate)}
          </span>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          id="stat-received"
          label="Received"
          value={todaySummary.total_received}
          sublabel="Total parcels received"
          variant="default"
          icon={<PackagePlus className="h-4 w-4" />}
        />

        <StatCard
          id="stat-allocated"
          label="Allocated"
          value={todaySummary.total_allocated}
          sublabel={`${todaySummary.allocated_riders_count} active riders assigned`}
          variant="amber"
          icon={<PackageCheck className="h-4 w-4" />}
        />

        <StatCard
          id="stat-returns"
          label="Returns"
          value={todaySummary.total_returns}
          sublabel={`${todaySummary.return_rate_percentage.toFixed(1)}% return rate`}
          variant="rose"
          icon={<RotateCcw className="h-4 w-4" />}
        />

        <StatCard
          id="stat-remaining"
          label="Remaining"
          value={todaySummary.remaining_unallocated}
          sublabel={
            todaySummary.remaining_unallocated < 0
              ? 'Over-allocated'
              : 'Unassigned stock in hub'
          }
          variant={todaySummary.remaining_unallocated < 0 ? 'rose' : 'emerald'}
          icon={<Layers className="h-4 w-4" />}
        />
      </div>

      {/* Main Operations Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <PrimaryButton
          size="lg"
          icon={<PackagePlus className="h-5 w-5" />}
          onClick={onOpenAddRecords}
        >
          Add Today’s Records
        </PrimaryButton>

        <SecondaryButton
          size="lg"
          variant="outline"
          icon={<ClipboardCheck className="h-5 w-5" />}
          onClick={onNavigateToRecords}
        >
          View Today’s Summary
        </SecondaryButton>
      </div>

      {/* Active Reconciliation Progress Bar */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
            Dispatch Allocation Progress
          </span>
          <span className="font-mono font-bold text-slate-600">
            {todaySummary.total_received > 0
              ? `${Math.min(
                  100,
                  Math.round(
                    (todaySummary.total_allocated / todaySummary.total_received) * 100
                  )
                )}% Allocated`
              : '0%'}
          </span>
        </div>

        {/* Multi-segment progress track */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
          <div
            className="h-full bg-amber-500 transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(
                100,
                todaySummary.total_received > 0
                  ? (todaySummary.total_allocated / todaySummary.total_received) * 100
                  : 0
              )}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
          <span>
            Intake: <strong className="text-slate-800">{todaySummary.total_received}</strong>
          </span>
          <span>
            Assigned: <strong className="text-amber-700">{todaySummary.total_allocated}</strong>
          </span>
          <span>
            Hub Balance: <strong className="text-emerald-700">{todaySummary.remaining_unallocated}</strong>
          </span>
        </div>
      </div>

      {/* Rider Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Rider Activity
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Today's allocations & parcel return counts per rider
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToRiders}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
          >
            <span>View all ({riders.length})</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* List of top active riders today */}
        <div className="space-y-2">
          {riderSummaries.slice(0, 5).map(summary => (
            <RiderCard
              key={summary.rider.id}
              rider={summary.rider}
              summary={summary}
              onClick={() => onSelectRiderProfile(summary.rider.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

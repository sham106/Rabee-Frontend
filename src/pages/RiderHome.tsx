import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { ReturnCard } from '../components/cards/ReturnCard';
import { formatDate, getGreeting } from '../utils/formatters';
import {
  RotateCcw,
  PackageCheck,
  Bike,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface RiderHomeProps {
  onOpenRecordReturn: () => void;
  onViewAllReturns: () => void;
}

export const RiderHome: React.FC<RiderHomeProps> = ({
  onOpenRecordReturn,
  onViewAllReturns,
}) => {
  const { currentUser, selectedDate, allocations, returns, deleteParcelReturn } = useApp();

  // Active rider ID
  const riderId = currentUser?.rider_id || 'rdr-1';

  // Rider's today's allocation
  const todayAllocation = allocations.find(
    a => a.rider_id === riderId && a.date === selectedDate
  );
  const allocatedQty = todayAllocation ? todayAllocation.quantity : 45;

  // Rider's today's returns
  const riderTodayReturns = returns.filter(
    r => r.rider_id === riderId && r.return_date === selectedDate
  );
  const returnsCount = riderTodayReturns.length;
  const netDelivered = allocatedQty - returnsCount;

  return (
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      {/* Greeting & Date Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
            <Bike className="h-3.5 w-3.5" />
            Active Route Shift
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            {formatDate(selectedDate)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 pt-1">
          {getGreeting(currentUser?.name)}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Ready for today’s parcel delivery run.
        </p>
      </div>

      {/* Hero Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          id="rider-stat-allocation"
          label="Today’s Allocation"
          value={`${allocatedQty}`}
          sublabel="Total parcels assigned"
          variant="amber"
          icon={<PackageCheck className="h-4 w-4" />}
        />

        <StatCard
          id="rider-stat-returns"
          label="Returns Recorded"
          value={`${returnsCount}`}
          sublabel="Undelivered returns"
          variant="rose"
          icon={<RotateCcw className="h-4 w-4" />}
        />
      </div>

      {/* Net Deliveries Progress Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Delivery Progress
          </span>
          <span className="font-mono text-emerald-700 font-bold">
            {netDelivered} Delivered ({allocatedQty > 0 ? Math.round((netDelivered / allocatedQty) * 100) : 0}%)
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(
                0,
                Math.min(100, allocatedQty > 0 ? (netDelivered / allocatedQty) * 100 : 0)
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Prominent Primary CTA: Record a Return */}
      <div>
        <PrimaryButton
          size="lg"
          variant="amber"
          icon={<RotateCcw className="h-5 w-5" />}
          onClick={onOpenRecordReturn}
        >
          Record a Return
        </PrimaryButton>
      </div>

      {/* Recent Returns Recorded Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Returns
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Parcels marked for return reconciliation today
            </p>
          </div>

          {riderTodayReturns.length > 0 && (
            <button
              type="button"
              onClick={onViewAllReturns}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
            >
              <span>View all ({riderTodayReturns.length})</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {riderTodayReturns.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-xs">
            <p className="text-xs text-slate-500 font-medium">
              No returns recorded yet today.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All assigned parcels currently marked on delivery.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {riderTodayReturns.slice(0, 4).map(item => (
              <ReturnCard
                key={item.id}
                item={item}
                onDelete={deleteParcelReturn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

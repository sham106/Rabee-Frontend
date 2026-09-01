import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { ReturnCard } from '../components/cards/ReturnCard';
import { Modal } from '../components/common/Modal';
import { FormField } from '../components/common/FormField';
import { formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  PackageCheck,
  RotateCcw,
  TrendingUp,
  Edit2,
  Power,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Calendar,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Rider, RiderStatus } from '../types';

interface RiderProfilePageProps {
  riderId: string;
  onBack: () => void;
  onAllocate?: () => void;
}

export const RiderProfilePage: React.FC<RiderProfilePageProps> = ({
  riderId,
  onBack,
  onAllocate,
}) => {
  const {
    riders,
    selectedDate,
    allocations,
    returns,
    updateRider,
    resetRiderPassword,
    deleteParcelReturn,
    showToast,
  } = useApp();

  const rider = riders.find(r => r.id === riderId);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState(rider?.name || '');
  const [editUsername, setEditUsername] = useState(rider?.username || '');
  const [editStatus, setEditStatus] = useState<RiderStatus>(rider?.status || 'active');
  const [editUsernameError, setEditUsernameError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [ledgerMonth, setLedgerMonth] = useState(() => selectedDate.slice(0, 7));
  const [rangeStart, setRangeStart] = useState(() => `${selectedDate.slice(0, 7)}-01`);
  const [rangeEnd, setRangeEnd] = useState(() => selectedDate);

  // Reset Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  if (!rider) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 max-w-lg mx-auto">
        <p className="text-slate-500 font-medium text-sm">Rider profile not found or has been removed.</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Riders Roster
        </button>
      </div>
    );
  }

  // --- Operational Statistics Calculations ---
  // Today's Allocation & Returns
  const todayAllocation = allocations.find(
    a => a.rider_id === rider.id && a.date === selectedDate
  );
  const todayAllocated = todayAllocation?.quantity || 0;
  const todayRiderReturns = returns.filter(
    r => r.rider_id === rider.id && r.return_date === selectedDate
  );
  const todayReturnCount = todayRiderReturns.length;
  const todayNetDelivered = Math.max(0, todayAllocated - todayReturnCount);
  const todayReturnRate =
    todayAllocated > 0 ? ((todayReturnCount / todayAllocated) * 100).toFixed(1) + '%' : '0.0%';

  // Historical Cumulative
  const historicalAllocations = allocations.filter(a => a.rider_id === rider.id);
  const allTimeAllocated = historicalAllocations.reduce((sum, a) => sum + a.quantity, 0);
  const allTimeReturns = returns.filter(r => r.rider_id === rider.id);
  const allTimeReturnCount = allTimeReturns.length;
  const allTimeRate =
    allTimeAllocated > 0
      ? ((allTimeReturnCount / allTimeAllocated) * 100).toFixed(1) + '%'
      : '0.0%';

  const monthlyLedger = (() => {
    const allocationByDate = new Map<string, number>();
    const returnsByDate = new Map<string, number>();

    historicalAllocations
      .filter(allocation => allocation.date.startsWith(`${ledgerMonth}-`))
      .forEach(allocation => {
        allocationByDate.set(
          allocation.date,
          (allocationByDate.get(allocation.date) || 0) + allocation.quantity
        );
      });

    allTimeReturns
      .filter(parcelReturn => parcelReturn.return_date.startsWith(`${ledgerMonth}-`))
      .forEach(parcelReturn => {
        returnsByDate.set(
          parcelReturn.return_date,
          (returnsByDate.get(parcelReturn.return_date) || 0) + 1
        );
      });

    const dates = Array.from(new Set([...allocationByDate.keys(), ...returnsByDate.keys()])).sort().reverse();
    const rows = dates.map(date => {
      const allocated = allocationByDate.get(date) || 0;
      const returned = returnsByDate.get(date) || 0;
      return { date, allocated, returned, net: Math.max(0, allocated - returned) };
    });

    return {
      rows,
      allocated: rows.reduce((sum, row) => sum + row.allocated, 0),
      returned: rows.reduce((sum, row) => sum + row.returned, 0),
      net: rows.reduce((sum, row) => sum + row.net, 0),
    };
  })();

  const ledgerMonthLabel = new Intl.DateTimeFormat('en-MU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${ledgerMonth}-01T12:00:00`));

  const changeLedgerMonth = (offset: number) => {
    const value = new Date(`${ledgerMonth}-01T12:00:00`);
    value.setMonth(value.getMonth() + offset);
    setLedgerMonth(`${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`);
  };

  const rangeIsValid = Boolean(rangeStart && rangeEnd && rangeStart <= rangeEnd);
  const dateRangeSummary = (() => {
    if (!rangeIsValid) return { allocated: 0, returned: 0, net: 0, operatingDays: 0 };
    const rangeAllocations = historicalAllocations.filter(item => item.date >= rangeStart && item.date <= rangeEnd);
    const rangeReturns = allTimeReturns.filter(item => item.return_date >= rangeStart && item.return_date <= rangeEnd);
    const allocated = rangeAllocations.reduce((sum, item) => sum + item.quantity, 0);
    const returned = rangeReturns.length;
    const operatingDates = new Set([
      ...rangeAllocations.map(item => item.date),
      ...rangeReturns.map(item => item.return_date),
    ]);
    return { allocated, returned, net: Math.max(0, allocated - returned), operatingDays: operatingDates.size };
  })();

  const isActive = rider.status === 'active';

  // Open Edit Modal with current values
  const handleOpenEdit = () => {
    setEditName(rider.name);
    setEditUsername(rider.username || '');
    setEditStatus(rider.status);
    setEditUsernameError(null);
    setIsEditModalOpen(true);
  };

  const handleEditUsernameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/\s+/g, '');
    setEditUsername(sanitized);
    if (sanitized.trim()) {
      const isTaken = riders.some(r => r.id !== rider.id && r.username.toLowerCase() === sanitized);
      if (isTaken) {
        setEditUsernameError('This username is already in use. Choose another one.');
      } else {
        setEditUsernameError(null);
      }
    } else {
      setEditUsernameError(null);
    }
  };

  // Save Edit Changes
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = editName.trim();
    const cleanUsername = editUsername.trim().toLowerCase().replace(/\s+/g, '');

    if (!cleanName) {
      showToast({
        type: 'error',
        title: 'Name Required',
        message: 'Please provide a valid full name.',
      });
      return;
    }

    if (!cleanUsername) {
      setEditUsernameError('Username cannot be empty.');
      return;
    }

    const duplicate = riders.some(r => r.id !== rider.id && r.username.toLowerCase() === cleanUsername);
    if (duplicate) {
      setEditUsernameError('This username is already in use. Choose another one.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateRider(rider.id, {
        name: cleanName,
        username: cleanUsername,
        status: editStatus,
      });
      setIsUpdating(false);
      setIsEditModalOpen(false);
    } catch (err: any) {
      setIsUpdating(false);
      setEditUsernameError(err?.message || 'Failed to update rider.');
    }
  };

  // Execute Password Reset
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setResetError('Please enter a new password.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setResetError('The rider password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsResetting(true);
    setResetError(null);
    try {
      await resetRiderPassword(rider.id, newPassword.trim());
      setIsResetting(false);
      setIsResetModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setIsResetting(false);
      setResetError(err?.message || 'Failed to reset password.');
    }
  };

  // Confirm Deactivate
  const handleConfirmDeactivate = async () => {
    try {
      await updateRider(rider.id, { status: 'inactive' });
      setIsDeactivateModalOpen(false);
    } catch (e) {
      // toast handled
    }
  };

  // Direct Activate
  const handleActivateRider = async () => {
    try {
      await updateRider(rider.id, { status: 'active' });
    } catch (e) {
      // toast handled
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Header / Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Riders Roster</span>
        </button>

        <div className="flex items-center gap-2">
          {isActive && onAllocate && (
            <button
              type="button"
              onClick={onAllocate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Allocate Parcels</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Rider Profile Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          {/* Avatar & Rider Metadata */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {rider.avatar ? (
                <img
                  src={rider.avatar}
                  alt={rider.name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-3xl object-cover border border-slate-200"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-900 font-black text-2xl border border-amber-200">
                  {rider.name.charAt(0)}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {rider.name}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {isActive ? 'Active Account' : 'Inactive Account'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-slate-600 font-medium">
                <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
                  @{rider.username || 'username'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-[11px]">
                  Registered {formatDate(rider.joinedDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit Rider</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewPassword('');
                setConfirmPassword('');
                setResetError(null);
                setShowNewPassword(false);
                setIsResetModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-600" />
              <span>Reset Password</span>
            </button>

            {isActive ? (
              <button
                type="button"
                onClick={() => setIsDeactivateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                <Power className="h-3.5 w-3.5" />
                <span>Deactivate Rider</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleActivateRider}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Activate Rider</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Today's Operational Performance Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today's Operational Statistics ({formatDate(selectedDate)})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Today’s Allocated"
            value={todayAllocated}
            sublabel="Assigned parcels today"
            variant="amber"
            icon={<PackageCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Today’s Returns"
            value={todayReturnCount}
            sublabel="Undelivered returns today"
            variant="rose"
            icon={<RotateCcw className="h-4 w-4" />}
          />
          <StatCard
            label="Net Delivered"
            value={todayNetDelivered}
            sublabel="Successfully delivered"
            variant="emerald"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <StatCard
            label="Return Rate"
            value={todayReturnRate}
            sublabel="Undelivered ratio"
            variant="default"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Custom inclusive date-range totals */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <History className="h-4 w-4 text-amber-600" />
              Custom Period Totals
            </h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Calculate {rider.name}&apos;s activity between two dates, including both selected days.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              From
              <input type="date" value={rangeStart} onChange={event => setRangeStart(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-amber-500" />
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              To
              <input type="date" value={rangeEnd} onChange={event => setRangeEnd(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-amber-500" />
            </label>
          </div>
        </div>

        {!rangeIsValid ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            <AlertCircle className="h-4 w-4" /> The “From” date must be before or equal to the “To” date.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl bg-amber-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Total assigned</p><p className="mt-1 text-2xl font-black text-slate-900">{dateRangeSummary.allocated}</p></div>
            <div className="rounded-2xl bg-rose-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Total returns</p><p className="mt-1 text-2xl font-black text-slate-900">{dateRangeSummary.returned}</p></div>
            <div className="rounded-2xl bg-emerald-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Net parcels</p><p className="mt-1 text-2xl font-black text-slate-900">{dateRangeSummary.net}</p></div>
            <div className="rounded-2xl bg-slate-50 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Operating days</p><p className="mt-1 text-2xl font-black text-slate-900">{dateRangeSummary.operatingDays}</p></div>
          </div>
        )}
      </section>

      {/* Monthly allocation and returns ledger */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Calendar className="h-4 w-4 text-amber-600" />
              Monthly Assignment Ledger
            </h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Daily parcels assigned, returned, and reconciled for {rider.name}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => changeLedgerMonth(-1)} aria-label="Previous month" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="month"
              value={ledgerMonth}
              onChange={event => event.target.value && setLedgerMonth(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
              aria-label="Ledger month"
            />
            <button type="button" onClick={() => changeLedgerMonth(1)} aria-label="Next month" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px bg-slate-200">
          <div className="bg-amber-50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Assigned</p><p className="mt-1 text-2xl font-black text-slate-900">{monthlyLedger.allocated}</p></div>
          <div className="bg-rose-50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Returns</p><p className="mt-1 text-2xl font-black text-slate-900">{monthlyLedger.returned}</p></div>
          <div className="bg-emerald-50 p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Net</p><p className="mt-1 text-2xl font-black text-slate-900">{monthlyLedger.net}</p></div>
        </div>

        {monthlyLedger.rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-bold text-slate-700">No activity in {ledgerMonthLabel}</p>
            <p className="mt-1 text-xs text-slate-400">Assignments and returns will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr><th className="px-5 py-3">Operating day</th><th className="px-4 py-3 text-right">Assigned</th><th className="px-4 py-3 text-right">Returns</th><th className="px-5 py-3 text-right">Net</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyLedger.rows.map(row => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{formatDate(row.date)}</td>
                    <td className="px-4 py-3.5 text-right font-black text-amber-700">{row.allocated}</td>
                    <td className="px-4 py-3.5 text-right font-black text-rose-600">{row.returned}</td>
                    <td className="px-5 py-3.5 text-right font-black text-emerald-700">{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Historical All-Time Statistics */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Historical Total Statistics
          </span>
          <span className="text-[11px] text-slate-400 font-medium">All recorded shifts</span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Allocations
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">
              {allTimeAllocated}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Returns
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 block mt-1">
              {allTimeReturnCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Lifetime Return Rate
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 block mt-1">
              {allTimeRate}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity: Recorded Parcel Returns */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              Recent Activity & Recorded Returns ({allTimeReturns.length})
            </h3>
            <p className="text-xs text-slate-400 font-medium">Audit logs of all returns processed for this rider</p>
          </div>
        </div>

        {allTimeReturns.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-xs text-slate-400 font-medium">No return logs recorded for this rider account.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allTimeReturns.slice(0, 10).map(item => (
              <ReturnCard
                key={item.id}
                item={item}
                showDate={true}
                onDelete={deleteParcelReturn}
              />
            ))}
            {allTimeReturns.length > 10 && (
              <p className="text-center text-xs text-slate-400 font-medium pt-2">
                Showing recent 10 of {allTimeReturns.length} historical returns.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ================= EDIT RIDER MODAL ================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Rider Details"
        subtitle={`Updating account settings for ${rider.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
          {/* Rider Name */}
          <FormField
            id="edit-rider-name"
            label="Rider Name"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder="Full Name"
            required
            autoFocus
          />

          {/* Username */}
          <div>
            <label htmlFor="edit-rider-username" className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3.5 text-xs font-bold font-mono text-slate-400">
                @
              </div>
              <input
                id="edit-rider-username"
                type="text"
                value={editUsername}
                onChange={e => handleEditUsernameChange(e.target.value)}
                placeholder="e.g. rabee2"
                required
                className={`w-full rounded-2xl bg-white border pl-8 pr-4 py-3 text-xs font-mono font-bold text-slate-900 outline-none shadow-xs transition-all ${
                  editUsernameError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
            </div>
            {editUsernameError ? (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {editUsernameError}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Lowercase, no spaces. Rider uses this to sign in.
              </p>
            )}
          </div>

          {/* Account Status */}
          <div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Account Status
              </label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as RiderStatus)}
                className="w-full rounded-2xl bg-white border border-slate-200 px-3.5 py-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SecondaryButton size="md" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton size="md" type="submit" loading={isUpdating}>
              Save Changes
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ================= RESET PASSWORD MODAL ================= */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetError(null);
        }}
        title="Reset Rider Password"
        subtitle={`Assign a new security login password for ${rider.name} (@${rider.username})`}
        maxWidth="md"
      >
        <form onSubmit={handleSavePassword} className="space-y-4 pt-2">
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3.5 flex items-start gap-3">
            <KeyRound className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-bold">Security Best Practice</p>
              <p className="mt-0.5 text-amber-800">
                For security, current passwords are never displayed. Set a new password below and communicate it to the rider.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                autoFocus
                className="w-full rounded-2xl bg-white border border-slate-200 pl-3.5 pr-10 py-3 text-xs font-medium text-slate-900 outline-none focus:border-amber-500 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password to confirm"
              required
              className="w-full rounded-2xl bg-white border border-slate-200 px-3.5 py-3 text-xs font-medium text-slate-900 outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          {resetError && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {resetError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <SecondaryButton
              size="md"
              onClick={() => {
                setIsResetModalOpen(false);
                setResetError(null);
              }}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton size="md" type="submit" loading={isResetting}>
              Set New Password
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ================= DEACTIVATE RIDER CONFIRMATION MODAL ================= */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title="Deactivate this rider?"
        subtitle="Confirm suspension of rider access and allocations"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900">
              <p className="font-bold">
                Deactivating {rider.name} (@{rider.username})
              </p>
              <p className="mt-1 leading-relaxed text-rose-800">
                {rider.name} will no longer be able to sign in or receive new parcel allocations. Historical records will remain available.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SecondaryButton size="md" onClick={() => setIsDeactivateModalOpen(false)}>
              Keep Active
            </SecondaryButton>
            <button
              type="button"
              onClick={handleConfirmDeactivate}
              className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 text-xs shadow-xs transition-colors cursor-pointer"
            >
              Deactivate Rider
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

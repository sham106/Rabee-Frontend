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
  const [editVehicle, setEditVehicle] = useState(rider?.vehicleType || 'Motorcycle');
  const [editPlate, setEditPlate] = useState(rider?.plateNumber || '');
  const [editUsernameError, setEditUsernameError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const isActive = rider.status === 'active';

  // Open Edit Modal with current values
  const handleOpenEdit = () => {
    setEditName(rider.name);
    setEditUsername(rider.username || '');
    setEditStatus(rider.status);
    setEditVehicle(rider.vehicleType || 'Motorcycle');
    setEditPlate(rider.plateNumber || '');
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
        vehicleType: editVehicle as any,
        plateNumber: editPlate.trim() || undefined,
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
                <span className="text-slate-500">
                  {rider.vehicleType || 'Motorcycle'}{' '}
                  {rider.plateNumber && `(${rider.plateNumber})`}
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

          {/* Account Status & Vehicle */}
          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Vehicle Type
              </label>
              <select
                value={editVehicle}
                onChange={e => setEditVehicle(e.target.value as any)}
                className="w-full rounded-2xl bg-white border border-slate-200 px-3.5 py-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Van">Van / Cargo</option>
                <option value="TukTuk">TukTuk</option>
              </select>
            </div>
          </div>

          <FormField
            id="edit-rider-plate"
            label="Vehicle Plate Number (Optional)"
            value={editPlate}
            onChange={e => setEditPlate(e.target.value)}
            placeholder="e.g. KDM 482A"
          />

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

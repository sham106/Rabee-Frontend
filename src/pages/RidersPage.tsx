import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RiderCard } from '../components/cards/RiderCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { Modal } from '../components/common/Modal';
import { FormField } from '../components/common/FormField';
import { Rider, RiderStatus } from '../types';
import {
  UserPlus,
  Search,
  Users,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Bike,
  Sparkles,
  AlertCircle,
  Power,
  X,
} from 'lucide-react';

interface RidersPageProps {
  onSelectRider: (riderId: string) => void;
}

export const RidersPage: React.FC<RidersPageProps> = ({ onSelectRider }) => {
  const { riders, riderSummaries, addRider, updateRider, resetRiderPassword, showToast } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deactivatingRider, setDeactivatingRider] = useState<Rider | null>(null);
  const [resettingRider, setResettingRider] = useState<Rider | null>(null);

  // Add Form States
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('rabee123');
  const [formStatus, setFormStatus] = useState<RiderStatus>('active');
  const [formVehicle, setFormVehicle] = useState<'Motorcycle' | 'Van' | 'TukTuk'>('Motorcycle');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Active / Inactive counts
  const activeCount = useMemo(() => riders.filter(r => r.status === 'active').length, [riders]);
  const inactiveCount = useMemo(() => riders.filter(r => r.status === 'inactive').length, [riders]);

  // Filtered riders list
  const filteredRiders = useMemo(() => {
    return riders.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesUsername = r.username?.toLowerCase().includes(q);
        const matchesPhone = r.phone?.toLowerCase().includes(q);
        return matchesName || matchesUsername || matchesPhone;
      }
      return true;
    });
  }, [riders, statusFilter, searchQuery]);

  // Suggest next username (e.g. rabee + number)
  const suggestNextUsername = () => {
    let nextNum = riders.length + 1;
    let candidate = `rabee${nextNum}`;
    while (riders.some(r => r.username.toLowerCase() === candidate.toLowerCase())) {
      nextNum++;
      candidate = `rabee${nextNum}`;
    }
    return candidate;
  };

  const handleOpenAdd = () => {
    const suggested = suggestNextUsername();
    setFormName('');
    setFormUsername(suggested);
    setFormPassword('rabee123');
    setFormStatus('active');
    setFormVehicle('Motorcycle');
    setUsernameError(null);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleUsernameChange = (val: string) => {
    // Force lowercase and strip spaces
    const sanitized = val.toLowerCase().replace(/\s+/g, '');
    setFormUsername(sanitized);

    // Validate uniqueness
    if (sanitized.trim()) {
      const isTaken = riders.some(r => r.username.toLowerCase() === sanitized);
      if (isTaken) {
        setUsernameError('This username is already in use. Choose another one.');
      } else {
        setUsernameError(null);
      }
    } else {
      setUsernameError(null);
    }
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    const cleanUsername = formUsername.trim().toLowerCase().replace(/\s+/g, '');

    if (!cleanName) {
      showToast({
        type: 'error',
        title: 'Missing Rider Name',
        message: 'Please enter the rider’s full name.',
      });
      return;
    }

    if (!cleanUsername) {
      setUsernameError('Username is required.');
      return;
    }

    // Check duplicate username
    const exists = riders.some(r => r.username.toLowerCase() === cleanUsername);
    if (exists) {
      setUsernameError('This username is already in use. Choose another one.');
      return;
    }

    if (!formPassword.trim()) {
      showToast({
        type: 'error',
        title: 'Missing Password',
        message: 'Please assign a password for the rider account.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addRider({
        name: cleanName,
        username: cleanUsername,
        password: formPassword.trim(),
        status: formStatus,
        vehicleType: formVehicle,
        hub: 'Nairobi Central Sorting Hub',
      });
      setIsSubmitting(false);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setUsernameError(err?.message || 'Failed to create rider.');
    }
  };

  // Deactivation confirmation
  const handleConfirmDeactivate = async () => {
    if (!deactivatingRider) return;
    try {
      await updateRider(deactivatingRider.id, { status: 'inactive' });
      setDeactivatingRider(null);
    } catch (e) {
      // toast handled in context
    }
  };

  // Direct reactivation
  const handleReactivate = async (rider: Rider, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateRider(rider.id, { status: 'active' });
    } catch (e) {
      // toast handled in context
    }
  };

  // Password Reset Submission
  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingRider) return;
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
      await resetRiderPassword(resettingRider.id, newPassword.trim());
      setIsResetting(false);
      setResettingRider(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setIsResetting(false);
      setResetError(err?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Operations & Fleet Roster
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Riders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage delivery rider accounts, company credentials, and operational allocations.
          </p>
        </div>

        <PrimaryButton
          size="md"
          icon={<UserPlus className="h-4 w-4" />}
          onClick={handleOpenAdd}
          fullWidth={false}
        >
          Add New Rider
        </PrimaryButton>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 rounded-2xl bg-white border border-slate-200 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All ({riders.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or username (e.g. rabee1)..."
            className="w-full rounded-2xl bg-white border border-slate-200 pl-10 pr-8 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modern Riders List / Grid */}
      {filteredRiders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No riders found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No riders matching "${searchQuery}". Try searching with a different name or username.`
              : `There are currently no ${statusFilter} riders registered.`}
          </p>
          <div className="mt-4">
            <PrimaryButton size="sm" onClick={handleOpenAdd} fullWidth={false}>
              Add New Rider
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRiders.map(rider => {
            const summary = riderSummaries.find(s => s.rider.id === rider.id);

            return (
              <div key={rider.id} className="relative group">
                <RiderCard
                  rider={rider}
                  summary={summary}
                  onClick={() => onSelectRider(rider.id)}
                  actionLabel="View Rider"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ================= ADD NEW RIDER MODAL ================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Rider"
        subtitle="Create a company delivery rider account with instant login credentials"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRider} className="space-y-4 pt-2">
          {/* Rider Full Name */}
          <FormField
            id="add-rider-name"
            label="Rider Name"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. John Mwangi"
            helper="The rider's official full name displayed on allocation records"
            required
            autoFocus
          />

          {/* Username with uniqueness check */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="add-rider-username" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Username
              </label>
              <button
                type="button"
                onClick={() => handleUsernameChange(suggestNextUsername())}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                Auto-Suggest
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-3.5 text-xs font-bold font-mono text-slate-400">
                @
              </div>
              <input
                id="add-rider-username"
                type="text"
                value={formUsername}
                onChange={e => handleUsernameChange(e.target.value)}
                placeholder="e.g. rabee2"
                required
                className={`w-full rounded-2xl bg-white border pl-8 pr-4 py-3 text-xs font-mono font-bold text-slate-900 outline-none shadow-xs transition-all ${
                  usernameError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
            </div>
            {usernameError ? (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {usernameError}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Used by the rider to sign in. Auto-converted to lowercase with no spaces (e.g. rabee1, rabee2).
              </p>
            )}
          </div>

          {/* Company Assigned Password */}
          <div>
            <label htmlFor="add-rider-password" className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="add-rider-password"
                type={showPassword ? 'text' : 'password'}
                value={formPassword}
                onChange={e => setFormPassword(e.target.value)}
                placeholder="A simple password assigned by company"
                required
                className="w-full rounded-2xl bg-white border border-slate-200 pl-3.5 pr-10 py-3 text-xs font-medium text-slate-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Provide this temporary or permanent password to the rider. No email or phone is required.
            </p>
          </div>

          {/* Account Status and Vehicle Type */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Account Status
              </label>
              <select
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as RiderStatus)}
                className="w-full rounded-2xl bg-white border border-slate-200 px-3.5 py-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              >
                <option value="active">Active (Can receive parcels)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Vehicle Type
              </label>
              <select
                value={formVehicle}
                onChange={e => setFormVehicle(e.target.value as any)}
                className="w-full rounded-2xl bg-white border border-slate-200 px-3.5 py-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Van">Van / Cargo</option>
                <option value="TukTuk">TukTuk</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <SecondaryButton size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton size="md" type="submit" loading={isSubmitting}>
              Create Rider
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* ================= RESET PASSWORD MODAL ================= */}
      <Modal
        isOpen={!!resettingRider}
        onClose={() => {
          setResettingRider(null);
          setResetError(null);
        }}
        title="Reset Rider Password"
        subtitle={`Assign a new security login password for ${resettingRider?.name} (@${resettingRider?.username})`}
        maxWidth="md"
      >
        <form onSubmit={handleExecuteResetPassword} className="space-y-4 pt-2">
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
                setResettingRider(null);
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
        isOpen={!!deactivatingRider}
        onClose={() => setDeactivatingRider(null)}
        title="Deactivate this rider?"
        subtitle="Confirm suspension of rider access and allocations"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900">
              <p className="font-bold">
                Deactivating {deactivatingRider?.name} (@{deactivatingRider?.username})
              </p>
              <p className="mt-1 leading-relaxed text-rose-800">
                {deactivatingRider?.name} will no longer be able to sign in or receive new parcel allocations. Historical records and returns logs will remain preserved.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SecondaryButton size="md" onClick={() => setDeactivatingRider(null)}>
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

import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import {
  User,
  ShieldCheck,
  Bike,
  BarChart3,
  MapPin,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { currentUser, allUsers, setCurrentUser, resetDemoData, showToast } = useApp();

  const handleRoleSwitch = (role: UserRole) => {
    const target = allUsers.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
      showToast({
        type: 'success',
        title: `Switched to ${target.name}`,
        message: `Current role: ${role.toUpperCase()}`,
      });
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo intakes, allocations, and return records to initial defaults?')) {
      await resetDemoData();
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
          Terminal Profile
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
          Account & Operations Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          User permissions, hub assignment, and rapid role simulation.
        </p>
      </div>

      {/* User Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500 text-slate-950 font-black text-2xl shadow-md shadow-amber-500/20">
            {currentUser?.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser?.name}</h2>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 uppercase">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono font-medium">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              {currentUser?.email}
            </p>
            {currentUser?.phone && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-mono font-medium mt-0.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {currentUser?.phone}
              </p>
            )}
          </div>
        </div>

        {/* Hub Assignment info */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Building2 className="h-4 w-4 text-amber-600" />
              Assigned Hub
            </span>
            <span className="text-slate-900 font-medium">
              {currentUser?.hub || 'Nairobi Central Sorting Hub'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/80">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Station Address
            </span>
            <span className="text-slate-500">Industrial Area, Commercial St., Nairobi</span>
          </div>
        </div>
      </div>

      {/* Instant Role Switcher for Testing */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Switch Active Role (Demo Testing)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Seamlessly test navigation, recording permissions, and interfaces across all roles.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
              currentUser?.role === 'admin'
                ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-5 w-5 mb-1 text-amber-600" />
            <span className="text-xs font-bold">Admin</span>
            <span className="text-[10px] text-slate-400 font-medium">Peter K.</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch('rider')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
              currentUser?.role === 'rider'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bike className="h-5 w-5 mb-1 text-emerald-600" />
            <span className="text-xs font-bold">Rider</span>
            <span className="text-[10px] text-slate-400 font-medium">John M.</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch('manager')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
              currentUser?.role === 'manager'
                ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="h-5 w-5 mb-1 text-sky-600" />
            <span className="text-xs font-bold">Manager</span>
            <span className="text-[10px] text-slate-400 font-medium">Sarah O.</span>
          </button>
        </div>
      </div>

      {/* System Actions */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Reset Demo Data</h4>
            <p className="text-[11px] text-slate-500 font-medium">Restore factory sample intakes and returns</p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Data</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Sign Out</h4>
            <p className="text-[11px] text-slate-500 font-medium">Lock terminal and end current session</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

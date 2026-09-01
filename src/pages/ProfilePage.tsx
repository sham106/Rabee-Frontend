import React from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  MapPin,
  Building2,
  Phone,
  Mail,
  LogOut,
} from 'lucide-react';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { currentUser } = useApp();

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
          Account details, hub assignment, and session security.
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
              {currentUser?.hub || 'Mauritius Operations Hub'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/80">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Station Address
            </span>
            <span className="text-slate-500">Mauritius</span>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
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

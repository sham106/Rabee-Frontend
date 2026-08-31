import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, getGreeting } from '../../utils/formatters';
import { TODAY_DATE } from '../../data/mockData';
import {
  User,
  ShieldCheck,
  Bike,
  BarChart3,
  ChevronDown,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface MobileHeaderProps {
  onOpenProfile?: () => void;
  onNavigateToRecords?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenProfile }) => {
  const { currentUser, switchRole, selectedDate, resetAllData } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    admin: {
      label: 'Operations Admin',
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    rider: {
      label: 'Field Rider',
      icon: <Bike className="h-3.5 w-3.5" />,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    manager: {
      label: 'Management',
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      color: 'bg-sky-50 text-sky-800 border-sky-200',
    },
  };

  const currentRole = currentUser?.role || 'admin';
  const roleInfo = roleMeta[currentRole];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Brand wordmark & greeting */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-xl shadow-xs shadow-amber-500/20">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                Rabee
              </span>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-slate-300" />
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
                Operations
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">
              {getGreeting(currentUser?.name)}
            </p>
          </div>
        </div>

        {/* Right: Date pill & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Date indicator */}
          <div className="hidden xs:flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            <span className="font-semibold">{formatDate(selectedDate)}</span>
          </div>

          {/* Role switcher trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all cursor-pointer shadow-xs ${roleInfo.color}`}
            >
              {roleInfo.icon}
              <span className="capitalize">{currentRole}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {/* Dropdown for role switching */}
            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl bg-white border border-slate-200 p-2 shadow-xl">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Role Mode
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {currentUser?.name}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        switchRole('admin');
                        setShowRoleMenu(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        currentRole === 'admin'
                          ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      <div className="text-left">
                        <div className="font-semibold">Admin / Operations</div>
                        <div className="text-[10px] text-slate-400">Peter Kamau</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        switchRole('rider', 'rdr-1');
                        setShowRoleMenu(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        currentRole === 'rider'
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Bike className="h-4 w-4 text-emerald-600" />
                      <div className="text-left">
                        <div className="font-semibold">Field Rider</div>
                        <div className="text-[10px] text-slate-400">John Mwangi</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        switchRole('manager');
                        setShowRoleMenu(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                        currentRole === 'manager'
                          ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4 text-sky-600" />
                      <div className="text-left">
                        <div className="font-semibold">Management View</div>
                        <div className="text-[10px] text-slate-400">Sarah Ochieng</div>
                      </div>
                    </button>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetAllData();
                        setShowRoleMenu(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-[11px] text-slate-500 hover:bg-slate-100 hover:text-amber-700 cursor-pointer font-medium"
                    >
                      <span>Reset Demo Records</span>
                      <Sparkles className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

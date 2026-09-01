import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import {
  Home,
  ClipboardList,
  Users,
  FileSpreadsheet,
  User as UserIcon,
  RotateCcw,
  History,
  BarChart2,
  Calendar,
  LogOut,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onSelectTab?: (tab: NavTab) => void;
  onOpenAddRecords?: () => void;
  onOpenRecordReturn?: () => void;
  onOpenExport?: () => void;
  onLogout?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  onSelectTab,
  onOpenAddRecords,
  onOpenRecordReturn,
  onOpenExport,
  onLogout,
}) => {
  const { currentUser, selectedDate } = useApp();
  const role = currentUser?.role || 'admin';
  const handleTabClick = (tab: NavTab) => {
    if (onSelectTab) onSelectTab(tab);
    else if (onTabChange) onTabChange(tab);
  };

  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const adminNavItems: NavItem[] = [
    { id: 'home', label: 'Operations Home', icon: Home },
    { id: 'records', label: "Today's Records", icon: ClipboardList },
    { id: 'riders', label: 'Rider Roster', icon: Users },
    { id: 'reports', label: 'Management Dashboard', icon: BarChart2 },
    { id: 'profile', label: 'Staff Profile', icon: UserIcon },
  ];

  const riderNavItems: NavItem[] = [
    { id: 'home', label: 'My Deliveries', icon: Home },
    { id: 'returns', label: 'Record Return', icon: RotateCcw },
    { id: 'history', label: 'Return History', icon: History },
    { id: 'profile', label: 'Rider Profile', icon: UserIcon },
  ];

  const managerNavItems: NavItem[] = [
    { id: 'home', label: 'Executive Dashboard', icon: BarChart2 },
    { id: 'reports', label: 'Comprehensive Reports', icon: FileSpreadsheet },
    { id: 'riders', label: 'Rider Performance', icon: Users },
    { id: 'profile', label: 'Manager Settings', icon: UserIcon },
  ];

  const items =
    role === 'rider' ? riderNavItems : role === 'manager' ? managerNavItems : adminNavItems;

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between border-r border-slate-200 bg-white p-5 h-screen sticky top-0 shrink-0 shadow-xs">
      <div className="space-y-6">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-2xl shadow-sm shadow-amber-500/30">
            R
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 block">
              Rabee
            </span>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              Delivery Courier
            </span>
          </div>
        </div>

        {/* Date Context Box */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Operations Date</span>
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900">
            {formatDate(selectedDate)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
            {currentUser?.hub || 'Mauritius Operations Hub'}
          </div>
        </div>

        {/* Navigation items list */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>
          {items.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? 'bg-slate-950/10 text-slate-950' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Admin Action */}
        {role === 'admin' && onOpenAddRecords && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenAddRecords}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 px-4 py-3 text-xs font-bold text-amber-800 transition-all cursor-pointer shadow-xs"
            >
              <ClipboardList className="h-4 w-4 text-amber-600" />
              <span>Assign Parcels</span>
            </button>
          </div>
        )}
      </div>

      {/* Authenticated user */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200/80 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold border border-amber-200">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
            <p className="text-[11px] text-slate-500 capitalize flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {role} mode
            </p>
          </div>
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        )}
      </div>
    </aside>
  );
};

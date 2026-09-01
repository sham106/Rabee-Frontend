import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  ClipboardList,
  Users,
  FileSpreadsheet,
  User as UserIcon,
  RotateCcw,
  History,
  BarChart2,
  PieChart,
  PackageCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

import { NavTab } from '../../types';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onSelectTab?: (tab: NavTab) => void;
  onOpenAddRecords?: () => void;
  onOpenRecordReturn?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onSelectTab,
  onOpenAddRecords,
}) => {
  const { currentUser } = useApp();
  const role = currentUser?.role || 'admin';
  const handleTabClick = (tab: NavTab) => {
    if (onSelectTab) onSelectTab(tab);
    else if (onTabChange) onTabChange(tab);
  };

  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  const adminNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'records', label: 'Records', icon: ClipboardList },
    { id: 'riders', label: 'Riders', icon: Users },
    { id: 'reports', label: 'Dashboard', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const riderNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'returns', label: 'Record', icon: RotateCcw },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const managerNavItems: NavItem[] = [
    { id: 'home', label: 'Overview', icon: BarChart2 },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'riders', label: 'Riders', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const items =
    role === 'rider' ? riderNavItems : role === 'manager' ? managerNavItems : adminNavItems;

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden rounded-[1.6rem] border border-white/10 bg-slate-950/95 p-1.5 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
      {role === 'admin' && onOpenAddRecords && (
        <button
          type="button"
          onClick={onOpenAddRecords}
          className="absolute -top-14 right-1 flex h-11 items-center gap-2 rounded-2xl bg-amber-400 px-4 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95"
          aria-label="Assign parcels to a rider"
        >
          <PackageCheck className="h-4 w-4" />
          Assign parcels
        </button>
      )}
      <div className="flex items-center justify-around">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={`relative flex min-h-14 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center transition-all cursor-pointer ${isActive ? 'bg-white/10' : ''}`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-amber-300 stroke-[2.4]' : 'text-slate-500 hover:text-slate-300'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -inset-1.5 rounded-full bg-amber-400/15 blur-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>

              <span
                className={`mt-1 text-[10px] tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-amber-200 font-bold' : 'text-slate-500 font-medium'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-amber-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

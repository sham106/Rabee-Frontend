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
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-2 py-1.5 pb-safe shadow-lg">
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
              className="relative flex flex-1 flex-col items-center justify-center py-2 px-1 text-center transition-all cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-amber-600 stroke-[2.4]' : 'text-slate-400 hover:text-slate-600'
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -inset-1.5 rounded-full bg-amber-500/15 blur-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>

              <span
                className={`mt-1 text-[10px] tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-amber-600 font-bold' : 'text-slate-500 font-medium'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 h-1 w-6 rounded-full bg-amber-500"
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

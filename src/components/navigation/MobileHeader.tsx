import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, getGreeting } from '../../utils/formatters';
import { Calendar, User } from 'lucide-react';

interface MobileHeaderProps { onOpenProfile?: () => void; onNavigateToRecords?: () => void; }

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenProfile }) => {
  const { currentUser, selectedDate } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-[#f5f6f4]/90 px-4 py-3 backdrop-blur-xl sm:px-6 md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-slate-950 text-lg font-black text-amber-300 shadow-sm">R</div>
          <div>
            <p className="font-extrabold tracking-tight text-slate-900">Rabee</p>
            <p className="line-clamp-1 text-xs font-medium text-slate-500">{getGreeting(currentUser?.name)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-700 xs:flex">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            <span className="font-semibold">{formatDate(selectedDate)}</span>
          </div>
          <button type="button" onClick={onOpenProfile} aria-label="Open account profile" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

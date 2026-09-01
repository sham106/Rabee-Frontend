import React from 'react';
import { useApp } from '../context/AppContext';
import { ReturnCard } from '../components/cards/ReturnCard';
import { formatDate, getGreeting } from '../utils/formatters';
import { ArrowUpRight, CalendarDays, CheckCircle2, ChevronRight, Clock3, RotateCcw, Route, ScanLine } from 'lucide-react';
import { motion } from 'motion/react';

interface RiderHomeProps { onOpenRecordReturn: () => void; onViewAllReturns: () => void; }

export const RiderHome: React.FC<RiderHomeProps> = ({ onOpenRecordReturn, onViewAllReturns }) => {
  const { currentUser, selectedDate, allocations, returns, deleteParcelReturn } = useApp();
  const riderId = currentUser?.rider_id;
  const todayAllocation = allocations.find(item => item.rider_id === riderId && item.date === selectedDate);
  const allocatedQty = todayAllocation?.quantity || 0;
  const riderTodayReturns = returns.filter(item => item.rider_id === riderId && item.return_date === selectedDate);
  const returnsCount = riderTodayReturns.length;
  const netDelivered = Math.max(0, allocatedQty - returnsCount);
  const completion = allocatedQty > 0 ? Math.round((netDelivered / allocatedQty) * 100) : 0;

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-28 md:pb-12">
      <header className="flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700">Field workspace</p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">{getGreeting(currentUser?.name)}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Your route, returns and daily balance.</p>
        </div>
        <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm sm:w-auto sm:min-w-40 sm:justify-start sm:gap-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex items-center gap-2 sm:block">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Operating day</p>
            <p className="text-xs font-extrabold whitespace-nowrap text-slate-800 sm:mt-0.5">{formatDate(selectedDate)}</p>
          </div>
        </div>
      </header>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/15">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-28 w-40 opacity-[0.08] [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300"><span className={`h-2 w-2 rounded-full ${allocatedQty > 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />{allocatedQty > 0 ? 'Route active' : 'Awaiting allocation'}</span>
            <Route className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold text-slate-400">PARCELS ASSIGNED</p><p className="mt-1 text-6xl font-black leading-none tracking-[-0.07em]">{allocatedQty}</p></div>
            <div className="mb-1 text-right"><p className="text-2xl font-black text-emerald-400">{netDelivered}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Net on route</p></div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>Route balance</span><span className="text-white">{completion}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${Math.min(100, completion)}%` }} /></div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-4 w-4" /></div><p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{netDelivered}</p><p className="text-xs font-bold text-slate-500">Remaining after returns</p></div>
        <div className="rounded-[1.5rem] border border-rose-100 bg-rose-50/60 p-4 shadow-sm"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-600"><RotateCcw className="h-4 w-4" /></div><p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{returnsCount}</p><p className="text-xs font-bold text-slate-500">Returns logged today</p></div>
      </div>

      <button type="button" onClick={onOpenRecordReturn} className="group flex w-full items-center justify-between rounded-[1.5rem] bg-amber-400 p-2 pl-4 text-left text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 active:scale-[0.99]">
        <span className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-300"><ScanLine className="h-5 w-5" /></span><span><span className="block text-sm font-black">Record parcel return</span><span className="block text-[11px] font-semibold text-slate-700">Scan or enter a barcode</span></span></span>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/60"><ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
      </button>

      <section className="space-y-3">
        <div className="flex items-end justify-between px-1"><div><p className="text-base font-black text-slate-950">Today’s return log</p><p className="text-xs font-medium text-slate-500">Live reconciliation for this route</p></div>{riderTodayReturns.length > 0 && <button type="button" onClick={onViewAllReturns} className="flex items-center gap-1 text-xs font-extrabold text-amber-700">All {riderTodayReturns.length}<ChevronRight className="h-4 w-4" /></button>}</div>
        {riderTodayReturns.length === 0 ? <div className="flex items-center gap-4 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Clock3 className="h-5 w-5" /></div><div><p className="text-sm font-extrabold text-slate-800">No returns recorded</p><p className="mt-0.5 text-xs leading-relaxed text-slate-500">New return entries will appear here immediately.</p></div></div> : <div className="space-y-2">{riderTodayReturns.slice(0, 4).map(item => <ReturnCard key={item.id} item={item} onDelete={deleteParcelReturn} />)}</div>}
      </section>
    </div>
  );
};

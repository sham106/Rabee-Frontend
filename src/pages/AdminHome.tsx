import React from 'react';
import { useApp } from '../context/AppContext';
import { RiderCard } from '../components/cards/RiderCard';
import { formatDate, getGreeting } from '../utils/formatters';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Layers3,
  PackageCheck,
  PackagePlus,
  RotateCcw,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminHomeProps {
  onOpenAddRecords: () => void;
  onNavigateToRecords: () => void;
  onNavigateToRiders: () => void;
  onNavigateToReports: () => void;
  onSelectRiderProfile: (riderId: string) => void;
}

export const AdminHome: React.FC<AdminHomeProps> = ({ onOpenAddRecords, onNavigateToRecords, onNavigateToRiders, onNavigateToReports, onSelectRiderProfile }) => {
  const { currentUser, selectedDate, selectedDateSummary: summary, riderSummaries, riders } = useApp();
  const allocationProgress = summary.total_received > 0 ? Math.min(100, Math.round((summary.total_allocated / summary.total_received) * 100)) : 0;
  const activeRiders = riders.filter(rider => rider.status === 'active').length;
  const waitingRiders = riderSummaries.filter(item => item.rider.status === 'active' && item.allocated === 0).length;
  const topRiders = [...riderSummaries].sort((a, b) => b.allocated - a.allocated).slice(0, 5);

  const metrics = [
    { label: 'Received', value: summary.total_received, note: 'At the hub', icon: PackagePlus, tone: 'bg-white' },
    { label: 'Assigned', value: summary.total_allocated, note: `${summary.allocated_riders_count} riders`, icon: PackageCheck, tone: 'bg-amber-50' },
    { label: 'Returns', value: summary.total_returns, note: `${summary.return_rate_percentage.toFixed(1)}% rate`, icon: RotateCcw, tone: 'bg-rose-50' },
    { label: 'Hub balance', value: summary.remaining_unallocated, note: summary.remaining_unallocated < 0 ? 'Over allocated' : 'Still unassigned', icon: Layers3, tone: 'bg-emerald-50' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-28 md:pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-700"><span>Operations control</span><span className="h-1 w-1 rounded-full bg-slate-300" /><span className="text-slate-400">{currentUser?.hub || 'Mauritius Hub'}</span></div>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-slate-950 lg:text-4xl">{getGreeting(currentUser?.name)}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">A clear view of today’s intake, dispatch and exceptions.</p>
        </div>
        <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:w-auto sm:min-w-44 sm:justify-start sm:gap-3"><CalendarDays className="h-4 w-4 shrink-0 text-amber-600" /><div className="flex items-center gap-2 sm:block"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Operating date</p><p className="whitespace-nowrap text-xs font-black text-slate-800 sm:mt-0.5">{formatDate(selectedDate)}</p></div></div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.7fr)]">
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/10 sm:p-7">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Live dispatch position</span>
              <div className="mt-7 flex items-end gap-4"><p className="text-6xl font-black leading-none tracking-[-0.07em] sm:text-7xl">{allocationProgress}%</p><p className="mb-1 max-w-36 text-xs font-semibold leading-relaxed text-slate-400">of received parcels assigned to the field</p></div>
              <div className="mt-6 h-2.5 max-w-2xl overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${allocationProgress}%` }} /></div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-400"><span><strong className="text-white">{summary.total_received}</strong> received</span><span><strong className="text-amber-300">{summary.total_allocated}</strong> dispatched</span><span><strong className="text-emerald-300">{summary.remaining_unallocated}</strong> at hub</span></div>
            </div>
            <button type="button" onClick={onOpenAddRecords} className="group flex items-center justify-between gap-5 rounded-2xl bg-amber-400 px-4 py-3 text-left text-slate-950 transition hover:bg-amber-300 lg:min-w-52"><span><span className="block text-sm font-black">Update operations</span><span className="block text-[10px] font-bold text-slate-700">Intake & allocations</span></span><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></button>
          </div>
        </motion.section>

        <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Fleet pulse</p><p className="mt-1 text-lg font-black text-slate-950">Rider readiness</p></div><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><Users className="h-5 w-5" /></div></div>
          <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-950 p-4 text-white"><p className="text-3xl font-black">{activeRiders}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Active riders</p></div><div className={`rounded-2xl p-4 ${waitingRiders > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}><p className="text-3xl font-black text-slate-950">{waitingRiders}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Awaiting work</p></div></div>
          <button type="button" onClick={onNavigateToRiders} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50"><span>Manage rider roster</span><ChevronRight className="h-4 w-4" /></button>
        </aside>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(item => <div key={item.label} className={`rounded-[1.5rem] border border-slate-200 p-4 shadow-sm sm:p-5 ${item.tone}`}><div className="flex items-start justify-between"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{item.label}</p><item.icon className="h-4 w-4 text-slate-500" /></div><p className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">{item.value}</p><p className="mt-1 text-[11px] font-semibold text-slate-500">{item.note}</p></div>)}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.65fr)]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between px-1 pb-4"><div><h2 className="text-lg font-black text-slate-950">Today’s rider board</h2><p className="text-xs font-medium text-slate-500">Highest allocations and live return position</p></div><button type="button" onClick={onNavigateToRiders} className="flex items-center gap-1 text-xs font-extrabold text-amber-700">All riders <ChevronRight className="h-4 w-4" /></button></div>
          {topRiders.length ? <div className="grid gap-2 2xl:grid-cols-2">{topRiders.map(item => <RiderCard key={item.rider.id} rider={item.rider} summary={item} onClick={() => onSelectRiderProfile(item.rider.id)} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-500">No riders are registered yet.</div>}
        </section>

        <aside className="space-y-3">
          <div className="px-1"><h2 className="text-lg font-black text-slate-950">Quick controls</h2><p className="text-xs font-medium text-slate-500">Common administrative tasks</p></div>
          <button type="button" onClick={onNavigateToRecords} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-slate-300"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><ClipboardCheck className="h-5 w-5" /></span><span><span className="block text-sm font-black text-slate-900">Daily records</span><span className="text-[11px] font-medium text-slate-500">Review and correct entries</span></span></span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
          <button type="button" onClick={onNavigateToReports} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-slate-300"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><BarChart3 className="h-5 w-5" /></span><span><span className="block text-sm font-black text-slate-900">Management report</span><span className="text-[11px] font-medium text-slate-500">Compare dates and riders</span></span></span><ChevronRight className="h-4 w-4 text-slate-400" /></button>
          {waitingRiders > 0 && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><CircleAlert className="h-5 w-5 shrink-0 text-amber-700" /><div><p className="text-xs font-black text-amber-950">{waitingRiders} active rider{waitingRiders === 1 ? '' : 's'} without allocation</p><p className="mt-1 text-[11px] leading-relaxed text-amber-800">Review the roster before dispatch closes.</p></div></div>}
        </aside>
      </div>
    </div>
  );
};

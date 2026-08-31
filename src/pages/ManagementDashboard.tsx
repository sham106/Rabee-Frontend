import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { DateFilter } from '../components/common/DateFilter';
import { DateFilterRange } from '../types';
import { formatDate } from '../utils/formatters';
import { TODAY_DATE, YESTERDAY_DATE } from '../data/mockData';
import {
  BarChart3,
  Download,
  Search,
  Users,
  PackagePlus,
  PackageCheck,
  RotateCcw,
  Layers,
  TrendingUp,
  ArrowUpDown,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
} from 'lucide-react';

interface ManagementDashboardProps {
  onOpenExport: () => void;
  onSelectRider: (riderId: string) => void;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  onOpenExport,
  onSelectRider,
}) => {
  const { riders, intakes, allocations, returns, selectedDate } = useApp();

  const [dateRange, setDateRange] = useState<DateFilterRange>('today');
  const [customDate, setCustomDate] = useState<string>(TODAY_DATE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'allocated' | 'returns' | 'net' | 'rate'>('allocated');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter datasets by chosen date scope
  const { filteredIntakes, filteredAllocations, filteredReturns } = useMemo(() => {
    let targetDates: string[] = [];
    if (dateRange === 'today') targetDates = [TODAY_DATE];
    else if (dateRange === 'yesterday') targetDates = [YESTERDAY_DATE];
    else if (dateRange === 'week') targetDates = [TODAY_DATE, YESTERDAY_DATE, '2026-08-28', '2026-08-27', '2026-08-26'];
    else if (dateRange === 'month') targetDates = intakes.map(i => i.date);
    else if (dateRange === 'custom' && customDate) targetDates = [customDate];

    return {
      filteredIntakes: intakes.filter(i => targetDates.includes(i.date)),
      filteredAllocations: allocations.filter(a => targetDates.includes(a.date)),
      filteredReturns: returns.filter(r => targetDates.includes(r.return_date)),
    };
  }, [dateRange, customDate, intakes, allocations, returns]);

  // Aggregate KPI metrics
  const totalReceived = filteredIntakes.reduce((sum, i) => sum + i.total_received, 0);
  const totalAllocated = filteredAllocations.reduce((sum, a) => sum + a.quantity, 0);
  const totalReturns = filteredReturns.length;
  const netParcels = totalAllocated - totalReturns;
  const remaining = totalReceived - totalAllocated;
  const returnRate = totalAllocated > 0 ? (totalReturns / totalAllocated) * 100 : 0;
  const activeRidersCount = riders.filter(r => r.status === 'active').length;

  // Breakdown of Return Reasons
  const returnReasonCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReturns.forEach(r => {
      counts[r.return_reason] = (counts[r.return_reason] || 0) + 1;
    });
    return counts;
  }, [filteredReturns]);

  // Table summary per rider
  const riderTableData = useMemo(() => {
    const rows = riders.map(rider => {
      const riderAllocs = filteredAllocations.filter(a => a.rider_id === rider.id);
      const allocatedQty = riderAllocs.reduce((sum, a) => sum + a.quantity, 0);
      const riderReturns = filteredReturns.filter(r => r.rider_id === rider.id);
      const returnCount = riderReturns.length;
      const net = allocatedQty - returnCount;
      const rate = allocatedQty > 0 ? (returnCount / allocatedQty) * 100 : 0;

      return {
        rider,
        allocatedQty,
        returnCount,
        net,
        rate,
      };
    });

    // Apply search filter
    const searched = rows.filter(
      row =>
        row.rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.rider.phone.includes(searchQuery)
    );

    // Sorting
    return searched.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.rider.name.localeCompare(b.rider.name);
      else if (sortField === 'allocated') comparison = a.allocatedQty - b.allocatedQty;
      else if (sortField === 'returns') comparison = a.returnCount - b.returnCount;
      else if (sortField === 'net') comparison = a.net - b.net;
      else if (sortField === 'rate') comparison = a.rate - b.rate;

      return sortAsc ? comparison : -comparison;
    });
  }, [riders, filteredAllocations, filteredReturns, searchQuery, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Executive Oversight
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Management Reporting Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time parcel volume, delivery reconciliation, and fleet metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={onOpenExport}
            fullWidth={false}
          >
            Export Report
          </PrimaryButton>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <DateFilter
            activeRange={dateRange}
            onRangeChange={setDateRange}
            customDate={customDate}
            onCustomDateChange={setCustomDate}
          />
          <div className="text-xs text-slate-500 font-mono font-medium">
            Active Dataset: <strong className="text-slate-900">{filteredAllocations.length} allocations</strong>
          </div>
        </div>
      </div>

      {/* Topline KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Total Intake"
          value={totalReceived}
          sublabel="Received cargo volume"
          variant="default"
          icon={<PackagePlus className="h-4 w-4" />}
        />

        <StatCard
          label="Total Allocated"
          value={totalAllocated}
          sublabel="Assigned to field riders"
          variant="amber"
          icon={<PackageCheck className="h-4 w-4" />}
        />

        <StatCard
          label="Total Returns"
          value={totalReturns}
          sublabel={`${returnRate.toFixed(1)}% return rate`}
          variant="rose"
          icon={<RotateCcw className="h-4 w-4" />}
        />

        <StatCard
          label="Net Delivered"
          value={netParcels}
          sublabel="Successfully reconciled"
          variant="emerald"
          icon={<ShieldCheck className="h-4 w-4" />}
        />

        <StatCard
          label="Active Fleet"
          value={activeRidersCount}
          sublabel="Registered riders"
          variant="indigo"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Return Reasons Breakdown Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <PieChart className="h-4 w-4 text-amber-600" />
            Return Reason Distribution ({totalReturns} total)
          </h3>
        </div>

        {totalReturns === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No returns for selected range.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.entries(returnReasonCounts).map(([reason, rawCount]) => {
              const count = Number(rawCount);
              const pct = totalReturns > 0 ? ((count / totalReturns) * 100).toFixed(0) : '0';
              return (
                <div
                  key={reason}
                  className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-slate-700 truncate">{reason}</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900">{count}</span>
                    <span className="text-xs font-mono text-amber-600 font-bold">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rider Summary Table (Desktop) & Stacked Cards (Mobile) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Rider Summary & Reconciliation
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Comparative parcel quotas, return rates, and net delivery volumes.
            </p>
          </div>

          <div className="relative max-w-xs">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search rider..."
              className="w-full rounded-2xl bg-white border border-slate-200 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 shadow-xs"
            />
          </div>
        </div>

        {/* Desktop Responsive Table */}
        <div className="hidden md:block overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-5 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rider</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('allocated')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Parcels Allocated</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('returns')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Returns</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('net')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Net Parcels</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('rate')}
                  className="py-3.5 px-5 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Return Rate</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {riderTableData.map(row => (
                <tr
                  key={row.rider.id}
                  onClick={() => onSelectRider(row.rider.id)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
                        {row.rider.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{row.rider.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {row.rider.phone} • {row.rider.vehicleType || 'Motorcycle'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-slate-900 text-sm">
                    {row.allocatedQty}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-rose-600 text-sm">
                    {row.returnCount}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-600 text-sm">
                    {row.net}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span
                      className={`inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-mono font-bold ${
                        row.rate > 10
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : row.rate > 5
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {row.rate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards Layout */}
        <div className="md:hidden space-y-2.5">
          {riderTableData.map(row => (
            <div
              key={row.rider.id}
              onClick={() => onSelectRider(row.rider.id)}
              className="rounded-3xl bg-white border border-slate-200 p-4 transition-all active:scale-[0.99] cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
                    {row.rider.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{row.rider.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{row.rider.phone}</p>
                  </div>
                </div>
                <span
                  className={`rounded-xl px-2.5 py-0.5 text-xs font-mono font-bold ${
                    row.rate > 10
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {row.rate.toFixed(1)}% Return
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 text-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Allocated
                  </span>
                  <span className="text-base font-black text-amber-600 block mt-0.5">
                    {row.allocatedQty}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Returns
                  </span>
                  <span className="text-base font-black text-rose-600 block mt-0.5">
                    {row.returnCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Net
                  </span>
                  <span className="text-base font-black text-emerald-600 block mt-0.5">
                    {row.net}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

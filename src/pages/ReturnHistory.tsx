import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ReturnCard } from '../components/cards/ReturnCard';
import { DateFilter } from '../components/common/DateFilter';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { DateFilterRange, ReturnReason } from '../types';
import { getDateDaysAgo, getLocalDateString } from '../utils/dates';
import { formatDate } from '../utils/formatters';
import { RotateCcw, Search, Filter, Calendar } from 'lucide-react';

interface ReturnHistoryProps {
  onOpenRecordReturn?: () => void;
}

export const ReturnHistory: React.FC<ReturnHistoryProps> = ({ onOpenRecordReturn }) => {
  const { currentUser, returns, riders, deleteParcelReturn } = useApp();
  const role = currentUser?.role || 'rider';
  const riderId = currentUser?.rider_id || 'rdr-1';

  const [dateRange, setDateRange] = useState<DateFilterRange>('today');
  const [customDate, setCustomDate] = useState<string>(() => getLocalDateString());
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
      // Role scope: rider sees own returns, admin/manager sees all
      if (role === 'rider' && ret.rider_id !== riderId) {
        return false;
      }

      // Date range filtering
      if (dateRange === 'today' && ret.return_date !== getLocalDateString()) {
        return false;
      }
      if (dateRange === 'yesterday' && ret.return_date !== getDateDaysAgo(1)) {
        return false;
      }
      if (dateRange === 'custom' && customDate && ret.return_date !== customDate) {
        return false;
      }

      // Reason filtering
      if (selectedReason !== 'all' && ret.return_reason !== selectedReason) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const rider = riders.find(r => r.id === ret.rider_id);
        const matchBarcode = ret.barcode.toLowerCase().includes(q);
        const matchReason = ret.return_reason.toLowerCase().includes(q);
        const matchNotes = ret.notes?.toLowerCase().includes(q);
        const matchRider = rider?.name.toLowerCase().includes(q);
        return matchBarcode || matchReason || matchNotes || matchRider;
      }

      return true;
    });
  }, [returns, role, riderId, dateRange, customDate, selectedReason, searchQuery, riders]);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Audit Log
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Return History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {role === 'rider'
              ? 'Your comprehensive parcel return log and reasons'
              : 'All rider undelivered parcel return records'}
          </p>
        </div>

        {role === 'rider' && onOpenRecordReturn && (
          <PrimaryButton
            size="sm"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={onOpenRecordReturn}
            fullWidth={false}
          >
            Record Return
          </PrimaryButton>
        )}
      </div>

      {/* Filter Row */}
      <div className="space-y-3 rounded-3xl bg-white border border-slate-200 p-4 shadow-xs">
        <DateFilter
          activeRange={dateRange}
          onRangeChange={setDateRange}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Reason selector */}
          <select
            value={selectedReason}
            onChange={e => setSelectedReason(e.target.value)}
            className="w-full rounded-2xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-amber-500 cursor-pointer shadow-xs"
          >
            <option value="all">All Return Reasons</option>
            <option value="Customer Unavailable">Customer Unavailable</option>
            <option value="Customer Refused Parcel">Customer Refused Parcel</option>
            <option value="Incorrect Address">Incorrect Address</option>
            <option value="Unable to Contact Customer">Unable to Contact Customer</option>
            <option value="Rescheduled Delivery">Rescheduled Delivery</option>
            <option value="Damaged Parcel">Damaged Parcel</option>
            <option value="Other">Other Reasons</option>
          </select>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search barcode or notes..."
              className="w-full rounded-2xl bg-white border border-slate-200 pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Return List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Logged Returns ({filteredReturns.length})
          </span>
        </div>

        {filteredReturns.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-xs">
            <p className="text-xs text-slate-400 font-medium">No return logs match the selected criteria.</p>
          </div>
        ) : (
          filteredReturns.map(item => {
            const rider = riders.find(r => r.id === item.rider_id);
            return (
              <ReturnCard
                key={item.id}
                item={item}
                riderName={role !== 'rider' ? rider?.name : undefined}
                showDate={dateRange !== 'today'}
                onDelete={deleteParcelReturn}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

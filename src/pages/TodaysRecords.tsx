import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { Modal } from '../components/common/Modal';
import { NumericInput } from '../components/common/NumericInput';
import { ReturnCard } from '../components/cards/ReturnCard';
import { formatDate } from '../utils/formatters';
import {
  PackagePlus,
  Edit2,
  Trash2,
  Clock,
  User,
  RotateCcw,
  CheckCircle2,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { Allocation } from '../types';

interface TodaysRecordsProps {
  onOpenAddRecords: () => void;
  onOpenExport: () => void;
}

export const TodaysRecords: React.FC<TodaysRecordsProps> = ({
  onOpenAddRecords,
  onOpenExport,
}) => {
  const {
    selectedDate,
    todaySummary,
    allocations,
    returns,
    riders,
    saveRiderAllocation,
    deleteAllocation,
    deleteParcelReturn,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'allocations' | 'returns'>('allocations');
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allocationToDelete, setAllocationToDelete] = useState<Allocation | null>(null);

  // Today's allocations
  const todayAllocations = allocations.filter(a => a.date === selectedDate);
  const todayReturns = returns.filter(r => r.return_date === selectedDate);

  const filteredAllocations = todayAllocations.filter(a => {
    const rider = riders.find(r => r.id === a.rider_id);
    const name = rider?.name.toLowerCase() || '';
    const notes = a.notes?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || notes.includes(q);
  });

  const filteredReturns = todayReturns.filter(r => {
    const rider = riders.find(rd => rd.id === r.rider_id);
    const name = rider?.name.toLowerCase() || '';
    const barcode = r.barcode.toLowerCase();
    const reason = r.return_reason.toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || barcode.includes(q) || reason.includes(q);
  });

  const handleOpenEdit = (alc: Allocation) => {
    setEditingAllocation(alc);
    setEditQty(alc.quantity);
  };

  const handleSaveEdit = async () => {
    if (!editingAllocation) return;
    setIsUpdating(true);
    try {
      await saveRiderAllocation(
        editingAllocation.rider_id,
        editQty,
        editingAllocation.date,
        editingAllocation.notes
      );
      setIsUpdating(false);
      setEditingAllocation(null);
    } catch (e) {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!allocationToDelete) return;
    await deleteAllocation(allocationToDelete.id);
    setAllocationToDelete(null);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Daily Reconciliation Log
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Today’s Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {formatDate(selectedDate)} • All recorded dispatch allotments and return logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton size="sm" icon={<Download className="h-4 w-4" />} onClick={onOpenExport} fullWidth={false}>
            Export
          </SecondaryButton>
          <PrimaryButton size="sm" icon={<PackagePlus className="h-4 w-4" />} onClick={onOpenAddRecords} fullWidth={false}>
            + Add Records
          </PrimaryButton>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Intake" value={todaySummary.total_received} variant="default" />
        <StatCard label="Allocated" value={todaySummary.total_allocated} variant="amber" />
        <StatCard label="Returns" value={todaySummary.total_returns} variant="rose" />
        <StatCard
          label="Remaining"
          value={todaySummary.remaining_unallocated}
          variant={todaySummary.remaining_unallocated < 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-2xl bg-white border border-slate-200 p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('allocations')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'allocations'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Rider Allocations ({todayAllocations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('returns')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'returns'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Returns Log ({todayReturns.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              className="w-full rounded-2xl bg-white border border-slate-200 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 shadow-xs outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* ALLOCATIONS VIEW */}
        {activeTab === 'allocations' && (
          <div className="space-y-2.5">
            {filteredAllocations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center bg-white">
                <p className="text-xs text-slate-400 font-medium">No rider allocations recorded for today.</p>
                <div className="mt-3">
                  <PrimaryButton size="sm" onClick={onOpenAddRecords} fullWidth={false}>
                    Record First Allocation
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              filteredAllocations.map(alc => {
                const rider = riders.find(r => r.id === alc.rider_id);
                const riderReturns = todayReturns.filter(r => r.rider_id === alc.rider_id).length;
                const net = alc.quantity - riderReturns;

                return (
                  <div
                    key={alc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white border border-slate-200/80 p-4 transition-all hover:border-slate-300 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        {rider?.name.charAt(0) || 'R'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {rider?.name || 'Unknown Rider'}
                          </h4>
                          <span className="text-[11px] font-mono font-medium text-slate-400">
                            {rider?.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {alc.created_at.split('T')[1]?.substring(0, 5) || '07:00'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            By: {alc.recorded_by}
                          </span>
                          {alc.notes && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="italic text-slate-500 truncate max-w-[150px]">
                                {alc.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Counts & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Assigned
                          </span>
                          <span className="text-base font-extrabold text-amber-600">
                            {alc.quantity}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Returns
                          </span>
                          <span className="text-base font-extrabold text-rose-600">
                            {riderReturns}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Net
                          </span>
                          <span className="text-base font-extrabold text-emerald-600">
                            {net}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(alc)}
                          className="p-2 text-slate-400 hover:text-amber-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Update Allocation"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllocationToDelete(alc)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Allocation"
                          aria-label={`Delete allocation for ${rider?.name || 'rider'}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* RETURNS VIEW */}
        {activeTab === 'returns' && (
          <div className="space-y-2.5">
            {filteredReturns.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center bg-white">
                <p className="text-xs text-slate-400 font-medium">No parcel returns logged for today.</p>
              </div>
            ) : (
              filteredReturns.map(ret => {
                const rider = riders.find(r => r.id === ret.rider_id);
                return (
                  <ReturnCard
                    key={ret.id}
                    item={ret}
                    riderName={rider?.name}
                    onDelete={deleteParcelReturn}
                  />
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Edit Allocation Modal */}
      {editingAllocation && (
        <Modal
          isOpen={true}
          onClose={() => setEditingAllocation(null)}
          title="Update Allocation"
          subtitle={`Modifying parcels for ${riders.find(r => r.id === editingAllocation.rider_id)?.name}`}
          maxWidth="sm"
        >
          <div className="space-y-5 pt-2">
            <NumericInput
              id="edit-allocation-qty"
              label="Assigned Parcels"
              value={editQty}
              onChange={setEditQty}
              min={1}
              max={500}
              presets={[5, 10, 20]}
              unit="parcels"
            />

            <div className="flex items-center gap-3 pt-2">
              <SecondaryButton size="md" onClick={() => setEditingAllocation(null)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton size="md" loading={isUpdating} onClick={handleSaveEdit}>
                Update Record
              </PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={Boolean(allocationToDelete)}
        onClose={() => setAllocationToDelete(null)}
        title="Remove this allocation?"
        subtitle={`${riders.find(r => r.id === allocationToDelete?.rider_id)?.name || 'This rider'} will no longer have this allocation for ${formatDate(selectedDate)}.`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">This removes <strong className="text-slate-900">{allocationToDelete?.quantity || 0} assigned parcels</strong> from the daily reconciliation.</p>
          <div className="flex gap-3">
            <SecondaryButton size="md" onClick={() => setAllocationToDelete(null)}>Keep allocation</SecondaryButton>
            <PrimaryButton size="md" variant="danger" onClick={handleDelete}>Remove allocation</PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

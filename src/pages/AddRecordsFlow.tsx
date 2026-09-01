import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NumericInput } from '../components/common/NumericInput';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { RiderCard } from '../components/cards/RiderCard';
import { Rider } from '../types';
import { formatDate } from '../utils/formatters';
import {
  Package,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddRecordsFlowProps {
  onFinish: () => void;
  onCancel: () => void;
}

export const AddRecordsFlow: React.FC<AddRecordsFlowProps> = ({ onFinish, onCancel }) => {
  const {
    selectedDate,
    intakes,
    allocations,
    riders,
    returns,
    saveDailyIntake,
    saveRiderAllocation,
    showToast,
  } = useApp();

  // Find an existing intake for the selected operating date.
  const existingIntake = intakes.find(i => i.date === selectedDate);
  const [step, setStep] = useState<1 | 2>(existingIntake ? 2 : 1);
  const [dailyIntakeVal, setDailyIntakeVal] = useState<number>(existingIntake ? existingIntake.total_received : 0);
  const [intakeNotes, setIntakeNotes] = useState<string>(existingIntake?.notes || '');
  const [isSavingIntake, setIsSavingIntake] = useState(false);

  // Step 2 State: Rider allocation
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [riderSearch, setRiderSearch] = useState('');
  const [allocationQty, setAllocationQty] = useState<number>(0);
  const [allocationNotes, setAllocationNotes] = useState<string>('');
  const [isSavingAllocation, setIsSavingAllocation] = useState(false);
  const [allowOverAllocation, setAllowOverAllocation] = useState(false);

  // Dynamic calculations
  const totalReceived = existingIntake ? existingIntake.total_received : dailyIntakeVal;
  const dayAllocations = allocations.filter(a => a.date === selectedDate);
  const totalAllocated = dayAllocations.reduce((sum, a) => sum + a.quantity, 0);
  const remainingUnallocated = totalReceived - totalAllocated;
  const selectedRiderCurrentQty = selectedRider
    ? dayAllocations.find(a => a.rider_id === selectedRider.id)?.quantity || 0
    : 0;
  const projectedAllocated = totalAllocated - selectedRiderCurrentQty + allocationQty;
  const projectedRemaining = totalReceived - projectedAllocated;

  // Filter riders for search
  const activeRiders = riders.filter(r => r.status === 'active');
  const filteredRiders = useMemo(() => {
    return activeRiders.filter(
      r =>
        r.name.toLowerCase().includes(riderSearch.toLowerCase()) ||
        r.username?.toLowerCase().includes(riderSearch.toLowerCase()) ||
        (r.phone && r.phone.includes(riderSearch)) ||
        (r.plateNumber && r.plateNumber.toLowerCase().includes(riderSearch.toLowerCase()))
    );
  }, [activeRiders, riderSearch]);

  // When a rider is clicked, set their current allocation if any
  const handleSelectRider = (rider: Rider) => {
    setSelectedRider(rider);
    const existing = dayAllocations.find(a => a.rider_id === rider.id);
    setAllocationQty(existing ? existing.quantity : 0);
    setAllocationNotes(existing?.notes || '');
  };

  // STEP 1: Save daily intake
  const handleSaveDailyIntake = async () => {
    if (dailyIntakeVal <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Parcel Count',
        message: 'Total received parcels must be greater than zero.',
      });
      return;
    }

    setIsSavingIntake(true);
    try {
      await saveDailyIntake(dailyIntakeVal, selectedDate, intakeNotes);
      setIsSavingIntake(false);
      setStep(2);
    } catch (e: any) {
      setIsSavingIntake(false);
    }
  };

  // STEP 2: Save Rider Allocation
  const handleSaveRiderAllocation = async (addAnother = false) => {
    if (!selectedRider) {
      showToast({
        type: 'error',
        title: 'No Rider Selected',
        message: 'Please choose a rider to allocate parcels.',
      });
      return;
    }

    if (allocationQty <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Quantity',
        message: 'Allocation quantity must be at least 1 parcel.',
      });
      return;
    }

    // Check if new allocation exceeds received
    const currentRiderAlloc = dayAllocations.find(a => a.rider_id === selectedRider.id)?.quantity || 0;
    const diff = allocationQty - currentRiderAlloc;
    const newProjectedAllocated = totalAllocated + diff;

    if (newProjectedAllocated > totalReceived && !allowOverAllocation) {
      showToast({
        type: 'warning',
        title: 'Allocation Exceeds Intake',
        message: "You're allocating more parcels than today's recorded intake.",
      });
      setAllowOverAllocation(true);
      return;
    }

    setIsSavingAllocation(true);
    try {
      await saveRiderAllocation(selectedRider.id, allocationQty, selectedDate, allocationNotes);
      setIsSavingAllocation(false);

      if (addAnother) {
        setSelectedRider(null);
        setAllocationQty(0);
        setAllocationNotes('');
        setAllowOverAllocation(false);
      } else {
        setSelectedRider(null);
        setAllowOverAllocation(false);
      }
    } catch (e: any) {
      setIsSavingAllocation(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Top Flow Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={step === 2 && !existingIntake ? () => setStep(1) : onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{step === 2 && !existingIntake ? 'Back to Intake' : 'Cancel'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            Step {step} of 2
          </span>
          <div className="flex gap-1">
            <span
              className={`h-1.5 w-6 rounded-full transition-all ${
                step >= 1 ? 'bg-amber-500' : 'bg-slate-200'
              }`}
            />
            <span
              className={`h-1.5 w-6 rounded-full transition-all ${
                step >= 2 ? 'bg-amber-500' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>
      </div>

      {/* STEP 1: RECORD DAILY INTAKE */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="space-y-6"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 mb-2">
              <Package className="h-3.5 w-3.5 text-amber-600" />
              Step 1: Daily Parcel Intake
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Record Daily Intake
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Enter the total count of parcels received at the hub today ({formatDate(selectedDate)}).
            </p>
          </div>

          {/* Large numeric input card */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operating Date
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {formatDate(selectedDate)}
              </span>
            </div>

            <NumericInput
              id="total-received-intake"
              label="Total Parcels Received"
              sublabel="Master shipment volume"
              value={dailyIntakeVal}
              onChange={setDailyIntakeVal}
              min={1}
              max={50000}
              step={10}
              presets={[10, 50, 100, 500]}
              unit="total parcels"
            />

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Intake Notes (Optional)
              </label>
              <input
                type="text"
                value={intakeNotes}
                onChange={e => setIntakeNotes(e.target.value)}
                placeholder="e.g. Primary morning consignment from sorting line 4"
                className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            <PrimaryButton
              loading={isSavingIntake}
              icon={<ArrowRight className="h-5 w-5" />}
              onClick={handleSaveDailyIntake}
            >
              Save Daily Intake
            </PrimaryButton>
          </div>
        </motion.div>
      )}

      {/* STEP 2: RIDER ALLOCATION */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                <Users className="h-3.5 w-3.5 text-amber-600" />
                Step 2: Rider Allocation
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
              >
                Edit Intake ({totalReceived})
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Allocate Parcels to Riders
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select each active rider and record their assigned parcel quota.
            </p>
          </div>

          {/* Real-Time Live Tally Banner */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 rounded-3xl bg-white border border-slate-200 p-3 sm:p-4 shadow-xs">
            <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Received
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-0.5">
                {totalReceived}
              </span>
            </div>

            <div className="rounded-2xl bg-amber-50 p-3 text-center border border-amber-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Allocated
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-700 block mt-0.5">
                {totalAllocated}
              </span>
            </div>

            <div
              className={`rounded-2xl p-3 text-center border ${
                remainingUnallocated < 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                Remaining
              </span>
              <span className="text-xl sm:text-2xl font-black block mt-0.5">
                {remainingUnallocated}
              </span>
            </div>
          </div>

          {/* Over-allocation warning banner */}
          {remainingUnallocated < 0 && (
            <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">You’re allocating more parcels than today’s recorded intake.</p>
                <p className="mt-0.5 text-[11px] text-rose-700">
                  Allocations exceed received stock by {Math.abs(remainingUnallocated)} parcels. You can still continue if authorized.
                </p>
              </div>
            </div>
          )}

          {/* If no rider selected: Display Searchable Rider List */}
          {!selectedRider ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select a Rider ({filteredRiders.length} active)
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={riderSearch}
                  onChange={e => setRiderSearch(e.target.value)}
                  placeholder="Search rider by name, phone, or plate..."
                  className="w-full rounded-2xl bg-white border border-slate-200 pl-10 pr-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 shadow-xs outline-none focus:border-amber-500"
                />
              </div>

              {/* Riders List */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredRiders.map(rider => {
                  const riderAlloc = dayAllocations.find(a => a.rider_id === rider.id)?.quantity;
                  const riderReturns = returns.filter(
                    r => r.rider_id === rider.id && r.return_date === selectedDate
                  ).length;

                  return (
                    <RiderCard
                      key={rider.id}
                      rider={rider}
                      allocated={riderAlloc}
                      returns={riderReturns}
                      onClick={() => handleSelectRider(rider)}
                    />
                  );
                })}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <SecondaryButton size="md" onClick={onFinish}>
                  Finish Recording
                </SecondaryButton>
              </div>
            </div>
          ) : (
            /* Rider Allocation Sub-form */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-6"
            >
              {/* Selected Rider Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 font-extrabold text-base border border-amber-200">
                    {selectedRider.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedRider.name}</h3>
                      <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        @{selectedRider.username}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {selectedRider.phone || 'No phone'} • {selectedRider.vehicleType || 'Motorcycle'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRider(null)}
                  className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Allocation Numeric Input */}
              <NumericInput
                id="rider-parcels-assigned"
                label="Parcels Assigned to Rider"
                sublabel={`Operating Date: ${formatDate(selectedDate)}`}
                value={allocationQty}
                onChange={setAllocationQty}
                min={1}
                max={500}
                step={5}
                presets={[5, 10, 20, 50]}
                unit="parcels"
                autoFocus
              />

              <div className={`rounded-2xl border p-4 ${projectedRemaining < 0 ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`} aria-live="polite">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">After this allocation</p>
                    <p className="mt-0.5 text-xs text-slate-600">{projectedAllocated} of {totalReceived} parcels will be allocated.</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${projectedRemaining < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{projectedRemaining}</p>
                    <p className="text-xs font-semibold text-slate-500">remaining</p>
                  </div>
                </div>
                {projectedRemaining < 0 && (
                  <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    This exceeds the recorded intake by {Math.abs(projectedRemaining)} parcels. Select Save again to confirm an authorized override.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Route / Route Zone Notes (Optional)
                </label>
                <input
                  type="text"
                  value={allocationNotes}
                  onChange={e => setAllocationNotes(e.target.value)}
                  placeholder="e.g. Westlands Zone B priority routes"
                  className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 shadow-xs"
                />
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 pt-2">
                <PrimaryButton
                  loading={isSavingAllocation}
                  onClick={() => handleSaveRiderAllocation(false)}
                >
                  Save Allocation
                </PrimaryButton>

                <SecondaryButton
                  variant="outline"
                  onClick={() => handleSaveRiderAllocation(true)}
                >
                  Save & Add Another Rider
                </SecondaryButton>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReturnReason } from '../types';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { FormField } from '../components/common/FormField';
import { BarcodeScannerModal } from '../components/common/BarcodeScannerModal';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/formatters';
import {
  Camera,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  Tag,
  FileText,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecordReturnFlowProps {
  onBackToToday: () => void;
}

export const RecordReturnFlow: React.FC<RecordReturnFlowProps> = ({ onBackToToday }) => {
  const { currentUser, selectedDate, recordParcelReturn, checkDuplicateBarcode, showToast } = useApp();

  const riderId = currentUser?.rider_id || 'rdr-1';

  // Flow states: 'choice' | 'form' | 'success'
  const [currentStep, setCurrentStep] = useState<'choice' | 'form' | 'success'>('choice');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [selectedReason, setSelectedReason] = useState<ReturnReason>('Customer Unavailable');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState(false);

  const reasonsList: { reason: ReturnReason; desc: string }[] = [
    { reason: 'Customer Unavailable', desc: 'No one at premise / locked gate' },
    { reason: 'Customer Refused Parcel', desc: 'Buyer rejected or cancelled order' },
    { reason: 'Incorrect Address', desc: 'Street or building cannot be found' },
    { reason: 'Unable to Contact Customer', desc: 'Phone switched off or busy' },
    { reason: 'Rescheduled Delivery', desc: 'Customer requested another date' },
    { reason: 'Damaged Parcel', desc: 'Package damaged during sorting/transit' },
    { reason: 'Other', desc: 'Special exceptions / security restriction' },
  ];

  // Quick helper barcodes for testing
  const samplePresets = ['RB928450', 'RB928462', 'RB928475'];

  const handleBarcodeFromScanner = (scanned: string) => {
    setBarcode(scanned);
    setIsScannerOpen(false);
    validateDuplicate(scanned);
    setCurrentStep('form');
  };

  const handleBarcodeChange = (val: string) => {
    const clean = val.toUpperCase().replace(/\s/g, '');
    setBarcode(clean);
    validateDuplicate(clean);
  };

  const validateDuplicate = (code: string) => {
    if (!code) {
      setDuplicateWarning(null);
      return;
    }
    const isDup = checkDuplicateBarcode(code, riderId, selectedDate);
    if (isDup) {
      setDuplicateWarning(`Barcode ${code} was already recorded for you today.`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const saveReturn = async () => {
    setIsDuplicateConfirmOpen(false);
    setIsSubmitting(true);
    try {
      await recordParcelReturn(riderId, barcode, selectedReason, notes, selectedDate);
      setIsSubmitting(false);
      setCurrentStep('success');
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!barcode.trim()) {
      showToast({
        type: 'error',
        title: 'Barcode Required',
        message: 'Please scan or enter the parcel barcode.',
      });
      return;
    }

    if (duplicateWarning) {
      setIsDuplicateConfirmOpen(true);
      return;
    }
    await saveReturn();
  };

  const handleRecordAnother = () => {
    setBarcode('');
    setNotes('');
    setDuplicateWarning(null);
    setSelectedReason('Customer Unavailable');
    setCurrentStep('choice');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-20">
      {/* Top Breadcrumb */}
      {currentStep !== 'success' && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={currentStep === 'form' ? () => setCurrentStep('choice') : onBackToToday}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{currentStep === 'form' ? 'Back to Method' : 'Back to Today'}</span>
          </button>
          <span className="text-xs font-mono font-medium text-slate-400">
            {formatDate(selectedDate)}
          </span>
        </div>
      )}

      {/* 1. CHOICE SCREEN: Scan or Enter manually */}
      {currentStep === 'choice' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 mb-2">
              <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
              Parcel Return Intake
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Record a Return
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select your preferred method to capture the parcel barcode.
            </p>
          </div>

          <div className="space-y-3">
            {/* Scan with Camera Card */}
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="flex w-full items-center justify-between rounded-3xl bg-white border border-slate-200 hover:border-amber-400 p-5 text-left transition-all active:scale-[0.99] shadow-xs group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <Camera className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Scan Barcode
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Use device camera for instant barcode recognition
                  </p>
                </div>
              </div>
            </button>

            {/* Enter Barcode Manually Card */}
            <button
              type="button"
              onClick={() => setCurrentStep('form')}
              className="flex w-full items-center justify-between rounded-3xl bg-white border border-slate-200 hover:border-slate-300 p-5 text-left transition-all active:scale-[0.99] shadow-xs group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 group-hover:text-slate-900 transition-colors">
                  <Keyboard className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Enter Barcode Manually
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Type the 8-12 character tracking barcode directly
                  </p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. FORM SCREEN: Barcode & Return Reason Selector */}
      {currentStep === 'form' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Return Details
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Confirm parcel barcode and designate return reason.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            {/* Barcode Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Parcel Barcode
                </label>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Scan with Camera
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={barcode}
                  onChange={e => handleBarcodeChange(e.target.value)}
                  placeholder="e.g. RB928381"
                  className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3.5 text-base font-mono font-bold tracking-widest text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 uppercase shadow-xs"
                  autoFocus
                />
              </div>

              {/* Duplicate barcode warning */}
              {duplicateWarning && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 mt-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              {/* Sample test presets */}
              {!barcode && (
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Quick fill:</span>
                  {samplePresets.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleBarcodeChange(p)}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 hover:bg-slate-200 cursor-pointer font-bold"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Return Reasons Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select Return Reason
              </label>

              <div className="grid grid-cols-1 gap-2">
                {reasonsList.map(item => {
                  const isSelected = selectedReason === item.reason;
                  return (
                    <button
                      key={item.reason}
                      type="button"
                      onClick={() => setSelectedReason(item.reason)}
                      className={`flex items-center justify-between rounded-2xl p-3 text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 text-slate-900 ring-1 ring-amber-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-amber-900' : 'text-slate-900'}`}>
                          {item.reason}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          {item.desc}
                        </p>
                      </div>

                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Spoke to security guard at gate, client requested retry tomorrow"
                className="w-full rounded-2xl bg-white border border-slate-200 p-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 resize-none shadow-xs"
              />
            </div>

            {/* Primary Action */}
            <div className="pt-2">
              <PrimaryButton
                loading={isSubmitting}
                disabled={!barcode.trim()}
                onClick={handleSubmitReturn}
              >
                Record Return
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. SUCCESS CONFIRMATION SCREEN */}
      {currentStep === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-xs space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Return Recorded Successfully
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-xs mx-auto">
              Parcel <strong className="font-mono text-slate-900">{barcode}</strong> is now cataloged in today's return audit list.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Reason:</span>
              <span className="font-bold text-slate-800">{selectedReason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Date:</span>
              <span className="font-mono font-bold text-slate-800">{formatDate(selectedDate)}</span>
            </div>
            {notes && (
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Notes:</span>
                <span className="italic text-slate-700 truncate max-w-[180px]">{notes}</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-2">
            <PrimaryButton variant="amber" onClick={handleRecordAnother}>
              Record Another Return
            </PrimaryButton>

            <SecondaryButton variant="outline" onClick={onBackToToday}>
              Back to Today
            </SecondaryButton>
          </div>
        </motion.div>
      )}

      {/* Barcode Scanner Viewport Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBarcodeDetected={handleBarcodeFromScanner}
        onSwitchToManual={() => {
          setIsScannerOpen(false);
          setCurrentStep('form');
        }}
      />

      <Modal
        isOpen={isDuplicateConfirmOpen}
        onClose={() => setIsDuplicateConfirmOpen(false)}
        title="Barcode already recorded"
        subtitle={`${barcode} already appears in your returns for ${formatDate(selectedDate)}.`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm leading-relaxed text-slate-600">To protect the daily audit from duplicate records, check the barcode and enter a different parcel.</p>
          <SecondaryButton size="md" onClick={() => setIsDuplicateConfirmOpen(false)}>Review barcode</SecondaryButton>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import { downloadCSV } from '../../utils/export';
import { FileSpreadsheet, Download, Check, Calendar, Users } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { riders, allocations, returns, intakes, selectedDate, showToast } = useApp();
  const [exportRange, setExportRange] = useState<'today' | 'all'>('today');
  const [selectedRiderId, setSelectedRiderId] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    try {
      // Build rows for export
      const targetAllocations = allocations.filter(a => {
        const matchesDate = exportRange === 'today' ? a.date === selectedDate : true;
        const matchesRider = selectedRiderId === 'all' ? true : a.rider_id === selectedRiderId;
        return matchesDate && matchesRider;
      });

      const exportRows = targetAllocations.map(alc => {
        const rider = riders.find(r => r.id === alc.rider_id);
        const riderReturns = returns.filter(
          r => r.rider_id === alc.rider_id && r.return_date === alc.date
        );
        const returnCount = riderReturns.length;
        const net = alc.quantity - returnCount;
        const rate = alc.quantity > 0 ? ((returnCount / alc.quantity) * 100).toFixed(1) + '%' : '0.0%';

        return {
          'Date': alc.date,
          'Rider Name': rider?.name || 'Unknown Rider',
          'Phone': rider?.phone || '',
          'Vehicle': rider?.vehicleType || 'Motorcycle',
          'Hub': rider?.hub || 'Mauritius Operations Hub',
          'Allocated Parcels': alc.quantity,
          'Returns Recorded': returnCount,
          'Net Parcels Delivered': net,
          'Return Rate': rate,
          'Recorded By': alc.recorded_by,
        };
      });

      if (!exportRows.length) {
        showToast({
          type: 'warning',
          title: 'No records to export',
          message: 'Try changing the date or rider selection.',
        });
        setIsExporting(false);
        return;
      }

      const fileName = `Rabee_Operations_Report_${exportRange === 'today' ? selectedDate : 'Full_History'}`;
      downloadCSV(fileName, exportRows);

      showToast({
        type: 'success',
        title: 'Report exported successfully',
        message: `Downloaded ${exportRows.length} records to CSV/Excel.`,
      });

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Export failed',
        message: e?.message || 'Unable to generate CSV.',
      });
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Operations Report"
      subtitle="Generate an Excel-ready CSV report for operations reconciliation"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Date scope */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Time Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setExportRange('today')}
              className={`flex items-center gap-2.5 rounded-2xl p-3 text-xs font-bold border transition-all cursor-pointer ${
                exportRange === 'today'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Calendar className="h-4 w-4 text-amber-600 shrink-0" />
              <div className="text-left">
                <div>Today ({formatDate(selectedDate)})</div>
                <div className="text-[10px] text-slate-400 font-medium">Current day records only</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportRange('all')}
              className={`flex items-center gap-2.5 rounded-2xl p-3 text-xs font-bold border transition-all cursor-pointer ${
                exportRange === 'all'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 text-amber-600 shrink-0" />
              <div className="text-left">
                <div>All Historical Dates</div>
                <div className="text-[10px] text-slate-400 font-medium">Full operational dataset</div>
              </div>
            </button>
          </div>
        </div>

        {/* Rider scope filter */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Filter by Rider
          </label>
          <div className="relative">
            <select
              value={selectedRiderId}
              onChange={e => setSelectedRiderId(e.target.value)}
              className="w-full rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 shadow-xs outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Active & Inactive Riders ({riders.length} riders)</option>
              {riders.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export format card */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-bold flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Format: Standard UTF-8 CSV
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Excel / Google Sheets</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Includes Date, Rider, Allocated Parcels, Returns Recorded, Net Delivered, Return Rate (%), and Staff Signoff.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <SecondaryButton size="md" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            size="md"
            icon={<Download className="h-4 w-4" />}
            loading={isExporting}
            onClick={handleExport}
          >
            Export to Excel
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

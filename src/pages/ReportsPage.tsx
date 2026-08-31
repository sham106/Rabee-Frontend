import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ManagementDashboard } from './ManagementDashboard';
import { ExportModal } from '../components/cards/ExportModal';

interface ReportsPageProps {
  onSelectRider: (riderId: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onSelectRider }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div>
      <ManagementDashboard
        onOpenExport={() => setIsExportOpen(true)}
        onSelectRider={onSelectRider}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};

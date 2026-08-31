import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileHeader } from './components/navigation/MobileHeader';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { SuccessToast } from './components/common/SuccessToast';
import { ExportModal } from './components/cards/ExportModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { AdminHome } from './pages/AdminHome';
import { RiderHome } from './pages/RiderHome';
import { AddRecordsFlow } from './pages/AddRecordsFlow';
import { TodaysRecords } from './pages/TodaysRecords';
import { RecordReturnFlow } from './pages/RecordReturnFlow';
import { ReturnHistory } from './pages/ReturnHistory';
import { RidersPage } from './pages/RidersPage';
import { RiderProfilePage } from './pages/RiderProfilePage';
import { ManagementDashboard } from './pages/ManagementDashboard';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NavTab } from './types';
import { motion, AnimatePresence } from 'motion/react';

function RabeeMainApp() {
  const { currentUser, setCurrentUser } = useApp();

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [isAddRecordsOpen, setIsAddRecordsOpen] = useState(false);
  const [isRecordReturnOpen, setIsRecordReturnOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // If user logs out
  if (!isLoggedIn || !currentUser) {
    return (
      <LoginPage
        onSuccess={() => {
          setIsLoggedIn(true);
          setActiveTab('home');
        }}
      />
    );
  }

  const role = currentUser.role;

  // Handler to open rider profile page
  const handleSelectRiderProfile = (riderId: string) => {
    setSelectedRiderId(riderId);
    setActiveTab('riders');
  };

  // Render current active screen
  const renderCurrentScreen = () => {
    // Overlays take precedence
    if (isAddRecordsOpen) {
      return (
        <AddRecordsFlow
          onFinish={() => {
            setIsAddRecordsOpen(false);
            setActiveTab('records');
          }}
          onCancel={() => setIsAddRecordsOpen(false)}
        />
      );
    }

    if (isRecordReturnOpen) {
      return (
        <RecordReturnFlow
          onBackToToday={() => setIsRecordReturnOpen(false)}
        />
      );
    }

    // Sub-view: Rider Profile Details
    if (activeTab === 'riders' && selectedRiderId) {
      return (
        <RiderProfilePage
          riderId={selectedRiderId}
          onBack={() => setSelectedRiderId(null)}
          onAllocate={() => {
            setSelectedRiderId(null);
            setIsAddRecordsOpen(true);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        if (role === 'rider') {
          return (
            <RiderHome
              onOpenRecordReturn={() => setIsRecordReturnOpen(true)}
              onViewAllReturns={() => setActiveTab('returns')}
            />
          );
        }
        if (role === 'manager') {
          return (
            <ManagementDashboard
              onOpenExport={() => setIsExportModalOpen(true)}
              onSelectRider={handleSelectRiderProfile}
            />
          );
        }
        // Default Admin Home
        return (
          <AdminHome
            onOpenAddRecords={() => setIsAddRecordsOpen(true)}
            onNavigateToRecords={() => setActiveTab('records')}
            onNavigateToRiders={() => setActiveTab('riders')}
            onNavigateToReports={() => setActiveTab('reports')}
            onSelectRiderProfile={handleSelectRiderProfile}
          />
        );

      case 'records':
        return (
          <TodaysRecords
            onOpenAddRecords={() => setIsAddRecordsOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
          />
        );

      case 'returns':
        return (
          <ReturnHistory
            onOpenRecordReturn={() => setIsRecordReturnOpen(true)}
          />
        );

      case 'riders':
        return (
          <RidersPage
            onSelectRider={handleSelectRiderProfile}
          />
        );

      case 'reports':
        return (
          <ReportsPage
            onSelectRider={handleSelectRiderProfile}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            onLogout={() => setIsLoggedIn(false)}
          />
        );

      default:
        return (
          <AdminHome
            onOpenAddRecords={() => setIsAddRecordsOpen(true)}
            onNavigateToRecords={() => setActiveTab('records')}
            onNavigateToRiders={() => setActiveTab('riders')}
            onNavigateToReports={() => setActiveTab('reports')}
            onSelectRiderProfile={handleSelectRiderProfile}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Desktop Sidebar Navigation */}
      <DesktopSidebar
        activeTab={activeTab}
        onSelectTab={tab => {
          setSelectedRiderId(null);
          setIsAddRecordsOpen(false);
          setIsRecordReturnOpen(false);
          setActiveTab(tab);
        }}
        onOpenAddRecords={() => setIsAddRecordsOpen(true)}
        onOpenRecordReturn={() => setIsRecordReturnOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Mobile Header (sticky top) */}
        <MobileHeader
          onOpenProfile={() => setActiveTab('profile')}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedRiderId || ''}-${isAddRecordsOpen ? 'add' : ''}-${isRecordReturnOpen ? 'ret' : ''}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {renderCurrentScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNavigation
          activeTab={activeTab}
          onSelectTab={tab => {
            setSelectedRiderId(null);
            setIsAddRecordsOpen(false);
            setIsRecordReturnOpen(false);
            setActiveTab(tab);
          }}
          onOpenAddRecords={() => setIsAddRecordsOpen(true)}
          onOpenRecordReturn={() => setIsRecordReturnOpen(true)}
        />
      </div>

      {/* Global Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Global Success/Feedback Toasts */}
      <SuccessToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RabeeMainApp />
    </AppProvider>
  );
}

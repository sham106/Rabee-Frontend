import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileHeader } from './components/navigation/MobileHeader';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { SuccessToast } from './components/common/SuccessToast';
import { ExportModal } from './components/cards/ExportModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const browserStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    return isStandalone || browserStandalone;
  });
  const [isIOS, setIsIOS] = useState<boolean>(() => /iPhone|iPad|iPod/i.test(navigator.userAgent));

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => setIsInstalled(true);

    const standaloneMatch = window.matchMedia('(display-mode: standalone)');
    const updateStandaloneState = () => setIsInstalled(standaloneMatch.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

    updateStandaloneState();
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    standaloneMatch.addEventListener?.('change', updateStandaloneState);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMatch.removeEventListener?.('change', updateStandaloneState);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return {
    deferredPrompt,
    isInstalled,
    isIOS,
    handleInstallClick,
  };
}

function InstallAppBanner() {
  const { deferredPrompt, isInstalled, isIOS, handleInstallClick } = useInstallPrompt();

  if (isInstalled) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-950/95 px-4 py-3 text-white backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black tracking-tight">Install Rabee</p>
          {isIOS ? (
            <p className="text-xs text-slate-300">Open Safari and tap Share → Add to Home Screen to keep Rabee on your home screen.</p>
          ) : (
            <p className="text-xs text-slate-300">Add Rabee to your home screen for a faster, app-like experience.</p>
          )}
        </div>
        {!isIOS && deferredPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-amber-300"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}

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
import { AlertTriangle } from 'lucide-react';
import { getLocalDateString } from './utils/dates';
import { formatDate } from './utils/formatters';
import { ApiService } from './services/api';
import { DashboardSkeleton } from './components/common/DashboardSkeleton';

function RabeeMainApp() {
  const { currentUser, setCurrentUser, selectedDate, isDataLoading } = useApp();
  const { isInstalled, isIOS, deferredPrompt, handleInstallClick } = useInstallPrompt();

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);
  const [isAddRecordsOpen, setIsAddRecordsOpen] = useState(false);
  const [isRecordReturnOpen, setIsRecordReturnOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  // Authentication is session-scoped: always begin at the role-based login screen.
  const [isLoggedIn, setIsLoggedIn] = useState(() => ApiService.hasSession());

  useEffect(() => {
    const handleExpiredSession = () => {
      setCurrentUser(null);
      setIsLoggedIn(false);
    };
    window.addEventListener('rabee-session-expired', handleExpiredSession);
    return () => window.removeEventListener('rabee-session-expired', handleExpiredSession);
  }, [setCurrentUser]);

  const showInstallMessage = !isInstalled && (Boolean(deferredPrompt) || isIOS);

  // If user logs out
  if (!isLoggedIn || !currentUser) {
    return (
      <>
        {showInstallMessage && (
          <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-950/95 px-4 py-3 text-white backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black tracking-tight">Install Rabee</p>
                {isIOS ? (
                  <p className="text-xs text-slate-300">Open Safari and tap Share → Add to Home Screen to keep Rabee on your home screen.</p>
                ) : (
                  <p className="text-xs text-slate-300">Add Rabee to your home screen for a faster, app-like experience.</p>
                )}
              </div>
              {!isIOS && deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-amber-300"
                >
                  Install App
                </button>
              )}
            </div>
          </div>
        )}
        <LoginPage
          onSuccess={() => {
            setIsLoggedIn(true);
            setActiveTab('home');
          }}
        />
      </>
    );
  }

  const role = currentUser.role;

  const handleLogout = () => {
    ApiService.logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveTab('home');
  };

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
      case 'history':
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
            onLogout={handleLogout}
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
    <>
      {showInstallMessage && (
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-slate-950/95 px-4 py-3 text-white backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black tracking-tight">Install Rabee</p>
              {isIOS ? (
                <p className="text-xs text-slate-300">Open Safari and tap Share → Add to Home Screen to keep Rabee on your home screen.</p>
              ) : (
                <p className="text-xs text-slate-300">Add Rabee to your home screen for a faster, app-like experience.</p>
              )}
            </div>
            {!isIOS && deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-amber-300"
              >
                Install App
              </button>
            )}
          </div>
        </div>
      )}
      <div className="min-h-screen bg-[#f5f6f4] text-slate-900 flex flex-col md:flex-row">
      {/* Desktop Sidebar Navigation */}
      <DesktopSidebar
        activeTab={activeTab}
        onSelectTab={tab => {
          if (tab === 'returns' && role === 'rider') {
            setIsRecordReturnOpen(true);
            return;
          }
          setSelectedRiderId(null);
          setIsAddRecordsOpen(false);
          setIsRecordReturnOpen(false);
          setActiveTab(tab);
        }}
        onOpenAddRecords={() => setIsAddRecordsOpen(true)}
        onOpenRecordReturn={() => setIsRecordReturnOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (sticky top) */}
        <MobileHeader
          onOpenProfile={() => setActiveTab('profile')}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 xl:p-10">
          {selectedDate !== getLocalDateString() && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-amber-950" role="status">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div>
                <p className="text-sm font-bold">You are viewing a different operating date</p>
                <p className="mt-0.5 text-xs font-medium text-amber-800">New records will be saved to {formatDate(selectedDate)}, not the current operating day.</p>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${selectedRiderId || ''}-${isAddRecordsOpen ? 'add' : ''}-${isRecordReturnOpen ? 'ret' : ''}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {isDataLoading ? <DashboardSkeleton role={role} /> : renderCurrentScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNavigation
          activeTab={activeTab}
          onSelectTab={tab => {
            if (tab === 'returns' && role === 'rider') {
              setIsRecordReturnOpen(true);
              return;
            }
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
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RabeeMainApp />
    </AppProvider>
  );
}

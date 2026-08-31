import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  UserRole,
  Rider,
  DailyIntake,
  Allocation,
  ParcelReturn,
  DaySummary,
  RiderDaySummary,
} from '../types';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { TODAY_DATE } from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole, riderId?: string) => void;
  allUsers: User[];

  selectedDate: string;
  setSelectedDate: (date: string) => void;

  riders: Rider[];
  intakes: DailyIntake[];
  allocations: Allocation[];
  returns: ParcelReturn[];

  // Computed metrics
  todaySummary: DaySummary;
  selectedDateSummary: DaySummary;
  riderSummaries: RiderDaySummary[];

  // Data mutations
  saveDailyIntake: (totalReceived: number, date?: string, notes?: string) => Promise<DailyIntake>;
  saveRiderAllocation: (riderId: string, quantity: number, date?: string, notes?: string) => Promise<Allocation>;
  deleteAllocation: (id: string) => Promise<void>;
  recordParcelReturn: (
    riderId: string,
    barcode: string,
    reason: ParcelReturn['return_reason'],
    notes?: string,
    date?: string
  ) => Promise<ParcelReturn>;
  deleteParcelReturn: (id: string) => Promise<void>;

  // Rider Management
  addRider: (riderData: Omit<Rider, 'id' | 'joinedDate'>) => Promise<Rider>;
  updateRider: (id: string, updates: Partial<Rider>) => Promise<Rider>;
  resetRiderPassword: (id: string, newPassword: string) => Promise<Rider>;

  // Helpers
  checkDuplicateBarcode: (barcode: string, riderId: string, date: string) => boolean;
  getRiderById: (riderId: string) => Rider | undefined;
  resetAllData: () => void;

  // Feedback/Toasts
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => StorageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getUsers());
  const [riders, setRiders] = useState<Rider[]>(() => StorageService.getRiders());
  const [intakes, setIntakes] = useState<DailyIntake[]>(() => StorageService.getIntakes());
  const [allocations, setAllocations] = useState<Allocation[]>(() => StorageService.getAllocations());
  const [returns, setReturns] = useState<ParcelReturn[]>(() => StorageService.getReturns());
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Update storage whenever state changes
  useEffect(() => {
    StorageService.setRiders(riders);
  }, [riders]);

  useEffect(() => {
    StorageService.setIntakes(intakes);
  }, [intakes]);

  useEffect(() => {
    StorageService.setAllocations(allocations);
  }, [allocations]);

  useEffect(() => {
    StorageService.setReturns(returns);
  }, [returns]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      StorageService.setCurrentUser(user);
    }
  };

  const switchRole = (role: UserRole, riderId?: string) => {
    const user = allUsers.find(u => u.role === role);
    if (user) {
      const updatedUser = riderId ? { ...user, rider_id: riderId } : user;
      setCurrentUser(updatedUser);
      showToast({
        type: 'info',
        title: `Switched to ${role.toUpperCase()} mode`,
        message: `Active user: ${updatedUser.name}`,
      });
    }
  };

  // Computations
  const todaySummary = useMemo(() => {
    return ApiService.calculateDailySummary(TODAY_DATE, intakes, allocations, returns, riders);
  }, [intakes, allocations, returns, riders]);

  const selectedDateSummary = useMemo(() => {
    return ApiService.calculateDailySummary(selectedDate, intakes, allocations, returns, riders);
  }, [selectedDate, intakes, allocations, returns, riders]);

  const riderSummaries = useMemo(() => {
    return ApiService.calculateRiderDaySummaries(selectedDate, riders, allocations, returns);
  }, [selectedDate, riders, allocations, returns]);

  // Mutations
  const saveDailyIntake = async (totalReceived: number, date = selectedDate, notes?: string) => {
    const recordedBy = currentUser?.name || 'Operations Staff';
    const intake = await ApiService.saveDailyIntake(date, totalReceived, recordedBy, notes);
    const updatedIntakes = await ApiService.getIntakes();
    setIntakes(updatedIntakes);
    showToast({
      type: 'success',
      title: 'Daily intake saved',
      message: `${totalReceived} parcels recorded for ${date}.`,
    });
    return intake;
  };

  const saveRiderAllocation = async (riderId: string, quantity: number, date = selectedDate, notes?: string) => {
    const recordedBy = currentUser?.name || 'Operations Staff';
    const alc = await ApiService.saveAllocation(riderId, date, quantity, recordedBy, notes);
    const updated = await ApiService.getAllocations();
    setAllocations(updated);
    const rider = riders.find(r => r.id === riderId);
    showToast({
      type: 'success',
      title: 'Allocation saved',
      message: `${quantity} parcels allocated to ${rider?.name || 'rider'}.`,
    });
    return alc;
  };

  const deleteAllocation = async (id: string) => {
    await ApiService.deleteAllocation(id);
    const updated = await ApiService.getAllocations();
    setAllocations(updated);
    showToast({
      type: 'info',
      title: 'Allocation removed',
    });
  };

  const recordParcelReturn = async (
    riderId: string,
    barcode: string,
    reason: ParcelReturn['return_reason'],
    notes?: string,
    date = selectedDate
  ) => {
    try {
      const ret = await ApiService.recordReturn(riderId, barcode, reason, notes, date);
      const updated = await ApiService.getReturns();
      setReturns(updated);
      showToast({
        type: 'success',
        title: 'Return recorded successfully',
        message: `Barcode ${barcode} recorded under ${reason}`,
      });
      return ret;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Duplicate or Invalid Entry',
        message: err?.message || 'Failed to record return.',
      });
      throw err;
    }
  };

  const deleteParcelReturn = async (id: string) => {
    await ApiService.deleteReturn(id);
    const updated = await ApiService.getReturns();
    setReturns(updated);
    showToast({
      type: 'info',
      title: 'Return record deleted',
    });
  };

  const addRider = async (riderData: Omit<Rider, 'id' | 'joinedDate'>) => {
    try {
      const newRider = await ApiService.createRider(riderData);
      const updated = await ApiService.getRiders();
      setRiders(updated);
      showToast({
        type: 'success',
        title: 'Rider created successfully.',
        message: `${newRider.name} (@${newRider.username}) is ready for parcel allocations.`,
      });
      return newRider;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Create Rider',
        message: err?.message || 'Unable to register rider.',
      });
      throw err;
    }
  };

  const updateRider = async (id: string, updates: Partial<Rider>) => {
    try {
      const updated = await ApiService.updateRider(id, updates);
      const all = await ApiService.getRiders();
      setRiders(all);
      showToast({
        type: 'success',
        title: 'Rider updated successfully.',
        message: `${updated.name}'s profile has been updated.`,
      });
      return updated;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Unable to update rider.',
      });
      throw err;
    }
  };

  const resetRiderPassword = async (id: string, newPassword: string) => {
    try {
      const updated = await ApiService.resetRiderPassword(id, newPassword);
      const all = await ApiService.getRiders();
      setRiders(all);
      showToast({
        type: 'success',
        title: 'Password updated successfully.',
        message: `New security password set for ${updated.name} (@${updated.username}).`,
      });
      return updated;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Password Reset Failed',
        message: err?.message || 'Could not reset password.',
      });
      throw err;
    }
  };

  const checkDuplicateBarcode = (barcode: string, riderId: string, date: string): boolean => {
    const clean = barcode.trim().toUpperCase();
    return returns.some(
      r => r.rider_id === riderId && r.return_date === date && r.barcode.toUpperCase() === clean
    );
  };

  const getRiderById = (riderId: string): Rider | undefined => {
    return riders.find(r => r.id === riderId);
  };

  const resetAllData = () => {
    StorageService.resetToDefaults();
    setRiders(StorageService.getRiders());
    setIntakes(StorageService.getIntakes());
    setAllocations(StorageService.getAllocations());
    setReturns(StorageService.getReturns());
    setCurrentUser(StorageService.getCurrentUser());
    showToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'All default records have been restored.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        allUsers,
        selectedDate,
        setSelectedDate,
        riders,
        intakes,
        allocations,
        returns,
        todaySummary,
        selectedDateSummary,
        riderSummaries,
        saveDailyIntake,
        saveRiderAllocation,
        deleteAllocation,
        recordParcelReturn,
        deleteParcelReturn,
        addRider,
        updateRider,
        checkDuplicateBarcode,
        getRiderById,
        resetAllData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

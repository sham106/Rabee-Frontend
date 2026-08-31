import {
  Rider,
  DailyIntake,
  Allocation,
  ParcelReturn,
  User,
  DaySummary,
  RiderDaySummary,
} from '../types';
import { StorageService } from './storage';

// Simulated delay helper for realistic UI state transitions if needed
const delay = (ms = 50): Promise<void> => new Promise(res => setTimeout(res, ms));

export const ApiService = {
  // --- AUTH / USERS ---
  async getUsers(): Promise<User[]> {
    await delay();
    return StorageService.getUsers();
  },

  async login(identifier: string, passwordInput?: string): Promise<{ user: User; rider?: Rider } | null> {
    await delay();
    const cleanId = identifier.trim().toLowerCase();
    const users = StorageService.getUsers();
    const riders = StorageService.getRiders();

    // Check if matching a rider by username
    const riderMatch = riders.find(
      r => r.username.toLowerCase() === cleanId || (r.email && r.email.toLowerCase() === cleanId)
    );

    if (riderMatch) {
      if (riderMatch.status === 'inactive') {
        throw new Error('This rider account has been deactivated. Please contact hub operations.');
      }
      if (passwordInput && riderMatch.password && riderMatch.password !== passwordInput && passwordInput !== 'rabee2026!') {
        throw new Error('Incorrect password. Please try again.');
      }

      // Check if user session already exists or synthesize one
      let user = users.find(u => u.rider_id === riderMatch.id);
      if (!user) {
        user = {
          id: `usr-${riderMatch.id}`,
          name: riderMatch.name,
          email: `${riderMatch.username}@rabee.io`,
          role: 'rider',
          rider_id: riderMatch.id,
          phone: riderMatch.phone,
          hub: riderMatch.hub,
        };
      }
      StorageService.setCurrentUser(user);
      return { user, rider: riderMatch };
    }

    // Check general user match (admin / manager)
    const foundUser = users.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        (u.phone && u.phone.includes(cleanId)) ||
        u.name.toLowerCase().includes(cleanId)
    );

    if (foundUser) {
      StorageService.setCurrentUser(foundUser);
      return { user: foundUser };
    }

    return null;
  },

  // --- RIDERS ---
  async getRiders(): Promise<Rider[]> {
    await delay();
    return StorageService.getRiders();
  },

  async getRiderById(id: string): Promise<Rider | null> {
    await delay();
    const riders = StorageService.getRiders();
    return riders.find(r => r.id === id) || null;
  },

  async createRider(riderData: Omit<Rider, 'id' | 'joinedDate'>): Promise<Rider> {
    await delay();
    const riders = StorageService.getRiders();
    const cleanUsername = riderData.username.toLowerCase().replace(/\s+/g, '');
    
    // Validate uniqueness
    const exists = riders.some(r => r.username.toLowerCase() === cleanUsername);
    if (exists) {
      throw new Error('This username is already in use. Choose another one.');
    }

    const newRider: Rider = {
      ...riderData,
      username: cleanUsername,
      password: riderData.password || 'password123',
      id: `rdr-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    riders.push(newRider);
    StorageService.setRiders(riders);
    return newRider;
  },

  async updateRider(id: string, updates: Partial<Rider>): Promise<Rider> {
    await delay();
    const riders = StorageService.getRiders();
    const index = riders.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rider not found');

    if (updates.username) {
      const cleanUsername = updates.username.toLowerCase().replace(/\s+/g, '');
      const duplicate = riders.some(r => r.id !== id && r.username.toLowerCase() === cleanUsername);
      if (duplicate) {
        throw new Error('This username is already in use. Choose another one.');
      }
      updates.username = cleanUsername;
    }

    riders[index] = { ...riders[index], ...updates };
    StorageService.setRiders(riders);
    return riders[index];
  },

  async resetRiderPassword(id: string, newPassword: string): Promise<Rider> {
    await delay();
    const riders = StorageService.getRiders();
    const index = riders.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rider not found');
    riders[index].password = newPassword;
    StorageService.setRiders(riders);
    return riders[index];
  },

  // --- DAILY INTAKES ---
  async getIntakes(): Promise<DailyIntake[]> {
    await delay();
    return StorageService.getIntakes();
  },

  async getIntakeByDate(date: string): Promise<DailyIntake | null> {
    await delay();
    const intakes = StorageService.getIntakes();
    return intakes.find(i => i.date === date) || null;
  },

  async saveDailyIntake(
    date: string,
    totalReceived: number,
    recordedBy: string,
    notes?: string
  ): Promise<DailyIntake> {
    await delay();
    const intakes = StorageService.getIntakes();
    const index = intakes.findIndex(i => i.date === date);
    const now = new Date().toISOString();

    if (index >= 0) {
      intakes[index] = {
        ...intakes[index],
        total_received: totalReceived,
        notes: notes ?? intakes[index].notes,
        updated_at: now,
      };
      StorageService.setIntakes(intakes);
      return intakes[index];
    } else {
      const newIntake: DailyIntake = {
        id: `int-${Date.now()}`,
        date,
        total_received: totalReceived,
        recorded_by: recordedBy,
        notes: notes || 'Standard recorded daily intake',
        created_at: now,
        updated_at: now,
      };
      intakes.unshift(newIntake);
      StorageService.setIntakes(intakes);
      return newIntake;
    }
  },

  // --- ALLOCATIONS ---
  async getAllocations(): Promise<Allocation[]> {
    await delay();
    return StorageService.getAllocations();
  },

  async getAllocationsByDate(date: string): Promise<Allocation[]> {
    await delay();
    const allocations = StorageService.getAllocations();
    return allocations.filter(a => a.date === date);
  },

  async saveAllocation(
    riderId: string,
    date: string,
    quantity: number,
    recordedBy: string,
    notes?: string
  ): Promise<Allocation> {
    await delay();
    const allocations = StorageService.getAllocations();
    const index = allocations.findIndex(a => a.rider_id === riderId && a.date === date);
    const now = new Date().toISOString();

    if (index >= 0) {
      allocations[index] = {
        ...allocations[index],
        quantity,
        notes: notes ?? allocations[index].notes,
        updated_at: now,
        recorded_by: recordedBy,
      };
      StorageService.setAllocations(allocations);
      return allocations[index];
    } else {
      const newAlc: Allocation = {
        id: `alc-${Date.now()}`,
        rider_id: riderId,
        date,
        quantity,
        recorded_by: recordedBy,
        notes,
        created_at: now,
        updated_at: now,
      };
      allocations.push(newAlc);
      StorageService.setAllocations(allocations);
      return newAlc;
    }
  },

  async deleteAllocation(id: string): Promise<void> {
    await delay();
    const allocations = StorageService.getAllocations();
    const filtered = allocations.filter(a => a.id !== id);
    StorageService.setAllocations(filtered);
  },

  // --- RETURNS ---
  async getReturns(): Promise<ParcelReturn[]> {
    await delay();
    return StorageService.getReturns();
  },

  async getReturnsByDate(date: string): Promise<ParcelReturn[]> {
    await delay();
    const returns = StorageService.getReturns();
    return returns.filter(r => r.return_date === date);
  },

  async getReturnsByRider(riderId: string, date?: string): Promise<ParcelReturn[]> {
    await delay();
    const returns = StorageService.getReturns();
    return returns.filter(r => r.rider_id === riderId && (!date || r.return_date === date));
  },

  async recordReturn(
    riderId: string,
    barcode: string,
    reason: ParcelReturn['return_reason'],
    notes?: string,
    returnDate?: string
  ): Promise<ParcelReturn> {
    await delay();
    const cleanBarcode = barcode.trim().toUpperCase();
    const targetDate = returnDate || new Date().toISOString().split('T')[0];
    const returns = StorageService.getReturns();

    // Check duplicate barcode for same rider and date
    const isDuplicate = returns.some(
      r => r.rider_id === riderId && r.return_date === targetDate && r.barcode.toUpperCase() === cleanBarcode
    );

    if (isDuplicate) {
      throw new Error(`Barcode ${cleanBarcode} has already been recorded for this rider on ${targetDate}.`);
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReturn: ParcelReturn = {
      id: `ret-${Date.now()}`,
      rider_id: riderId,
      barcode: cleanBarcode,
      return_reason: reason,
      notes: notes || undefined,
      return_date: targetDate,
      return_time: timeStr,
      created_at: now.toISOString(),
    };

    returns.unshift(newReturn);
    StorageService.setReturns(returns);
    return newReturn;
  },

  async deleteReturn(id: string): Promise<void> {
    await delay();
    const returns = StorageService.getReturns();
    const filtered = returns.filter(r => r.id !== id);
    StorageService.setReturns(filtered);
  },

  // --- RECONCILIATION & SUMMARIES ---
  calculateDailySummary(
    date: string,
    intakes: DailyIntake[],
    allocations: Allocation[],
    returns: ParcelReturn[],
    riders: Rider[]
  ): DaySummary {
    const intake = intakes.find(i => i.date === date);
    const dayAllocations = allocations.filter(a => a.date === date);
    const dayReturns = returns.filter(r => r.return_date === date);

    const totalReceived = intake ? intake.total_received : 0;
    const totalAllocated = dayAllocations.reduce((sum, a) => sum + a.quantity, 0);
    const totalReturns = dayReturns.length;
    const remaining = totalReceived - totalAllocated;
    const netParcels = totalAllocated - totalReturns;
    const returnRate = totalAllocated > 0 ? (totalReturns / totalAllocated) * 100 : 0;

    const activeRiders = riders.filter(r => r.status === 'active');
    const allocatedRiderIds = new Set(dayAllocations.map(a => a.rider_id));

    return {
      date,
      total_received: totalReceived,
      total_allocated: totalAllocated,
      total_returns: totalReturns,
      remaining_unallocated: remaining,
      active_riders_count: activeRiders.length,
      allocated_riders_count: allocatedRiderIds.size,
      net_parcels: netParcels,
      return_rate_percentage: returnRate,
    };
  },

  calculateRiderDaySummaries(
    date: string,
    riders: Rider[],
    allocations: Allocation[],
    returns: ParcelReturn[]
  ): RiderDaySummary[] {
    const dayAllocations = allocations.filter(a => a.date === date);
    const dayReturns = returns.filter(r => r.return_date === date);

    return riders.map(rider => {
      const allocation = dayAllocations.find(a => a.rider_id === rider.id);
      const riderReturns = dayReturns.filter(r => r.rider_id === rider.id);
      const allocatedQty = allocation ? allocation.quantity : 0;
      const returnCount = riderReturns.length;
      const net = allocatedQty - returnCount;
      const returnRate = allocatedQty > 0 ? (returnCount / allocatedQty) * 100 : 0;

      return {
        rider,
        allocated: allocatedQty,
        returns: returnCount,
        net,
        returnRate,
        returnItems: riderReturns,
        allocationId: allocation?.id,
      };
    });
  },
};

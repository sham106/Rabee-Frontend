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

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'rabee_access_token';
const REFRESH_TOKEN_KEY = 'rabee_refresh_token';
let refreshInFlight: Promise<{ user: User }> | null = null;

const getAccessToken = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);

function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  StorageService.setCurrentUser(null);
  window.dispatchEvent(new Event('rabee-session-expired'));
}

function saveSession(result: { access_token: string; refresh_token: string; user: User }, persistent: boolean) {
  const target = persistent ? localStorage : sessionStorage;
  const other = persistent ? sessionStorage : localStorage;
  target.setItem(TOKEN_KEY, result.access_token);
  target.setItem(REFRESH_TOKEN_KEY, result.refresh_token);
  other.removeItem(TOKEN_KEY);
  other.removeItem(REFRESH_TOKEN_KEY);
  StorageService.setCurrentUser(result.user);
}

async function refreshSession(): Promise<{ user: User }> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Your session has expired. Please sign in again.');
  const persistent = Boolean(localStorage.getItem(REFRESH_TOKEN_KEY));

  refreshInFlight = fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).then(async response => {
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) clearSession();
      throw new Error(body?.detail || 'Your session has expired. Please sign in again.');
    }
    saveSession(body, persistent);
    return { user: body.user as User };
  }).finally(() => { refreshInFlight = null; });

  return refreshInFlight;
}

async function request<T>(path: string, options: RequestInit = {}, allowRefresh = true): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 401 && allowRefresh && !path.startsWith('/auth/')) {
    await refreshSession();
    return request<T>(path, options, false);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;
    const message = Array.isArray(detail)
      ? detail.map(item => `${item.loc?.slice(-1)?.[0] || 'field'}: ${item.msg}`).join('. ')
      : detail;
    throw new Error(message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const ApiService = {
  hasSession(): boolean {
    return Boolean(getAccessToken() || getRefreshToken());
  },

  async restoreSession(): Promise<{ user: User }> {
    return refreshSession();
  },

  logout(): void {
    clearSession();
  },

  // --- AUTH / USERS ---
  async getUsers(): Promise<User[]> {
    await delay();
    return StorageService.getUsers();
  },

  async login(identifier: string, passwordInput?: string, keepSignedIn = true): Promise<{ user: User; rider?: Rider } | null> {
    const result = await request<{ access_token: string; refresh_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: identifier.trim(), password: passwordInput || '' }),
    });
    saveSession(result, keepSignedIn);
    return { user: result.user };
  },

  // --- RIDERS ---
  async getRiders(): Promise<Rider[]> {
    return request<Rider[]>('/riders');
  },

  async getRiderById(id: string): Promise<Rider | null> {
    return request<Rider>(`/riders/${id}`);
  },

  async createRider(riderData: Omit<Rider, 'id' | 'joinedDate'>): Promise<Rider> {
    return request<Rider>('/riders', { method: 'POST', body: JSON.stringify(riderData) });
  },

  async updateRider(id: string, updates: Partial<Rider>): Promise<Rider> {
    return request<Rider>(`/riders/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  },

  async resetRiderPassword(id: string, newPassword: string): Promise<Rider> {
    await request<void>(`/riders/${id}/password`, { method: 'PUT', body: JSON.stringify({ password: newPassword }) });
    return request<Rider>(`/riders/${id}`);
  },

  // --- DAILY INTAKES ---
  async getIntakes(): Promise<DailyIntake[]> {
    return request<DailyIntake[]>('/intakes');
  },

  async getIntakeByDate(date: string): Promise<DailyIntake | null> {
    const intakes = await request<DailyIntake[]>(`/intakes?start=${date}&end=${date}`);
    return intakes[0] || null;
  },

  async saveDailyIntake(
    date: string,
    totalReceived: number,
    recordedBy: string,
    notes?: string
  ): Promise<DailyIntake> {
    return request<DailyIntake>(`/intakes/${date}`, { method: 'PUT', body: JSON.stringify({ total_received: totalReceived, notes }) });
  },

  // --- ALLOCATIONS ---
  async getAllocations(): Promise<Allocation[]> {
    return request<Allocation[]>('/allocations');
  },

  async getAllocationsByDate(date: string): Promise<Allocation[]> {
    return request<Allocation[]>(`/allocations?date=${date}`);
  },

  async saveAllocation(
    riderId: string,
    date: string,
    quantity: number,
    recordedBy: string,
    notes?: string
  ): Promise<Allocation> {
    return request<Allocation>(`/allocations/${date}`, { method: 'PUT', body: JSON.stringify({ rider_id: riderId, quantity, notes }) });
  },

  async deleteAllocation(id: string): Promise<void> {
    await request<void>(`/allocations/${id}`, { method: 'DELETE' });
  },

  // --- RETURNS ---
  async getReturns(): Promise<ParcelReturn[]> {
    return request<ParcelReturn[]>('/returns');
  },

  async getReturnsByDate(date: string): Promise<ParcelReturn[]> {
    return request<ParcelReturn[]>(`/returns?date=${date}`);
  },

  async getReturnsByRider(riderId: string, date?: string): Promise<ParcelReturn[]> {
    return request<ParcelReturn[]>(`/returns?rider_id=${riderId}${date ? `&date=${date}` : ''}`);
  },

  async recordReturn(
    riderId: string,
    barcode: string,
    reason: ParcelReturn['return_reason'],
    notes?: string,
    returnDate?: string
  ): Promise<ParcelReturn> {
    return request<ParcelReturn>('/returns', { method: 'POST', body: JSON.stringify({ rider_id: riderId, barcode, return_reason: reason, notes, return_date: returnDate || new Date().toISOString().split('T')[0] }) });
  },

  async deleteReturn(id: string): Promise<void> {
    await request<void>(`/returns/${id}`, { method: 'DELETE' });
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

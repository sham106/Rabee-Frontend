import {
  Rider,
  DailyIntake,
  Allocation,
  ParcelReturn,
  User,
} from '../types';
import {
  INITIAL_RIDERS,
  INITIAL_INTAKES,
  INITIAL_ALLOCATIONS,
  INITIAL_RETURNS,
  INITIAL_USERS,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'rabee_users_v1',
  CURRENT_USER: 'rabee_current_user_v1',
  RIDERS: 'rabee_riders_v1',
  INTAKES: 'rabee_intakes_v1',
  ALLOCATIONS: 'rabee_allocations_v1',
  RETURNS: 'rabee_returns_v1',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  getUsers: (): User[] => getItem(STORAGE_KEYS.USERS, INITIAL_USERS),
  setUsers: (users: User[]) => setItem(STORAGE_KEYS.USERS, users),

  getCurrentUser: (): User => getItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]),
  setCurrentUser: (user: User) => setItem(STORAGE_KEYS.CURRENT_USER, user),

  getRiders: (): Rider[] => {
    const rawRiders = getItem(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    // Ensure every rider has a valid username & password
    const sanitized = rawRiders.map((r, idx) => ({
      ...r,
      username: r.username || `rabee${idx + 1}`,
      password: r.password || 'password123',
    }));
    return sanitized;
  },
  setRiders: (riders: Rider[]) => setItem(STORAGE_KEYS.RIDERS, riders),

  getIntakes: (): DailyIntake[] => getItem(STORAGE_KEYS.INTAKES, INITIAL_INTAKES),
  setIntakes: (intakes: DailyIntake[]) => setItem(STORAGE_KEYS.INTAKES, intakes),

  getAllocations: (): Allocation[] => getItem(STORAGE_KEYS.ALLOCATIONS, INITIAL_ALLOCATIONS),
  setAllocations: (allocations: Allocation[]) => setItem(STORAGE_KEYS.ALLOCATIONS, allocations),

  getReturns: (): ParcelReturn[] => getItem(STORAGE_KEYS.RETURNS, INITIAL_RETURNS),
  setReturns: (returns: ParcelReturn[]) => setItem(STORAGE_KEYS.RETURNS, returns),

  resetToDefaults: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.RIDERS, JSON.stringify(INITIAL_RIDERS));
    localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(INITIAL_INTAKES));
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(INITIAL_ALLOCATIONS));
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(INITIAL_RETURNS));
  },
};

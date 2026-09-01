import {
  Rider,
  DailyIntake,
  Allocation,
  ParcelReturn,
  User,
} from '../types';

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
  getUsers: (): User[] => getItem(STORAGE_KEYS.USERS, []),
  setUsers: (users: User[]) => setItem(STORAGE_KEYS.USERS, users),

  getCurrentUser: (): User | null => getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => {
    if (user) setItem(STORAGE_KEYS.CURRENT_USER, user);
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getRiders: (): Rider[] => {
    return getItem<Rider[]>(STORAGE_KEYS.RIDERS, []);
  },
  setRiders: (riders: Rider[]) => setItem(STORAGE_KEYS.RIDERS, riders),

  getIntakes: (): DailyIntake[] => getItem(STORAGE_KEYS.INTAKES, []),
  setIntakes: (intakes: DailyIntake[]) => setItem(STORAGE_KEYS.INTAKES, intakes),

  getAllocations: (): Allocation[] => getItem(STORAGE_KEYS.ALLOCATIONS, []),
  setAllocations: (allocations: Allocation[]) => setItem(STORAGE_KEYS.ALLOCATIONS, allocations),

  getReturns: (): ParcelReturn[] => getItem(STORAGE_KEYS.RETURNS, []),
  setReturns: (returns: ParcelReturn[]) => setItem(STORAGE_KEYS.RETURNS, returns),

  clearOperationalCache: () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.RIDERS);
    localStorage.removeItem(STORAGE_KEYS.INTAKES);
    localStorage.removeItem(STORAGE_KEYS.ALLOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.RETURNS);
  },
};

export type UserRole = 'admin' | 'rider' | 'manager';

export type RiderStatus = 'active' | 'inactive';

export type ReturnReason =
  | 'Customer Unavailable'
  | 'Customer Refused Parcel'
  | 'Incorrect Address'
  | 'Unable to Contact Customer'
  | 'Rescheduled Delivery'
  | 'Damaged Parcel'
  | 'Other';

export interface Rider {
  id: string;
  name: string;
  username: string; // e.g. "rabee1", "rabee2"
  password?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  status: RiderStatus;
  vehicleType?: 'Motorcycle' | 'Van' | 'Bicycle' | 'TukTuk';
  plateNumber?: string;
  hub: string;
  joinedDate: string;
}

export interface DailyIntake {
  id: string;
  date: string; // YYYY-MM-DD
  total_received: number;
  recorded_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Allocation {
  id: string;
  rider_id: string;
  rider_name?: string;
  date: string; // YYYY-MM-DD
  quantity: number;
  recorded_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface ParcelReturn {
  id: string;
  rider_id: string;
  rider_name?: string;
  barcode: string;
  return_reason: ReturnReason;
  notes?: string;
  return_date: string; // YYYY-MM-DD
  return_time: string; // HH:mm
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rider_id?: string;
  phone?: string;
  avatar?: string;
  hub: string;
}

export interface DaySummary {
  date: string;
  total_received: number;
  total_allocated: number;
  total_returns: number;
  remaining_unallocated: number;
  active_riders_count: number;
  allocated_riders_count: number;
  net_parcels: number;
  return_rate_percentage: number;
}

export interface RiderDaySummary {
  rider: Rider;
  allocated: number;
  returns: number;
  net: number;
  returnRate: number;
  returnItems: ParcelReturn[];
  allocationId?: string;
}

export type DateFilterRange = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export type NavTab = 'home' | 'records' | 'returns' | 'riders' | 'reports' | 'profile';

// User Types
export type UserRole = 'admin' | 'creator' | 'viewer';

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  is_active: boolean;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
}

// Notification Preference Types
export type NotificationType = 'offers' | 'order_updates' | 'newsletter';

export interface NotificationPreference {
  user_id: string;
  offers: boolean;
  order_updates: boolean;
  newsletter: boolean;
}

// Campaign Types
export type CampaignStatus = 'draft' | 'sent';

export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  notification_type: NotificationType;
  city_filter?: string;
  created_by: string;
  status: CampaignStatus;
  created_at?: string;
  updated_at?: string;
  recipient_count?: number;
}

// Notification Log Types
export type NotificationStatus = 'success' | 'failed';

export interface NotificationLog {
  log_id: string;
  user_id: string;
  campaign_id: string;
  campaign_name?: string;
  user_name?: string;
  user_email?: string;
  sent_at: string;
  status: NotificationStatus;
}

// Dashboard Stats Types
export interface DashboardStats {
  active_users: number;
  campaigns_sent: number;
  success_rate: number;
  total_notifications: number;
}

export interface ActivityData {
  date: string;
  notifications: number;
}

// Auth Types
export interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  userType?: 'END_USER' | 'SYSTEM_USER';
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}

// Form Types
export interface CampaignFormData {
  campaign_name: string;
  notification_type: NotificationType;
  city_filter?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  is_active: boolean;
}

// Filter Types
export interface UserFilters {
  search?: string;
  city?: string;
  is_active?: boolean;
}

export interface CampaignFilters {
  status?: CampaignStatus;
  notification_type?: NotificationType;
  search?: string;
}

export interface LogFilters {
  campaign_id?: string;
  status?: NotificationStatus;
  date_from?: string;
  date_to?: string;
}

// Permission Types
export interface Permission {
  page: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  send?: boolean;
  download?: boolean;
}

export const RolePermissions: Record<UserRole, Record<string, Partial<Permission>>> = {
  admin: {
    dashboard: { read: true },
    users: { create: true, read: true, update: true, delete: true },
    preferences: { create: true, read: true, update: true, delete: true },
    campaigns: { create: true, read: true, update: true, delete: true, send: true, download: true },
    logs: { read: true, download: true },
  },
  creator: {
    dashboard: { read: true },
    users: { create: true, read: true, update: true },
    preferences: { create: true, read: true, update: true },
    campaigns: { create: true, read: true, update: true, send: true, download: true },
    logs: { read: true },
  },
  viewer: {
    dashboard: { read: true },
    users: { read: true },
    preferences: { read: true },
    campaigns: { read: true, download: true },
    logs: { read: true, download: true },
  },
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

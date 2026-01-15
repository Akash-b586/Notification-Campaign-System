// User Types
export type UserRole = 'ADMIN' | 'CREATOR' | 'VIEWER' | 'CUSTOMER';

export interface User {
  userId: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  city?: string;
  isActive: boolean;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

// Notification Preference Types
export type NotificationType = 'OFFERS' | 'ORDER_UPDATES' | 'NEWSLETTER';
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

export interface NotificationPreference {
  id: string;
  userId: string;
  notificationType: NotificationType;
  email: boolean;
  sms: boolean;
  push: boolean;
  updatedAt: string;
}

// Newsletter Types
export interface Newsletter {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscription {
  id: string;
  userId: string;
  newsletterId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  createdAt: string;
  updatedAt: string;
  newsletter?: Newsletter;
}

// Campaign Types
export type CampaignStatus = 'DRAFT' | 'SENT';

export interface Campaign {
  id: string;
  campaignName: string;
  notificationType: NotificationType;
  cityFilter?: string;
  createdById: string;
  status: CampaignStatus;
  createdAt?: string;
  createdBy?: {
    userId: string;
    name: string;
    email: string;
  };
  recipientCount?: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Order Types
export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  productId: string;
  status: OrderStatus;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

// Notification Log Types
export type SendStatus = 'SUCCESS' | 'FAILED';

export interface NotificationLog {
  id: string;
  userId: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  status: SendStatus;
  sentAt: string;
  campaignId?: string;
  orderId?: string;
  newsletterId?: string;
  // Expanded relationships from API
  user?: User;
  campaign?: Campaign;
  order?: Order;
  newsletter?: Newsletter;
}

// Dashboard Stats Types
export interface DashboardStats {
  activeUsers: number;
  campaignsSent: number;
  successRate: number;
  totalNotifications: number;
}

export interface ActivityData {
  date: string;
  notifications: number;
}

// Auth Types
export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  role?: UserRole;
}

// Form Types
export interface CampaignFormData {
  campaignName: string;
  notificationType: NotificationType;
  cityFilter?: string;
}

export interface OrderFormData {
  orderNumber: string;
  userId: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  [key: string]: any;
}

// Permission Types
export const Permissions = {
  admin: {
    dashboard: ['read'],
    users: ['create', 'read', 'update', 'delete'],
    preferences: ['create', 'read', 'update', 'delete'],
    campaigns: ['create', 'read', 'update', 'delete', 'send'],
    orders: ['create', 'read', 'update', 'delete'],
    newsletters: ['create', 'read', 'update', 'delete', 'publish'],
    logs: ['read'],
    staff: ['create', 'read', 'update', 'delete'],
  },
  creator: {
    dashboard: ['read'],
    users: ['create', 'read', 'update'],
    campaigns: ['create', 'read', 'update', 'send'],
    newsletters: ['create', 'read', 'update', 'publish'],
    logs: ['read'],
  },
  viewer: {
    dashboard: ['read'],
    campaigns: ['read'],
    logs: ['read'],
  },
  customer: {
    orders: ['create', 'read'],
    preferences: ['read', 'update'],
    newsletters: ['read'],
  },
};


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
  isActive?: boolean;
}

export interface CampaignFilters {
  status?: CampaignStatus;
  notificationType?: NotificationType;
  search?: string;
}

export interface LogFilters {
  campaignId?: string;
  status?: Notification;
  dateFrom?: string;
  dateTo?: string;
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
  ADMIN: {
    dashboard: { read: true },
    users: { create: true, read: true, update: true, delete: true },
    preferences: { create: true, read: true, update: true, delete: true },
    campaigns: { create: true, read: true, update: true, delete: true, send: true, download: true },
    logs: { read: true, download: true },
  },
  CREATOR: {
    dashboard: { read: true },
    users: { create: true, read: true, update: true },
    preferences: { create: true, read: true, update: true },
    campaigns: { create: true, read: true, update: true, send: true, download: true },
    logs: { read: true },
  },
  VIEWER: {
    dashboard: { read: true },
    users: { read: true },
    preferences: { read: true },
    campaigns: { read: true, download: true },
    logs: { read: true, download: true },
  },
  CUSTOMER: {
    orders: { create: true, read: true },
    preferences: { read: true, update: true },
    newsletters: { read: true },
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

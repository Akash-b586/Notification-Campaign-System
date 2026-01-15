import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole } from '../types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hasPermission: (page: string, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: AuthUser) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      hasPermission: (page: string, action: string) => {
        const { user } = get();
        if (!user) return false;

        const role = user.role as UserRole;
        
        // Admin has all permissions
        if (role === 'ADMIN') return true;

        // Define permissions based on role
        const permissions: Record<UserRole, Record<string, string[]>> = {
          ADMIN: {
            dashboard: ['read'],
            users: ['create', 'read', 'update', 'delete'],
            preferences: ['create', 'read', 'update', 'delete'],
            campaigns: ['create', 'read', 'update', 'delete', 'send'],
            orders: ['create', 'read', 'update', 'delete'],
            newsletters: ['create', 'read', 'update', 'delete', 'publish'],
            logs: ['read'],
            staff: ['create', 'read', 'update', 'delete'],
          },
          CREATOR: {
            dashboard: ['read'],
            users: ['create', 'read', 'update','delete'],
            campaigns: ['create', 'read', 'update', 'send','download'],
            newsletters: ['create', 'read', 'update', 'publish'],
            logs: ['read'],
          },
          VIEWER: {
            dashboard: ['read'],
            campaigns: ['read','download'],
            logs: ['read'],
          },
          CUSTOMER: {
            orders: ['create', 'read'],
            preferences: ['read', 'update'],
            newsletters: ['read'],
          },
        };

        return permissions[role]?.[page]?.includes(action) || false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

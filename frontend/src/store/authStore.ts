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
        if (role === 'admin') return true;

        // Define permissions based on role
        const permissions: Record<UserRole, Record<string, string[]>> = {
          admin: {
            dashboard: ['read'],
            users: ['create', 'read', 'update', 'delete'],
            preferences: ['create', 'read', 'update', 'delete'],
            campaigns: ['create', 'read', 'update', 'delete', 'send', 'download'],
            logs: ['read', 'download'],
            staff: ['create', 'read', 'update', 'delete'],
          },
          creator: {
            dashboard: ['read'],
            users: ['create', 'read', 'update'],
            preferences: ['create', 'read', 'update', 'delete'],
            campaigns: ['create', 'read', 'update', 'download'],
            logs: ['read', 'download'],
          },
          viewer: {
            dashboard: ['read'],
            campaigns: ['read', 'download'],
            logs: ['read'],
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

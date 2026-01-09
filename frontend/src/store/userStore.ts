import { create } from 'zustand';
import type { User, UserFilters } from '../types';

interface UserState {
  users: User[];
  selectedUser: User | null;
  filters: UserFilters;
  isLoading: boolean;
  
  // Actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  setSelectedUser: (user: User | null) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  setLoading: (loading: boolean) => void;
  getFilteredUsers: () => User[];
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  selectedUser: null,
  filters: {},
  isLoading: false,

  setUsers: (users: User[]) => {
    set({ users });
  },

  addUser: (user: User) => {
    set((state) => ({ users: [...state.users, user] }));
  },

  updateUser: (userId: string, data: Partial<User>) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.user_id === userId ? { ...user, ...data } : user
      ),
    }));
  },

  deleteUser: (userId: string) => {
    set((state) => ({
      users: state.users.filter((user) => user.user_id !== userId),
    }));
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  setFilters: (filters: Partial<UserFilters>) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  getFilteredUsers: () => {
    const { users, filters } = get();
    let filtered = [...users];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.user_id.toLowerCase().includes(search)
      );
    }

    if (filters.city) {
      filtered = filtered.filter((user) => user.city === filters.city);
    }

    if (filters.is_active !== undefined) {
      filtered = filtered.filter((user) => user.is_active === filters.is_active);
    }

    return filtered;
  },
}));

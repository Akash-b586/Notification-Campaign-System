import { create } from 'zustand';
import type { NotificationPreference } from '../types';

interface PreferenceState {
  preferences: Record<string, NotificationPreference>;
  isLoading: boolean;
  
  // Actions
  setPreferences: (preferences: NotificationPreference[]) => void;
  updatePreference: (userId: string, data: Partial<NotificationPreference>) => void;
  setLoading: (loading: boolean) => void;
  getUserPreference: (userId: string) => NotificationPreference | undefined;
}

export const usePreferenceStore = create<PreferenceState>((set, get) => ({
  preferences: {},
  isLoading: false,

  setPreferences: (preferences: NotificationPreference[]) => {
    const preferencesMap: Record<string, NotificationPreference> = {};
    preferences.forEach((pref) => {
      preferencesMap[pref.user_id] = pref;
    });
    set({ preferences: preferencesMap });
  },

  updatePreference: (userId: string, data: Partial<NotificationPreference>) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        [userId]: {
          ...state.preferences[userId],
          ...data,
        },
      },
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  getUserPreference: (userId: string) => {
    return get().preferences[userId];
  },
}));

import { create } from 'zustand';
import type { NotificationPreference, NotificationType } from '../types';

interface PreferenceState {
  // Preferences organized by userId, then by notification type
  preferences: Record<string, Record<NotificationType, NotificationPreference>>;
  newsLetterSubscriptions: Record<string, boolean>; // userId -> isSubscribed
  isLoading: boolean;
  
  // Actions
  setPreferences: (userId: string, preferences: Record<NotificationType, NotificationPreference>) => void;
  updatePreference: (userId: string, notificationType: NotificationType, data: Partial<NotificationPreference>) => void;
  getPreference: (userId: string, notificationType: NotificationType) => NotificationPreference | undefined;
  setNewsletterSubscription: (userId: string, isSubscribed: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const usePreferenceStore = create<PreferenceState>((set, get) => ({
  preferences: {},
  newsLetterSubscriptions: {},
  isLoading: false,

  setPreferences: (userId: string, preferences: Record<NotificationType, NotificationPreference>) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        [userId]: preferences,
      },
    }));
  },

  updatePreference: (userId: string, notificationType: NotificationType, data: Partial<NotificationPreference>) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        [userId]: {
          ...state.preferences[userId],
          [notificationType]: {
            ...state.preferences[userId]?.[notificationType],
            ...data,
          },
        },
      },
    }));
  },

  getPreference: (userId: string, notificationType: NotificationType) => {
    const state = get();
    return state.preferences[userId]?.[notificationType];
  },

  setNewsletterSubscription: (userId: string, isSubscribed: boolean) => {
    set((state) => ({
      newsLetterSubscriptions: {
        ...state.newsLetterSubscriptions,
        [userId]: isSubscribed,
      },
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

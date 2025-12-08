import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Onboarding step enum
 */
export enum OnboardingStep {
  WELCOME = 'welcome',
  SIGN_UP = 'sign_up',
  ADD_CHILD = 'add_child',
  PERMISSIONS = 'permissions',
  COMPLETED = 'completed',
}

/**
 * App state interface
 */
interface AppState {
  // Selected child ID
  selectedChildId: string | null;

  // Onboarding
  onboardingStep: OnboardingStep;
  onboardingCompleted: boolean;

  // App ready state
  appReady: boolean;

  // Theme preference (for future dark mode support)
  theme: 'light' | 'dark' | 'auto';

  // Notification preferences
  notificationsEnabled: boolean;

  // Actions
  setSelectedChildId: (childId: string | null) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  setAppReady: (ready: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  resetStore: () => void;
}

/**
 * Initial state
 */
const initialState = {
  selectedChildId: null,
  onboardingStep: OnboardingStep.WELCOME,
  onboardingCompleted: false,
  appReady: false,
  theme: 'auto' as const,
  notificationsEnabled: true,
};

/**
 * Global app store using Zustand with AsyncStorage persistence
 *
 * Features:
 * - Persisted to AsyncStorage for state restoration
 * - Manages selected child
 * - Tracks onboarding progress
 * - App ready state for splash screen
 * - Theme and notification preferences
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      /**
       * Set selected child ID
       */
      setSelectedChildId: (childId) => {
        set({ selectedChildId: childId });
      },

      /**
       * Set onboarding step
       */
      setOnboardingStep: (step) => {
        set({ onboardingStep: step });
      },

      /**
       * Complete onboarding
       */
      completeOnboarding: () => {
        set({
          onboardingStep: OnboardingStep.COMPLETED,
          onboardingCompleted: true,
        });
      },

      /**
       * Set app ready state
       */
      setAppReady: (ready) => {
        set({ appReady: ready });
      },

      /**
       * Set theme preference
       */
      setTheme: (theme) => {
        set({ theme });
      },

      /**
       * Set notifications enabled
       */
      setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
      },

      /**
       * Reset store to initial state
       */
      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'thrive-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields
      partialize: (state) => ({
        selectedChildId: state.selectedChildId,
        onboardingStep: state.onboardingStep,
        onboardingCompleted: state.onboardingCompleted,
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useSelectedChildId = () => useAppStore((state) => state.selectedChildId);
export const useOnboarding = () =>
  useAppStore((state) => ({
    step: state.onboardingStep,
    completed: state.onboardingCompleted,
  }));
export const useAppReady = () => useAppStore((state) => state.appReady);
export const useTheme = () => useAppStore((state) => state.theme);
export const useNotificationsEnabled = () =>
  useAppStore((state) => state.notificationsEnabled);

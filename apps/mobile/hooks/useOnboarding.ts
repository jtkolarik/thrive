import { useState } from 'react';
import { ChildInput } from './useChildren';

export interface OnboardingPreferences {
  digest_frequency: 'daily' | 'weekly' | 'never';
  notifications: {
    milestones: boolean;
    digest: boolean;
    dailyPrompts: boolean;
  };
}

export interface OnboardingState {
  currentStep: number;
  children: ChildInput[];
  preferences: OnboardingPreferences;
}

const initialPreferences: OnboardingPreferences = {
  digest_frequency: 'weekly',
  notifications: {
    milestones: true,
    digest: true,
    dailyPrompts: true,
  },
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    children: [],
    preferences: initialPreferences,
  });

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const addChild = (child: ChildInput) => {
    setState((prev) => ({
      ...prev,
      children: [...prev.children, child],
    }));
  };

  const updateChild = (index: number, child: ChildInput) => {
    setState((prev) => ({
      ...prev,
      children: prev.children.map((c, i) => (i === index ? child : c)),
    }));
  };

  const removeChild = (index: number) => {
    setState((prev) => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
  };

  const setPreferences = (preferences: Partial<OnboardingPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
    }));
  };

  const setNotificationPreference = (
    key: keyof OnboardingPreferences['notifications'],
    value: boolean
  ) => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [key]: value,
        },
      },
    }));
  };

  const reset = () => {
    setState({
      currentStep: 0,
      children: [],
      preferences: initialPreferences,
    });
  };

  return {
    state,
    currentStep: state.currentStep,
    children: state.children,
    preferences: state.preferences,
    setCurrentStep,
    addChild,
    updateChild,
    removeChild,
    setPreferences,
    setNotificationPreference,
    reset,
  };
}

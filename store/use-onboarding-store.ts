import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "@onboarding_state";

interface OnboardingState {
  // State
  hasOnboarded: boolean;
  username: string;
  currentStep: number;
  isLoading: boolean;

  // Actions
  setUsername: (username: string) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => Promise<void>;
  loadOnboardingState: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Initial state
  hasOnboarded: false,
  username: "",
  currentStep: 0,
  isLoading: true,

  // Set username
  setUsername: (username: string) => {
    set({ username });
  },

  // Set current step
  setStep: (step: number) => {
    set({ currentStep: Math.max(0, Math.min(2, step)) });
  },

  // Go to next step
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 2) {
      set({ currentStep: currentStep + 1 });
    }
  },

  // Go to previous step
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  // Complete onboarding and persist state
  completeOnboarding: async () => {
    const { username } = get();
    const state = {
      hasOnboarded: true,
      username: username.trim(),
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      set({ hasOnboarded: true, username: username.trim() });
    } catch (error) {
      console.error("Error saving onboarding state:", error);
      throw error;
    }
  },

  // Load onboarding state from storage
  loadOnboardingState: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { hasOnboarded, username } = JSON.parse(stored);
        set({ hasOnboarded, username, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error loading onboarding state:", error);
      set({ isLoading: false });
    }
  },

  // Reset onboarding (for testing/debugging)
  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({
        hasOnboarded: false,
        username: "",
        currentStep: 0,
      });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  },
}));

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./storage";

interface AppState {
  hasCompletedOnboarding: boolean;
  lastActiveTab: string;
  completeOnboarding: () => void;
  setLastActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      lastActiveTab: "",

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setLastActiveTab: (tab) => set({ lastActiveTab: tab }),
    }),
    {
      name: "app-state",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

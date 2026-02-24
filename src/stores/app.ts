import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./storage";

interface AppState {
  hasCompletedOnboarding: boolean;
  lastActiveTab: string;
  privacyConsentVersion: string | null;
  consentTimestamp: string | null;
  hasSeenSwipeTutorial: boolean;

  completeOnboarding: () => void;
  setLastActiveTab: (tab: string) => void;
  acceptPrivacyPolicy: (version: string) => void;
  revokePrivacyConsent: () => void;
  markSwipeTutorialSeen: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: true,
      lastActiveTab: "",
      privacyConsentVersion: "1.0",
      consentTimestamp: new Date().toISOString(),
      hasSeenSwipeTutorial: true,

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setLastActiveTab: (tab) => set({ lastActiveTab: tab }),
      acceptPrivacyPolicy: (version) =>
        set({
          privacyConsentVersion: version,
          consentTimestamp: new Date().toISOString(),
        }),
      revokePrivacyConsent: () =>
        set({
          privacyConsentVersion: null,
          consentTimestamp: null,
        }),
      markSwipeTutorialSeen: () => set({ hasSeenSwipeTutorial: true }),
    }),
    {
      name: "app-state",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

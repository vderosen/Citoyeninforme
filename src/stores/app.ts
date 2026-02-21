import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./storage";

interface AppState {
  hasCompletedOnboarding: boolean;
  lastActiveTab: string;
  privacyConsentVersion: string | null;
  consentTimestamp: string | null;
  crashReportingOptIn: boolean;
  hasSeenSwipeTutorial: boolean;

  completeOnboarding: () => void;
  setLastActiveTab: (tab: string) => void;
  acceptPrivacyPolicy: (version: string) => void;
  revokePrivacyConsent: () => void;
  setCrashReportingOptIn: (optIn: boolean) => void;
  markSwipeTutorialSeen: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      lastActiveTab: "",
      privacyConsentVersion: null,
      consentTimestamp: null,
      crashReportingOptIn: false,
      hasSeenSwipeTutorial: false,

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
      setCrashReportingOptIn: (optIn) => set({ crashReportingOptIn: optIn }),
      markSwipeTutorialSeen: () => set({ hasSeenSwipeTutorial: true }),
    }),
    {
      name: "app-state",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./storage";

interface AppState {
  hasCompletedOnboarding: boolean;
  lastActiveTab: string;
  privacyConsentVersion: string | null;
  consentTimestamp: string | null;
  hasSeenSwipeTutorial: boolean;
  crashReportingOptIn: boolean;

  completeOnboarding: () => void;
  setLastActiveTab: (tab: string) => void;
  acceptPrivacyPolicy: (version: string) => void;
  revokePrivacyConsent: () => void;
  markSwipeTutorialSeen: () => void;
  setCrashReportingOptIn: (optIn: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      lastActiveTab: "",
      privacyConsentVersion: null,
      consentTimestamp: null,
      hasSeenSwipeTutorial: false,
      crashReportingOptIn: true,

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
      setCrashReportingOptIn: (optIn) => set({ crashReportingOptIn: optIn }),
    }),
    {
      name: "app-state",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

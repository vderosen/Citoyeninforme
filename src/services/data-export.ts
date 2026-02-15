import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppStore } from "../stores/app";
import { useSurveyStore } from "../stores/survey";
import { useAssistantStore } from "../stores/assistant";
import { getFeedbackEntries, clearFeedbackEntries } from "./feedback";

export async function generateExport(): Promise<string> {
  const appState = useAppStore.getState();
  const surveyState = useSurveyStore.getState();
  const assistantState = useAssistantStore.getState();
  const feedback = getFeedbackEntries();

  const exportData = {
    exportVersion: "1.0" as const,
    exportedAt: new Date().toISOString(),
    appVersion: Constants.expoConfig?.version ?? "1.0.0",

    consent: {
      policyVersion: appState.privacyConsentVersion,
      acceptedAt: appState.consentTimestamp,
    },

    survey: {
      status: surveyState.status,
      answers: surveyState.answers,
      importanceWeights: surveyState.importanceWeights,
      profile: surveyState.profile,
    },

    assistant: {
      mode: assistantState.mode,
      selectedCandidateId: assistantState.selectedCandidateId,
      messages: assistantState.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    },

    preferences: {
      hasCompletedOnboarding: appState.hasCompletedOnboarding,
      lastActiveTab: appState.lastActiveTab,
      crashReportingOptIn: appState.crashReportingOptIn,
    },

    feedback: feedback.map((f) => ({
      id: f.id,
      timestamp: f.timestamp,
      screen: f.screen,
      type: f.type,
      text: f.text,
    })),
  };

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `lucide-data-export-${dateStr}.json`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(
    fileUri,
    JSON.stringify(exportData, null, 2),
    { encoding: FileSystem.EncodingType.UTF8 }
  );

  return fileUri;
}

export async function shareExport(fileUri: string): Promise<void> {
  await Sharing.shareAsync(fileUri, {
    mimeType: "application/json",
    dialogTitle: "Export Lucide",
  });
}

export async function deleteAllUserData(): Promise<void> {
  useSurveyStore.getState().reset();
  useAssistantStore.getState().resetConversation();
  clearFeedbackEntries();

  const appStore = useAppStore.getState();
  appStore.revokePrivacyConsent();
  appStore.setCrashReportingOptIn(false);

  await AsyncStorage.clear();
}

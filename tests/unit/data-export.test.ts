import { generateExport, deleteAllUserData } from "../../src/services/data-export";

// Mock expo modules
jest.mock("expo-file-system", () => ({
  cacheDirectory: "/tmp/cache/",
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: "1.0.0",
      ios: { buildNumber: "1" },
    },
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    clear: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock stores
const mockAppState = {
  hasCompletedOnboarding: true,
  lastActiveTab: "index",
  privacyConsentVersion: "1.0",
  consentTimestamp: "2026-01-01T00:00:00.000Z",
  crashReportingOptIn: false,
  revokePrivacyConsent: jest.fn(),
  setCrashReportingOptIn: jest.fn(),
};

const mockSurveyState = {
  status: "completed",
  answers: { q1: "a1" },
  importanceWeights: { theme1: 0.8 },
  profile: null,
  reset: jest.fn(),
};

const mockAssistantState = {
  mode: "comprendre",
  selectedCandidateId: null,
  conversations: {
    comprendre: [
      {
        id: "msg-1",
        role: "user",
        content: "Hello",
        timestamp: "2026-01-01T12:00:00.000Z",
      },
    ],
  },
  resetConversation: jest.fn(),
};

jest.mock("../../src/stores/app", () => ({
  useAppStore: {
    getState: () => mockAppState,
  },
}));

jest.mock("../../src/stores/survey", () => ({
  useSurveyStore: {
    getState: () => mockSurveyState,
  },
}));

jest.mock("../../src/stores/assistant", () => ({
  useAssistantStore: {
    getState: () => mockAssistantState,
  },
}));

jest.mock("../../src/services/feedback", () => ({
  getFeedbackEntries: () => [],
  clearFeedbackEntries: jest.fn(),
}));

jest.mock("../../src/stores/storage", () => ({
  zustandStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const FileSystem = require("expo-file-system");
const AsyncStorage = require("@react-native-async-storage/async-storage").default;

describe("data-export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("generateExport produces valid JSON with correct schema", async () => {
    const fileUri = await generateExport();

    expect(fileUri).toMatch(/^\/tmp\/cache\/lucide-data-export-\d{4}-\d{2}-\d{2}\.json$/);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);

    const writtenContent = FileSystem.writeAsStringAsync.mock.calls[0][1];
    const parsed = JSON.parse(writtenContent);

    expect(parsed.exportVersion).toBe("1.0");
    expect(parsed.exportedAt).toBeDefined();
    expect(parsed.appVersion).toBe("1.0.0");
    expect(parsed.consent.policyVersion).toBe("1.0");
    expect(parsed.survey.status).toBe("completed");
    expect(parsed.survey.answers).toEqual({ q1: "a1" });
    expect(parsed.assistant.mode).toBe("comprendre");
    expect(parsed.assistant.conversations.comprendre).toHaveLength(1);
    expect(parsed.preferences.hasCompletedOnboarding).toBe(true);
    expect(parsed.feedback).toEqual([]);
  });

  test("export file name matches expected format", async () => {
    const fileUri = await generateExport();
    expect(fileUri).toContain("lucide-data-export-");
    expect(fileUri).toEndWith(".json");
  });

  test("deleteAllUserData calls reset on all stores and clears AsyncStorage", async () => {
    await deleteAllUserData();

    expect(mockSurveyState.reset).toHaveBeenCalled();
    expect(mockAssistantState.resetConversation).toHaveBeenCalled();
    expect(mockAppState.revokePrivacyConsent).toHaveBeenCalled();
    expect(mockAppState.setCrashReportingOptIn).toHaveBeenCalledWith(false);
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      'app-state',
      'survey-state',
      'assistant-state',
      'feedback_entries',
    ]);
  });
});

// Custom matcher
expect.extend({
  toEndWith(received: string, suffix: string) {
    const pass = received.endsWith(suffix);
    return {
      pass,
      message: () => `expected "${received}" to end with "${suffix}"`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toEndWith(suffix: string): R;
    }
  }
}

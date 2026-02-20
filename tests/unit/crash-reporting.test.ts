import { initCrashReporting, captureException } from "../../src/services/crash-reporting";

// Mock Sentry
const mockInit = jest.fn();
const mockCaptureException = jest.fn();
const mockClose = jest.fn();

jest.mock("@sentry/react-native", () => ({
  init: (...args: unknown[]) => mockInit(...args),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  close: () => mockClose(),
  mobileReplayIntegration: jest.fn(() => ({})),
  feedbackIntegration: jest.fn(() => ({})),
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

beforeEach(() => {
  jest.clearAllMocks();
  // Reset module state by clearing the initialized flag
  jest.resetModules();
});

describe("crash-reporting", () => {
  test("initCrashReporting(false) does not call Sentry.init", () => {
    initCrashReporting(false);
    expect(mockInit).not.toHaveBeenCalled();
  });

  test("captureException is a no-op when not initialized", () => {
    captureException(new Error("test"));
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  test("initCrashReporting(true) calls Sentry.init when DSN exists", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = "https://test@sentry.io/123";

    // Re-import to get fresh module state
    const mod = require("../../src/services/crash-reporting");
    mod.initCrashReporting(true);

    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://test@sentry.io/123",
        beforeSend: expect.any(Function),
      })
    );

    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });

  test("beforeSend strips breadcrumbs with long messages", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = "https://test@sentry.io/123";

    const mod = require("../../src/services/crash-reporting");
    mod.initCrashReporting(true);

    const beforeSend = mockInit.mock.calls[0][0].beforeSend;

    const event = {
      breadcrumbs: [
        { category: "navigation", message: "short" },
        { category: "ui.input", message: "user typed something" },
        { category: "http", message: "x".repeat(250) },
      ],
    };

    const result = beforeSend(event);

    // ui.input should be filtered out
    expect(result.breadcrumbs).toHaveLength(1);
    expect(result.breadcrumbs[0].category).toBe("navigation");

    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });
});

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
  jest.resetModules();
});

describe("crash-reporting", () => {
  test("Sentry.init is called at module load when DSN exists", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = "https://test@sentry.io/123";

    require("../../src/services/crash-reporting");

    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://test@sentry.io/123",
        beforeSend: expect.any(Function),
      })
    );

    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });

  test("Sentry.init is not called when DSN is missing", () => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;

    require("../../src/services/crash-reporting");

    expect(mockInit).not.toHaveBeenCalled();
  });

  test("captureException is a no-op without consent", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = "https://test@sentry.io/123";

    const mod = require("../../src/services/crash-reporting");
    mod.captureException(new Error("test"));

    expect(mockCaptureException).not.toHaveBeenCalled();

    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });

  test("captureException works after consent is given", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = "https://test@sentry.io/123";

    const mod = require("../../src/services/crash-reporting");
    mod.updateCrashReportingConsent(true);
    mod.captureException(new Error("test"));

    expect(mockCaptureException).toHaveBeenCalledTimes(1);

    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });

  test("beforeSend drops events when consent is not given", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = "https://test@sentry.io/123";

    require("../../src/services/crash-reporting");

    const beforeSend = mockInit.mock.calls[0][0].beforeSend;
    const event = { breadcrumbs: [] };

    expect(beforeSend(event)).toBeNull();

    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });

  test("beforeSend strips breadcrumbs with long messages", () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = "https://test@sentry.io/123";

    const mod = require("../../src/services/crash-reporting");
    mod.updateCrashReportingConsent(true);

    const beforeSend = mockInit.mock.calls[0][0].beforeSend;

    const event = {
      breadcrumbs: [
        { category: "navigation", message: "short" },
        { category: "ui.input", message: "user typed something" },
        { category: "http", message: "x".repeat(250) },
      ],
    };

    const result = beforeSend(event);

    // ui.input should be filtered out, long message too
    expect(result.breadcrumbs).toHaveLength(1);
    expect(result.breadcrumbs[0].category).toBe("navigation");

    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });
});

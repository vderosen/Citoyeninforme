import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { isRunningInExpoGo } from "expo";

type CrashContext = Record<string, string>;
type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() ?? "";
const MAX_CONTEXT_STRING_LENGTH = 200;

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

let hasConsent = false;
let isInitialized = false;

function sanitizeLongStrings(value: JsonValue): JsonValue {
  if (typeof value === "string" && value.length > MAX_CONTEXT_STRING_LENGTH) {
    return `[REDACTED_LONG_STRING:${value.length}]`;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeLongStrings(entry));
  }

  if (value && typeof value === "object") {
    const sanitized: { [key: string]: JsonValue } = {};
    for (const [key, nested] of Object.entries(value)) {
      sanitized[key] = sanitizeLongStrings(nested as JsonValue);
    }
    return sanitized;
  }

  return value;
}

function sanitizeEvent(event: any): any {
  if (!hasConsent) {
    return null;
  }

  const next = { ...event };

  if (Array.isArray(next.breadcrumbs)) {
    next.breadcrumbs = next.breadcrumbs
      .filter((breadcrumb: any) => !(breadcrumb.category ?? "").startsWith("ui.input"))
      .map((breadcrumb: any) => {
        if (!breadcrumb.data || typeof breadcrumb.data !== "object") {
          return breadcrumb;
        }

        const data = { ...(breadcrumb.data as Record<string, unknown>) };
        delete data.body;
        delete data.data;
        return { ...breadcrumb, data };
      });
  }

  if (next.request && typeof next.request === "object") {
    const request = { ...next.request } as Record<string, unknown>;
    delete request.body;
    delete request.data;
    next.request = request;
  }

  if (next.contexts && typeof next.contexts === "object") {
    next.contexts = sanitizeLongStrings(next.contexts as JsonValue);
  }

  if (next.extra && typeof next.extra === "object") {
    next.extra = sanitizeLongStrings(next.extra as JsonValue) as Record<string, unknown>;
  }

  return next;
}

function computeReleaseAndDist(): { release?: string; dist?: string } {
  const expoConfig = Constants.expoConfig;

  const version = expoConfig?.version;
  const bundleId = expoConfig?.ios?.bundleIdentifier ?? expoConfig?.android?.package;
  const iosBuildNumber = expoConfig?.ios?.buildNumber;
  const androidVersionCode =
    typeof expoConfig?.android?.versionCode === "number"
      ? String(expoConfig.android.versionCode)
      : undefined;
  const buildNumber = iosBuildNumber ?? androidVersionCode;

  if (!bundleId || !version || !buildNumber) {
    return {};
  }

  return {
    release: `${bundleId}@${version}+${buildNumber}`,
    dist: buildNumber,
  };
}

function initializeSdkIfNeeded(): void {
  if (isInitialized || !SENTRY_DSN) {
    return;
  }

  const { release, dist } = computeReleaseAndDist();

  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: true,
    sendDefaultPii: false,
    beforeSend: (event) => sanitizeEvent(event),
    environment: __DEV__ ? "development" : (process.env.EXPO_PUBLIC_APP_ENV ?? "production"),
    release,
    dist,
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    attachScreenshot: true,
    attachViewHierarchy: true,
    enableNativeFramesTracking: !isRunningInExpoGo(),
    enableAppHangTracking: true,
    enableWatchdogTerminationTracking: true,
    integrations: [navigationIntegration],
  });

  isInitialized = true;
}

export function initCrashReporting(optIn: boolean): void {
  hasConsent = optIn;
  if (optIn) {
    initializeSdkIfNeeded();
  }
}

export async function updateCrashReportingConsent(optIn: boolean): Promise<void> {
  hasConsent = optIn;
  if (optIn) {
    initializeSdkIfNeeded();
  } else if (isInitialized) {
    await Sentry.close();
    isInitialized = false;
  }
}

export function captureException(error: Error, context?: CrashContext): void {
  if (!hasConsent || !isInitialized || !SENTRY_DSN) {
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

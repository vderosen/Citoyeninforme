import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

let isInitialized = false;

export function initCrashReporting(optIn: boolean): void {
  if (!optIn) return;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    release: Constants.expoConfig?.version ?? "unknown",
    dist: Constants.expoConfig?.ios?.buildNumber ?? "1",
    beforeSend(event) {
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.filter((breadcrumb) => {
          if (breadcrumb.category === "ui.input") return false;
          if (
            breadcrumb.category === "http" &&
            breadcrumb.data?.requestBody
          ) {
            delete breadcrumb.data.requestBody;
          }
          if (breadcrumb.message && breadcrumb.message.length > 200) {
            return false;
          }
          return true;
        });
      }

      if (event.contexts) {
        for (const [key, ctx] of Object.entries(event.contexts)) {
          if (ctx && typeof ctx === "object") {
            for (const [k, v] of Object.entries(ctx)) {
              if (typeof v === "string" && v.length > 200) {
                (event.contexts![key] as Record<string, unknown>)[k] =
                  "[stripped]";
              }
            }
          }
        }
      }

      return event;
    },
  });

  isInitialized = true;
}

export function updateCrashReportingConsent(optIn: boolean): void {
  if (optIn && !isInitialized) {
    initCrashReporting(true);
  } else if (!optIn && isInitialized) {
    Sentry.close();
    isInitialized = false;
  }
}

export function captureException(
  error: Error,
  context?: Record<string, string>
): void {
  if (!isInitialized) return;

  Sentry.captureException(error, {
    contexts: context
      ? { custom: context as Record<string, unknown> }
      : undefined,
  });
}

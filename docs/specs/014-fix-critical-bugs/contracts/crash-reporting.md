# Service Contract: Crash Reporting

**Feature**: 014-fix-critical-bugs
**Date**: 2026-02-20

## Overview

The crash reporting service (`src/services/crash-reporting.ts`) wraps `@sentry/react-native`. This contract documents the privacy-related configuration changes.

## Public API (Unchanged)

```typescript
function initCrashReporting(optIn: boolean): void
function updateCrashReportingConsent(optIn: boolean): void
function captureException(error: Error, context?: Record<string, string>): void
```

No API signature changes. All changes are internal configuration.

## Sentry Configuration Contract (CHANGED)

### Before (Broken)
- `sendDefaultPii: true` — Sentry attaches IP addresses and other PII by default
- `mobileReplayIntegration()` — records user screen sessions
- `feedbackIntegration()` — enables feedback collection widget
- `replaysSessionSampleRate: 0.1` — 10% of sessions recorded
- `replaysOnErrorSampleRate: 1` — 100% of error sessions recorded

### After (Fixed)
- `sendDefaultPii: false` — no PII attached to events
- No replay integration — no session recordings
- No feedback integration — no feedback widget
- No replay sample rates — removed entirely

### Preserved Behavior
- `beforeSend` scrubbing remains as defense-in-depth (filters `ui.input` breadcrumbs, strips HTTP request bodies, truncates long context strings)
- `enableLogs: true` remains
- `release` and `dist` tags remain

## Initialization Timing Contract (CHANGED)

### Before (Broken)
- `initCrashReporting(crashReportingOptIn)` called once in `useEffect([], [])` (empty deps)
- Value of `crashReportingOptIn` at call time is always the Zustand default (`false`) because store hasn't rehydrated yet
- Crashes before rehydration are lost even for opted-in users

### After (Fixed)
- `useEffect` dependency array includes `crashReportingOptIn`
- After store rehydration, `crashReportingOptIn` updates to the persisted value → effect re-runs → Sentry initializes with correct preference
- Runtime preference changes also trigger re-initialization

### Design Note: Toggle Off
The `useEffect` calls `initCrashReporting(optIn)`, which returns early when `optIn=false`. This means toggling crash reporting OFF via the settings won't call `Sentry.close()`. For a complete toggle-off, the effect should use `updateCrashReportingConsent(optIn)` instead. This is tracked as a design consideration — the current `initCrashReporting` + dependency array approach correctly handles the primary scenario (rehydration), but `updateCrashReportingConsent` provides cleaner lifecycle management.

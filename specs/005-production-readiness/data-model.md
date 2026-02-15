# Data Model: Production Readiness

**Branch**: `005-production-readiness` | **Date**: 2026-02-15

## Overview

This feature adds 4 new data entities and modifies 1 existing entity. All new data is stored locally (no cloud). No changes to the election dataset schema.

## Modified Entities

### AppState (existing — `src/stores/app.ts`)

Current fields:
- `hasCompletedOnboarding: boolean`
- `lastActiveTab: string`

**Added fields**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `privacyConsentVersion` | `string \| null` | `null` | Version of the privacy policy the user accepted |
| `consentTimestamp` | `string \| null` | `null` | ISO 8601 timestamp of when consent was given |
| `crashReportingOptIn` | `boolean` | `false` | Whether user has opted in to crash reporting |

**State transitions**:
- `null` → `"1.0"`: User accepts privacy policy for the first time
- `"1.0"` → `null` → `"2.0"`: Policy version bumped, consent cleared, user re-accepts
- On data deletion: all fields reset to defaults

**Actions added**:
- `acceptPrivacyPolicy(version: string): void` — records consent version and timestamp
- `revokePrivacyConsent(): void` — clears consent (used during data deletion)
- `setCrashReportingOptIn(optIn: boolean): void` — toggles crash reporting

## New Entities

### ConsentRecord (logical — part of AppState)

Not a separate store. Represented by `privacyConsentVersion` + `consentTimestamp` in AppState.

| Attribute | Type | Constraints |
|-----------|------|-------------|
| `version` | `string` | Matches `PRIVACY_POLICY_VERSION` constant |
| `timestamp` | `string` | ISO 8601, set at acceptance time |

**Validation**: Consent is considered valid when `privacyConsentVersion === PRIVACY_POLICY_VERSION`.

### UserDataExport (transient — generated on demand)

Not persisted. Generated when the user taps "Export my data" and written to a temporary file.

```typescript
interface UserDataExport {
  exportVersion: "1.0";
  exportedAt: string;             // ISO 8601
  appVersion: string;             // From expo-constants

  consent: {
    policyVersion: string | null;
    acceptedAt: string | null;
  };

  survey: {
    status: string;
    answers: Record<string, string>;
    importanceWeights: Record<string, number>;
    profile: UserProfile | null;
  };

  assistant: {
    mode: string;
    selectedCandidateId: string | null;
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>;
  };

  preferences: {
    hasCompletedOnboarding: boolean;
    lastActiveTab: string;
    crashReportingOptIn: boolean;
  };

  feedback: Array<{
    id: string;
    timestamp: string;
    screen: string;
    type: string;
    text: string | null;
  }>;
}
```

**Lifecycle**: Created → shared via system share sheet → temporary file cleaned up.

### CrashReport (external — managed by Sentry SDK)

Not stored locally by the app. The Sentry SDK handles queuing and delivery.

| Attribute | Included | Notes |
|-----------|----------|-------|
| Error type & message | Yes | Standard JS error info |
| Stack trace | Yes | Symbolicated by Sentry |
| Device platform (iOS/Android) | Yes | Non-PII |
| OS version | Yes | Non-PII |
| App version & build number | Yes | Non-PII |
| Timestamp | Yes | When error occurred |
| User-generated content | **No** | Stripped by `beforeSend` |
| Device identifiers (IDFA, etc.) | **No** | Not collected |
| IP address | **No** | Sentry configured to not store |
| Location data | **No** | Not collected |

### RateLimitEntry (server-side — in-memory on proxy)

Not persisted to disk. Lives in-memory on the proxy process.

```typescript
interface RateLimitEntry {
  count: number;       // Requests in current window
  windowStart: number; // Unix timestamp (ms) of window start
}

// Stored as: Map<string, RateLimitEntry> keyed by client IP
```

**Lifecycle**: Created on first request from an IP → incremented on subsequent requests → expired when window elapses → removed by periodic cleanup.

**Configuration constants**:
- `RATE_LIMIT_WINDOW_MS`: 60000 (1 minute)
- `RATE_LIMIT_MAX_REQUESTS`: 20
- `RATE_LIMIT_CLEANUP_INTERVAL_MS`: 300000 (5 minutes)

## Entity Relationships

```
AppState (modified)
  ├── privacyConsentVersion ──→ PRIVACY_POLICY_VERSION constant
  ├── crashReportingOptIn ──→ gates Sentry SDK initialization
  └── (existing fields unchanged)

UserDataExport (transient)
  ├── reads from AppState
  ├── reads from SurveyStore
  ├── reads from AssistantStore
  └── reads from FeedbackEntries (zustandStorage)

CrashReport (external)
  └── sent to Sentry only when crashReportingOptIn === true

RateLimitEntry (proxy memory)
  └── keyed by client IP, independent of app state
```

## Data Deletion Strategy

When the user triggers "Delete all my data":

1. **SurveyStore**: Call `useSurveyStore.getState().reset()` — resets all survey state
2. **AssistantStore**: Call `useAssistantStore.getState().resetConversation()` — clears messages and mode
3. **AppState**: Reset to initial values (including clearing consent, which triggers re-consent on next launch)
4. **Feedback entries**: Call `clearFeedbackEntries()` from `src/services/feedback.ts`
5. **AsyncStorage**: Clear all keys via `AsyncStorage.clear()` as a safety net
6. **SQLite**: No action needed — election data is not user-generated

After deletion, the app navigates to the privacy consent screen (since consent was cleared).

## Migration Strategy

No schema migration needed. The new fields in AppState are additive with `null`/`false` defaults. Zustand's persist middleware handles missing keys gracefully — they receive default values on first hydration after update.

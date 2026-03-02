# Research: Fix Critical Bugs

**Feature**: 014-fix-critical-bugs
**Date**: 2026-02-20

## R1: Sentry PII and Session Replay Configuration

**Decision**: Disable PII collection and remove session replay + feedback integrations entirely.

**Rationale**: The constitution (Principle VII: Privacy & Trust) mandates maximum care with user data. The UI copy promises anonymous crash reports. The legally conservative approach is to match the code to the promise rather than update the promise to match the code. Sentry functions well without PII — stack traces, device info, and OS version are sufficient for crash triage.

**Alternatives considered**:
- Update UI copy to disclose PII/replay collection → Rejected. Would require privacy policy update, potential GDPR re-consent flow, and undermines user trust.
- Gate replay/feedback behind a separate "enhanced diagnostics" toggle → Rejected for MVP. Over-engineers the current need; can be added later if product requires it.

**Implementation details**:
- Set `sendDefaultPii: false` in Sentry.init options
- Remove `Sentry.mobileReplayIntegration()` from integrations array
- Remove `Sentry.feedbackIntegration()` from integrations array
- Remove `replaysSessionSampleRate` and `replaysOnErrorSampleRate` config keys
- Keep `beforeSend` scrubbing as defense-in-depth

## R2: Crash Reporting Initialization Timing

**Decision**: Add `crashReportingOptIn` to the `useEffect` dependency array in `_layout.tsx` so crash reporting re-initializes when the persisted value loads.

**Rationale**: Zustand's persist middleware rehydrates asynchronously. On first render, `crashReportingOptIn` is the default (`false`). After rehydration, it becomes the persisted value. Adding it to the dependency array ensures `initCrashReporting` is called again with the correct value.

**Alternatives considered**:
- Use `onRehydrateStorage` callback in the app store → Rejected. Would couple the store to the crash reporting service and require importing `initCrashReporting` inside the store module, creating a circular concern.
- Block app render until rehydration completes → Rejected. Degrades startup performance on slow devices.

**Implementation details**:
- Change `useEffect(() => { initCrashReporting(crashReportingOptIn); }, [])` to `useEffect(() => { initCrashReporting(crashReportingOptIn); }, [crashReportingOptIn])`
- `initCrashReporting` already handles the `!optIn` case (returns early), so toggling off works
- `updateCrashReportingConsent` already exists for runtime toggle — but the `useEffect` approach is simpler and sufficient since the dependency array handles both rehydration and runtime changes

## R3: Test Suite — Environment Variable Mismatch

**Decision**: Change test env var from `SENTRY_DSN` to `EXPO_PUBLIC_SENTRY_DSN` to match production code.

**Rationale**: The crash-reporting service reads `process.env.EXPO_PUBLIC_SENTRY_DSN` (the Expo convention for client-exposed env vars). The test incorrectly sets `SENTRY_DSN`, so Sentry.init is never called and all assertions fail.

**Alternatives considered**: None — this is a straightforward bug.

## R4: Test Suite — Missing Sentry Mocks

**Decision**: Add `mobileReplayIntegration` and `feedbackIntegration` to the Sentry mock.

**Rationale**: The crash-reporting service calls `Sentry.mobileReplayIntegration()` and `Sentry.feedbackIntegration()` inside the `integrations` array. Without these mocked, the import throws at test time.

**Note**: After the PII fix (R1) removes these integrations from production code, the mock additions become unnecessary. However, if tests are fixed before the production code change, the mocks are needed. The safest sequence is: fix production code first (remove integrations), then update tests to match. If both are done in the same commit, the mocks can be omitted.

## R5: Test Suite — Conversations vs Messages Mock Shape

**Decision**: Update `data-export.test.ts` mock from `messages: [...]` to `conversations: { general: [...] }` and update assertion from `parsed.assistant.messages` to `parsed.assistant.conversations`.

**Rationale**: The assistant store migrated from v0 (`messages` array) to v1 (`conversations` dict) in a previous feature. The data-export service now iterates `Object.entries(assistantState.conversations)`. The test mock was never updated to reflect this migration.

**Alternatives considered**: None — this is a straightforward mock/assertion sync issue.

## R6: FileSystem.cacheDirectory Null Guard

**Decision**: Add a null guard with a user-friendly error when `FileSystem.cacheDirectory` is null.

**Rationale**: `expo-file-system` types declare `cacheDirectory` as `string | null`. On native platforms it's always populated, but the type system doesn't guarantee this. A null guard prevents a confusing "null/data-export.json" file path and provides a clear error message.

**Implementation details**:
- Check `if (!FileSystem.cacheDirectory)` and throw an error with a descriptive message
- This is preferable to falling back to an empty string, which would create a file at an invalid path

## R7: EncodingType Reference

**Decision**: Use string literal `'utf8'` instead of `FileSystem.EncodingType.UTF8`.

**Rationale**: The `EncodingType` enum has been inconsistent across expo-file-system versions. The string literal `'utf8'` is the underlying value that the API accepts and is forward-compatible. This avoids type errors from enum changes between versions.

**Alternatives considered**:
- Import the correct enum for the installed version → Rejected. Fragile across upgrades.
- Type assertion `as any` → Rejected. Hides the problem.

## R8: Conversations Null Guard in Export

**Decision**: Add `?? {}` fallback when accessing `assistantState.conversations` in the export function.

**Rationale**: If the store hasn't been initialized or the migration didn't run, `conversations` could be undefined. `Object.entries(undefined)` throws. The `?? {}` fallback produces an empty export rather than a crash.

## R9: Selective Data Deletion

**Decision**: Replace `AsyncStorage.clear()` with selective removal of known Lucide storage keys.

**Rationale**: `AsyncStorage.clear()` removes ALL keys, including those from third-party libraries, Expo internals, and any other packages that use AsyncStorage. This is destructive beyond the user's intent.

**Known Lucide storage keys**:
- `app-state` (Zustand persist — app store)
- `survey-state` (Zustand persist — survey store)
- `assistant-state` (Zustand persist — assistant store)
- `feedback_entries` (direct zustandStorage — feedback service)

**Implementation details**:
- Use `AsyncStorage.multiRemove(['app-state', 'survey-state', 'assistant-state', 'feedback_entries'])` instead of `AsyncStorage.clear()`
- Keep the existing store reset calls (`reset()`, `resetConversation()`, etc.) as they update in-memory state

## R10: Proxy Fail-Closed Authentication

**Decision**: When `LLM_PROXY_API_KEY` is not set, `checkAuth()` returns `false` (reject all requests).

**Rationale**: Fail-open is a security footgun. A deployer who forgets to set the env var unknowingly exposes the proxy to the internet. The safe default is to reject requests and log a clear warning at startup.

**Alternatives considered**:
- Allow a `--dev` flag or `NODE_ENV=development` to override → Spec assumption allows this: "The LLM proxy in development context may optionally allow requests without a key if an explicit development context flag is set." However, for simplicity, the initial fix will just be fail-closed. A development convenience flag can be added later if needed.

**Implementation details**:
- Change `checkAuth()` to return `false` when `expectedKey` is undefined
- Add startup warning: `console.warn("[llm-proxy] WARNING: LLM_PROXY_API_KEY is not set. All requests will be rejected.")`

## R11: Contract Tests — Real HTTP Assertions

**Decision**: Rewrite contract tests to spawn an actual proxy instance and make real HTTP requests.

**Rationale**: Static assertions validate object shapes but don't catch runtime behavior regressions. Real HTTP tests verify the proxy's actual request/response cycle, including auth checks, CORS headers, and error handling.

**Implementation details**:
- Use Node.js `http` module (or `fetch`) to make requests — no external test HTTP client needed
- Spawn proxy in `beforeAll` with a test port and `LLM_PROXY_API_KEY=test-key`
- Stop proxy in `afterAll`
- Test: health endpoint returns `{ ok: true }`
- Test: unauthenticated POST to `/api/chat` returns 401
- Test: authenticated POST without `OPENAI_API_KEY` returns 500 (missing upstream key)
- Keep test isolated by using a random high port

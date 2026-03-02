# Quickstart: Fix Critical Bugs

**Feature**: 014-fix-critical-bugs
**Date**: 2026-02-20

## Prerequisites

- Node.js 18+
- Project dependencies installed (`npm install`)
- On branch `014-fix-critical-bugs`

## Implementation Order

Fixes should be applied in dependency order. Later fixes depend on earlier ones for clean test runs.

### Step 1: Fix crash reporting service (P1 — FR-001, FR-002)

**File**: `src/services/crash-reporting.ts`

1. Set `sendDefaultPii: false`
2. Remove `Sentry.mobileReplayIntegration()` from integrations
3. Remove `Sentry.feedbackIntegration()` from integrations
4. Remove `replaysSessionSampleRate` and `replaysOnErrorSampleRate`
5. Keep `beforeSend` scrubbing as defense-in-depth

**Verify**: Review the Sentry.init config — no PII, no replays, no feedback.

### Step 2: Fix crash reporting initialization timing (P1 — FR-003, FR-004)

**File**: `src/app/_layout.tsx`

1. Change the crash reporting `useEffect` dependency array from `[]` to `[crashReportingOptIn]`

**Design decision**: Use `updateCrashReportingConsent` instead of `initCrashReporting` in the effect body, so that toggling off properly calls `Sentry.close()`. The effect will fire on rehydration (value changes from default to persisted) and on runtime toggle.

**Verify**: The effect re-runs when `crashReportingOptIn` changes.

### Step 3: Fix crash reporting tests (P1 — FR-005, FR-006)

**File**: `tests/unit/crash-reporting.test.ts`

1. Change `process.env.SENTRY_DSN` → `process.env.EXPO_PUBLIC_SENTRY_DSN`
2. Add `mobileReplayIntegration: jest.fn(() => ({}))` to Sentry mock (only needed if Step 1 is not yet applied)
3. Add `feedbackIntegration: jest.fn(() => ({}))` to Sentry mock (only needed if Step 1 is not yet applied)
4. After Step 1 is applied, these mocks are no longer called by production code. Keep them in the mock anyway for safety (mocking unused exports doesn't hurt).

**Verify**: `npm test -- --testPathPattern=crash-reporting`

### Step 4: Fix data export TypeScript errors (P2 — FR-007, FR-008)

**File**: `src/services/data-export.ts`

1. Add null guard for `FileSystem.cacheDirectory`: throw descriptive error if null
2. Replace `FileSystem.EncodingType.UTF8` with string literal `'utf8'`

**Verify**: `npx tsc --noEmit` reports zero errors in data-export.ts

### Step 5: Fix data export null guards (P2 — FR-009)

**File**: `src/services/data-export.ts`

1. Add `?? {}` fallback: `Object.entries(assistantState.conversations ?? {})`

**Verify**: Export succeeds when assistant store is empty.

### Step 6: Fix selective data deletion (P2 — FR-010)

**File**: `src/services/data-export.ts`

1. Replace `await AsyncStorage.clear()` with `await AsyncStorage.multiRemove(['app-state', 'survey-state', 'assistant-state', 'feedback_entries'])`

**Verify**: After deletion, non-Lucide keys remain in AsyncStorage.

### Step 7: Fix data export tests (P1 — FR-005, FR-006)

**File**: `tests/unit/data-export.test.ts`

1. Change mock from `messages: [...]` to `conversations: { general: [...] }`
2. Change assertion from `parsed.assistant.messages` to `parsed.assistant.conversations.general`

**Verify**: `npm test -- --testPathPattern=data-export`

### Step 8: Fix proxy fail-closed auth (P2 — FR-011, FR-012)

**File**: `scripts/llm-proxy.js`

1. In `checkAuth()`: when `expectedKey` is falsy, return `false` instead of `true`
2. At startup (after `server.listen`): add warning log when `LLM_PROXY_API_KEY` is not set

**Verify**: Start proxy without `LLM_PROXY_API_KEY`, send request → receives 401.

### Step 9: Rewrite contract tests (P3 — FR-005)

**File**: `tests/contract/proxy-api.test.ts`

1. Spawn actual proxy in `beforeAll` with test port and `LLM_PROXY_API_KEY=test-key`
2. Replace static assertions with real HTTP requests
3. Test: GET /health → 200 `{ ok: true }`
4. Test: POST /api/chat without auth → 401
5. Kill proxy in `afterAll`

**Verify**: `npm test -- --testPathPattern=proxy-api`

### Final Verification

```bash
npm test          # All tests pass (zero failures)
npx tsc --noEmit  # Zero type errors
```

## Key Design Decisions

1. **Privacy-safe approach**: Disable PII/replays rather than update UI copy (legally conservative, per constitution Principle VII).
2. **Dependency array over onRehydrateStorage**: Simpler, no store-service coupling.
3. **`updateCrashReportingConsent` in useEffect**: Handles both init and teardown cleanly.
4. **String literal `'utf8'`**: Forward-compatible across expo-file-system versions.
5. **`multiRemove` over `clear`**: Surgical deletion preserves third-party storage.
6. **Fail-closed proxy**: Safe default; development convenience can be added later via explicit flag.

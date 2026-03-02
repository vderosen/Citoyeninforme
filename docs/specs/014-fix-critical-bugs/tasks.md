# Tasks: Fix Critical Bugs

**Input**: Design documents from `/specs/014-fix-critical-bugs/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Existing test fixes are included (US3). No new test authoring requested except US8 (contract test rewrite).

**Organization**: Tasks grouped by user story. 8 user stories across crash reporting (P1), test suite (P1), data export (P2), proxy auth (P2), and contract tests (P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Audit all affected files to understand current state before making changes

- [X] T001 Read and audit all affected source files (`src/services/crash-reporting.ts`, `src/app/_layout.tsx`, `src/services/data-export.ts`, `scripts/llm-proxy.js`) and test files (`tests/unit/crash-reporting.test.ts`, `tests/unit/data-export.test.ts`, `tests/contract/proxy-api.test.ts`) to confirm bug locations match research.md findings

---

## Phase 2: US1 — Crash reporting respects privacy promises (Priority: P1) MVP

**Goal**: Sentry configuration sends only anonymous, non-PII crash data. No session replays, no feedback widget.

**Independent Test**: Review `Sentry.init` config in `src/services/crash-reporting.ts` — confirm `sendDefaultPii: false`, no replay integrations, no feedback integrations, no replay sample rates.

**Functional Requirements**: FR-001, FR-002

### Implementation for User Story 1

- [X] T002 [US1] Set `sendDefaultPii: false`, remove `mobileReplayIntegration()` and `feedbackIntegration()` from integrations array, remove `replaysSessionSampleRate` and `replaysOnErrorSampleRate` from config in `src/services/crash-reporting.ts`
- [X] T003 [P] [US1] Verify crash reporting description copy is accurate (matches "anonymous, no personal data" promise) in `src/i18n/locales/fr/settings.json`

**Checkpoint**: Sentry config is privacy-safe. UI copy matches actual behavior.

---

## Phase 3: US2 — Crash reporting works reliably after app restart (Priority: P1)

**Goal**: Crash reporting initializes with the user's persisted preference after store rehydration, not just the Zustand default.

**Independent Test**: Confirm `useEffect` dependency array includes `crashReportingOptIn` so the effect re-fires when the persisted value loads.

**Functional Requirements**: FR-003, FR-004

### Implementation for User Story 2

- [X] T004 [US2] Add `crashReportingOptIn` to the `useEffect` dependency array and use `updateCrashReportingConsent(crashReportingOptIn)` instead of `initCrashReporting(crashReportingOptIn)` in the effect body in `src/app/_layout.tsx`

**Checkpoint**: Crash reporting responds to both rehydration and runtime preference changes.

---

## Phase 4: US3 — Test suite passes and reflects current code (Priority: P1)

**Goal**: All existing tests pass with zero failures against the current codebase.

**Independent Test**: Run `npm test -- --runInBand` and verify zero failures.

**Functional Requirements**: FR-005, FR-006

**Dependencies**: Best done after US1 (crash-reporting production fix) and after US4/US5 (data-export production fixes), so mocks match final code.

### Implementation for User Story 3

- [X] T005 [P] [US3] Change `process.env.SENTRY_DSN` to `process.env.EXPO_PUBLIC_SENTRY_DSN` and add `mobileReplayIntegration: jest.fn(() => ({}))` and `feedbackIntegration: jest.fn(() => ({}))` to the Sentry mock in `tests/unit/crash-reporting.test.ts`
- [X] T006 [P] [US3] Update mock data from `messages: [...]` to `conversations: { general: [...] }` and update assertions from `parsed.assistant.messages` to `parsed.assistant.conversations.general` in `tests/unit/data-export.test.ts`
- [X] T007 [US3] Run full test suite (`npm test -- --runInBand`) and verify all tests pass with zero failures

**Checkpoint**: Full test suite passes. Safety net restored.

---

## Phase 5: US4 — Data export works without build errors (Priority: P2)

**Goal**: Data export service compiles cleanly with zero type errors.

**Independent Test**: Run `npx tsc --noEmit` and verify zero errors in `src/services/data-export.ts`.

**Functional Requirements**: FR-007, FR-008

### Implementation for User Story 4

- [X] T008 [US4] Add null guard for `FileSystem.cacheDirectory` — throw descriptive error if null — in `src/services/data-export.ts`
- [X] T009 [US4] Replace `FileSystem.EncodingType.UTF8` with string literal `'utf8'` in `src/services/data-export.ts`

**Checkpoint**: `npx tsc --noEmit` reports zero type errors in data-export.ts.

---

## Phase 6: US5 — Data export handles missing or corrupted store data (Priority: P2)

**Goal**: Export completes gracefully when assistant store conversations are undefined or corrupted, producing empty structures instead of crashing.

**Independent Test**: Clear assistant store, trigger export, verify it completes with `{ conversations: {} }`.

**Functional Requirements**: FR-009

### Implementation for User Story 5

- [X] T010 [US5] Add `?? {}` fallback when accessing `assistantState.conversations` in the export function in `src/services/data-export.ts`

**Checkpoint**: Export succeeds with empty/missing assistant store data.

---

## Phase 7: US6 — Delete all data only removes Lucide data (Priority: P2)

**Goal**: Data deletion removes only known Lucide storage keys, preserving third-party and system keys.

**Independent Test**: Populate storage with a non-Lucide key, trigger delete, verify non-Lucide key persists.

**Functional Requirements**: FR-010

### Implementation for User Story 6

- [X] T011 [US6] Replace `AsyncStorage.clear()` with `AsyncStorage.multiRemove(['app-state', 'survey-state', 'assistant-state', 'feedback_entries'])` in the `deleteAllUserData` function in `src/services/data-export.ts`

**Checkpoint**: Deletion is surgical — only Lucide keys removed.

---

## Phase 8: US7 — Proxy rejects requests when no API key is configured (Priority: P2)

**Goal**: The LLM proxy defaults to fail-closed authentication. Missing API key = all requests rejected.

**Independent Test**: Start proxy without `LLM_PROXY_API_KEY`, send request to `/api/chat`, verify 401 response.

**Functional Requirements**: FR-011, FR-012

### Implementation for User Story 7

- [X] T012 [US7] Change `checkAuth()` to return `false` when `expectedKey` is undefined/falsy in `scripts/llm-proxy.js`
- [X] T013 [US7] Add startup warning `console.warn("[llm-proxy] WARNING: LLM_PROXY_API_KEY is not set. All requests will be rejected.")` after `server.listen` in `scripts/llm-proxy.js`

**Checkpoint**: Proxy is fail-closed by default with clear startup warning.

---

## Phase 9: US8 — Contract tests validate actual proxy behavior (Priority: P3)

**Goal**: Contract tests spin up a real proxy instance and make actual HTTP requests instead of testing static object shapes.

**Independent Test**: Run `npm test -- --testPathPattern=proxy-api` and verify tests use real HTTP assertions.

**Functional Requirements**: FR-005 (test subset)

**Dependencies**: Must be done after US7 (proxy auth fix), since contract tests validate the fixed behavior.

### Implementation for User Story 8

- [X] T014 [US8] Rewrite contract tests to spawn actual proxy instance in `beforeAll` (with test port and `LLM_PROXY_API_KEY=test-key`), send real HTTP requests (GET `/health` → 200, POST `/api/chat` without auth → 401, POST `/api/chat` without `OPENAI_API_KEY` → 500), and kill proxy in `afterAll` in `tests/contract/proxy-api.test.ts`

**Checkpoint**: Contract tests validate real proxy behavior via HTTP.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all subsystems

- [X] T015 Run full test suite verification (`npm test`) — confirm zero failures across all unit and contract tests
- [X] T016 Run type checker verification (`npx tsc --noEmit`) — confirm zero type errors across entire project

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Setup (Phase 1) — crash reporting PII fix
- **US2 (Phase 3)**: Depends on Setup (Phase 1) — can run in parallel with US1 (different files)
- **US3 (Phase 4)**: Depends on US1 (Phase 2) + US4/US5 (Phases 5-6) — test mocks must match final production code
- **US4 (Phase 5)**: Depends on Setup (Phase 1) — can run in parallel with US1/US2 (different file)
- **US5 (Phase 6)**: Depends on US4 (Phase 5) — same file, sequential edits
- **US6 (Phase 7)**: Depends on US5 (Phase 6) — same file, sequential edits
- **US7 (Phase 8)**: Depends on Setup (Phase 1) — fully independent (different file)
- **US8 (Phase 9)**: Depends on US7 (Phase 8) — contract tests validate fixed proxy
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — only touches `src/services/crash-reporting.ts`
- **US2 (P1)**: Independent — only touches `src/app/_layout.tsx`
- **US3 (P1)**: Depends on US1 (for crash-reporting test mocks) and benefits from US4/US5 (for data-export test mocks)
- **US4 (P2)**: Independent — touches `src/services/data-export.ts`
- **US5 (P2)**: Sequential after US4 — same file
- **US6 (P2)**: Sequential after US5 — same file
- **US7 (P2)**: Independent — only touches `scripts/llm-proxy.js`
- **US8 (P3)**: Depends on US7 — tests validate proxy auth behavior

### Shared File Constraints

- `src/services/data-export.ts`: Modified by US4, US5, US6 — **must be sequential**
- `scripts/llm-proxy.js`: Modified by US7 (T012 + T013) — **sequential within story**
- All other files are touched by only one user story — safe for parallel execution

### Parallel Opportunities

**Stream A** (Crash reporting): US1 → US2 → US3 (crash-reporting tests)
**Stream B** (Data export): US4 → US5 → US6 → US3 (data-export tests)
**Stream C** (Proxy): US7 → US8

Streams A, B, and C can run in parallel as they touch entirely different files.

---

## Parallel Example: Streams A + B + C

```bash
# These three streams can execute concurrently:

# Stream A (crash reporting):
Task: T002 "Fix Sentry PII config in src/services/crash-reporting.ts"
Task: T003 "Update UI copy in src/i18n/locales/fr/settings.json"  # parallel with T002
Task: T004 "Fix useEffect deps in src/app/_layout.tsx"              # after T002 (different file but logical order)
Task: T005 "Fix crash-reporting tests"                              # after T002

# Stream B (data export):
Task: T008 "Add cacheDirectory null guard in src/services/data-export.ts"
Task: T009 "Replace EncodingType in src/services/data-export.ts"    # after T008 (same file)
Task: T010 "Add conversations fallback in src/services/data-export.ts"  # after T009
Task: T011 "Replace AsyncStorage.clear in src/services/data-export.ts"  # after T010
Task: T006 "Fix data-export tests"                                  # after T010

# Stream C (proxy):
Task: T012 "Fix checkAuth in scripts/llm-proxy.js"
Task: T013 "Add startup warning in scripts/llm-proxy.js"           # after T012 (same file)
Task: T014 "Rewrite contract tests"                                 # after T012/T013
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (audit files)
2. Complete Phase 2: US1 (crash reporting privacy) — **constitution violation fix**
3. Complete Phase 3: US2 (crash reporting timing)
4. Complete Phase 4: US3 (test suite passes) — **development workflow fix**
5. **STOP and VALIDATE**: All P1 issues resolved, test safety net restored

### Incremental Delivery

1. P1 fixes (US1 + US2 + US3) → Privacy compliance + reliable crash reporting + passing tests
2. P2 fixes (US4 + US5 + US6) → Clean builds + robust data export + safe deletion
3. P2 fixes (US7) → Secure proxy deployment
4. P3 improvements (US8) → Better regression protection

### Recommended Execution Order (Single Developer)

For a single developer, the optimal order follows the quickstart.md sequence:

1. T001 (audit) → T002 (PII fix) → T003 (UI copy) → T004 (init timing)
2. T008 (cache guard) → T009 (encoding) → T010 (conversations fallback) → T011 (selective delete)
3. T005 (crash tests) → T006 (export tests) → T007 (verify all tests)
4. T012 (fail-closed auth) → T013 (startup warning) → T014 (contract tests)
5. T015 (final test run) → T016 (final type check)

---

## Notes

- All changes are edits to existing files — no new source files created
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US4/US5/US6 share `src/services/data-export.ts` — must be sequential
- US3 test fixes should follow their corresponding production code fixes
- Commit after each phase or logical group
- Total: 16 tasks across 8 user stories + setup + polish

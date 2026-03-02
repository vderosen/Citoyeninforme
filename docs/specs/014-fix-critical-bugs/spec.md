# Feature Specification: Fix Critical Bugs

**Feature Branch**: `014-fix-critical-bugs`
**Created**: 2026-02-20
**Status**: Draft
**Input**: Batch fix of 8 identified issues across crash reporting, data export, test suite, and proxy authentication

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crash reporting respects privacy promises (Priority: P1)

As a user who has been told crash reports are "anonymous with no personal data," I expect the application to actually send only anonymous, non-PII crash data when I opt in.

**Why this priority**: This is a legal/compliance issue. The UI promises anonymity while the code sends PII and records session replays. This exposes the project to regulatory risk and erodes user trust.

**Independent Test**: Toggle crash reporting on in Settings, trigger a crash, and verify the Sentry payload contains no PII, no session replay data, and no feedback integration data.

**Acceptance Scenarios**:

1. **Given** a user opts in to crash reporting, **When** a crash occurs, **Then** the data sent to Sentry does not include personally identifiable information (no IP addresses, no user inputs, no session recordings).
2. **Given** a user reads the crash reporting description in Settings, **When** they see the toggle, **Then** the description accurately reflects what data is collected and sent.
3. **Given** a user has not opted in to crash reporting, **When** a crash occurs, **Then** no data is sent to any external service.

---

### User Story 2 - Crash reporting works reliably after app restart (Priority: P1)

As a user who previously opted in to crash reporting, I expect crash reporting to be active immediately when I reopen the app, not only after some delay.

**Why this priority**: Currently, crashes that occur before store rehydration are silently lost even for opted-in users, making the entire crash reporting feature unreliable.

**Independent Test**: Opt in to crash reporting, force-quit the app, relaunch, and trigger a crash early in the startup sequence. Verify the crash is captured.

**Acceptance Scenarios**:

1. **Given** a user previously opted in to crash reporting, **When** the app launches and the persisted state loads, **Then** crash reporting initializes with the user's saved preference.
2. **Given** a user previously opted in, **When** a crash occurs before the store has rehydrated, **Then** either the crash is queued and sent once initialized, or initialization happens early enough to capture it.
3. **Given** a user changes their opt-in preference during a session, **When** the preference changes, **Then** crash reporting starts or stops accordingly within that session.

---

### User Story 3 - Test suite passes and reflects current code (Priority: P1)

As a developer working on the project, I expect the test suite to pass and accurately test the current code, not outdated structures.

**Why this priority**: Four failing tests mean the safety net is broken. Any future change could introduce regressions without detection.

**Independent Test**: Run `npm test -- --runInBand` and verify all tests pass with zero failures.

**Acceptance Scenarios**:

1. **Given** the current codebase, **When** the crash-reporting tests run, **Then** they use the correct environment variable name and mock all Sentry integrations used by the code.
2. **Given** the current assistant store uses a conversations dictionary, **When** data-export tests run, **Then** mock data and assertions use the conversations structure, not the deprecated messages array.
3. **Given** all test fixes are applied, **When** the full test suite is executed, **Then** all tests pass with zero failures.

---

### User Story 4 - Data export works without build errors (Priority: P2)

As a developer building the app, I expect the build to succeed without type errors in the data export service.

**Why this priority**: Build errors block CI pipelines and reduce developer confidence. These are straightforward type-safety issues.

**Independent Test**: Run the type checker and verify zero errors in the data export service.

**Acceptance Scenarios**:

1. **Given** the data export service, **When** the type checker analyzes it, **Then** no type errors are reported for cache directory usage or encoding type references.
2. **Given** the cache directory may be unavailable, **When** the export runs, **Then** a missing cache directory is handled gracefully with a clear error message rather than a null reference crash.

---

### User Story 5 - Data export handles missing or corrupted store data (Priority: P2)

As a user who triggers a data export, I expect it to succeed even if some store data is missing or in an unexpected shape.

**Why this priority**: A corrupted or empty assistant store currently crashes the export. Users should get a partial export rather than a crash.

**Independent Test**: Clear the assistant store, then trigger a data export. Verify it completes without error and produces valid output with empty conversations.

**Acceptance Scenarios**:

1. **Given** the assistant store has no conversations (empty or undefined), **When** the user exports data, **Then** the export completes with an empty conversations object.
2. **Given** the assistant store has a corrupted shape, **When** the user exports data, **Then** the export completes gracefully instead of throwing.

---

### User Story 6 - Delete all data only removes Lucide data (Priority: P2)

As a user who deletes all their data, I expect only Lucide-related data to be removed, not data from other libraries or system keys.

**Why this priority**: The current approach is a destructive operation that wipes everything, potentially breaking other functionality or third-party libraries.

**Independent Test**: Populate storage with a non-Lucide key, trigger "delete all data," and verify the non-Lucide key still exists afterward.

**Acceptance Scenarios**:

1. **Given** storage contains both Lucide keys and non-Lucide keys, **When** the user deletes all their data, **Then** only known Lucide keys are removed.
2. **Given** the user triggers data deletion, **When** the operation completes, **Then** all Lucide store data (app preferences, survey results, assistant conversations) is cleared.
3. **Given** the user triggers data deletion, **When** the operation completes, **Then** keys from other libraries or system internals remain intact.

---

### User Story 7 - Proxy rejects requests when no API key is configured (Priority: P2)

As a deployer of the LLM proxy, I expect the proxy to refuse requests by default if I forget to set the API key environment variable, rather than silently accepting all traffic.

**Why this priority**: A fail-open authentication model is a security footgun. Anyone who deploys without setting the key unknowingly exposes the proxy.

**Independent Test**: Start the proxy without the API key set, send a request to the chat endpoint, and verify it returns an error.

**Acceptance Scenarios**:

1. **Given** the API key environment variable is not set, **When** a request arrives at the chat endpoint, **Then** the proxy rejects it and does not forward to the upstream AI service.
2. **Given** the API key is not set, **When** the proxy starts, **Then** it logs a warning indicating that authentication is not configured.
3. **Given** the API key is set and a request provides the correct key, **When** the request arrives, **Then** it is forwarded normally.

---

### User Story 8 - Contract tests validate actual proxy behavior (Priority: P3)

As a developer, I expect contract tests to verify real interactions with the proxy, not just static object shapes.

**Why this priority**: Static assertions provide minimal regression protection. Real request/response tests catch actual regressions but are lower urgency than the other issues.

**Independent Test**: Run contract tests and verify they start an actual proxy instance, make real requests, and validate responses.

**Acceptance Scenarios**:

1. **Given** the contract test suite, **When** tests execute, **Then** they spin up an actual proxy instance and send real requests.
2. **Given** the proxy is running in test context, **When** a health check request is sent, **Then** the test validates the actual response.

---

### Edge Cases

- What happens if the Sentry DSN environment variable is missing at runtime? Crash reporting should silently disable without errors.
- What happens if storage keys have changed since the last version? The deletion function should handle missing keys gracefully.
- What happens if the proxy is deployed in production context without any environment variables? It should fail safely and log clear errors.
- What happens if store rehydration takes unusually long (slow device)? Crashes during that window should either be queued or the initialization should block until rehydration completes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The crash reporting service MUST NOT send personally identifiable information (no PII flag, no session replays, no feedback integrations).
- **FR-002**: The crash reporting UI copy MUST accurately describe what data is collected and sent.
- **FR-003**: Crash reporting MUST initialize based on the user's persisted preference after store rehydration, not based on the default state.
- **FR-004**: The crash reporting initialization MUST react to preference changes during the app lifecycle.
- **FR-005**: All unit tests MUST pass against the current codebase without modification to the source code under test.
- **FR-006**: Test mocks MUST match the current module interfaces (correct env var names, correct integration mocks, correct store shapes).
- **FR-007**: The data export service MUST handle a nullable cache directory without a runtime crash.
- **FR-008**: The data export service MUST use valid encoding type references compatible with the installed file system package version.
- **FR-009**: The data export service MUST handle missing or corrupted assistant store data gracefully (fallback to empty structures).
- **FR-010**: The "delete all data" function MUST only remove known Lucide-specific storage keys, not all keys.
- **FR-011**: The LLM proxy MUST reject requests when no API key is configured (fail-closed authentication).
- **FR-012**: The LLM proxy MUST log a warning at startup when no API key is configured.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The full test suite passes with zero failures.
- **SC-002**: The type checker reports zero errors in the data export service.
- **SC-003**: Crash reporting payloads contain no PII fields (verified by configuration audit: PII flag disabled, no replay/feedback integrations).
- **SC-004**: UI copy in all locales accurately describes the data collection behavior.
- **SC-005**: Data export completes successfully when the assistant store is empty, producing valid output with an empty conversations object.
- **SC-006**: After "delete all data," non-Lucide storage keys remain intact.
- **SC-007**: The proxy rejects 100% of unauthenticated requests when the API key is not configured.

## Assumptions

- The privacy-safe approach is preferred: disable PII and session replays rather than updating the UI copy to admit data collection. This is the legally conservative choice.
- The known Lucide storage keys are: `app-state`, `survey-state`, `assistant-state`. If other Lucide keys exist, they should be added to the deletion list.
- For crash reporting initialization timing, using the store's rehydration callback or adding the opt-in flag to the effect dependency array are both acceptable approaches.
- The LLM proxy in development context may optionally allow requests without a key if an explicit development context flag is set, but the default (no env) behavior must be fail-closed.
- Contract test improvements (P3) may be deferred if the higher-priority fixes are complex.

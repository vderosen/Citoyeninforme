# Tasks: Sentry Integration

**Input**: Plan document from `/docs/specs/022-sentry-integration/plan.md`
**Prerequisites**: plan.md (required), Sentry organization access, EAS project access

**Tests**: Included — unit tests + integration verification + build/release verification.

**Organization**: Tasks are grouped by workstream to cover both:
1. Sentry project setup (platform side)
2. Sentry integration in codebase (app side)

## Format: `[ID] [P?] [WS?] Description`

- **[P]**: Can run in parallel (different files/systems, no dependencies)
- **[WS]**: Workstream (`WS1` Sentry Platform, `WS2` App Integration, `WS3` Validation/Ops)
- Include exact file paths in descriptions

---

## Phase 1: WS1 — Sentry Platform Setup (Priority: P1)

**Goal**: Have a production-ready Sentry project, DSN, auth, environments, and baseline alerting.

**Independent Test**: New test issue sent from app appears in the correct Sentry project/environment.

- [x] T001 [WS1] Create (or confirm) Sentry org slug `citoyeninforme` and project `citoyen-informe-mobile` (React Native platform).
- [x] T002 [WS1] Configure environments in Sentry (`development`, `preview`, `production`) and validate they appear in project settings.
- [x] T003 [WS1] Generate DSN from `citoyen-informe-mobile` and store it for runtime app configuration.
- [x] T004 [WS1] Create Sentry auth token with minimum scopes required for release/source map upload.
- [x] T005 [WS1] Add EAS secrets: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `EXPO_PUBLIC_SENTRY_DSN`.
- [x] T006 [WS1] Define release naming policy: `com.vderosen.citoyeninforme@<appVersion>+<buildNumber>` and dist policy (iOS build number / Android version code).
- [x] T007 [WS1] Create baseline alert rules in Sentry for production: high-frequency new issue and crash-free drop threshold.

**Checkpoint**: Sentry project is operational, secrets are configured, and alerting baseline exists.
**Evidence**: Record proof in `docs/specs/022-sentry-integration/runbook.md` under `WS1 Completion Evidence`.

---

## Phase 2: WS2 — App Configuration & Dependency Setup (Priority: P1)

**Goal**: Restore Sentry SDK/build integration in Expo config and dependency graph.

**Independent Test**: App compiles with Sentry SDK and preview build is able to upload source maps.

- [ ] T008 [WS2] Add `@sentry/react-native` dependency in `package.json`.
- [ ] T009 [WS2] Add Expo plugin `@sentry/react-native/expo` to `app.json` plugins (with `organization` and `project`).
- [ ] T010 [P] [WS2] Update `.env.example` with clear runtime/build-time Sentry variable documentation (`EXPO_PUBLIC_SENTRY_DSN`, token vars location in EAS).
- [ ] T011 [P] [WS2] Update `README.md` Sentry setup section (local setup, EAS setup, privacy stance, verification steps).

**Checkpoint**: Dependency + build plugin + docs are aligned and actionable.

---

## Phase 3: WS2 — Runtime Crash Reporting Service (Priority: P1)

**Goal**: Add privacy-safe, consent-gated crash reporting abstraction.

**Independent Test**: With opt-in off, no events are sent; with opt-in on, sanitized events are sent.

- [ ] T012 [WS2] Create `src/services/crash-reporting.ts` with `initCrashReporting(optIn)`, `updateCrashReportingConsent(optIn)`, `captureException(error, context?)`.
- [ ] T013 [WS2] In `src/services/crash-reporting.ts`, read DSN from `process.env.EXPO_PUBLIC_SENTRY_DSN`; no-op safely if missing.
- [ ] T014 [WS2] In `src/services/crash-reporting.ts`, enforce privacy defaults: `sendDefaultPii: false`, no replay integration, no feedback integration.
- [ ] T015 [WS2] In `src/services/crash-reporting.ts`, implement `beforeSend` sanitization: drop `ui.input` breadcrumbs, remove HTTP request bodies, redact long context strings.

**Checkpoint**: Crash-reporting service exists and enforces privacy contract.

---

## Phase 4: WS2 — Consent State + UI Wiring (Priority: P1)

**Goal**: Persist crash-reporting consent and expose explicit user control in settings.

**Independent Test**: Toggle changes state immediately, persists across restart, and effectively gates capture.

- [ ] T016 [WS2] Extend `AppState` in `src/stores/app.ts` with `crashReportingOptIn: boolean` (default `false`) and `setCrashReportingOptIn(optIn: boolean)`.
- [ ] T017 [WS2] Update `src/app/settings.tsx` to add crash-reporting toggle wired to store and `updateCrashReportingConsent`.
- [ ] T018 [P] [WS2] Update `src/i18n/locales/fr/settings.json` crash-reporting copy to match actual behavior (anonymous, opt-in).

**Checkpoint**: Opt-in UX and persisted consent state are implemented.

---

## Phase 5: WS2 — App Lifecycle/Error Capture Wiring (Priority: P1)

**Goal**: Ensure runtime errors are captured through the new abstraction without breaking UX.

**Independent Test**: Triggered error hits ErrorBoundary fallback and (if opted in) appears in Sentry.

- [ ] T019 [WS2] Update `src/app/_layout.tsx` to sync consent changes via `updateCrashReportingConsent(crashReportingOptIn)` in a `useEffect`.
- [ ] T020 [WS2] Update `src/app/_layout.tsx` to install global error handler and route exceptions through `captureException`.
- [ ] T021 [WS2] Update `src/components/shared/ErrorBoundary.tsx` to report errors through `captureException` while preserving existing fallback behavior.
- [ ] T022 [WS2] Decide and implement root wrapping strategy (`Sentry.wrap(RootLayout)` vs plain export) in `src/app/_layout.tsx` based on SDK guidance and compatibility.

**Checkpoint**: Lifecycle + boundary + global handler are wired end-to-end.

---

## Phase 6: WS3 — Test Coverage (Priority: P1)

**Goal**: Lock behavior with automated tests for gating and sanitization.

**Independent Test**: `npm test` passes with dedicated crash-reporting tests.

- [ ] T023 [WS3] Add `tests/unit/crash-reporting.test.ts` covering no-op when disabled/missing DSN and capture when enabled.
- [ ] T024 [WS3] Add tests for `beforeSend` sanitization (breadcrumb filtering, requestBody stripping, long-string redaction).
- [ ] T025 [WS3] Add/adjust tests for store consent persistence and settings toggle wiring (unit/component level where currently practiced in repo).

**Checkpoint**: Core Sentry behavior is covered by tests.

---

## Phase 7: WS3 — Build, Release, and Production Verification (Priority: P1)

**Goal**: Validate source maps, release mapping, and event quality in preview/production flow.

**Independent Test**: Preview crash shows de-obfuscated stack trace with correct release/environment tags.

- [ ] T026 [WS3] Run preview build and verify source map upload succeeds with configured Sentry auth.
- [ ] T027 [WS3] Trigger controlled test exception in preview build and confirm issue in Sentry with readable stack trace.
- [ ] T028 [WS3] Validate environment tagging (`preview`/`production`) and release naming consistency in Sentry issues.
- [ ] T029 [WS3] Verify production alert rules fire as expected on synthetic or controlled real events.

**Checkpoint**: Sentry data quality and release integration are verified.

---

## Phase 8: WS3 — Operational Documentation & Handover (Priority: P2)

**Goal**: Ensure maintainability with explicit runbook and troubleshooting guidance.

**Independent Test**: A new engineer can execute setup/verification using docs only.

- [ ] T030 [WS3] Add `docs/specs/022-sentry-integration/runbook.md` with setup, env/secrets matrix, verification workflow, and rollback steps.
- [ ] T031 [WS3] Add troubleshooting section in runbook for common failures: missing DSN, token scope errors, failed source-map upload, no events in Sentry.
- [ ] T032 [WS3] Add privacy checklist in runbook (what must never be sent, how to validate payload hygiene).

**Checkpoint**: Integration is operable and auditable.

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 must complete before Phases 2 and 7.
- Phase 2 must complete before Phases 3, 4, and 5.
- Phase 3 + Phase 4 are prerequisites for Phase 5.
- Phase 5 is prerequisite for Phase 6.
- Phase 6 should complete before final production verification in Phase 7.
- Phase 8 is finalization after technical verification.

### Parallel Opportunities

- T010 and T011 can run in parallel with T008/T009 after dependency install starts.
- T018 can run in parallel with T017.
- T023/T024/T025 can run in parallel after core wiring is stable.
- T030/T031/T032 can run in parallel after verification outcomes are known.

---

## Suggested Execution Strategy

1. Complete all P1 platform tasks (Phase 1) first.
2. Implement app integration in this order: Phase 2 → Phase 3 → Phase 4 → Phase 5.
3. Lock behavior with tests (Phase 6).
4. Validate on preview/production path (Phase 7).
5. Finalize operations/runbook (Phase 8).

This order minimizes rework and ensures privacy + observability are validated before rollout.

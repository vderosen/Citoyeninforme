# Plan: End-to-End Sentry Integration for **Citoyen Informé** (Expo React Native)

## Summary
This plan implements Sentry in two tracks:
1. **Sentry-side setup** (organization/project, auth, environments, alerting, releases).
2. **Codebase integration** (Expo plugin + runtime SDK + privacy-safe consent-gated reporting + verification).

The plan is aligned with current repo state: Sentry integration was previously removed and is currently inactive in runtime/build config.

## Current Baseline (Confirmed)
1. No active runtime Sentry initialization in `src/app/_layout.tsx`.
2. No Expo Sentry plugin in `app.json`.
3. No `@sentry/react-native` dependency in `package.json`.
4. Sentry env keys still documented in `.env.example`.
5. No crash-reporting service currently present under `src/services/`.
6. Settings has no crash-reporting toggle in `src/app/settings.tsx`.

## Scope
### In scope
1. Sentry org/project setup and project hygiene.
2. Mobile app SDK setup for iOS/Android Expo builds.
3. Opt-in-only crash reporting with privacy filtering.
4. Source map upload and release health basics.
5. Tests and production verification checklist.

### Out of scope
1. Session Replay.
2. Feedback widget.
3. User-identifying telemetry.
4. Backend/proxy Sentry integration.

## Track A: Sentry Project Setup (Platform Side)

### A1. Create and Configure Sentry Project
1. Create (or reuse) organization slug: `citoyeninforme` (display name can remain "citoyen-informe").
2. Create project: `citoyen-informe-mobile` (platform React Native).
3. Set environment strategy:
   - `development`
   - `preview`
   - `production`
4. Generate DSN from this project.
5. Define ownership defaults (optional initially): all unassigned.

### A2. Auth and Secrets for Build-Time Upload
1. Create Sentry auth token with minimum scopes for releases/source maps.
2. Store secrets in EAS:
   - `SENTRY_AUTH_TOKEN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`
3. Store runtime DSN as EAS/env:
   - `EXPO_PUBLIC_SENTRY_DSN` (runtime SDK)
4. Keep `SENTRY_DSN` only if plugin/build flow requires it in your chosen setup pattern.
5. Document secret rotation procedure in `docs/` (short runbook).

### A3. Alerting and Triage Baseline
1. Create alert rule for new high-volume production issue.
2. Create alert rule for app crash-free session drop threshold (if enabled by your plan level).
3. Configure issue grouping defaults.
4. Enable suspect commits/release association if repo integration is available.

### A4. Release Strategy Definition
1. Release name format:
   - `com.vderosen.citoyeninforme@<appVersion>+<buildNumber>`
2. Dist:
   - iOS build number or Android version code.
3. Ensure release mapping is deterministic across EAS preview/production.

## Track B: Codebase Integration (App Side)

### B1. Dependencies and Expo Build Plugin
1. Add `@sentry/react-native` dependency.
2. Add Expo plugin `@sentry/react-native/expo` in `app.json`.
3. Configure plugin with:
   - `organization` from `SENTRY_ORG`
   - `project` from `SENTRY_PROJECT`
   - `url` default `https://sentry.io/` unless self-hosted.

### B2. Runtime Crash Service (Privacy-Safe Abstraction)
1. Create `src/services/crash-reporting.ts`.
2. Export API:
   - `initCrashReporting(optIn: boolean): void`
   - `updateCrashReportingConsent(optIn: boolean): void`
   - `captureException(error: Error, context?: Record<string, string>): void`
3. Behavior:
   - Read DSN from `process.env.EXPO_PUBLIC_SENTRY_DSN`.
   - If DSN missing, no-op safely.
   - Default consent is OFF.
   - Send events only when opt-in is true.
4. Use `beforeSend` sanitization:
   - Drop `ui.input` breadcrumbs.
   - Strip request bodies from HTTP breadcrumbs.
   - Redact long strings and custom context text.
5. Enforce privacy flags:
   - `sendDefaultPii: false`
   - No replay integration.
   - No feedback integration.

### B3. App Lifecycle Wiring
1. Update `src/app/_layout.tsx`:
   - Sync consent changes with `updateCrashReportingConsent(...)` in `useEffect`.
   - Keep error boundary for user fallback UI.
   - Wire global error handler to call `captureException(...)`.
   - Ensure no crash loop from fatal handler behavior.
2. Optionally wrap root with `Sentry.wrap` if required by SDK version and desired instrumentation level.

### B4. Store and Settings UX
1. Extend `src/stores/app.ts`:
   - Add `crashReportingOptIn: boolean` default `false`.
   - Add setter `setCrashReportingOptIn(optIn: boolean)`.
2. Update `src/app/settings.tsx`:
   - Add toggle for crash reporting consent.
   - Persist change and call consent sync service immediately.
   - Ensure all user-facing text remains via `t('...')`.
3. Update i18n keys in `src/i18n/locales/fr/settings.json` with accurate privacy wording.

### B5. Environment and Documentation Cleanup
1. Align `.env.example`:
   - Explain `EXPO_PUBLIC_SENTRY_DSN` runtime purpose.
   - Explain build-time vars/tokens ownership and where they live (EAS secrets, not local if avoidable).
2. Update `README.md` with:
   - Local setup.
   - Build setup.
   - Verification steps.
   - Privacy note (opt-in, no personal content).

## Public APIs / Interfaces / Types Changes
1. New service module:
   - `src/services/crash-reporting.ts`
   - `initCrashReporting(optIn: boolean): void`
   - `updateCrashReportingConsent(optIn: boolean): void`
   - `captureException(error: Error, context?: Record<string, string>): void`
2. App store shape change in `AppState`:
   - Add `crashReportingOptIn: boolean`
   - Add `setCrashReportingOptIn(optIn: boolean): void`
3. i18n interface changes:
   - Add or reactivate crash-reporting labels/descriptions in `settings` namespace.
4. No backend API contract changes.

## Implementation Sequence (Decision-Complete)
1. Prepare Sentry org/project, DSN, auth token, alert defaults.
2. Add SDK dependency + Expo plugin config.
3. Implement crash-reporting service with strict privacy sanitization.
4. Wire `_layout` lifecycle + global handler + error boundary capture calls.
5. Add persisted consent flag in store.
6. Add settings toggle + i18n text.
7. Add tests.
8. Validate on dev build and preview build.
9. Enable production alerts and document operational runbook.

## Test Plan and Scenarios

### Unit Tests
1. `initCrashReporting(false)` does not emit events.
2. Missing DSN results in safe no-op.
3. `updateCrashReportingConsent(true)` enables capture.
4. `updateCrashReportingConsent(false)` disables capture.
5. `beforeSend` strips/redacts sensitive breadcrumb/context payloads.
6. `captureException` sends sanitized context only when opted in.

### Integration / App Behavior Tests
1. Fresh install default: crash opt-in OFF.
2. Toggle ON in settings: subsequent test exception appears in Sentry.
3. Toggle OFF: subsequent exceptions do not appear.
4. Consent persistence after app restart works.
5. ErrorBoundary fallback still renders correctly for user.

### Build/Release Verification
1. EAS preview build uploads source maps successfully.
2. Trigger JS exception in preview and confirm de-obfuscated stack trace.
3. Verify issue environment tagging (`preview`/`production`) and release naming consistency.
4. Validate alert triggers for production event.

## Acceptance Criteria
1. Sentry project receives mobile exceptions only when user opt-in is enabled.
2. No personal/user-generated content is sent in event payloads.
3. Source maps are uploaded and stack traces are readable.
4. Consent toggle works immediately and persists across restarts.
5. Tests covering consent gating and sanitization pass.

## Risks and Mitigations
1. Risk: accidental PII leakage via breadcrumbs or custom context.
   - Mitigation: strict `beforeSend` sanitizer + explicit tests.
2. Risk: DSN or auth secrets misconfigured in EAS.
   - Mitigation: preflight checklist + one preview build validation gate.
3. Risk: stale docs diverge from implementation.
   - Mitigation: update README/env example in same change set.

## Assumptions and Defaults
1. Sentry Cloud (`https://sentry.io/`) is used, not self-hosted.
2. Crash reporting remains strictly opt-in and OFF by default.
3. No Session Replay or Feedback feature is enabled.
4. The app continues local-first privacy posture with no user account identity in telemetry.
5. Release naming default is `bundleId@version+build`.
6. iOS and Android both covered through Expo managed workflow and EAS builds.

## Deliverables
1. Sentry project configured and operational with alert baseline.
2. Runtime crash reporting abstraction + consent wiring in app.
3. Settings toggle and persisted consent state.
4. Tests for gating and sanitization.
5. Updated setup and operations documentation.

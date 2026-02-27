# Runbook: WS1 Sentry Platform Baseline

This runbook captures the repository-side documentation needed to close WS1 (Sentry platform setup) for `docs/specs/022-sentry-integration`.

## WS1 Release and Dist Policy

Use one deterministic release format across preview and production:

- `release = com.vderosen.citoyeninforme@<appVersion>+<buildNumber>`

Dist must match native build identifiers:

- iOS dist: `CFBundleVersion` (build number)
- Android dist: `versionCode`

Policy notes:

- `appVersion` must come from the app version in the build artifact.
- `buildNumber` must be the native build identifier for the specific platform.
- Do not use random values or timestamps for release/dist.

## WS1 Required Secret Names

WS1 requires the following EAS secrets:

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `EXPO_PUBLIC_SENTRY_DSN`

Secret ownership:

- Store these in EAS secrets for CI/EAS build usage.
- Do not commit secret values in git.
- Keep local `.env` values only for local testing when explicitly needed.

## WS1 Completion Evidence

WS1 is complete when all evidence below is attached to the PR/issue:

1. Project setup evidence:
   - Sentry org slug `citoyeninforme` exists.
   - Sentry project `citoyen-informe-mobile` exists.
2. Environment evidence:
   - `development`, `preview`, `production` visible in Sentry project environments.
3. Secret evidence:
   - EAS secrets created with exact names:
     - `SENTRY_AUTH_TOKEN`
     - `SENTRY_ORG`
     - `SENTRY_PROJECT`
     - `EXPO_PUBLIC_SENTRY_DSN`
4. Release policy evidence:
   - At least one captured event/build artifact showing release format:
     - `com.vderosen.citoyeninforme@<appVersion>+<buildNumber>`
   - Dist matches platform native build identifier.
5. Alerting evidence:
   - Baseline production alert rules created:
     - high-frequency new issue
     - crash-free drop threshold

## WS1 Sentry Data Region

The Sentry organization uses the **EU/DE data region** (`de.sentry.io`).

Configuration touchpoints:

- `app.json` Expo plugin `url`: `https://de.sentry.io/` — controls where the Sentry CLI uploads source maps and debug symbols during native builds.
- DSN (in `EXPO_PUBLIC_SENTRY_DSN`): contains the ingest URL for runtime event submission (e.g., `https://<key>@o<org-id>.ingest.de.sentry.io/<project-id>`).

If the organization is migrated to a different region, update both the plugin URL and the DSN.

## WS1 Execution Evidence (2026-02-27)

- Sentry org slug: `citoyeninforme` (`https://citoyeninforme.sentry.io`)
- Sentry project slug: `citoyen-informe-mobile` (ID `4510958595997776`)
- EAS variables present in `development` / `preview` / `production`:
  - `SENTRY_AUTH_TOKEN` (secret)
  - `SENTRY_ORG=citoyeninforme`
  - `SENTRY_PROJECT=citoyen-informe-mobile`
  - `EXPO_PUBLIC_SENTRY_DSN` (sensitive)
- Environment verification: events exist for `development`, `preview`, `production`
- Baseline production alert rules (active):
  - `434207` — `WS1: Production high-frequency new issue`
  - `434212` — `WS1: Production crash-free drop threshold`

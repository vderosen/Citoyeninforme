# Citoyen Informé (formerly Lucide v2)

Citoyen Informé is a civic election app built with Expo + React Native.  
Its goal is to help citizens understand candidates and programs with neutral, source-backed information, not voting recommendations.

This repository currently ships with the Paris 2026 municipal election dataset (`src/data/elections/paris-2026`), but the app architecture is dataset-driven.

## What the app includes

- Discover flow on Home: election context, key logistics, trust/neutrality card, and action shortcuts.
- Candidate exploration: gallery, profile pages, theme-based filtering, and source references.
- Candidate comparison: side-by-side comparison by theme.
- Civic survey: civic primer, weighted questionnaire, deterministic matching, tie explanation, contradiction detection.
- Four-tab navigation: Accueil, Cartes Swipe, Résultats, Assistant IA.
- Assistant IA as a single chat experience, with optional candidate-focused context when entering from a candidate profile.
- 5-step onboarding carousel with branching final entry point.
- Production-readiness features:
  - privacy consent gate,
  - settings screen (privacy, data export/delete, crash reporting opt-in),
  - offline handling banner and chat offline state,
  - secured local LLM proxy (auth + rate limiting + basic input sanitization).

## Product principles (from specs)

- Neutrality first: no candidate endorsement.
- Sources first: claims should be linked to references.
- Local-first user data: survey/chat/preferences are persisted on device.
- Deterministic matching: same answers => same ranking.

## Tech stack

- React Native `0.81` + Expo SDK `54`
- Expo Router `6`
- TypeScript `5.9`
- Zustand for app state (persisted stores)
- NativeWind + Tailwind for styling
- react-i18next (French locale currently)
- Sentry React Native (opt-in crash reporting)

## Project structure

```text
src/
  app/                 Expo Router routes
  components/          UI by feature (home, assistant, survey, onboarding...)
  data/                Dataset schema + loader + bundled election data
  hooks/               Shared hooks (network status)
  i18n/                Translation setup and locale JSON
  services/            Matching, chatbot, export, crash reporting, prompts
  stores/              Zustand stores (app, survey, assistant, election)
  utils/               Helpers (input sanitization, etc.)

scripts/               Data pipeline and local proxy scripts
docs/
  specs/               Functional and technical specifications
  assets/              Legacy design assets
  legacy/              Archive of old data versions and silos
tests/                 Unit and contract tests
e2e/                   Detox end-to-end tests
```

## Quickstart

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

At minimum, set:

- `OPENAI_API_KEY`
- `EXPO_PUBLIC_LLM_PROXY_URL` (usually `http://localhost:3001` for local dev)

Recommended for proxy auth:

- `LLM_PROXY_API_KEY`
- `EXPO_PUBLIC_LLM_PROXY_API_KEY`

Optional:

- `EXPO_PUBLIC_SENTRY_DSN` (runtime crash reporting DSN)
- `EXPO_PUBLIC_PRIVACY_POLICY_URL`
- Crash reporting is disabled by default and only enabled after explicit opt-in in Settings.

Required for EAS builds with Sentry source-map/release integration (set as EAS secrets):

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `EXPO_PUBLIC_SENTRY_DSN`

Privacy stance:

- No default PII is sent to Sentry.
- Crash reports are opt-in only.
- User-generated content is sanitized before sending.

### 3. Start the LLM proxy

```bash
npm run chat:proxy
```

Health check:

```bash
curl -s http://localhost:3001/health
```

### 4. Start the app

```bash
npm start
```

Platform shortcuts:

```bash
npm run ios
npm run android
npm run web
```

For iOS Simulator visual testing via MCP, see `.agents/workflows/launch-simulator.md`.

## Common commands

- `npm start` - start Expo
- `npm run chat:proxy` - run local chat proxy
- `npm test` - run test suite
- `npm run lint` - run ESLint
- `npm run data:review:paris-2026` - generate markdown review of the bundled dataset

## Data and election content

Bundled dataset files live in:

- `src/data/elections/paris-2026/election.json`
- `src/data/elections/paris-2026/candidates.json`
- `src/data/elections/paris-2026/themes.json`
- `src/data/elections/paris-2026/positions.json`
- `src/data/elections/paris-2026/survey-questions.json`
- `src/data/elections/paris-2026/civic-facts.json`
- `src/data/elections/paris-2026/logistics.json`

The loader is currently wired in `src/data/loader.ts`. To switch elections, provide a new dataset folder with the same schema and update loader imports.

## Build and release

EAS profiles are defined in `eas.json`:

```bash
eas build --profile development --platform all
eas build --profile preview --platform all
eas build --profile production --platform all
```

Store submission commands:

```bash
eas submit --platform ios
eas submit --platform android
```

### Sentry release/dist policy (WS1)

- Release format: `com.vderosen.citoyeninforme@<appVersion>+<buildNumber>`
- Dist mapping:
  - iOS: `CFBundleVersion` (build number)
  - Android: `versionCode`
- Use deterministic release/dist values across preview and production builds.
- WS1 setup/completion evidence is documented in `docs/specs/022-sentry-integration/runbook.md`.

### Sentry runtime verification (WS2)

1. Launch the app and keep crash reporting disabled in `Paramètres`.
2. Trigger a controlled exception and verify no event is sent.
3. Enable `Rapports de crash anonymes` in `Paramètres`.
4. Trigger the same exception and verify an issue appears in Sentry with environment/release tags.

## Specs index

All product and implementation context is documented in `specs/`:

All product and implementation context is documented in `docs/specs/`:

- `docs/specs/001-civic-election-app` - MVP functional scope
- `docs/specs/002-frontend-redesign` - action-first UX redesign
- `docs/specs/003-ui-polish` - navigation and hierarchy polish
- `docs/specs/004-neighborhood-pulse-redesign` - visual identity system
- `docs/specs/005-production-readiness` - privacy, security, resilience, release
- `docs/specs/006-onboarding-redesign` - 5-step onboarding flow

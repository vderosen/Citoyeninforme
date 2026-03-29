# Citoyen Informé

Citoyen Informé is an Expo + React Native civic app.
It helps users compare candidates with neutral, source-based information (no voting recommendations).

## Scope

- Current bundled dataset: Paris 2026 municipal election
- App data is local-first (stored on device)
- UI language is French

## Main Features

- Home with election context and key logistics
- Candidate browsing and profile pages
- Candidate comparison by theme
- Swipe survey with deterministic scoring
- Results page with ranking and explanations
- AI assistant chat (via local/deployed proxy)

## Tech Stack

- Expo SDK 54 / React Native 0.81
- Expo Router 6
- TypeScript
- Zustand
- NativeWind + Tailwind
- react-i18next

## Quick Start

```bash
npm install
cp .env.example .env
npm run chat:proxy
npm start
```

Optional platform commands:

```bash
npm run ios
npm run android
npm run web
```

## Useful Commands

```bash
npm test
npm run lint
npm run data:review:paris-2026
```

## Project Structure

```text
src/            App code (routes, components, stores, services)
assets/         App assets (images, fonts)
data_pipeline/  Data preparation scripts and artifacts
docs/           Documentation (specs, internal context, archive)
scripts/        Tooling and local proxy scripts
tests/          Unit/contract tests
e2e/            Detox tests
```

## Open Source Files

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)
- [LICENSE](LICENSE)

## Release Notes

- JS/content/UI changes: OTA (`eas update`)
- Native/runtime changes: store build + submit (`eas build` / `eas submit`)

Details: `docs/release-strategy.md`

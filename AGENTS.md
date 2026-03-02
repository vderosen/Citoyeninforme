# Citoyen Informé — Agent Guidelines

## Quick Start

- Read `Context.md` for architecture, tech stack, and project conventions
- Read `.specify/memory/constitution.md` for core principles (neutrality, privacy, source-grounded truth)
- Run `npm test && npm run lint` before committing

## Key Rules

- **Branding:** App name is **Citoyen Informé** (not "Lucide")
- **Language:** French only — all user-facing strings via `t('key')` from react-i18next
- **Privacy:** All user data stays on-device (AsyncStorage). No server-side user profiles
- **Neutrality:** No voting recommendations. Survey uses transparent, deterministic scoring
- **Card order:** Always use `balancedShuffle` — never randomize or hardcode
- **Release strategy:** Default to OTA (`eas update`) for JS/UI/content fixes. Use store releases (`eas build` + `eas submit`) only for native/binary changes.
- **When user says "update this":** Always classify the change first as `OTA` or `Store` and state the path explicitly before release commands.

## OTA vs Store Decision Matrix

- **OTA update (`eas update --channel production`)**
  - Changes under `src/**` (screens, components, hooks, stores, services)
  - i18n/content/data updates (`src/i18n/**`, `src/data/**`)
  - Styling/theme/font usage in JS/TS (for existing bundled fonts)
- **Store update (`eas build` + `eas submit`)**
  - Any `app.json` native config change (icons/splash, bundle/package IDs, permissions, plugins, build numbers/version codes)
  - Any dependency change that adds/updates native modules
  - Any native folder change (`ios/**`, `android/**`) when those folders are used

## Release Workflow

- OTA path:
  1. `npm test && npm run lint`
  2. `eas update --channel production --message "<note>"`
- Store path:
  1. `npm test && npm run lint`
  2. `eas build --platform ios --profile production`
  3. `eas build --platform android --profile production`
  4. `eas submit --platform ios --profile production`
  5. `eas submit --platform android --profile production`

## Workflows

See `.agents/workflows/` for step-by-step procedures:
- `/launch-simulator` — Boot iOS simulator and connect MCP for visual testing

## Testing

| Tool | Purpose | Command |
|---|---|---|
| Jest | Unit tests | `npm test` |
| Detox | E2E native tests | See `e2e/` directory |
| iOS Simulator MCP | AI visual debugging | See `/launch-simulator` workflow |

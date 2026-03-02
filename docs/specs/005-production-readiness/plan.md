# Implementation Plan: Production Readiness

**Branch**: `005-production-readiness` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-production-readiness/spec.md`

## Summary

Harden the Lucide civic election app for App Store and Play Store submission. This feature adds privacy consent (GDPR), LLM proxy security (CORS + auth + rate limiting), global error boundaries with opt-in Sentry crash reporting, offline context detection, data export/deletion, a settings screen, EAS build configuration, store metadata, and prompt injection guardrails. No new cloud dependencies — the app remains local-first.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54, managed workflow)
**Primary Dependencies**: Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23 + Tailwind CSS 3.4.17, @gluestack-ui/themed 1.1.73, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3
**Storage**: AsyncStorage (user preferences, survey results via Zustand persist), SQLite via expo-sqlite 16.0.3 (election dataset), bundled JSON (seed data), MMKV referenced but currently using AsyncStorage adapter in `storage.native.ts`
**Testing**: Jest 29.7.0 + jest-expo 54.0.0 + @testing-library/react-native 13.2.0. Three existing unit tests: `matching.test.ts`, `loader.test.ts`, `contradiction.test.ts`
**Target Platform**: iOS 15+ and Android (API 24+), portrait orientation, Expo managed workflow
**Project Type**: Mobile (React Native / Expo)
**Performance Goals**: Privacy consent screen loads instantly (no network), data export completes in <10s for typical usage, proxy rate limiting enforces 20 req/min per client
**Constraints**: Offline-capable for all local content, no PII in crash reports, local-first architecture (no cloud backend), must pass App Store Review Guidelines and Google Play Developer Policy
**Scale/Scope**: Single-user local app, ~12 screens (adding 2: privacy consent, settings), 1 proxy server (Node.js), bundled dataset for Paris 2026 election

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Neutrality & Non-Prescription | PASS | No changes to content presentation or candidate ordering. Prompt injection guardrails reinforce neutrality. |
| II. Source-Grounded Truth | PASS | No changes to data sourcing or citation system. |
| III. City-Agnostic Architecture | PASS | All new features (consent, error handling, settings, offline, export) are generic — no Paris-specific logic. EAS config uses `com.lucide.app` bundle ID already defined. |
| IV. Critical Thinking Over Persuasion | PASS | No changes to debate/Socratic features. |
| V. Structured Data as Single Source of Truth | PASS | No changes to election dataset schema or data flow. |
| VI. Simplicity & MVP Discipline | PASS | Settings screen is a stack screen accessed from Home header gear icon, not a new tab. The 3-tab layout (Accueil, Assistant, Candidats) is preserved. Privacy consent is a legal requirement, not feature creep. Error boundaries and crash reporting are stability requirements. |
| VII. Privacy & Trust | PASS | This feature is the primary implementation of Privacy & Trust. Consent before data processing, opt-in crash reporting (no PII), local-first data, GDPR export/deletion. Analytics excluded from scope per constitution (no individual tracking). |

**Gate result**: PASS — no violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-production-readiness/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── privacy-consent.ts
│   ├── proxy-api.ts
│   ├── data-export.ts
│   ├── settings.ts
│   └── crash-reporting.ts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── _layout.tsx              # MODIFY: Add ErrorBoundary wrapper, privacy consent gate, network provider
│   ├── (tabs)/
│   │   ├── _layout.tsx          # MODIFY: Add gear icon to Home tab header
│   │   ├── index.tsx            # (Home tab - no changes)
│   │   ├── assistant.tsx        # MODIFY: Add offline guard
│   │   └── candidates.tsx       # (no changes)
│   ├── onboarding.tsx           # (no changes)
│   ├── privacy-consent.tsx      # NEW: Privacy consent screen
│   ├── settings.tsx             # NEW: Settings screen
│   ├── candidate/[id].tsx       # (no changes)
│   ├── comparison.tsx           # (no changes)
│   └── survey/                  # (no changes)
├── components/
│   ├── shared/
│   │   ├── ErrorBoundary.tsx    # NEW: Global error boundary with fallback UI
│   │   ├── OfflineBanner.tsx    # NEW: Non-intrusive offline indicator
│   │   ├── ErrorState.tsx       # (exists - reuse in error boundary fallback)
│   │   └── LoadingState.tsx     # (exists - no changes)
│   └── settings/
│       ├── PrivacySection.tsx   # NEW: Privacy policy link, consent info
│       ├── DataSection.tsx      # NEW: Export & delete controls
│       └── AboutSection.tsx     # NEW: Version, build, credits
├── services/
│   ├── chatbot.ts               # MODIFY: Add auth header, input sanitization
│   ├── crash-reporting.ts       # NEW: Sentry integration (opt-in)
│   ├── data-export.ts           # NEW: Export/delete all user data
│   ├── network.ts               # NEW: Network connectivity monitoring
│   └── prompts/
│       ├── scripts/rag-proxy.js   # MODIFY: Add anti-injection guardrails
│       ├── scripts/rag-proxy.js       # MODIFY: Add anti-injection guardrails
│       └── scripts/rag-proxy.js     # MODIFY: Add anti-injection guardrails
├── stores/
│   ├── app.ts                   # MODIFY: Add privacyConsentVersion, consentTimestamp, crashReportingOptIn
│   └── (others unchanged)
├── hooks/
│   └── useNetworkStatus.ts      # NEW: Network connectivity hook
├── i18n/locales/fr/
│   ├── privacy.json             # NEW: Privacy consent translations
│   ├── settings.json            # NEW: Settings screen translations
│   └── errors.json              # NEW: Error boundary translations
└── utils/
    └── input-sanitizer.ts       # NEW: Chat input sanitization

scripts/
└── llm-proxy.js                 # MODIFY: CORS restriction, auth, rate limiting, sanitize health endpoint

# Root config files
├── eas.json                     # NEW: EAS Build profiles (development, preview, production)
└── app.json                     # MODIFY: Add privacy policy URL, plugins for Sentry

tests/
├── unit/
│   ├── data-export.test.ts      # NEW
│   ├── input-sanitizer.test.ts  # NEW
│   ├── network.test.ts          # NEW
│   └── rate-limiter.test.ts     # NEW (proxy)
└── contract/
    └── proxy-api.test.ts        # NEW
```

**Structure Decision**: Extends existing Expo Router file-based structure. New screens (`privacy-consent.tsx`, `settings.tsx`) are stack screens at the app root level (not new tabs), consistent with existing patterns (`onboarding.tsx`, `comparison.tsx`). New services follow existing patterns in `src/services/`. Settings components get their own directory (`src/components/settings/`) to keep the feature organized.

## Complexity Tracking

No constitution violations to justify. The feature adds necessary production infrastructure without changing the core architecture.

# Implementation Plan: Onboarding Redesign

**Branch**: `006-onboarding-redesign` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-onboarding-redesign/spec.md`

## Summary

Replace the existing single-screen scrollable onboarding with a 5-step horizontal pager. Each step presents one focused message (app purpose, neutrality principles, usage contexts, trust contract, entry point selection). The final screen offers three branching CTAs routing to different tabs. Uses a horizontal FlatList with paging for swipe + button navigation, built entirely with existing dependencies (no new packages required).

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3, react-i18next 15.4.1
**Storage**: AsyncStorage via Zustand persist (existing `hasCompletedOnboarding` flag in `app-state` key)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS 15+ / Android 10+ / Web (Expo managed workflow)
**Project Type**: Mobile (cross-platform)
**Performance Goals**: < 300ms step transitions, 60fps swipe animations
**Constraints**: No new npm dependencies; must work offline; illustrations as placeholder icons initially
**Scale/Scope**: 1 screen file replaced, 5 step components created, 1 i18n file updated, ~300 LOC total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicable? | Status | Notes |
|-----------|-------------|--------|-------|
| I. Neutrality & Non-Prescription | Yes | PASS | Screen 4 explicitly communicates "no voting instructions, no partisan scoring, no political targeting". The three entry points on screen 5 present all app contexts equally — no context is privileged in ordering. |
| II. Source-Grounded Truth | No | N/A | Onboarding does not surface factual claims about candidates or elections. |
| III. City-Agnostic Architecture | Yes | PASS | All onboarding text is externalized via i18n. No Paris-specific content is hardcoded — city name or election type could be injected via configuration. |
| IV. Critical Thinking Over Persuasion | Marginal | PASS | Onboarding encourages exploration ("three ways to start") rather than steering toward a single path. The primary CTA on screen 5 is the survey (which surfaces user priorities) rather than a recommendation. |
| V. Structured Data as Single Source of Truth | No | N/A | Onboarding does not consume the election dataset. |
| VI. Simplicity & MVP Discipline | Yes | PASS | Replaces one screen with one screen (same route). Uses no new dependencies. 5 steps is the minimum to convey: purpose, trust, contexts, contract, action. No new tabs or navigation structures added. |
| VII. Privacy & Trust | Yes | PASS | Only persists the existing `hasCompletedOnboarding` boolean. No new user data collected during onboarding. Screen 4 proactively communicates trust commitments. |

**Gate result: PASS** — No violations. No complexity tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/006-onboarding-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (navigation contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── onboarding.tsx              # Replaced: single screen → pager host
├── components/
│   └── onboarding/
│       ├── OnboardingPager.tsx      # Horizontal FlatList pager with step management
│       ├── OnboardingStep.tsx       # Shared step layout (title, illustration, content, CTA, progress)
│       ├── StepPurpose.tsx          # Screen 1: "Comprendre avant de choisir"
│       ├── StepNeutrality.tsx       # Screen 2: "Neutre, sourcé, vérifiable"
│       ├── StepModes.tsx            # Screen 3: "Trois façons de commencer"
│       ├── StepTrust.tsx            # Screen 4: "Ce que Lucide fait – et ne fait pas"
│       └── StepReady.tsx            # Screen 5: "Prêt·e ?" with branching CTAs
├── i18n/
│   └── locales/
│       └── fr/
│           └── onboarding.json     # Updated: expanded from 12 keys to ~40 keys
└── stores/
    └── app.ts                      # Unchanged (reuse completeOnboarding)
```

**Structure Decision**: Mobile single-project structure. Onboarding components live under `src/components/onboarding/` following the existing component organization pattern (e.g., `src/components/assistant/`, `src/components/candidates/`). The route file `src/app/onboarding.tsx` remains the single entry point, now hosting the pager.

## Complexity Tracking

> No violations detected. Table intentionally left empty.

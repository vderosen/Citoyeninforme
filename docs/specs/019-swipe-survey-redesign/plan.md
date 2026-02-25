# Implementation Plan: Swipe Survey Redesign

**Branch**: `019-swipe-survey-redesign` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/019-swipe-survey-redesign/spec.md`

## Summary

Replace the multiple-choice questionnaire (10 questions × 3 options) with a Tinder-style swipe card interface (~18 statement cards × 4 swipe directions). Users swipe right (agree), left (disagree), up (coup de coeur), or down (catastrophe) on political affirmation cards. An adapter function bridges the new swipe format to the existing matching algorithm and contradiction detection, requiring zero changes to those services.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, react-native-reanimated 4.1.1, react-native-gesture-handler 2.28.0 (transitive → add as direct dependency)
**Storage**: AsyncStorage via Zustand persist (key: `survey-state`)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS + Android + Web (Expo managed workflow)
**Project Type**: Mobile (React Native)
**Performance Goals**: 60fps swipe animations, <16ms gesture response latency
**Constraints**: Offline-capable, local-only data storage, survey completion in <2 minutes
**Scale/Scope**: ~18 statement cards, 8 themes, 7 candidates, 1 screen rewrite

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Justification |
|-----------|--------|---------------|
| I. Neutrality & Non-Prescription | ✅ PASS | Statement cards present neutral affirmations. The 4-direction swipe treats all opinions equally with the same scoring multiplier mechanics. Matching algorithm remains deterministic and transparent. |
| II. Source-Grounded Truth | ✅ PASS | Statement cards are derived from the curated election dataset themes. No new factual claims introduced — cards express political opinions for the user to react to. |
| III. City-Agnostic Architecture | ✅ PASS | Statement cards defined in election-specific data files (`statement-cards.json`), not hardcoded. SwipeCard components operate on generic `StatementCard[]` type. FR-014 enforced. |
| IV. Critical Thinking Over Persuasion | ✅ PASS | Contradiction detection continues unchanged on swipe-derived theme scores. No steering toward any position. |
| V. Structured Data as Single Source of Truth | ✅ PASS | Statement cards are part of the election dataset, loaded through the same `loadBundledDataset()` pipeline. No shadow copies. |
| VI. Simplicity & MVP Discipline | ✅ PASS | Replaces existing survey screen (no new tabs). Survey remains a stack screen above tabs. Each user story (P1–P5) is independently testable and deployable. |
| VII. Privacy & Trust | ✅ PASS | All data stored locally via AsyncStorage + Zustand persist. No changes to storage approach. |

**Gate result**: All 7 principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/019-swipe-survey-redesign/
├── plan.md              # This file
├── research.md          # Phase 0: gesture handling, scoring model, data design
├── data-model.md        # Phase 1: StatementCard type, SwipeResponse, adapter
├── quickstart.md        # Phase 1: integration test scenarios
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── survey/
│       ├── _layout.tsx                # KEPT (no changes)
│       ├── intro.tsx                  # KEPT (no changes)
│       ├── questions.tsx              # REWRITE → swipe card interface
│       └── results.tsx                # KEPT (no changes)
├── components/
│   └── survey/
│       ├── SwipeCard.tsx              # NEW — single card with gesture + visual feedback
│       ├── SwipeStack.tsx             # NEW — card stack orchestrator + undo logic
│       ├── SwipeOverlay.tsx           # NEW — directional feedback overlays (icons/labels)
│       ├── SwipeButtons.tsx           # NEW — 4 accessible button alternatives
│       ├── QuestionCard.tsx           # DEPRECATED (no longer imported, kept for reference)
│       ├── ProgressBar.tsx            # KEPT (minor: receives card count instead of question count)
│       ├── ResultsProfile.tsx         # KEPT
│       ├── AlignmentRanking.tsx       # KEPT
│       ├── ContradictionCard.tsx      # KEPT
│       ├── TieExplanation.tsx         # KEPT
│       └── CivicPrimer.tsx            # KEPT
├── data/
│   ├── schema.ts                      # ADD StatementCard interface
│   ├── loader.ts                      # ADD statement-cards import + validation
│   └── elections/paris-2026/
│       ├── statement-cards.json       # NEW — ~18 political affirmation cards
│       └── survey-questions.json      # KEPT (no longer loaded in swipe flow)
├── services/
│   ├── matching.ts                    # KEPT (zero changes)
│   ├── contradiction.ts               # KEPT (zero changes)
│   └── swipe-adapter.ts              # NEW — StatementCard[] → QuestionDefinition[] adapter
├── stores/
│   ├── survey.ts                      # MODIFY — adapt state for swipe responses
│   └── election.ts                    # ADD statementCards field + accessor
├── hooks/
│   └── useMotionPreference.ts         # KEPT (used by SwipeCard for reduced motion)
├── i18n/locales/fr/
│   └── survey.json                    # ADD swipe-related translation keys
└── utils/
    └── shuffle.ts                     # KEPT (used for card order randomization)
```

**Structure Decision**: Follows existing Expo Router mobile project structure. New components go in `src/components/survey/` alongside existing survey components. New adapter service in `src/services/`. New data file in `src/data/elections/paris-2026/`. No new directories needed.

## Complexity Tracking

> No constitution violations detected. No complexity justifications needed.

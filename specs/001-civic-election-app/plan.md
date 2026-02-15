# Implementation Plan: Lucide Civic Election App MVP

**Branch**: `001-civic-election-app` | **Date**: 2026-02-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-civic-election-app/spec.md`

## Summary

Build a cross-platform mobile civic election app using React Native (Expo) that lets users explore candidate positions, complete a preference-matching survey, and interact with an LLM-powered chatbot in three modes (Learn, Candidate, Debate). The app is city-agnostic — all election data lives in a swappable dataset layer. The Paris 2026 municipal election is the first deployment. All user data stays on-device by default.

## Technical Context

**Language/Version**: TypeScript 5.x on React Native 0.80+ (Expo SDK 54+)
**Primary Dependencies**: Expo (managed workflow), Expo Router, Zustand, react-i18next, gluestack-ui v3, NativeWind v4, react-native-mmkv, expo-sqlite, openai (Node SDK)
**Storage**: MMKV for key-value (user profile, preferences); SQLite for structured election dataset; bundled JSON for initial data seeding
**Testing**: Jest (unit), React Native Testing Library (component), Detox (E2E)
**Target Platform**: iOS 15+ and Android 10+ (cross-platform via Expo)
**Project Type**: mobile
**Performance Goals**: <100ms screen transitions, <2s app cold start, 60fps scrolling, <3s chatbot first-token response
**Constraints**: Offline-capable for all non-chatbot features, <50MB app bundle, local-first data storage, WCAG 2.1 AA compliance
**Scale/Scope**: ~10 candidates, ~8 themes, ~80 positions, ~20 survey questions, 3 chatbot modes, 2 pages + floating chatbot overlay

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Neutrality & Non-Prescription | PASS | Candidate ordering is alphabetical/randomized (FR-005). Survey algorithm is deterministic with no hidden weights (FR-009). Comparison views use equal visual weight (FR-004). |
| II. Source-Grounded Truth | PASS | Every position includes source references (FR-002). Chatbot cites sources in all modes (FR-012, FR-013). Missing data is flagged explicitly (FR-016). |
| III. City-Agnostic Architecture | PASS | Election dataset is isolated in a structured data layer (FR-017, FR-018). Configuration (city, year, rules) externalized in dataset JSON. No Paris-specific code in app logic. |
| IV. Critical Thinking Over Persuasion | PASS | Debate mode uses Socratic questioning only (FR-014). No candidate steering. Contradiction detection is logic-based, not editorial. |
| V. Structured Data as Single Source of Truth | PASS | One election dataset per deployment feeds all features (FR-017). Dataset schema covers candidates, positions, themes, logistics. No shadow copies. |
| VI. Simplicity & MVP Discipline | PASS | Two screens (Home, Learn) + floating chatbot overlay. Features prioritized P1–P5 and delivered incrementally. No speculative features. |
| VII. Privacy & Trust | PASS | User profiles stored locally via MMKV (FR-015). No server-side persistence without consent. No third-party data sharing. Analytics (if added) will be aggregate/anonymized. |

**Gate result**: All 7 principles PASS. No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-civic-election-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                     # Expo Router file-based routes
│   ├── _layout.tsx          # Root layout (providers, i18n, theme)
│   ├── index.tsx            # Home screen
│   ├── learn.tsx            # Learn screen (candidate browser)
│   └── survey/
│       ├── _layout.tsx      # Survey flow layout
│       ├── context.tsx      # Civic context mini-module
│       ├── questions.tsx    # Questionnaire
│       └── results.tsx      # Matching results
├── components/
│   ├── chatbot/             # Floating chatbot overlay
│   │   ├── ChatbotFAB.tsx   # Floating action button
│   │   ├── ChatbotPanel.tsx # Chat panel container
│   │   ├── ModeSelector.tsx # Learn/Candidate/Debate mode picker
│   │   └── MessageBubble.tsx
│   ├── candidates/          # Candidate display components
│   │   ├── CandidateCard.tsx
│   │   ├── CandidateList.tsx
│   │   ├── PositionCard.tsx
│   │   └── ComparisonView.tsx
│   ├── survey/              # Survey UI components
│   │   ├── QuestionCard.tsx
│   │   ├── ResultsChart.tsx
│   │   └── ContradictionCard.tsx
│   └── ui/                  # Shared UI primitives
│       ├── SourceReference.tsx
│       └── ThemeFilter.tsx
├── data/                    # Election dataset layer
│   ├── schema.ts            # TypeScript types for dataset
│   ├── loader.ts            # Load + validate bundled JSON
│   └── elections/
│       └── paris-2026/      # First deployment dataset
│           ├── election.json
│           ├── candidates.json
│           ├── themes.json
│           ├── positions.json
│           ├── survey-questions.json
│           ├── civic-facts.json
│           └── logistics.json
├── services/
│   ├── matching.ts          # Deterministic survey matching algorithm
│   ├── chatbot.ts           # LLM API integration (all 3 modes)
│   ├── prompts/             # System prompts per chatbot mode
│   │   ├── learn-mode.ts
│   │   ├── candidate-mode.ts
│   │   └── debate-mode.ts
│   └── contradiction.ts    # Preference contradiction detection
├── stores/
│   ├── survey.ts            # Zustand store: survey state + results
│   ├── election.ts          # Zustand store: loaded election data
│   └── chatbot.ts           # Zustand store: conversation state
├── i18n/
│   ├── index.ts             # i18next configuration
│   └── locales/
│       └── fr/
│           ├── common.json
│           ├── home.json
│           ├── learn.json
│           ├── survey.json
│           └── chatbot.json
└── utils/
    ├── accessibility.ts     # A11y helpers
    └── shuffle.ts           # Deterministic shuffle for candidate ordering

tests/
├── unit/
│   ├── matching.test.ts     # Survey matching algorithm tests
│   ├── contradiction.test.ts
│   └── loader.test.ts       # Dataset validation tests
├── component/
│   ├── CandidateList.test.tsx
│   ├── QuestionCard.test.tsx
│   └── ChatbotPanel.test.tsx
└── e2e/
    ├── browse-candidates.test.ts
    ├── complete-survey.test.ts
    └── chatbot-learn.test.ts
```

**Structure Decision**: Single mobile project using Expo managed workflow with file-based routing (Expo Router). All election data is bundled as JSON in `src/data/elections/{city-year}/`, making it trivially swappable for new elections. Minimal backend — a stateless proxy for OpenAI API key security (no database, no user data). This keeps the architecture simple per Principle VI.

## Complexity Tracking

> No Constitution Check violations. This section is intentionally empty.

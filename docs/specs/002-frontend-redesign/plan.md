# Implementation Plan: Frontend Redesign

**Branch**: `002-frontend-redesign` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-frontend-redesign/spec.md`

## Summary

Rebuild the civic election app frontend from a 2-page layout (Home + Learn) with a floating chatbot panel to a 3-tab bottom navigation (Accueil, Assistant, Candidats) with card-based, action-first design. The existing data layer, services (matching, contradiction detection, chatbot proxy), and election dataset remain unchanged. The redesign replaces the screen structure, navigation model, and component hierarchy while preserving all business logic.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, @gluestack-ui/themed 1.1.73, react-native-mmkv, expo-sqlite 16.0.3
**Storage**: MMKV (user preferences, survey results), SQLite (election dataset on native), bundled JSON (seed data), localStorage (web fallback)
**Testing**: Jest 29.7.0 with jest-expo 54, @testing-library/react-native 13.2.0
**Target Platform**: iOS 15+, Android API 24+, Web (secondary)
**Project Type**: Mobile (Expo managed workflow)
**Performance Goals**: Interactive within 3 seconds on standard mobile connection, 60 fps scrolling, smooth tab switching with preserved state
**Constraints**: Offline-capable for browsing/survey (assistant requires network), all data local-only, French-first UI, WCAG 2.1 AA accessibility
**Scale/Scope**: ~15 screens/views (3 tabs + candidate profile + comparison + survey flow + onboarding + assistant contexts), 4 candidates, 8 themes, ~20 survey questions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| I. Neutrality & Non-Prescription | PASS | Candidate gallery uses equal-weight cards with alphabetical/randomized order (FR-010). Comparison uses equal columns (FR-015). Assistant never recommends candidates (FR-032). Survey matching remains deterministic with no hidden weighting (FR-025). |
| II. Source-Grounded Truth | PASS | Source badges on all factual content (FR-034). "Non documente" and "Incertain" markers for missing/uncertain data (FR-027). Source references in candidate profiles (FR-011) and assistant answers (FR-027). |
| III. City-Agnostic Architecture | PASS | Existing data schema and services are city-agnostic. Redesign uses the same `Election`, `Candidate`, `Theme`, `Position` entities. Top context bar reads city/year from election data, not hardcoded (FR-002). |
| IV. Critical Thinking Over Persuasion | PASS | Debate context uses Socratic questioning (FR-029). Contradiction detection preserved (FR-021). Context guardrails prevent cross-context confusion (FR-033). |
| V. Structured Data as Single Source of Truth | PASS | All screens draw from the same election store (FR-036). No shadow data sources introduced. |
| VI. Simplicity & MVP Discipline | PASS | The 3-tab navigation (Accueil, Assistant, Candidats) maps directly to the three core user intents. Stack screens for candidate profiles, comparison, and survey are presented above tabs. No feature bloat beyond the core user goals. |
| VII. Privacy & Trust | PASS | All data local-only (FR-024). No server-side storage. Trust card explains data practices (FR-007). Feedback stored locally (spec Assumptions). |

**Gate Result**: PASS. All 7 principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── _layout.tsx                  # Root layout: providers + top context bar
│   ├── (tabs)/
│   │   ├── _layout.tsx              # 3-tab bottom navigation layout
│   │   ├── index.tsx                # Accueil (Home) tab
│   │   ├── assistant.tsx            # Assistant tab (chat UI with assistant context controls)
│   │   └── candidates.tsx           # Candidats tab (gallery)
│   ├── candidate/
│   │   └── [id].tsx                 # Candidate profile (stack screen)
│   ├── comparison.tsx               # Side-by-side comparison (stack screen)
│   ├── survey/
│   │   ├── _layout.tsx              # Survey stack layout
│   │   ├── intro.tsx                # Civic primer
│   │   ├── questions.tsx            # Questionnaire
│   │   └── results.tsx              # Results with alignment
│   └── onboarding.tsx               # First-time user onboarding
├── components/
│   ├── shell/
│   │   ├── ContextBar.tsx           # Persistent top bar (city, year, last update)
│   │   └── TabBar.tsx               # Custom bottom tab bar (if needed)
│   ├── home/
│   │   ├── HeroBlock.tsx            # Election context hero
│   │   ├── PrimaryShortcuts.tsx     # 3 large action buttons
│   │   ├── VotingInfoCard.tsx       # Practical voting card
│   │   ├── TrustCard.tsx            # Neutrality statement card
│   │   ├── ResumeCard.tsx           # "Continue where you left off"
│   │   └── ThemeFeed.tsx            # Lightweight theme exploration
│   ├── assistant/
│   │   ├── AssistantContextControls.tsx         # chat assistant unique tabs
│   │   ├── ChatArea.tsx             # Message list with streaming
│   │   ├── MessageBubble.tsx        # Message display (reuse/refactor)
│   │   ├── ContextPrompts.tsx       # Context-aware starter prompts
│   │   └── CandidateSelector.tsx    # Pick candidate for assistant avec contexte candidat
│   ├── candidates/
│   │   ├── CandidateGallery.tsx     # Equal-weight photo grid
│   │   ├── CandidateProfileCard.tsx # Profile summary + actions
│   │   ├── PositionCard.tsx         # Position with source (refactor)
│   │   ├── ThemeFilter.tsx          # Theme filter bar (refactor)
│   │   └── ComparisonView.tsx       # Side-by-side columns (refactor)
│   ├── survey/
│   │   ├── CivicPrimer.tsx          # Pre-survey facts display
│   │   ├── QuestionCard.tsx         # Question + options + importance
│   │   ├── ProgressBar.tsx          # Survey progress indicator
│   │   ├── ResultsProfile.tsx       # Personal theme profile
│   │   ├── AlignmentRanking.tsx     # Candidate alignment scores
│   │   ├── ContradictionCard.tsx    # Contradiction display (reuse)
│   │   └── TieExplanation.tsx       # Tie handling display
│   └── shared/
│       ├── TrustBadge.tsx           # Source / Non documente / Incertain badge
│       ├── SourceReference.tsx      # Clickable source link (refactor)
│       ├── EmptyState.tsx           # Generic empty state with CTA
│       ├── LoadingState.tsx         # Calm loading indicator
│       ├── ErrorState.tsx           # Error with recovery action
│       └── FeedbackAction.tsx       # "Signal unclear info" button
├── stores/
│   ├── election.ts                  # Unchanged
│   ├── survey.ts                    # Minor: add mid-survey persistence
│   ├── assistant.ts                 # Renamed from chatbot.ts, add persistence
│   ├── app.ts                       # New: onboarding state, active tab memory
│   ├── storage.native.ts            # Unchanged
│   └── storage.web.ts               # Unchanged
├── services/
│   ├── chatbot.ts                   # Unchanged (rename import references)
│   ├── matching.ts                  # Unchanged
│   ├── contradiction.ts             # Unchanged
│   └── prompts/
│       ├── scripts/rag-proxy.js       # Renamed from learn-context.ts
│       ├── scripts/rag-proxy.js           # Renamed from candidate-context.ts
│       └── scripts/rag-proxy.js         # Renamed from debate-context.ts
├── data/                            # Unchanged
├── i18n/
│   └── locales/fr/
│       ├── common.json              # Extended: shared UI labels
│       ├── home.json                # Updated: new Home screen copy
│       ├── candidates.json          # New: candidate gallery/profile copy
│       ├── assistant.json           # Renamed from chatbot.json, updated
│       ├── survey.json              # Updated: new survey flow copy
│       ├── comparison.json          # New: comparison view copy
│       └── onboarding.json          # New: onboarding copy
└── utils/
    ├── accessibility.ts             # Unchanged
    └── shuffle.ts                   # Unchanged

tests/
├── unit/
│   ├── matching.test.ts             # Unchanged
│   ├── loader.test.ts               # Unchanged
│   └── contradiction.test.ts        # Unchanged
├── component/
│   ├── CandidateGallery.test.tsx    # New
│   ├── TrustBadge.test.tsx          # New
│   ├── AssistantContextControls.test.tsx        # New
│   ├── ComparisonView.test.tsx      # New
│   ├── PrimaryShortcuts.test.tsx    # New
│   └── EmptyState.test.tsx          # New
└── integration/
    ├── navigation.test.tsx          # New: tab switching, deep links
    └── survey-flow.test.tsx         # New: full survey E2E
```

**Structure Decision**: Mobile app with Expo Router file-based routing. Existing `src/` directory structure is preserved and extended. Key change: `src/app/` moves from flat routes to a `(tabs)/` group layout for bottom navigation, with stack screens for candidate profiles, comparison, survey, and onboarding. Components are reorganized by feature area (shell, home, assistant, candidates, survey, shared) instead of the flatter current structure.

## Complexity Tracking

> No Constitution Check violations. This section is intentionally empty.

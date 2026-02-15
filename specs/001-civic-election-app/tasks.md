# Tasks: Lucide Civic Election App MVP

**Input**: Design documents from `/specs/001-civic-election-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included. The spec defines testing strategy (Jest + RNTL + Detox) and test files in the project structure.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Expo project, install all dependencies, and establish the base project structure.

- [x] T001 Initialize Expo project with `npx create-expo-app lucide --template tabs` and configure TypeScript
- [x] T002 Install all dependencies: expo-router, expo-linking, expo-constants, zustand, react-native-mmkv, expo-sqlite, react-i18next, i18next, react-native-localize, @gluestack-ui/themed, nativewind, tailwindcss, @testing-library/react-native, detox
- [x] T003 Create full directory structure per plan.md: `src/app/`, `src/app/survey/`, `src/components/chatbot/`, `src/components/candidates/`, `src/components/survey/`, `src/components/ui/`, `src/data/`, `src/data/elections/paris-2026/`, `src/services/`, `src/services/prompts/`, `src/stores/`, `src/i18n/locales/fr/`, `src/utils/`, `tests/unit/`, `tests/component/`, `tests/e2e/`
- [x] T004 [P] Configure NativeWind v4 with Tailwind: create `tailwind.config.js`, update `babel.config.js`, add NativeWind setup in `metro.config.js`
- [x] T005 [P] Configure Jest for unit and component testing in `jest.config.js`
- [x] T006 [P] Configure ESLint with `eslint-plugin-jsx-a11y` for accessibility linting

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. This includes the election dataset layer, storage setup, i18n, navigation, and theming.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Create election dataset TypeScript types in `src/data/schema.ts` matching all interfaces from `contracts/election-data.ts` (Election, Candidate, Theme, Position, SurveyQuestion, SurveyOption, CivicFact, ElectionLogistics, SourceReference, ElectionDataset)
- [x] T008 [P] Create Paris 2026 election metadata in `src/data/elections/paris-2026/election.json` (election ID, city, year, voting rules, timeline, data version)
- [x] T009 [P] Create Paris 2026 themes dataset in `src/data/elections/paris-2026/themes.json` (~8 themes: transport, housing, security, ecology, budget, culture, education, social)
- [x] T010 [P] Create Paris 2026 candidates dataset in `src/data/elections/paris-2026/candidates.json` (placeholder data for ~3-5 candidates with realistic structure)
- [x] T011 [P] Create Paris 2026 positions dataset in `src/data/elections/paris-2026/positions.json` (placeholder positions linking candidates to themes, each with at least one source reference per Principle II)
- [x] T012 [P] Create Paris 2026 civic facts dataset in `src/data/elections/paris-2026/civic-facts.json` (5-8 facts about Paris governance and municipal elections)
- [x] T013 [P] Create Paris 2026 logistics dataset in `src/data/elections/paris-2026/logistics.json` (key dates, eligibility, voting methods, locations)
- [x] T014 [P] Create Paris 2026 survey questions dataset in `src/data/elections/paris-2026/survey-questions.json` (~10-15 survey questions mapped to themes with balanced scoring)
- [x] T015 Implement dataset loader and validator in `src/data/loader.ts` — loads bundled JSON files, validates against schema.ts types, inserts into SQLite on first launch, handles version checking for OTA updates
- [x] T016 Write unit tests for dataset loader in `tests/unit/loader.test.ts` — test JSON parsing, schema validation, SQLite insertion, and error handling for malformed data
- [x] T017 [P] Configure react-i18next in `src/i18n/index.ts` — initialize i18next with react-native-localize for device locale detection, French as default and fallback language, namespace-based loading
- [x] T018 [P] Create French translation files: `src/i18n/locales/fr/common.json` (shared labels: navigation, buttons, errors), `src/i18n/locales/fr/home.json`, `src/i18n/locales/fr/learn.json`, `src/i18n/locales/fr/survey.json`, `src/i18n/locales/fr/chatbot.json`
- [x] T019 Create election data Zustand store in `src/stores/election.ts` — manages loaded election dataset (candidates, themes, positions, facts, logistics), exposes selectors for filtering by theme and candidate, loads data from SQLite via loader.ts
- [x] T020 [P] Create accessibility helpers in `src/utils/accessibility.ts` — semantic roles, screen reader announcements, focus management utilities for WCAG 2.1 AA
- [x] T021 [P] Create deterministic shuffle utility in `src/utils/shuffle.ts` — seeded random shuffle for candidate ordering (FR-005: alphabetical or randomized, never editorial)
- [x] T022 Create root layout in `src/app/_layout.tsx` — wrap app with providers (Zustand, i18n, gluestack-ui theme provider, NativeWind), initialize data loader on first mount, configure navigation structure with Expo Router

**Checkpoint**: Foundation ready — election data loads into SQLite, i18n works, navigation structure is in place, stores are initialized. User story implementation can begin.

---

## Phase 3: User Story 1 — Explore Election Information (Priority: P1) MVP

**Goal**: Users can browse candidates, filter by theme, read sourced positions, compare candidates side-by-side, and view election logistics. This is the standalone intellectual backbone of the app.

**Independent Test**: A user opens the app, navigates from Home to Learn, filters by theme, reads candidate positions with sources, and compares candidates — all without survey or chatbot.

### Tests for User Story 1

- [x] T023 [P] [US1] Write component tests for CandidateList and CandidateCard in `tests/component/CandidateList.test.tsx` — test rendering all candidates, alphabetical/randomized ordering, theme filtering, empty state
- [ ] T024 [P] [US1] Write E2E test for browsing candidates in `tests/e2e/browse-candidates.test.ts` — test Home → Learn navigation, theme filter interaction, position expansion, source display

### Implementation for User Story 1

- [x] T025 [P] [US1] Create SourceReference component in `src/components/ui/SourceReference.tsx` — renders a source citation (title, link, type, access date) with proper accessibility labels and external link handling
- [x] T026 [P] [US1] Create ThemeFilter component in `src/components/ui/ThemeFilter.tsx` — horizontal scrollable list of theme chips, supports single/multi-select, uses theme icons and i18n labels
- [x] T027 [P] [US1] Create CandidateCard component in `src/components/candidates/CandidateCard.tsx` — displays candidate name, party, photo, bio summary; tappable to expand positions
- [x] T028 [US1] Create PositionCard component in `src/components/candidates/PositionCard.tsx` — displays position summary, expandable details section, renders source references using SourceReference component (FR-002)
- [x] T029 [US1] Create CandidateList component in `src/components/candidates/CandidateList.tsx` — renders candidates from election store, applies deterministic shuffle (FR-005), filters by selected theme, handles "no position documented" state (Edge Case 1)
- [x] T030 [US1] Create ComparisonView component in `src/components/candidates/ComparisonView.tsx` — side-by-side display of 2+ candidates on a selected theme with equal visual weight (FR-004), shows "Pas de position documentee" when missing
- [x] T031 [US1] Create Home screen in `src/app/index.tsx` — election header (city + year from dataset), purpose explanation, "Start the survey" CTA, navigation links to Learn and Chatbot, neutrality statement (FR-001)
- [x] T032 [US1] Create Learn screen in `src/app/learn.tsx` — integrates ThemeFilter, CandidateList, PositionCard; supports candidate comparison mode; displays election logistics section with key dates, eligibility, voting methods (FR-002, FR-003, FR-006)

**Checkpoint**: User Story 1 fully functional — users can browse, filter, read, and compare candidate positions with sourced information. App is a useful standalone election guide.

---

## Phase 4: User Story 2 — Complete Survey and Get Candidate Matching (Priority: P2)

**Goal**: Users complete a civic context mini-module followed by a questionnaire, receiving a preference profile, candidate ranking with alignment scores, justification, and contradiction snapshot.

**Independent Test**: A user completes the survey from start to finish, receives candidate matching results with justification, and reviews contradictions — all without the chatbot.

**Dependencies**: Requires Phase 2 (election data, themes) and Phase 3 (CandidateCard for results display).

### Tests for User Story 2

- [x] T033 [P] [US2] Write unit tests for matching algorithm in `tests/unit/matching.test.ts` — test determinism (identical inputs → identical outputs per FR-009), score computation, candidate ranking, edge cases (tied scores, all-neutral answers)
- [x] T034 [P] [US2] Write unit tests for contradiction detection in `tests/unit/contradiction.test.ts` — test detecting inconsistent preferences across themes, severity classification, edge cases (no contradictions, all contradictions)
- [ ] T035 [P] [US2] Write component tests for QuestionCard in `tests/component/QuestionCard.test.tsx` — test rendering question text, options, selection state, accessibility
- [ ] T036 [P] [US2] Write E2E test for survey completion in `tests/e2e/complete-survey.test.ts` — test full flow: civic context → questionnaire → computing → results display

### Implementation for User Story 2

- [x] T037 [P] [US2] Implement deterministic matching algorithm in `src/services/matching.ts` — pure function per `contracts/matching.ts` interface: computes user theme scores from answers, calculates candidate alignment via weighted distance, produces ranked results with theme breakdown (FR-009)
- [x] T038 [P] [US2] Implement contradiction detection in `src/services/contradiction.ts` — analyzes user answers across themes to identify inconsistent preferences, produces severity-rated contradiction results with evidence
- [x] T039 [US2] Create survey Zustand store in `src/stores/survey.ts` — manages survey state (per `contracts/user-profile.ts`: SurveyState, SurveyStatus), persists to MMKV, tracks current question index, stores computed UserProfile on completion (FR-015)
- [x] T040 [P] [US2] Create QuestionCard component in `src/components/survey/QuestionCard.tsx` — renders survey question text, answer options as selectable cards, importance weight slider per theme, progress indicator
- [x] T041 [P] [US2] Create ResultsChart component in `src/components/survey/ResultsChart.tsx` — visualizes user theme preference profile, candidate alignment scores as bar/radar chart, theme breakdown per candidate
- [x] T042 [P] [US2] Create ContradictionCard component in `src/components/survey/ContradictionCard.tsx` — displays detected contradictions with severity indicator, explains the conflicting themes and evidence questions
- [x] T043 [US2] Create survey flow layout in `src/app/survey/_layout.tsx` — manages survey navigation (context → questions → results), prevents back-navigation during computing, handles abandon/resume
- [x] T044 [US2] Create civic context screen in `src/app/survey/context.tsx` — displays civic facts from dataset as swipeable cards, educational mini-module about Paris governance (FR-007)
- [x] T045 [US2] Create questionnaire screen in `src/app/survey/questions.tsx` — renders questions sequentially using QuestionCard, tracks answers in survey store, supports importance weighting, shows progress bar
- [x] T046 [US2] Create results screen in `src/app/survey/results.tsx` — displays preference profile (ResultsChart), candidate ranking with alignment scores, justification breakdown per theme (ThemeJustification), contradiction snapshot (ContradictionCard), option to retake survey (FR-008); handles tied scores by showing equal alignment with explanation (Edge Case 3)

**Checkpoint**: User Story 2 fully functional — users can complete the full survey flow and receive transparent, deterministic matching results stored locally on device.

---

## Phase 5: User Story 3 — Learn Mode Chatbot (Priority: P3)

**Goal**: Users can open a floating chatbot from any screen, select Learn mode, and ask questions about candidates/positions/elections grounded in the dataset with source citations.

**Independent Test**: A user opens the chatbot, selects Learn mode, asks about candidates, requests comparisons, and receives source-grounded answers — without having completed the survey.

**Dependencies**: Requires Phase 2 (election data for context injection).

### Tests for User Story 3

- [ ] T047 [P] [US3] Write component tests for ChatbotPanel in `tests/component/ChatbotPanel.test.tsx` — test message rendering, mode selection, streaming state, source citation display
- [ ] T048 [P] [US3] Write E2E test for chatbot learn mode in `tests/e2e/chatbot-learn.test.ts` — test opening chatbot, selecting learn mode, asking question, receiving sourced response


### Implementation for User Story 3

- [x] T049 [US3] Create chatbot Zustand store in `src/stores/chatbot.ts` — manages chatbot state per `contracts/chatbot.ts` (ChatbotState, ChatbotStatus, ChatbotMode), conversation history, streaming state, preloaded context
- [x] T050 [US3] Create Learn mode system prompt in `src/services/prompts/learn-mode.ts` — system prompt template that injects relevant election context, enforces source citation, handles "information unavailable" responses (FR-012, FR-016), ensures neutral assistant behavior; includes off-topic query redirect per Edge Case 4
- [x] T051 [US3] Implement chatbot service in `src/services/chatbot.ts` — handles LLM proxy API calls per `contracts/chatbot.ts` (ChatRequest → ChatStreamEvent SSE), builds ElectionContext from election store, manages streaming response parsing, extracts cited sources
- [x] T052 [P] [US3] Create ChatbotFAB component in `src/components/chatbot/ChatbotFAB.tsx` — floating action button visible on all screens, opens chatbot panel, shows unread indicator, accessible label
- [x] T053 [P] [US3] Create MessageBubble component in `src/components/chatbot/MessageBubble.tsx` — renders user and assistant messages, displays inline source citations using SourceReference component, handles streaming text with cursor
- [x] T054 [US3] Create ModeSelector component in `src/components/chatbot/ModeSelector.tsx` — displays Learn/Candidate/Debate mode options, shows lock icon on Debate mode if survey not completed, handles mode switching
- [x] T055 [US3] Create ChatbotPanel component in `src/components/chatbot/ChatbotPanel.tsx` — full chat interface: ModeSelector, message list with MessageBubble, text input, send button, streaming indicator; handles "Ask about this in chat" preloaded context (FR-010)
- [x] T056 [US3] Integrate chatbot overlay into root layout in `src/app/_layout.tsx` — add ChatbotFAB and ChatbotPanel as persistent overlay rendered above all screens, manage open/close state
- [x] T057 [US3] Add "Ask about this in chat" integration on Learn page — tappable action on PositionCard in `src/components/candidates/PositionCard.tsx` that opens chatbot with preloaded context (FR-010, spec US3 scenario 6)

**Checkpoint**: User Story 3 fully functional — users can access the chatbot from any screen, ask questions in Learn mode, and receive source-grounded responses.

---

## Phase 6: User Story 4 — Candidate Bot (Priority: P4)

**Goal**: Users can select a specific candidate in the chatbot and interact with a bot that speaks strictly within that candidate's documented positions, maintaining their communication style.

**Independent Test**: A user selects a candidate bot, asks questions about policies, and receives responses sourced from that candidate's program — without needing the survey or debate mode.

**Dependencies**: Requires Phase 5 (chatbot infrastructure: store, service, panel, FAB).

### Implementation for User Story 4

- [x] T058 [US4] Create Candidate mode system prompt in `src/services/prompts/candidate-mode.ts` — system prompt template that constrains responses to selected candidate's positions only, uses candidate's communicationStyle for tone, enforces "no documented position" for missing topics (FR-013), declines cross-candidate comparisons; includes off-topic query redirect per Edge Case 4
- [x] T059 [US4] Add candidate selection UI to ModeSelector in `src/components/chatbot/ModeSelector.tsx` — when Candidate mode is selected, show candidate picker list from election store, set selectedCandidateId in chatbot store
- [x] T060 [US4] Extend chatbot service for Candidate mode in `src/services/chatbot.ts` — filter ElectionContext to include only the selected candidate's positions, pass candidateId in ChatRequest, handle mode-specific system prompt selection

**Checkpoint**: User Story 4 fully functional — users can talk to individual candidate bots that stay in character and only cite their own documented positions.

---

## Phase 7: User Story 5 — Socratic Debate (Priority: P5)

**Goal**: Users who completed the survey can enter Debate mode where a Socratic agent challenges their preferences, detects contradictions, highlights trade-offs, and helps refine their thinking — without prescribing outcomes.

**Independent Test**: A user who completed the survey enters Debate mode, receives challenges based on their preference profile, and refines their positions — without needing Learn page or candidate bots.

**Dependencies**: Requires Phase 4 (survey results for user profile) and Phase 5 (chatbot infrastructure).

### Implementation for User Story 5

- [x] T061 [US5] Create Debate mode system prompt in `src/services/prompts/debate-mode.ts` — system prompt template that loads user's themeScores, importanceWeights, and contradictions (per UserProfileSummary in contracts/chatbot.ts); uses Socratic questioning only (FR-014); never steers toward specific candidate; references dataset sources for trade-offs; includes off-topic query redirect per Edge Case 4
- [x] T062 [US5] Extend chatbot service for Debate mode in `src/services/chatbot.ts` — build UserProfileSummary from survey store, include in ChatRequest, handle survey-not-completed guard (redirect to survey or offer general debate)
- [x] T063 [US5] Update ModeSelector for Debate mode gating in `src/components/chatbot/ModeSelector.tsx` — check survey store status, show "Complete survey first" prompt if status is not "completed", enable Debate mode selection when survey is done

**Checkpoint**: User Story 5 fully functional — users with survey results can engage in Socratic debate that challenges their thinking without prescribing answers.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, performance, and deployment readiness.

- [ ] T064 [P] Add WCAG 2.1 AA accessibility audit across all screens — verify 4.5:1 contrast ratios, 44x44pt touch targets, screen reader compatibility with VoiceOver/TalkBack, keyboard navigation, focus indicators (FR-020)
- [ ] T065 [P] Performance optimization — verify <100ms screen transitions, <2s cold start, 60fps scrolling, <3s chatbot first-token response; optimize SQLite queries and list rendering with FlashList if needed
- [ ] T066 Add OTA dataset update capability in `src/data/loader.ts` — check remote endpoint for dataset version changes, download updated JSON, re-load into SQLite without app store update (Edge Case 2)
- [x] T067 [P] Handle partial dataset gracefully — display clear indicators when candidate data is incomplete, disable comparison for missing candidates (Edge Case 5), show "Pas de position documentee" for missing positions (Edge Case 1)
- [ ] T068 [P] Create chatbot evaluation test set and run against all 3 modes — curated questions per mode (Learn, Candidate, Debate) covering source citation accuracy, off-topic redirect, neutrality, and "information unavailable" responses (Constitution: Development Workflow)
- [ ] T069 Run full E2E test suite with Detox and validate against quickstart.md setup instructions; verify no hardcoded French strings (all UI text through i18n per FR-019)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 2; uses CandidateCard from US1 for results display
- **US3 (Phase 5)**: Depends on Phase 2; uses election store data
- **US4 (Phase 6)**: Depends on Phase 5 (chatbot infrastructure)
- **US5 (Phase 7)**: Depends on Phase 4 (survey results) AND Phase 5 (chatbot infrastructure)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├──────────────────────┬──────────────────────┐
    ▼                      ▼                      ▼
Phase 3 (US1: Learn)   Phase 4 (US2: Survey)   Phase 5 (US3: Chatbot Learn)
    │                      │                      │
    │                      │                      ├───────────────┐
    │                      │                      ▼               │
    │                      │               Phase 6 (US4:          │
    │                      │               Candidate Bot)         │
    │                      │                                      │
    │                      └──────────────────────────────────────┐│
    │                                                             ▼▼
    │                                                     Phase 7 (US5:
    │                                                     Debate Mode)
    │                                                             │
    └─────────────────────────────────────────────────────────────┤
                                                                  ▼
                                                          Phase 8 (Polish)
```

### Within Each User Story

- Tests written first (TDD where tests exist)
- Shared components/services before screen-level integration
- Pure logic (matching, contradiction) before UI that consumes it
- Store before components that depend on it

### Parallel Opportunities

- **Phase 1**: T004, T005, T006 can all run in parallel
- **Phase 2**: T008–T014 (all dataset JSON files) can all run in parallel; T017+T018 (i18n) in parallel; T020+T021 (utils) in parallel
- **Phase 3**: T023+T024 (tests) in parallel; T025+T026+T027 (components) in parallel
- **Phase 4**: T033+T034+T035+T036 (tests) in parallel; T037+T038 (services) in parallel; T040+T041+T042 (components) in parallel
- **Phase 5**: T047+T048 (tests) in parallel; T052+T053 (components) in parallel; T057 can run after T055
- **Phase 3, 4, 5**: US1, US2, US3 can start in parallel after Phase 2 completes (if team allows)
- **Phase 8**: T064, T065, T067, T068 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for US1 together:
Task: "Component tests for CandidateList in tests/component/CandidateList.test.tsx"
Task: "E2E test for browse-candidates in tests/e2e/browse-candidates.test.ts"

# Launch independent components together:
Task: "SourceReference component in src/components/ui/SourceReference.tsx"
Task: "ThemeFilter component in src/components/ui/ThemeFilter.tsx"
Task: "CandidateCard component in src/components/candidates/CandidateCard.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch all tests together:
Task: "Matching algorithm tests in tests/unit/matching.test.ts"
Task: "Contradiction detection tests in tests/unit/contradiction.test.ts"
Task: "QuestionCard component tests in tests/component/QuestionCard.test.tsx"
Task: "Survey E2E test in tests/e2e/complete-survey.test.ts"

# Launch independent services together:
Task: "Matching algorithm in src/services/matching.ts"
Task: "Contradiction detection in src/services/contradiction.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 — Explore Election Information
4. **STOP and VALIDATE**: Users can browse candidates, filter by theme, read sourced positions, compare side-by-side
5. Deploy/demo if ready — the app is a useful standalone election guide

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Learn page) → Test independently → Deploy (MVP!)
3. Add US2 (Survey + matching) → Test independently → Deploy
4. Add US3 (Chatbot Learn mode) → Test independently → Deploy
5. Add US4 (Candidate bots) → Test independently → Deploy
6. Add US5 (Socratic debate) → Test independently → Deploy
7. Polish → Final validation → Release

### Single Developer Strategy (Recommended for MVP)

Sequential execution in priority order:
1. Phase 1 → Phase 2 → Phase 3 (US1) → **validate MVP**
2. Phase 4 (US2) → **validate survey flow**
3. Phase 5 (US3) → Phase 6 (US4) → **validate chatbot**
4. Phase 7 (US5) → **validate debate mode**
5. Phase 8 → **final polish and release**

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Paris 2026 dataset is placeholder data for development — real editorial content comes separately
- Constitution principles are hard gates: Neutrality (FR-005, FR-009), Source-Grounded (FR-002), City-Agnostic (FR-018), Privacy (FR-015)
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently

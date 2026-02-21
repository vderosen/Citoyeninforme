# Tasks: Rapid Debate Mode

**Input**: Design documents from `/specs/017-rapid-debate-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in the specification. No test tasks included.

**Organization**: Tasks grouped by user story (P1-P4) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

## Phase 1: Setup

**Purpose**: i18n keys and shared configuration needed by all stories

- [x] T001 Add debate-specific i18n translation keys (theme grid title, loading text, button labels "Terminer le débat"/"Nouveau débat"/"Retour"/"Réessayer", conclusion section headers, error messages) in src/i18n/locales/fr/assistant.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, state management, prompt builder, service, and base UI component that ALL user stories depend on

- [x] T002 Add debate types (DebateTurn, DebateOption, DebateSource, DebateSummary, CandidateProximityEntry) and debate state slice (debateTurns, isDebateActive, isGeneratingTurn, debateStartThemeId) with actions (startDebate, selectDebateOption, addDebateTurn, setGeneratingTurn, endDebate, resetDebate) to src/stores/assistant.ts — exclude debate fields from persistence partialize per FR-012
- [x] T003 [P] Create buildDebateTurnPrompt() function in src/services/prompts/debattre-mode.ts — instructs LLM to respond exclusively in JSON matching the DebateTurn schema, includes JSON schema definition, example response, turn number injection (for conclusion suggestion at turn 5-7), user profile context (contradictions + themeScores), and election data (candidates + positions + themes)
- [x] T004 [P] Create DebateOptionButton component in src/components/assistant/DebateOptionButton.tsx — wraps PressableScale with letter prefix display (a/b/c/d), three visual states (selectable/selected/disabled), onPress handler, and NativeWind styling consistent with app design
- [x] T005 Create debate service with generateDebateTurn() in src/services/debate.ts — sends POST to existing /api/chat SSE endpoint, accumulates SSE text chunks into complete response string, strips SSE event markers, parses JSON, validates structure (2-4 options for non-conclusion, required fields present, correct types), retries once on parse failure, throws typed error on second failure. Uses buildDebateTurnPrompt() from debattre-mode.ts

**Checkpoint**: Foundation ready — all debate types defined, store extended, service operational, base UI component available

---

## Phase 3: User Story 1 — Rapid Debate via Multiple-Choice (Priority: P1)

**Goal**: A user with a completed survey can enter "Debattre" mode and engage in a fast-paced Socratic debate by tapping options. Each turn builds on the full history. The debate flows with loading indicators and a "Terminer" button.

**Independent Test**: Select "Debattre" mode with a completed survey, complete 5 turns using only tap interactions, verify each turn presents a coherent argument and contextually relevant options, verify loading indicator appears between turns.

### Implementation

- [x] T006 [US1] Create DebateTurnCard component in src/components/assistant/DebateTurnCard.tsx — displays AI statement text bubble and a list of DebateOptionButton components for the current (unanswered) turn; for past turns, shows statement + only the selected option text in a distinct muted style with checkmark icon
- [x] T007 [US1] Create DebateArea component in src/components/assistant/DebateArea.tsx — main debate container with: (1) auto-start logic that calls generateDebateTurn using survey profile contradictions as startThemeId when isDebateActive is false and user has profile, (2) FlatList rendering DebateTurnCards from debateTurns store array, (3) option selection handler that calls selectDebateOption then triggers generateDebateTurn for next turn, (4) loading indicator (ActivityIndicator + i18n text) shown when isGeneratingTurn is true, (5) "Terminer le debat" button visible when debate is active and turnCount >= 1
- [x] T008 [US1] Modify src/app/(tabs)/assistant.tsx to conditionally render DebateArea instead of ChatArea when mode is "debattre" — import DebateArea, add mode check in render logic, hide TextInput/send area for debate mode

**Checkpoint**: Core debate loop functional — user can start debate (with survey), select options across multiple turns, see loading state, and tap "Terminer"

---

## Phase 4: User Story 2 — Theme-Based Debate Start Without Survey (Priority: P2)

**Goal**: Users without a completed survey see a grid of 8 election themes and can tap one to start a debate focused on that theme.

**Independent Test**: As a new user (no survey data), enter "Debattre" mode, verify theme grid displays 8 themes with icons, tap a theme, verify first AI turn is relevant to that theme.

### Implementation

- [x] T009 [P] [US2] Create DebateThemeGrid component in src/components/assistant/DebateThemeGrid.tsx — 2-column grid of 8 theme cards loaded from election dataset themes.json, each card displays theme icon (Ionicons) + localized theme name, PressableScale wrapper for tap feedback, onSelectTheme(themeId) callback prop, title text from i18n
- [x] T010 [US2] Integrate DebateThemeGrid into DebateArea in src/components/assistant/DebateArea.tsx — render DebateThemeGrid when !isDebateActive && user has no survey profile, on theme selection call startDebate(themeId) and trigger generateDebateTurn with startThemeId parameter

**Checkpoint**: Both entry paths work — survey users auto-start, non-survey users select theme first

---

## Phase 5: User Story 3 — Debate Conclusion with Candidate Proximity (Priority: P3)

**Goal**: When a debate concludes, a structured summary screen shows themes explored, key insight about argumentation patterns, and factual candidate proximity (when justified). User can start a new debate or return.

**Independent Test**: Complete a full debate (5+ turns), trigger conclusion (tap "Terminer" or select conclusion option), verify conclusion displays themes, insight, and justified candidate proximity entries.

### Implementation

- [x] T011 [P] [US3] Add buildConclusionPrompt() function in src/services/prompts/debattre-mode.ts — instructs LLM to generate conclusion JSON with themesExplored array, keyInsight paragraph, and optional candidateProximity entries; includes instruction that proximity must reference specific debate positions matched to documented candidate positions; includes "never recommend, only inform" directive per Constitution Principle I
- [x] T012 [US3] Add generateConclusion() function to src/services/debate.ts — sends full debate history with conclusion instruction, parses conclusion JSON, validates summary structure (themesExplored non-empty, keyInsight non-empty, candidateProximity entries reference valid candidateIds), same retry-once strategy as generateDebateTurn
- [x] T013 [P] [US3] Create DebateConclusionCard component in src/components/assistant/DebateConclusionCard.tsx — displays: section header, themes explored as horizontal chips/tags, key insight as styled paragraph, candidate proximity entries (each with candidate name + avatar via existing CandidateAvatar component + justification text), "Nouveau debat" primary button and "Retour" secondary button at bottom
- [x] T014 [US3] Integrate conclusion flow into DebateArea in src/components/assistant/DebateArea.tsx — when endDebate is called or user selects a conclusion option: set isGeneratingTurn, call generateConclusion, add conclusion turn to debateTurns; render DebateConclusionCard when last turn has isConclusion=true; handle "Nouveau debat" (resetDebate → restart) and "Retour" (resetDebate → switch mode to "comprendre")

**Checkpoint**: Full debate lifecycle complete — start, turns, conclusion with candidate proximity, restart or exit

---

## Phase 6: User Story 4 — Debate History Within a Session (Priority: P4)

**Goal**: Past turns are clearly visible with the selected option highlighted. History is scrollable. Debate state clears on mode switch.

**Independent Test**: Complete 3+ turns, scroll up, verify past turns show AI statement + selected option only (not all options) in distinct style. Switch modes and verify debate state clears.

### Implementation

- [x] T015 [US4] Enhance DebateTurnCard past-turn rendering in src/components/assistant/DebateTurnCard.tsx — ensure past turns show only the selected option text (not all options that were available), use muted background color and checkmark icon for selected option, add subtle separator between turns, auto-scroll FlatList to bottom on new turn
- [x] T016 [US4] Implement debate state clearing on mode switch in src/app/(tabs)/assistant.tsx — call resetDebate() when user switches away from "debattre" mode via ModeSelector, ensuring a fresh start when returning to debate mode

**Checkpoint**: History polish complete — clean visual hierarchy, auto-scroll, mode-switch clearing

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, performance, and final validation

- [x] T017 Implement context summarization for long debates (>10 turns) in src/services/debate.ts — when building the LLM prompt, summarize the first N-5 turns into a single "conversation so far" system message to keep within context limits; full turn history remains in UI (only the prompt sent to LLM is shortened)
- [x] T018 Add error handling UI in src/components/assistant/DebateArea.tsx — display user-friendly error message with "Reassayer" button when generateDebateTurn or generateConclusion throws after retry; show 15-second timeout message if generation exceeds threshold; handle option count validation failure gracefully
- [ ] T019 Run quickstart.md manual testing checklist (manual — requires running app) — verify all 10 scenarios from specs/017-rapid-debate-mode/quickstart.md testing section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) for i18n keys — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion — core debate loop
- **US2 (Phase 4)**: Depends on Phase 2 completion — can run in parallel with US1 (T009 is independent)
- **US3 (Phase 5)**: Depends on Phase 2 completion — can start after US1 for integration (T011, T013 are independent)
- **US4 (Phase 6)**: Depends on US1 (Phase 3) — refines existing DebateTurnCard and DebateArea
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Can start after Phase 2 — independent of US1 (DebateThemeGrid is a standalone component)
- **US3 (P3)**: Can start after Phase 2 (prompt + service tasks) — integration task (T014) requires US1's DebateArea
- **US4 (P4)**: Requires US1 complete — refines components created in US1

### Within Each User Story

- Services before UI components that consume them
- Standalone components (marked [P]) before integration tasks
- Core implementation before integration wiring

### Parallel Opportunities

- **Phase 2**: T003 (prompt builder) and T004 (DebateOptionButton) can run in parallel
- **Phase 4**: T009 (DebateThemeGrid) can start in parallel with Phase 3 tasks
- **Phase 5**: T011 (conclusion prompt) and T013 (DebateConclusionCard) can run in parallel

---

## Parallel Example: Phase 2 Foundation

```bash
# These two tasks can run simultaneously (different files, no dependencies):
Task T003: "Create buildDebateTurnPrompt() in src/services/prompts/debattre-mode.ts"
Task T004: "Create DebateOptionButton in src/components/assistant/DebateOptionButton.tsx"

# Then T005 depends on T003:
Task T005: "Create debate service in src/services/debate.ts"
```

## Parallel Example: User Story 3

```bash
# These two tasks can run simultaneously (different files):
Task T011: "Add buildConclusionPrompt() in src/services/prompts/debattre-mode.ts"
Task T013: "Create DebateConclusionCard in src/components/assistant/DebateConclusionCard.tsx"

# Then T012 depends on T011, and T014 depends on T012 + T013:
Task T012: "Add generateConclusion() to src/services/debate.ts"
Task T014: "Integrate conclusion flow into DebateArea"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (i18n keys)
2. Complete Phase 2: Foundational (types, store, service, base component)
3. Complete Phase 3: User Story 1 (core debate loop)
4. **STOP and VALIDATE**: Test debate loop with survey user — 5 turns, tap-only, loading indicators
5. Demo-ready with survey-based auto-start path

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. Add US1 → Test core debate loop → Demo (MVP!)
3. Add US2 → Test theme grid start → Now accessible to all users
4. Add US3 → Test conclusion screen → Full debate lifecycle
5. Add US4 → Test history polish → Polished experience
6. Polish → Error handling, long debate support → Production-ready

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- No test tasks included — tests were not requested in the specification
- Debate state is ephemeral (FR-012) — no persistence tasks needed
- No backend/proxy changes required — all client-side implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

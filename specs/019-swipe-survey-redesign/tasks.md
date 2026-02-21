# Tasks: Swipe Survey Redesign

**Input**: Design documents from `/specs/019-swipe-survey-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in spec — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add direct dependency and prepare project for swipe gesture support

- [x] T001 Add react-native-gesture-handler as an explicit direct dependency in package.json (already transitive via expo-router; pin to ^2.28.0)
- [x] T002 Wrap the app root with GestureHandlerRootView in src/app/_layout.tsx if not already present

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data types, statement card dataset, data loading, adapter service — MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Add StatementCard interface and SwipeDirection type to src/data/schema.ts — fields: id, electionId, text, themeIds, baseScores (Record<string, number>), order; SwipeDirection = "agree" | "disagree" | "strongly_agree" | "strongly_disagree"
- [x] T004 [P] Add statementCards field (StatementCard[]) to ElectionDataset interface in src/data/schema.ts
- [x] T005 [P] Create statement-cards.json in src/data/elections/paris-2026/statement-cards.json — ~18 political affirmation cards (2–3 per theme, some cross-theme) following the data-model.md distribution table; all texts in French, neutral phrasing per Constitution I
- [x] T006 Update loadBundledDataset() in src/data/loader.ts to import and include statement-cards.json in the returned ElectionDataset; add validation for StatementCard[] (required fields, themeId references)
- [x] T007 Add statementCards field and getStatementCards() accessor to the election store in src/stores/election.ts; sort by order field in loadDataset()
- [x] T008 Create swipe-adapter.ts in src/services/swipe-adapter.ts — implement statementCardsToQuestionDefs(cards: StatementCard[]): QuestionDefinition[] and statementCardsToSurveyQuestions(cards: StatementCard[]): SurveyQuestion[] per data-model.md adapter spec (4 options per card with direction multipliers: ×1, ×-1, ×2, ×-2)
- [x] T009 Add swipe-related i18n keys to src/i18n/locales/fr/survey.json — keys: swipeAgree ("D'accord"), swipeDisagree ("Pas d'accord"), swipeStronglyAgree ("Coup de cœur"), swipeStronglyDisagree ("Catastrophe"), swipeInstruction, undoLabel, cardProgress

**Checkpoint**: Foundation ready — StatementCard type defined, dataset created, loader updated, adapter service working, election store serves statement cards

---

## Phase 3: User Story 1 — Swipe Through Statement Cards (Priority: P1) 🎯 MVP

**Goal**: Replace the multiple-choice questionnaire with a card stack where users swipe in 4 directions to express opinions on political statements

**Independent Test**: Swipe through all ~18 cards in 4 different directions and verify each swipe direction is recognized and recorded correctly in the store

### Implementation for User Story 1

- [x] T010 [US1] Modify useSurveyStore in src/stores/survey.ts — add clearAnswer(cardId: string) action that deletes answers[cardId] and decrements currentQuestionIndex; keep existing answerQuestion/nextQuestion actions compatible with swipe flow (answerQuestion records "{cardId}-{direction}" option IDs)
- [x] T011 [US1] Create SwipeCard.tsx in src/components/survey/SwipeCard.tsx — a single card component using Gesture.Pan() from react-native-gesture-handler + react-native-reanimated animated styles; displays statement text, theme icon (from Ionicons), and theme name; detects swipe direction on gesture end using dominant-axis + threshold logic from research.md R2 (120px dead zone, velocity boost at 800px/s); calls onSwipe(cardId, direction) callback; animates card off-screen in swiped direction via withSpring/withTiming
- [x] T012 [US1] Create SwipeStack.tsx in src/components/survey/SwipeStack.tsx — orchestrates the card stack: receives StatementCard[] and currentIndex from store; renders current SwipeCard on top with 1-2 preview cards behind (scaled down); on swipe completion calls store.answerQuestion(cardId, optionId) and store.nextQuestion(); tracks swipedCards array in local state for undo support (Phase 6)
- [x] T013 [US1] Rewrite src/app/survey/questions.tsx — replace QuestionCard-based flow with SwipeStack; load statementCards from election store (shuffled via existing shuffle util); pass cards and current index to SwipeStack; show ProgressBar with card count (current/total); on last card swiped, trigger computeResults() using swipe adapter

**Checkpoint**: At this point, User Story 1 should be fully functional — users can swipe through all cards in 4 directions, responses are stored, and progress is tracked

---

## Phase 4: User Story 2 — Visual Feedback During Swipe (Priority: P2)

**Goal**: Provide real-time visual feedback during drag so users know which action their swipe will trigger before releasing

**Independent Test**: Slowly drag a card in each of the 4 directions; verify the correct directional overlay appears (icon + label + color tint) with opacity proportional to drag distance; verify the card tilts in the drag direction; verify releasing below threshold snaps card back

### Implementation for User Story 2

- [x] T014 [US2] Create SwipeOverlay.tsx in src/components/survey/SwipeOverlay.tsx — renders 4 directional overlays (right: green ✓ "D'accord", left: red ✗ "Pas d'accord", up: gold ❤️ "Coup de cœur", down: dark ⚡ "Catastrophe"); each overlay's opacity is an animated value driven by drag displacement (opacity = clamp(displacement / threshold, 0, 1)); only the dominant direction overlay is visible at any time
- [x] T015 [US2] Integrate SwipeOverlay into SwipeCard.tsx — pass translationX and translationY shared values to SwipeOverlay; add card rotation animation (rotation = translationX / 20 degrees) via useAnimatedStyle; ensure snap-back animation (withSpring to origin) when released below threshold fires with no response recorded

**Checkpoint**: Visual feedback is fully working — overlays, tilt, snap-back all driven by gesture position

---

## Phase 5: User Story 3 — Accessible Button Alternatives (Priority: P3)

**Goal**: Provide 4 clearly labeled buttons below the card stack as alternatives to swipe gestures for users with motor impairments

**Independent Test**: Complete the entire survey using only the 4 buttons (no swipe gestures) and verify all responses are correctly recorded with identical behavior to swipes

### Implementation for User Story 3

- [x] T016 [US3] Create SwipeButtons.tsx in src/components/survey/SwipeButtons.tsx — 4 buttons in a row: "Pas d'accord" (left), "Catastrophe" (down), "Coup de cœur" (up), "D'accord" (right); each button has its icon, label, and color matching the overlay; buttons call onButtonPress(direction: SwipeDirection) callback; include accessibilityLabel and accessibilityRole="button" on each
- [x] T017 [US3] Integrate SwipeButtons into SwipeStack.tsx — render SwipeButtons below the card stack; on button press, trigger the same card exit animation as a swipe (animate card off-screen in corresponding direction) then record the answer via the same store actions; disable buttons during animation

**Checkpoint**: Survey is fully completable via buttons alone — identical behavior to swipe input

---

## Phase 6: User Story 4 — Undo Last Swipe (Priority: P4)

**Goal**: Allow users to undo their most recent swipe to correct accidental inputs

**Independent Test**: Swipe a card, tap undo, verify the card returns to the stack and the previous response is cleared; swipe it in a different direction and verify the new response is recorded

### Implementation for User Story 4

- [x] T018 [US4] Add undo button UI and logic to SwipeStack.tsx — show an undo button (Ionicons "arrow-undo" icon) above or beside the card stack; visible only when swipedCards.length > 0; on press: pop last entry from swipedCards, call store.clearAnswer(cardId), decrement currentQuestionIndex, animate the card back from off-screen edge to center via reverse spring animation; disable undo button during animation
- [x] T019 [US4] Update ProgressBar in src/components/survey/ProgressBar.tsx to handle decrementing progress correctly when undo is triggered (ensure it reacts to currentQuestionIndex changes in both directions)

**Checkpoint**: Undo works for the most recent swipe — card returns, response cleared, progress updated

---

## Phase 7: User Story 5 — Results Integration (Priority: P5)

**Goal**: Feed swipe responses through the existing matching algorithm and contradiction detection to produce theme profiles and candidate rankings

**Independent Test**: Complete the swipe survey and verify that results show coherent theme scores, candidate ranking with alignment percentages, and detected contradictions matching the quickstart.md scenarios

### Implementation for User Story 5

- [x] T020 [US5] Update computeResults() in src/app/survey/questions.tsx — use swipeAdapter.statementCardsToQuestionDefs(statementCards) to convert cards to QuestionDefinition[]; pass { answers, importanceWeights: {}, questions: adapted, candidates: candidatePositions } to computeMatching(); use swipeAdapter.statementCardsToSurveyQuestions(statementCards) for detectContradictions(themeScores, answers, adaptedSurveyQuestions); store results via setResults()
- [x] T021 [US5] Verify results screen (src/app/survey/results.tsx) renders correctly with swipe-derived data — no code changes expected but verify that ResultsProfile, AlignmentRanking, ContradictionCard, and TieExplanation components handle the adapter output without issues

**Checkpoint**: End-to-end flow works — swipe survey → adapter → matching → contradiction detection → results screen

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, reduced motion, resume support, and cleanup

- [x] T022 [P] Add reduced motion support to SwipeCard.tsx — check useReducedMotion() (or useMotionPreference hook if it exists); when reduced motion is active: disable card rotation and flight animation, use opacity fade-out instead (opacity → 0 via withTiming), keep overlay feedback static (no animated opacity), document behavior per research.md R5
- [x] T023 [P] Verify resume-incomplete-survey behavior in SwipeStack.tsx — on mount, if store.currentQuestionIndex > 0 and answers has entries, skip already-answered cards and show the next unanswered card; ensure swipedCards local state is not populated for previously answered cards (undo is only available for current session swipes)
- [x] T024 [P] Add card shuffle randomization in questions.tsx — use existing src/utils/shuffle.ts to shuffle statementCards before passing to SwipeStack; ensure shuffle is deterministic per session (seed with dataset version or use a session-level seed stored in component state) so resume shows the same order
- [x] T025 Deprecate QuestionCard component — add a comment at the top of src/components/survey/QuestionCard.tsx marking it as deprecated (no longer imported by the swipe flow); do NOT delete it to preserve backward reference

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–7)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Phase 2
  - US2 (P2): Depends on US1 (SwipeCard must exist to add overlays)
  - US3 (P3): Depends on US1 (SwipeStack must exist to add buttons)
  - US4 (P4): Depends on US1 (SwipeStack must exist to add undo)
  - US5 (P5): Depends on US1 (questions.tsx must be rewritten)
- **Polish (Phase 8)**: Depends on US1+US2 being complete (SwipeCard needs to exist for reduced motion/resume)

### User Story Dependencies

- **US1 (P1)**: Foundational only → MVP
- **US2 (P2)**: US1 → SwipeCard.tsx must exist
- **US3 (P3)**: US1 → SwipeStack.tsx must exist (can run parallel with US2)
- **US4 (P4)**: US1 → SwipeStack.tsx must exist (can run parallel with US2/US3)
- **US5 (P5)**: US1 → questions.tsx must be rewritten (can run parallel with US2/US3/US4)

### Within Each User Story

- Models/types before services
- Services before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 2**: T003, T004, T005, T009 can all run in parallel (different files)
- **After US1**: US3, US4, US5 can potentially run in parallel (different files, but depend on US1 SwipeStack structure)
- **Phase 8**: T022, T023, T024 can all run in parallel (different concerns within existing files)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# These 4 tasks touch different files and can run in parallel:
T003: "Add StatementCard + SwipeDirection types to src/data/schema.ts"
T004: "Add statementCards to ElectionDataset in src/data/schema.ts"  # Same file as T003 — run together or sequentially
T005: "Create statement-cards.json in src/data/elections/paris-2026/"
T009: "Add swipe i18n keys to src/i18n/locales/fr/survey.json"

# Then sequentially (depend on T003/T004):
T006: "Update loader.ts (needs StatementCard type)"
T007: "Update election store (needs StatementCard type)"
T008: "Create swipe-adapter.ts (needs StatementCard + QuestionDefinition types)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dependency + root wrapper)
2. Complete Phase 2: Foundational (types, data, loader, adapter, store, i18n)
3. Complete Phase 3: User Story 1 (SwipeCard, SwipeStack, questions.tsx rewrite)
4. **STOP and VALIDATE**: Test swiping through all cards in all 4 directions
5. Deploy/demo if ready — basic swipe survey works end-to-end

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Swipe works → **MVP!**
3. Add US2 → Visual feedback during drag → better UX
4. Add US3 → Button alternatives → accessibility
5. Add US4 → Undo → error correction
6. Add US5 → Results integration → full pipeline
7. Polish → Reduced motion, resume, shuffle, cleanup

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The matching and contradiction services are NOT modified — the adapter bridges all differences
- Statement card content must follow Constitution Principle I (Neutrality) — neutral phrasing, no leading language
- The existing `importanceWeights` field is deprecated — empty object `{}` is passed to matching (defaults to 0.5)
- Card count (~18) targets <2 minutes completion (SC-001: ~5 seconds per card)

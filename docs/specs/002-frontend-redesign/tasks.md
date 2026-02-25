# Tasks: Frontend Redesign

**Input**: Design documents from `/specs/002-frontend-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec. Tests are omitted from user story phases. Existing unit tests (matching, loader, contradiction) remain unchanged.

**Organization**: Tasks are grouped by user story (P1-P7) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Route Restructuring)

**Purpose**: Migrate from flat routes (`index.tsx`, `learn.tsx`) and floating chatbot to `(tabs)/` group layout with stack screens. All new screens are minimal placeholders to establish the routing structure.

- [x] T001 Create `src/app/(tabs)/_layout.tsx` with 3-tab bottom navigation (Accueil at index 0, Assistant at index 1, Candidats at index 2) using Expo Router `Tabs` component per research.md R-001
- [x] T002 [P] Create `src/app/(tabs)/index.tsx` as placeholder Home tab screen (minimal View with title text)
- [x] T003 [P] Create `src/app/(tabs)/assistant.tsx` as placeholder Assistant tab screen
- [x] T004 [P] Create `src/app/(tabs)/candidates.tsx` as placeholder Candidates tab screen
- [x] T005 Update `src/app/_layout.tsx` to nest `(tabs)` group inside root Stack, configure stack screens for candidate/[id], comparison, survey/*, and onboarding above tabs
- [x] T006 [P] Create `src/app/candidate/[id].tsx` as placeholder candidate profile stack screen
- [x] T007 [P] Create `src/app/comparison.tsx` as placeholder comparison stack screen
- [x] T008 Rename `src/app/survey/context.tsx` to `src/app/survey/intro.tsx` and update `src/app/survey/_layout.tsx` references
- [x] T009 [P] Create `src/app/onboarding.tsx` as placeholder onboarding stack screen
- [x] T010 Delete `src/app/learn.tsx` (superseded by candidates tab + assistant tab)
- [x] T011 Delete `src/components/chatbot/ChatbotFAB.tsx` and `src/components/chatbot/ChatbotPanel.tsx` (superseded by assistant tab per research.md R-005)

**Checkpoint**: App boots with 3-tab navigation. All tabs and stack screens render placeholder content. Old `learn.tsx` route and floating chatbot components are removed.

---

## Phase 2: Foundational (Stores, Services, Shared Components, i18n)

**Purpose**: Create and modify all shared infrastructure that user stories depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Stores

- [x] T012 [P] Create `src/stores/app.ts` with AppStore (hasCompletedOnboarding: boolean, lastActiveTab: string) persisted via MMKV zustandStorage per contracts/store-interfaces.md
- [x] T013 [P] Rename `src/stores/chatbot.ts` to `src/stores/assistant.ts` and refactor to AssistantStore interface: add mode ("comprendre"/"parler"/"debattre"), preloadedContext, conversation persistence via MMKV, consumePreloadedContext(), resetConversation() per contracts/store-interfaces.md. Update all import references in `src/services/chatbot.ts` and any other files importing the old store
- [x] T014 [P] Modify `src/stores/survey.ts` to persist in-progress state (status, currentQuestionIndex, answers, importanceWeights) via MMKV and add datasetVersion field + isResultsStale(currentVersion) method per contracts/store-interfaces.md

### Services

- [x] T015 [P] Create `src/services/feedback.ts` with submitFeedback(), getFeedbackEntries(), clearFeedbackEntries() using direct MMKV access per contracts/store-interfaces.md
- [x] T016 [P] Rename prompt files: `src/services/prompts/learn-mode.ts` → `comprendre-mode.ts`, `src/services/prompts/candidate-mode.ts` → `parler-mode.ts`, `src/services/prompts/debate-mode.ts` → `debattre-mode.ts`. Update mode identifiers inside each file
- [x] T017 Update `src/services/chatbot.ts` import references to use renamed prompt files from T016 (service logic itself unchanged)

### i18n

- [x] T018 [P] Rename `src/i18n/locales/fr/chatbot.json` to `src/i18n/locales/fr/assistant.json` and update keys for new mode names (comprendre/parler/debattre)
- [x] T019 [P] Create `src/i18n/locales/fr/candidates.json` with candidate gallery, profile, filter, and action labels
- [x] T020 [P] Create `src/i18n/locales/fr/comparison.json` with comparison view labels and states
- [x] T021 [P] Create `src/i18n/locales/fr/onboarding.json` with onboarding flow copy
- [x] T022 Update `src/i18n/locales/fr/common.json` with shared UI labels (badge text, state messages, feedback prompts) and update `src/i18n/index.ts` to register new namespaces (assistant, candidates, comparison, onboarding) and remove old ones (chatbot, learn)

### Shared Components

- [x] T023 [P] Create `src/components/shared/TrustBadge.tsx` with source/non_documente/incertain variants per contracts/component-interfaces.md
- [x] T024 [P] Create `src/components/shared/EmptyState.tsx` with icon, title, description, and optional action per contracts/component-interfaces.md
- [x] T025 [P] Create `src/components/shared/LoadingState.tsx` with optional message per contracts/component-interfaces.md
- [x] T026 [P] Create `src/components/shared/ErrorState.tsx` with title, description, and recovery action per contracts/component-interfaces.md
- [x] T027 [P] Create `src/components/shared/FeedbackAction.tsx` with screen context and feedback type selector per contracts/component-interfaces.md, calling submitFeedback() from `src/services/feedback.ts`
- [x] T028 [P] Move and refactor `src/components/ui/SourceReference.tsx` to `src/components/shared/SourceReference.tsx` with compact/expanded display variants per contracts/component-interfaces.md. Update all existing import references

### Shell Components

- [x] T029 Create `src/components/shell/ContextBar.tsx` reading from useElectionStore to display city, election year, and last update date per contracts/component-interfaces.md. Integrate into root layout as fixed top bar

**Checkpoint**: All stores, services, shared components, and i18n namespaces are ready. App still renders placeholder screens but the infrastructure for all user stories is in place.

---

## Phase 3: User Story 1 - Discover the Election at a Glance (Priority: P1) 🎯 MVP

**Goal**: Home screen provides election context, 3 entry points, voting info, trust statement, resume prompt, and theme feed.

**Independent Test**: Open app, verify all Home screen elements render, tap each shortcut to confirm navigation, verify "resume" card conditional rendering.

### Implementation for User Story 1

- [x] T030 [P] [US1] Create `src/components/home/HeroBlock.tsx` displaying election city, year, and app description per contracts/component-interfaces.md
- [x] T031 [P] [US1] Create `src/components/home/PrimaryShortcuts.tsx` with 3 large action cards: survey (status-aware label: Commencer/Reprendre/Refaire), Voir les candidats, Poser une question per contracts/component-interfaces.md
- [x] T032 [P] [US1] Create `src/components/home/VotingInfoCard.tsx` displaying key dates, eligibility, and voting methods from ElectionLogistics per contracts/component-interfaces.md
- [x] T033 [P] [US1] Create `src/components/home/TrustCard.tsx` with neutrality statement, source policy summary, and badge legend per contracts/component-interfaces.md
- [x] T034 [P] [US1] Create `src/components/home/ResumeCard.tsx` conditionally rendering for incomplete survey or existing conversation per contracts/component-interfaces.md
- [x] T035 [P] [US1] Create `src/components/home/ThemeFeed.tsx` as horizontal scrollable theme chips navigating to Candidates tab with theme filter per contracts/component-interfaces.md
- [x] T036 [US1] Implement full Home screen in `src/app/(tabs)/index.tsx` composing HeroBlock, PrimaryShortcuts, VotingInfoCard, TrustCard, ResumeCard, ThemeFeed with navigation handlers per contracts/navigation.md (survey shortcuts, candidates, assistant, theme feed deep links)
- [x] T037 [US1] Update `src/i18n/locales/fr/home.json` with redesigned Home screen copy (hero text, shortcut labels, voting info, trust statement, resume prompts, theme feed)

**Checkpoint**: Home screen fully functional. User can see election context, tap all 3 shortcuts to navigate, see voting info, trust card, resume prompt (conditional), and theme feed.

---

## Phase 4: User Story 2 - Explore Candidates and Their Positions (Priority: P2)

**Goal**: Candidates tab shows equal-weight visual gallery. Tapping opens a full profile with positions, sources, missing markers, and actions.

**Independent Test**: Navigate to Candidates tab, verify equal-weight gallery, tap a candidate profile, check all sections (summary, positions, sources, missing markers), apply a theme filter.

### Implementation for User Story 2

- [x] T038 [P] [US2] Create `src/components/candidates/CandidateGallery.tsx` as 2-column FlatList grid with equal-weight cards, candidate photos, deterministic shuffle (daily seed via `src/utils/shuffle.ts`), and optional theme position snippets per contracts/component-interfaces.md and research.md R-006
- [x] T039 [P] [US2] Create `src/components/candidates/CandidateProfileCard.tsx` with photo+name+party header, "En bref" summary, positions by theme (collapsible), source references, missing position labels, and Comparer/Debattre action buttons per contracts/component-interfaces.md
- [x] T040 [P] [US2] Refactor `src/components/candidates/PositionCard.tsx` to integrate TrustBadge from `src/components/shared/TrustBadge.tsx` and SourceReference from `src/components/shared/SourceReference.tsx` for source/non_documente/incertain display
- [x] T041 [P] [US2] Move `src/components/ui/ThemeFilter.tsx` to `src/components/candidates/ThemeFilter.tsx` and refactor for new card-based design. Update all import references
- [x] T042 [US2] Implement Candidates tab screen in `src/app/(tabs)/candidates.tsx` with CandidateGallery, ThemeFilter, and theme query param handling (`?theme=themeId` auto-applies filter) per contracts/navigation.md
- [x] T043 [US2] Implement candidate profile screen in `src/app/candidate/[id].tsx` with CandidateProfileCard, deep link actions (Comparer → `/comparison?selected=id`, Debattre → assistant store + navigate, Ask about this → assistant context + navigate) per contracts/navigation.md
- [x] T044 [US2] Populate `src/i18n/locales/fr/candidates.json` with all candidate gallery, profile, filter, action, and empty state copy

**Checkpoint**: Candidates tab shows equal-weight gallery. Tapping a candidate opens full profile with positions, sources, and actions. Theme filter works. Deep link actions navigate correctly.

---

## Phase 5: User Story 3 - Compare Candidates Side by Side (Priority: P3)

**Goal**: Side-by-side comparison of 2+ candidates on one theme at a time with equal visual weight, source links, and disabled state.

**Independent Test**: Select 2+ candidates, view comparison on a theme, verify balanced layout, check source links, switch themes, test disabled state with insufficient data.

**Depends on**: US2 (candidate profiles provide navigation to comparison)

### Implementation for User Story 3

- [x] T045 [P] [US3] Refactor `src/components/candidates/ComparisonView.tsx` for equal-width columns per selected candidate, theme selector, source badges per column, and disabled state when <2 candidates or no positions per contracts/component-interfaces.md
- [x] T046 [US3] Implement comparison stack screen in `src/app/comparison.tsx` with candidate multi-selector, theme switching, ComparisonView, and `?selected=candidateId` param handling per contracts/navigation.md
- [x] T047 [US3] Populate `src/i18n/locales/fr/comparison.json` with comparison labels, disabled state messages, and empty position text

**Checkpoint**: Comparison view renders equal-width columns for 2+ candidates. Theme switching works. Disabled states display clear explanations.

---

## Phase 6: User Story 4 - Take the Civic Survey and Discover Alignment (Priority: P4)

**Goal**: Full survey flow: civic primer → questions with importance capture → results with alignment scores, contradictions, ties, and retake.

**Independent Test**: Start survey from Home, complete all questions, verify progress tracking, review results (alignment scores, contradiction flags, tie handling), retake, verify mid-survey persistence on app restart.

### Implementation for User Story 4

- [x] T048 [P] [US4] Create `src/components/survey/CivicPrimer.tsx` displaying civic facts with continue action per contracts/component-interfaces.md
- [x] T049 [P] [US4] Create `src/components/survey/ProgressBar.tsx` with current/total display and `accessibilityRole="progressbar"` per contracts/component-interfaces.md
- [x] T050 [P] [US4] Create `src/components/survey/ResultsProfile.tsx` displaying personal theme profile from survey results
- [x] T051 [P] [US4] Create `src/components/survey/AlignmentRanking.tsx` with equal-weight candidate cards showing alignment percentages per contracts/component-interfaces.md
- [x] T052 [P] [US4] Create `src/components/survey/TieExplanation.tsx` displaying tie explanations when 2+ candidates share identical scores per contracts/component-interfaces.md
- [x] T053 [P] [US4] Refactor `src/components/survey/QuestionCard.tsx` to add importance weight selector per theme alongside opinion selection per spec FR-018
- [x] T054 [US4] Implement survey intro screen in `src/app/survey/intro.tsx` with CivicPrimer and navigation to questions screen
- [x] T055 [US4] Update survey questions screen in `src/app/survey/questions.tsx` with ProgressBar, importance capture via refactored QuestionCard, and mid-survey persistence using updated survey store from T014
- [x] T056 [US4] Implement survey results screen in `src/app/survey/results.tsx` with ResultsProfile, AlignmentRanking, ContradictionCard (existing), TieExplanation, "Why this result" methodology section, and "Refaire le sondage" action per spec FR-020 through FR-023
- [x] T057 [US4] Update `src/i18n/locales/fr/survey.json` with civic primer text, importance labels, results copy, contradiction explanations, tie messages, and retake prompt

**Checkpoint**: Full survey flow works end-to-end. Progress bar tracks advancement. Results show alignment, contradictions, and ties. Mid-survey persistence survives app restart. Retake resets and restarts.

---

## Phase 7: User Story 5 - Ask Neutral Questions About the Election (Priority: P5)

**Goal**: Assistant tab with Comprendre mode: chat with source references, missing/uncertain markers, context-aware prompts, and off-topic redirection.

**Independent Test**: Open Assistant tab, verify Comprendre mode default, ask election questions, verify source references, test missing/uncertain markers, test off-topic redirection, test contextual entry from candidate profile.

### Implementation for User Story 5

- [x] T058 [P] [US5] Create `src/components/assistant/ModeSelector.tsx` as segmented control with Comprendre/Parler avec un candidat/Debattre buttons, `accessibilityRole="tablist"` per contracts/component-interfaces.md
- [x] T059 [P] [US5] Create `src/components/assistant/ChatArea.tsx` with scrollable message list, text input, auto-scroll on new messages, and streaming typing indicator per contracts/component-interfaces.md
- [x] T060 [P] [US5] Move and refactor `src/components/chatbot/MessageBubble.tsx` to `src/components/assistant/MessageBubble.tsx` integrating TrustBadge for inline source/non_documente/incertain display
- [x] T061 [P] [US5] Create `src/components/assistant/ContextPrompts.tsx` displaying context-aware starter prompts based on preloadedContext and mode per contracts/component-interfaces.md
- [x] T062 [US5] Implement Assistant tab screen in `src/app/(tabs)/assistant.tsx` for Comprendre mode: compose ModeSelector, ChatArea, ContextPrompts; consume preloadedContext from assistant store; connect to chatbot service SSE streaming; display source references and missing/uncertain markers per spec FR-026 and FR-027
- [x] T063 [US5] Populate `src/i18n/locales/fr/assistant.json` with mode labels, placeholder text, source display labels, missing/uncertain marker text, and off-topic redirection message

**Checkpoint**: Assistant tab defaults to Comprendre mode. Chat works with SSE streaming. Source references display on factual answers. Missing/uncertain markers show correctly. Contextual entry from other screens works.

---

## Phase 8: User Story 6 - Engage with Candidate Perspectives and Debate (Priority: P6)

**Goal**: Parler mode with candidate-bound responses and Debattre mode with survey-aware Socratic questioning. Mode guardrails prevent cross-mode confusion.

**Independent Test**: Switch to Parler, select candidate, verify responses stay within candidate positions. Switch to Debattre with/without survey results, verify trade-off questions and no candidate recommendations.

**Depends on**: US5 (assistant tab foundation)

### Implementation for User Story 6

- [x] T064 [P] [US6] Create `src/components/assistant/CandidateSelector.tsx` as horizontal list of candidate photos/names for Parler mode per contracts/component-interfaces.md
- [x] T065 [US6] Extend `src/app/(tabs)/assistant.tsx` with Parler mode: show CandidateSelector when mode is "parler", enforce selectedCandidateId requirement, pass candidate-specific system prompt to chatbot service per spec FR-028
- [x] T066 [US6] Extend `src/app/(tabs)/assistant.tsx` with Debattre mode: integrate survey profile from survey store into system prompt when available, implement fallback non-personalized debate path when no survey results, adapt to position changes per spec FR-029
- [x] T067 [US6] Implement mode guardrails in `src/stores/assistant.ts` and `src/app/(tabs)/assistant.tsx`: prevent debate-style challenges in Comprendre mode, require candidate selection in Parler mode, confirm mode switch with clear indicator per spec FR-033

**Checkpoint**: All 3 assistant modes work correctly. Parler stays within candidate positions. Debattre uses survey profile when available. Mode switches are clean with no behavioral confusion. No candidate recommendations in any mode.

---

## Phase 9: User Story 7 - Trust the Information and Navigate Accessibly (Priority: P7)

**Goal**: Consistent trust badges everywhere, onboarding flow, accessibility compliance (screen readers, contrast, text scaling, tap targets), and calm error/empty/loading states.

**Independent Test**: Audit all screens for badge consistency, verify screen reader compatibility, test contrast ratios, check text scaling, trigger all error/empty/loading states, test onboarding flow.

**Depends on**: All previous user stories (cross-cutting audit)

### Implementation for User Story 7

- [x] T068 [US7] Implement onboarding screen in `src/app/onboarding.tsx` with first-time user orientation explaining the app's purpose, 3 tabs, and neutrality commitment per spec FR-042
- [x] T069 [US7] Add onboarding gate in `src/app/_layout.tsx` checking AppStore.hasCompletedOnboarding: if false, render onboarding screen; on completion, call completeOnboarding() and navigate to tabs per research.md R-008
- [x] T070 [US7] Populate `src/i18n/locales/fr/onboarding.json` with onboarding screen copy (welcome text, app explanation, tab descriptions, get started button)
- [x] T071 [US7] Audit and add accessibility attributes across all screens: `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`, logical focus order, screen reader navigation per spec FR-038
- [x] T072 [US7] Audit and enforce WCAG 2.1 AA contrast ratios and minimum tap target sizes (44x44pt) across all interactive elements per spec FR-040 and FR-041
- [x] T073 [US7] Validate text scaling support: verify all screens render correctly with system font size set to maximum without layout breakage per spec FR-039

**Checkpoint**: Onboarding works for first-time users. All screens have consistent trust badges. Accessibility audit passes: screen reader navigation, contrast, tap targets, text scaling all compliant.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and cross-story integration testing.

- [x] T074 [P] Verify all deep link contracts per contracts/navigation.md: candidate→assistant ("Ask about this"), candidate→comparison ("Comparer"), candidate→assistant ("Debattre"), home→survey (status-aware), home→candidates, home→assistant, theme feed→candidates (filtered)
- [x] T075 [P] Verify tab state preservation per research.md R-002: scroll positions, conversation history, and form state persist across tab switches with `unmountOnBlur: false`
- [x] T076 Delete unused old files: `src/components/chatbot/` directory (remaining files after T011), `src/components/candidates/CandidateCard.tsx`, `src/components/candidates/CandidateList.tsx`, `src/components/survey/ResultsChart.tsx`, `src/components/ui/` directory (empty after moves), `src/i18n/locales/fr/learn.json`
- [x] T077 Verify all import paths across codebase are correct for renamed/moved files (assistant store, prompt files, component relocations) and no broken imports remain
- [x] T078 Run quickstart.md validation checklist to confirm all development workflows, commands, and key file locations are accurate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phase 3–9)**: All depend on Phase 2 completion
  - User stories can proceed in parallel (if staffed) or sequentially in priority order
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 - Home (P1)**: Can start after Phase 2. No dependencies on other stories.
- **US2 - Candidates (P2)**: Can start after Phase 2. No dependencies on other stories.
- **US3 - Comparison (P3)**: Can start after Phase 2. Integrates with US2 for navigation flow (Comparer action) but is independently testable with direct URL access.
- **US4 - Survey (P4)**: Can start after Phase 2. No dependencies on other stories.
- **US5 - Assistant Comprendre (P5)**: Can start after Phase 2. No dependencies on other stories.
- **US6 - Parler + Debattre (P6)**: Depends on **US5** (extends the assistant tab foundation).
- **US7 - Trust & Accessibility (P7)**: Depends on **all previous stories** (cross-cutting audit of existing screens).

### Within Each User Story

- Components (marked [P]) before screen composition
- Screen composition before i18n population
- All tasks within a story complete before marking story done

### Parallel Opportunities

- Phase 1: T002, T003, T004, T006, T007, T009 can all run in parallel after T001
- Phase 2: T012–T016, T018–T021, T023–T028 can all run in parallel
- Phase 3: T030–T035 can all run in parallel, then T036, then T037
- Phase 4: T038–T041 in parallel, then T042–T043, then T044
- Phase 5: T058–T061 in parallel, then T062, then T063
- Once Phase 2 completes: US1, US2, US3, US4, US5 can all start in parallel

---

## Parallel Example: User Story 1 (Home)

```bash
# Launch all home components in parallel:
Task: "Create HeroBlock in src/components/home/HeroBlock.tsx"
Task: "Create PrimaryShortcuts in src/components/home/PrimaryShortcuts.tsx"
Task: "Create VotingInfoCard in src/components/home/VotingInfoCard.tsx"
Task: "Create TrustCard in src/components/home/TrustCard.tsx"
Task: "Create ResumeCard in src/components/home/ResumeCard.tsx"
Task: "Create ThemeFeed in src/components/home/ThemeFeed.tsx"

# Then compose the screen (depends on all components above):
Task: "Implement full Home screen in src/app/(tabs)/index.tsx"

# Then populate translations:
Task: "Update src/i18n/locales/fr/home.json"
```

## Parallel Example: User Story 2 (Candidates)

```bash
# Launch all candidate components in parallel:
Task: "Create CandidateGallery in src/components/candidates/CandidateGallery.tsx"
Task: "Create CandidateProfileCard in src/components/candidates/CandidateProfileCard.tsx"
Task: "Refactor PositionCard in src/components/candidates/PositionCard.tsx"
Task: "Move ThemeFilter to src/components/candidates/ThemeFilter.tsx"

# Then implement screens (depends on components):
Task: "Implement Candidates tab in src/app/(tabs)/candidates.tsx"
Task: "Implement candidate profile in src/app/candidate/[id].tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (route restructuring)
2. Complete Phase 2: Foundational (stores, services, shared components, i18n)
3. Complete Phase 3: User Story 1 — Home
4. **STOP and VALIDATE**: Home screen fully functional, all 3 shortcuts navigate correctly
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Route structure and infrastructure ready
2. Add US1 (Home) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Candidates) → Test independently → Deploy/Demo
4. Add US3 (Comparison) → Test independently → Deploy/Demo
5. Add US4 (Survey) → Test independently → Deploy/Demo
6. Add US5 (Assistant Comprendre) → Test independently → Deploy/Demo
7. Add US6 (Parler + Debattre) → Test independently → Deploy/Demo
8. Add US7 (Trust & Accessibility) → Audit all screens → Deploy/Demo
9. Polish → Final cleanup and verification

### Parallel Team Strategy

With multiple developers after Phase 2 completes:

- Developer A: US1 (Home) → US4 (Survey)
- Developer B: US2 (Candidates) → US3 (Comparison)
- Developer C: US5 (Assistant Comprendre) → US6 (Parler + Debattre)
- All together: US7 (Trust & Accessibility) → Polish

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps each task to a specific user story for traceability
- Each user story is independently completable and testable after Phase 2
- Services (`chatbot.ts`, `matching.ts`, `contradiction.ts`) are unchanged — only import paths update
- Data layer (`schema.ts`, `loader.ts`, `database.*.ts`, bundled JSON) is unchanged
- Existing unit tests (matching, loader, contradiction) remain unchanged and should continue passing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

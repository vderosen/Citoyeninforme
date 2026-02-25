# Tasks: UI Cleanup & UX Improvements

**Input**: Design documents from `/specs/007-ui-cleanup-ux/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested in the feature specification. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Ensure feature branch exists and working state is clean

- [X] T001 Checkout feature branch `007-ui-cleanup-ux` and verify clean working state

---

## Phase 2: User Story 1 — Simplified Home Page (Priority: P1) MVP

**Goal**: Reduce the home page to exactly 3 content elements: survey CTA, VotingInfoCard, TrustCard. Remove all extraneous components (HeroBlock, secondary shortcuts, ResumeCard, ThemeFeed).

**Independent Test**: Open the app home tab and verify only 3 elements are visible. Survey CTA label adapts to survey status (not_started / in_progress / completed).

### Implementation for User Story 1

- [X] T002 [P] [US1] Reduce PrimaryShortcuts to survey-only CTA — remove "Explorer les candidats" and "Poser une question" buttons, keep only the survey button with adaptive label logic in `src/components/home/PrimaryShortcuts.tsx`
- [X] T003 [P] [US1] Strip home page to 3 elements — remove HeroBlock, ResumeCard, ThemeFeed imports and JSX, keep only PrimaryShortcuts (survey CTA) + VotingInfoCard + TrustCard in `src/app/(tabs)/index.tsx`
- [X] T004 [P] [US1] Remove unused i18n keys for deleted home components and verify survey CTA labels exist in `src/i18n/locales/fr/home.json`

**Checkpoint**: Home page displays exactly 3 elements. Survey CTA adapts label to survey status. No HeroBlock, no secondary shortcuts, no ResumeCard, no ThemeFeed visible.

---

## Phase 3: User Story 2 — Isolated Assistant Conversations (Priority: P2)

**Goal**: Refactor the assistant store from a flat `messages: ChatMessage[]` to a `conversations: Record<string, ChatMessage[]>` keyed by composite key (`mode` or `parler:${candidateId}`). Each mode/candidate gets its own independent conversation. Existing users' messages are migrated to the "comprendre" key.

**Independent Test**: Send a message in "Comprendre" mode, switch to "Parler" with Candidate A, send a different message, switch to Candidate B, send another message, then switch back through each — all histories must be intact and separate. Close and reopen app — all conversations persist.

### Implementation for User Story 2

- [X] T005 [US2] Refactor assistant store to conversation-keyed state — replace `messages: ChatMessage[]` with `conversations: Record<string, ChatMessage[]>`, add `getConversationKey()` and `getCurrentMessages()` selectors, update `addMessage()`, `updateLastAssistantMessage()`, `resetConversation()` to operate on current conversation key, add persist migration v0→v1 (move existing `messages` to `"comprendre"` key), update `partialize` in `src/stores/assistant.ts`
- [X] T006 [P] [US2] Update assistant page to use conversation-keyed API — replace `state.messages` reads with `getCurrentMessages()`, ensure `sendChatMessage()` passes conversation-specific history in `src/app/(tabs)/assistant.tsx`
- [X] T007 [P] [US2] Update ChatArea to read from `getCurrentMessages()` instead of `state.messages` in `src/components/assistant/ChatArea.tsx`
- [X] T008 [P] [US2] Redesign ModeSelector buttons for visual clarity — ensure three modes (Comprendre, Parler, Debattre) are clearly labeled and distinguishable at a glance in `src/components/assistant/ModeSelector.tsx`
- [X] T009 [P] [US2] Update data export to iterate over all conversations in the record instead of flat messages array in `src/services/data-export.ts`
- [X] T010 [P] [US2] Add conversation-related i18n labels (if any new strings are needed for mode descriptions or empty conversation states) in `src/i18n/locales/fr/assistant.json`

**Checkpoint**: Conversations are fully isolated by mode and candidate. Switching modes/candidates preserves all histories. Persist migration works for existing users. Data export captures all conversations.

---

## Phase 4: User Story 3 — Candidate Gallery & Compare Redesign (Priority: P3)

**Goal**: Remove the ThemeFilter toolbar, render all candidate cards at uniform height (photo + name + party only), and add an inline compare selection flow with a FAB button, selectable cards, and a bottom confirmation bar navigating to the existing comparison page.

**Independent Test**: Open candidates tab — no theme filter, all cards same height. Tap "Comparer" FAB — cards become selectable. Select 2+ candidates, tap confirm — navigates to comparison page. Cancel compare mode — selection resets.

### Implementation for User Story 3

- [X] T011 [US3] Modify CandidateGallery for uniform cards and selectable compare mode — remove `positionSnippet` rendering for natural uniform height, add `compareMode` and `selectedForCompare` props with selection toggle callback, add visual selection indicator (checkbox/overlay) on cards in `src/components/candidates/CandidateGallery.tsx`
- [X] T012 [US3] Add compare mode to candidates page — remove ThemeFilter import and JSX, add local `compareMode` and `selectedForCompare` state, add "Comparer" FAB button, add bottom confirmation bar showing selection count and "Voir la comparaison" button (enabled when 2+ selected, max 4), add cancel button, navigate to `/comparison` with `selected` param on confirm in `src/app/(tabs)/candidates.tsx`
- [X] T013 [P] [US3] Add compare mode i18n labels (Comparer, Voir la comparaison, cancel, selection count) in `src/i18n/locales/fr/candidates.json`

**Checkpoint**: No theme filter visible. All cards uniform height. Compare mode works end-to-end: FAB → select 2-4 candidates → confirm → comparison page. State resets on cancel or navigation away.

---

## Phase 5: User Story 4 — Streamlined Candidate Detail (Priority: P4)

**Goal**: Remove "Comparer" and "Poser une question" action buttons from the candidate detail page. Keep only the "Debattre" button which navigates to the assistant in "Parler" mode with the candidate pre-selected, opening or resuming their isolated conversation.

**Independent Test**: Open any candidate detail page — only "Debattre" button visible. Tap it — navigates to assistant in "Parler" mode with that candidate, showing their isolated conversation (new or resumed).

**Dependencies**: Best tested after US2 (conversation isolation) is complete, so that "Debattre" correctly opens an isolated conversation. However, the code change (removing buttons) is independent and can be implemented in parallel.

### Implementation for User Story 4

- [X] T014 [US4] Remove "Comparer" and "Poser une question" action buttons, keep only "Debattre" CTA — check both `src/app/candidate/[id].tsx` and `src/components/candidates/CandidateProfileCard.tsx` for button rendering, remove the extra buttons and any associated handlers/imports

**Checkpoint**: Candidate detail page displays full content (photo, name, party, bio, positions with sources) with exactly one "Debattre" button. No "Comparer" or "Poser une question" visible.

---

## Phase 6: User Story 5 — Remove Language Toggle (Priority: P5)

**Goal**: Remove the non-functional FR/EN LanguageSwitcher component from the entire application. The component file is deleted and all imports/usages in the tab layout are removed.

**Independent Test**: Navigate to every tab — no language toggle visible anywhere in the header.

### Implementation for User Story 5

- [X] T015 [US5] Remove LanguageSwitcher imports and all headerRight usages — remove global `headerRight` rendering LanguageSwitcher, remove LanguageSwitcher from home tab custom headerRight (keep Settings icon only), remove import statement in `src/app/(tabs)/_layout.tsx`
- [X] T016 [US5] Delete the LanguageSwitcher component file at `src/components/shell/LanguageSwitcher.tsx`

**Checkpoint**: No language toggle visible on any screen. Settings icon (if present) still works on home tab header.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories

- [X] T017 Run TypeScript type check to verify no compilation errors across all modified files
- [X] T018 Run linter (`npm run lint`) and fix any issues in modified files
- [X] T019 Validate against quickstart.md manual test checklist — verify all 12 test items pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: No dependencies on other stories — can start after Phase 1
- **US2 (Phase 3)**: No dependencies on other stories — can start after Phase 1
- **US3 (Phase 4)**: No dependencies on other stories — can start after Phase 1
- **US4 (Phase 5)**: Code-independent but best validated after US2 (conversation isolation makes "Debattre" fully functional)
- **US5 (Phase 6)**: No dependencies on other stories — can start after Phase 1
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Fully independent. Touches `index.tsx`, `PrimaryShortcuts.tsx`, `home.json` — no overlap with other stories.
- **US2 (P2)**: Fully independent. Touches `assistant.ts`, `assistant.tsx`, `ChatArea.tsx`, `ModeSelector.tsx`, `data-export.ts`, `assistant.json`.
- **US3 (P3)**: Fully independent. Touches `candidates.tsx`, `CandidateGallery.tsx`, `candidates.json`.
- **US4 (P4)**: Touches `candidate/[id].tsx` and/or `CandidateProfileCard.tsx`. Code changes are independent, but the full "Debattre" flow relies on US2's conversation isolation.
- **US5 (P5)**: Fully independent. Touches `_layout.tsx` and `LanguageSwitcher.tsx`.

### Within Each User Story

- T005 (store refactor) MUST complete before T006-T010 can start
- T011 (gallery component) SHOULD complete before T012 (page wiring) for cleaner integration
- T015 (remove imports) MUST complete before T016 (delete file)
- All other tasks within a story marked [P] can run in parallel

### Parallel Opportunities

- **All 5 user stories can start in parallel** after Phase 1 (no cross-story code dependencies)
- Within US1: T002, T003, T004 — all 3 tasks can run in parallel (different files)
- Within US2: T006, T007, T008, T009, T010 — all 5 tasks can run in parallel after T005
- Within US3: T013 can run in parallel with T011
- Within US5: T015 then T016 (sequential)

---

## Parallel Example: User Story 1

```bash
# All US1 tasks touch different files — launch in parallel:
Task: "Reduce PrimaryShortcuts to survey CTA in src/components/home/PrimaryShortcuts.tsx"
Task: "Strip home page to 3 elements in src/app/(tabs)/index.tsx"
Task: "Update i18n home.json labels"
```

## Parallel Example: User Story 2

```bash
# Step 1: Store refactor first (blocking)
Task: "Refactor assistant store to conversation-keyed state in src/stores/assistant.ts"

# Step 2: All consumers in parallel after store is ready
Task: "Update assistant page in src/app/(tabs)/assistant.tsx"
Task: "Update ChatArea in src/components/assistant/ChatArea.tsx"
Task: "Redesign ModeSelector in src/components/assistant/ModeSelector.tsx"
Task: "Update data export in src/services/data-export.ts"
Task: "Update i18n assistant.json"
```

## Parallel Example: Cross-Story

```bash
# All stories can run in parallel since they touch different files:
Task: "US1 — Strip home page" (index.tsx, PrimaryShortcuts.tsx)
Task: "US2 — Refactor assistant store" (assistant.ts, assistant.tsx, ChatArea.tsx)
Task: "US3 — Candidates gallery redesign" (candidates.tsx, CandidateGallery.tsx)
Task: "US4 — Simplify candidate detail" (candidate/[id].tsx, CandidateProfileCard.tsx)
Task: "US5 — Remove language toggle" (_layout.tsx, LanguageSwitcher.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1 — Simplified Home Page
3. **STOP and VALIDATE**: Home page shows exactly 3 elements, CTA adapts to survey status
4. Deploy/demo if ready

### Incremental Delivery

1. Setup → ready
2. US1 (Home simplification) → test independently → most visible quick win
3. US5 (Language toggle removal) → test independently → fast cleanup
4. US2 (Conversation isolation) → test independently → highest complexity, highest impact
5. US3 (Gallery + compare) → test independently → new feature
6. US4 (Candidate detail) → test independently → validates with US2
7. Polish → final validation

### Recommended Execution Order (Single Developer)

For a single developer, the recommended order balances quick wins with building toward complex changes:

1. **US5** (2 tasks, ~5 min) — Instant cleanup, builds momentum
2. **US1** (3 tasks, ~15 min) — Quick visible improvement
3. **US2** (6 tasks, ~45 min) — Most complex, do while fresh
4. **US3** (3 tasks, ~30 min) — Medium complexity
5. **US4** (1 task, ~5 min) — Simple removal, validates US2 integration
6. **Polish** (3 tasks) — Final sweep

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within the same story
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each story completion for clean git history
- Files marked UNUSED in plan.md (HeroBlock, ResumeCard, ThemeFeed, ThemeFilter) are kept in the tree but no longer imported — cleanup is deferred
- The comparison page (`src/app/comparison.tsx`) already handles `selected` params — no changes needed
- i18n infrastructure (react-i18next, locale files) remains intact for future EN support

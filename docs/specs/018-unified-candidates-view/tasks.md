# Tasks: Unified Candidates View

**Input**: Design documents from `/specs/018-unified-candidates-view/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in spec — no test tasks included.

**Organization**: Tasks grouped by user story. Since this is a single-screen rewrite, the foundational phase builds the screen scaffold and all user stories add their conditional rendering branch to the same file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup

**Purpose**: Add translation keys and prepare i18n before screen rewrite

- [x] T001 Add `emptyStateTitle` and `emptyStateDescription` keys to `src/i18n/locales/fr/candidates.json`

---

## Phase 2: Foundational (Screen Scaffold)

**Purpose**: Build the unified screen skeleton that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Rewrite `src/app/(tabs)/candidates.tsx` with base scaffold: imports (election store, CandidateAvatarBar, deterministicShuffle, dailySeed, LayoutAnimation, useTranslation, SafeAreaView, ScrollView), local state (`selectedIds: string[]`, `activeThemeId: string`), computed `shuffledCandidates`, `toggleCandidate` callback with LayoutAnimation and max-4 enforcement, and render SafeAreaView > ScrollView > CandidateAvatarBar passing shuffled candidates, selectedIds, onToggle, maxSelected=4. Content area below avatar bar is an empty placeholder.

**Checkpoint**: Avatar bar renders with daily-shuffled candidates. Tapping toggles selection with smooth animation. Max 4 enforced.

---

## Phase 3: User Story 1 — Browse and Select a Single Candidate (Priority: P1)

**Goal**: Tapping one candidate shows their full profile below the avatar bar

**Independent Test**: Tap any candidate avatar → profile appears with photo, name, party, bio, themed positions. Tap again → deselects and returns to empty area.

### Implementation for User Story 1

- [x] T003 [US1] In `src/app/(tabs)/candidates.tsx`, add conditional rendering: when `selectedIds.length === 1`, resolve candidate via `getCandidateById(selectedIds[0])`, get positions via `getPositionsForCandidate(selectedIds[0])`, and render `<CandidateProfileCard candidate={candidate} positions={positions} themes={themes} onDebate={undefined} />` below the avatar bar

**Checkpoint**: Single-candidate profile view is fully functional. Themes are navigable within the profile card (internal ThemeTabBar).

---

## Phase 4: User Story 2 — Compare Multiple Candidates (Priority: P1)

**Goal**: Selecting 2-4 candidates shows side-by-side comparison with theme navigation

**Independent Test**: Select 2 candidates → comparison appears. Switch themes → positions update. Add 3rd/4th → columns appear. Deselect down to 1 → returns to profile.

### Implementation for User Story 2

- [x] T004 [US2] In `src/app/(tabs)/candidates.tsx`, add conditional rendering: when `selectedIds.length >= 2`, render external `<ThemeTabBar>` + `<ComparisonView>` below the avatar bar. Wire `activeThemeId` local state to `ThemeTabBar.onSelectTheme` and pass to `ComparisonView.activeThemeId`. Pass `selectedCandidateIds={selectedIds}`, full `candidates` array, `positions`, and `themes`.

**Checkpoint**: Multi-candidate comparison is fully functional. Theme switching works. Deselecting to 1 transitions back to profile.

---

## Phase 5: User Story 3 — Empty State Guidance (Priority: P2)

**Goal**: When no candidate is selected, show a friendly guidance message

**Independent Test**: Open Candidats tab → see avatar bar + guidance message. Select a candidate → message disappears. Deselect all → message reappears.

### Implementation for User Story 3

- [x] T005 [US3] In `src/app/(tabs)/candidates.tsx`, add conditional rendering: when `selectedIds.length === 0`, render a centered View with two Text elements using `t("candidates:emptyStateTitle")` and `t("candidates:emptyStateDescription")` from i18n. Style with NativeWind: centered, muted text color, appropriate padding.

**Checkpoint**: Empty state guidance displays correctly and transitions smoothly to/from other states.

---

## Phase 6: User Story 4 — Quick Access to Debate Context (Priority: P2)

**Goal**: Debate button on single-candidate profile launches assistant in assistant personalization flow

**Independent Test**: Select a candidate → tap debate button → assistant opens in "candidate" context with that candidate. In comparison context → no debate button visible.

### Implementation for User Story 4

- [x] T006 [US4] In `src/app/(tabs)/candidates.tsx`, implement `handleDebate` callback: import `useAssistantStore` and `useRouter`, call `selectMode("candidate")` → `selectCandidate(selectedIds[0])` → `router.push("/(tabs)/assistant")`. Pass `handleDebate` as the `onDebate` prop to `CandidateProfileCard` (replacing the `undefined` from T003).

**Checkpoint**: Debate launches correctly from profile view. Button is absent in comparison context (naturally, since CandidateProfileCard only renders in single-selection context).

---

## Phase 7: Route Cleanup

**Purpose**: Remove obsolete routes and components replaced by the unified view

- [x] T007 [P] Delete `src/app/candidate/[id].tsx` (profile now inline in candidates tab)
- [x] T008 [P] Delete `src/app/comparison.tsx` (comparison now inline in candidates tab)
- [x] T009 Remove `<Stack.Screen name="candidate/[id]" />` and `<Stack.Screen name="comparison" options={{ title: "Comparaison" }} />` from `src/app/_layout.tsx`
- [x] T010 Delete `src/components/candidates/CandidateGallery.tsx` (replaced by CandidateAvatarBar)
- [x] T011 Verify no remaining imports of CandidateGallery, `candidate/[id]`, or `comparison` route across codebase (grep check)

**Checkpoint**: App compiles cleanly. No dead routes. No orphaned imports.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and final validation

- [x] T012 Remove deprecated i18n keys from `src/i18n/locales/fr/candidates.json`: `gallery`, `compare`, `compareConfirm`, `compareCancel`, `compareCount`, `emptyGallery`, `emptyGalleryDescription`
- [x] T013 Run quickstart.md verification checklist: empty state, profile context, comparison context, deselect, max selection (5th dimmed), theme navigation, debate launch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (needs i18n keys available)
- **User Stories (Phase 3-6)**: All depend on Phase 2 (screen scaffold must exist)
  - US1 and US2 can proceed in parallel (different conditional branches)
  - US3 can proceed in parallel with US1/US2 (different conditional branch)
  - US4 depends on US1 (passes `onDebate` prop to CandidateProfileCard added in T003)
- **Route Cleanup (Phase 7)**: Depends on Phase 3-6 (all user stories working before removing old routes)
- **Polish (Phase 8)**: Depends on Phase 7

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only. No cross-story dependencies.
- **US2 (P1)**: Depends on Phase 2 only. No cross-story dependencies.
- **US3 (P2)**: Depends on Phase 2 only. No cross-story dependencies.
- **US4 (P2)**: Depends on US1 (T003 must add CandidateProfileCard before T006 can wire onDebate)

### Within Each User Story

- Single task per story (this is a view-layer rewrite, not a multi-layer feature)
- Each task adds one conditional branch to the same file

### Parallel Opportunities

- T001 (i18n) has no blockers — start immediately
- T003 (US1), T004 (US2), T005 (US3) can theoretically run in parallel after T002, but since they all modify the same file (`candidates.tsx`), sequential execution is recommended
- T007, T008, T010 (file deletions) can run in parallel
- Recommended execution: T001 → T002 → T003 → T004 → T005 → T006 → T007-T011 → T012 → T013

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational scaffold (T002)
3. Complete Phase 3: US1 — single profile (T003)
4. Complete Phase 4: US2 — comparison (T004)
5. **STOP and VALIDATE**: Both core interactions work
6. Demo: unified view with profile + comparison

### Incremental Delivery

1. T001-T002 → Scaffold with selectable avatar bar
2. Add US1 (T003) → Single candidate browsing works
3. Add US2 (T004) → Multi-candidate comparison works
4. Add US3 (T005) → Empty state polished
5. Add US4 (T006) → Debate access restored
6. Cleanup (T007-T013) → Dead code removed, app is clean

---

## Notes

- All user stories modify the same file (`candidates.tsx`) — sequential execution recommended despite theoretical parallelism
- No new components created — all are reused from existing codebase
- No new dependencies — all packages already installed
- 13 total tasks across 8 phases
- Avatar ordering uses `deterministicShuffle(candidates, dailySeed())` for Constitution I compliance
- LayoutAnimation for smooth transitions (FR-012)

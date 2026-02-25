# Tasks: UI Polish — Navigation & Information Hierarchy

**Input**: Design documents from `/specs/003-ui-polish/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Tests**: Not requested in spec. Verification via `npm test`, `npm run lint`, and manual quickstart checklist.

**Organization**: Tasks grouped by user story (US1–US4) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add all i18n string keys needed by subsequent phases. These are shared resources that multiple user stories depend on.

- [x] T001 Add header and navigation i18n keys to `src/i18n/locales/fr/common.json` — keys: `headers.lucide`, `headers.assistant`, `headers.candidats`, `headers.comparaison`, `headers.survey`, `headers.surveyQuestions`, `headers.surveyResults`
- [x] T002 [P] Add home screen i18n keys to `src/i18n/locales/fr/home.json` — keys: `hero.heading` (compact single-line template), `themes.sectionTitle` ("Explorer par thème"), `hero.lastUpdated` (footnote format)

**Checkpoint**: All i18n keys in place. UI phases can now reference them.

---

## Phase 2: User Story 1 — Clear Screen Identity (Priority: P1) MVP

**Goal**: Remove the redundant persistent election-info banner (ContextBar) and add per-tab screen headers so each screen has a clean, distinct identity. Election context appears only once on the home screen.

**Independent Test**: Navigate across all 3 tabs. Verify: no election banner on any screen, each tab has a header title ("Lucide", "Assistant", "Candidats"), home hero shows election info exactly once.

### Implementation for User Story 1

- [x] T003 [US1] Remove ContextBar import and rendering from `src/app/_layout.tsx`, then delete `src/components/shell/ContextBar.tsx` — per research R3, ContextBar is only imported in _layout.tsx (line 10, rendered at line 57)
- [x] T004 [US1] Enable tab headers with per-tab titles in `src/app/(tabs)/_layout.tsx` — set `headerShown: true` in screenOptions, per-tab titles: "Lucide" (Home), "Assistant", "Candidats". Header styling per research R2: white bg, gray-900 semibold title, no shadow
- [x] T005 [P] [US1] Adjust SafeAreaView edges in `src/app/(tabs)/index.tsx` — remove `top` from SafeAreaView edges since the tab header now handles the top safe area
- [x] T006 [P] [US1] Adjust top padding in `src/app/(tabs)/assistant.tsx` — remove or reduce top padding/SafeAreaView top edge since header is now present
- [x] T007 [P] [US1] Adjust top padding in `src/app/(tabs)/candidates.tsx` — remove or reduce top padding/SafeAreaView top edge since header is now present

**Checkpoint**: US1 complete. No election banner on any screen. Each tab has a proper header. Home shows election info once in hero.

---

## Phase 3: User Story 2 — Professional Tab Bar (Priority: P2)

**Goal**: Add recognizable icons to each tab in the bottom tab bar, with active/inactive visual states matching standard mobile app conventions.

**Independent Test**: Inspect the tab bar on any screen. Each tab displays an icon above its label. Active tab shows filled icon + blue tint. Inactive tabs show outline icon + gray tint.

### Implementation for User Story 2

- [x] T008 [US2] Add Ionicons tab icons with active/inactive states to `src/app/(tabs)/_layout.tsx` — per research R1: home/home-outline, chatbubble/chatbubble-outline, people/people-outline. Use `tabBarIcon` callback with `focused`, `color`, `size` params. Import `Ionicons` from `@expo/vector-icons`. Icons are decorative (FR-012): don't override tab accessibility labels

**Checkpoint**: US2 complete. All 3 tabs display icons with correct active/inactive states.

---

## Phase 4: User Story 3 — Navigation Headers on Pushed Screens (Priority: P2)

**Goal**: Add native Stack headers with back arrows and contextual titles to all pushed screens (candidate detail, comparison, survey flow) so users always know where they are and how to go back.

**Independent Test**: Navigate to each pushed screen (tap a candidate, open comparison, start survey). Verify: header with title + back arrow is present, back arrow returns to previous screen, no manual back buttons remain in page content.

### Implementation for User Story 3

- [x] T009 [US3] Enable and style headers for pushed screens in `src/app/_layout.tsx` — set `headerShown: true` with header styling (per research R2) for `candidate/[id]`, `comparison`, `survey` screens. Keep `headerShown: false` for `(tabs)` and `onboarding`
- [x] T010 [P] [US3] Configure candidate detail header in `src/app/candidate/[id].tsx` — use `Stack.Screen options` to set `headerTitle` to the candidate's name dynamically. Remove any manual SafeAreaView top edge if present
- [x] T011 [P] [US3] Remove manual back button and adjust layout in `src/app/comparison.tsx` — remove the `← Retour` Pressable and its container. Stack header now provides back navigation. Adjust top padding
- [x] T012 [US3] Enable headers with contextual titles in `src/app/survey/_layout.tsx` — set `headerShown: true` with titles per step: "Questionnaire civique" (intro), contextual title (questions), "Résultats" (results). Apply same header styling as research R2
- [x] T013 [P] [US3] Remove manual back button from `src/app/survey/intro.tsx` — Stack header now handles back navigation. Adjust top padding
- [x] T014 [P] [US3] Adjust top padding in `src/app/survey/questions.tsx` — remove or reduce top SafeAreaView/padding since header is now present
- [x] T015 [P] [US3] Adjust top padding in `src/app/survey/results.tsx` — remove or reduce top SafeAreaView/padding since header is now present

**Checkpoint**: US3 complete. All pushed screens have native headers with back arrows. No manual back buttons remain.

---

## Phase 5: User Story 4 — Streamlined Home Screen Hierarchy (Priority: P3)

**Goal**: Tighten the home screen layout: compact hero heading, prominent primary CTA, labeled theme section, and relocated "last updated" footnote.

**Independent Test**: View the home screen. Verify: single-line election heading, survey button visually dominant over secondary actions, "Explorer par thème" title above theme carousel, "last updated" at scroll bottom or removed.

### Implementation for User Story 4

- [x] T016 [P] [US4] Compact hero heading to single line in `src/components/home/HeroBlock.tsx` — per research R4: replace 3-line layout (big city name + election type + purpose) with single-line `Élections municipales · Paris 2026` (`text-xl font-bold`) + purpose text. Use i18n key `hero.heading` with interpolation
- [x] T017 [P] [US4] Differentiate primary CTA from secondary actions in `src/components/home/PrimaryShortcuts.tsx` — per research R5: keep survey button full-width `bg-blue-600` with larger padding, place candidates + ask question side-by-side in horizontal row with `bg-gray-100` styling
- [x] T018 [P] [US4] Add section title above theme carousel in `src/components/home/ThemeFeed.tsx` — per research R6: add `Text` with "Explorer par thème" (`text-base font-semibold text-gray-900 px-4 mb-2`) above the horizontal FlatList. Use i18n key `themes.sectionTitle`
- [x] T019 [US4] Relocate "last updated" date to footnote at bottom of home screen ScrollView in `src/app/(tabs)/index.tsx` — move or add `lastUpdated` display as subtle text (`text-xs text-gray-400 text-center py-4`) at the end of the scroll content. Use i18n key `hero.lastUpdated`

**Checkpoint**: US4 complete. Home screen has clear visual hierarchy with compact heading, prominent CTA, labeled sections.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify no regressions, ensure code quality, validate against quickstart checklist.

- [x] T020 Run `npm run lint` and fix any linting issues across all modified files
- [x] T021 Run `npm test` and verify no test regressions
- [x] T022 Run manual verification against `specs/003-ui-polish/quickstart.md` checklist (6 sections, 22 items)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on T001 (common.json keys for tab headers)
- **Phase 3 (US2)**: Depends on T004 (tab layout must exist with headers before adding icons, same file)
- **Phase 4 (US3)**: Depends on T001 (common.json keys for pushed screen headers) and T003 (ContextBar removed from _layout.tsx before modifying it further)
- **Phase 5 (US4)**: Depends on T002 (home.json keys for hero and theme titles)
- **Phase 6 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 1. No dependency on other stories. **MVP scope.**
- **US2 (P2)**: After US1 (shares `(tabs)/_layout.tsx` — T008 builds on T004)
- **US3 (P2)**: After Phase 1 + T003 (shares `_layout.tsx`). Independent of US2 and US4
- **US4 (P3)**: After Phase 1. Independent of US1, US2, US3 (different files entirely)

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:

```text
# Phase 1: Both i18n files in parallel
T001 || T002

# Phase 2 (US1): Tab screen adjustments in parallel (after T004)
T005 || T006 || T007

# Phase 4 (US3): Pushed screen changes in parallel (after T009)
T010 || T011 || T013 || T014 || T015

# Phase 5 (US4): All home component changes in parallel
T016 || T017 || T018
```

### Cross-phase parallelism

US3 and US4 can run in parallel after Phase 1, since they touch completely different files:
- US3: root _layout.tsx, candidate/[id].tsx, comparison.tsx, survey/*
- US4: HeroBlock.tsx, PrimaryShortcuts.tsx, ThemeFeed.tsx, (tabs)/index.tsx

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: i18n keys
2. Complete Phase 2: US1 (remove ContextBar, add tab headers)
3. **STOP and VALIDATE**: Election info shows once, tabs have headers
4. App already looks significantly more professional

### Incremental Delivery

1. Phase 1 (Setup) → i18n keys ready
2. Phase 2 (US1) → Clean screen identity (**biggest single impact**)
3. Phase 3 (US2) → Professional tab icons
4. Phase 4 (US3) → Proper pushed screen navigation
5. Phase 5 (US4) → Polished home screen hierarchy
6. Phase 6 → Verify, lint, test

### Optimal Execution (Single Developer)

1. T001 + T002 in parallel
2. T003 → T004 → T005+T006+T007 in parallel
3. T008 (quick, same file as T004)
4. T009 → T010+T011+T013+T014+T015 in parallel → T012
5. T016+T017+T018 in parallel → T019
6. T020 → T021 → T022

---

## Notes

- No new dependencies required — `@expo/vector-icons` (Ionicons) is already installed
- All changes are pure UI/layout — no data model, business logic, or API modifications
- Onboarding screen is explicitly out of scope (not modified)
- Header styling is consistent across all screens (research R2): white bg, blue-600 tint, gray-900 semibold title, no shadow
- 22 tasks total across 6 phases

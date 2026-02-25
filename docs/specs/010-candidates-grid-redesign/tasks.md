# Tasks: Candidates Grid Redesign

**Input**: Design documents from `/specs/010-candidates-grid-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: US1 (Browse at a Glance) and US2 (Uniform Visual Treatment) are both P1 and tightly coupled — the 3-column compact grid delivers both simultaneously. They share a single phase. US3 and US4 are P2 interaction behaviors with separate phases.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create the party color utility — only new file in this feature

- [x] T001 [P] Create party color utility with PARTY_COLORS map (7 candidate IDs → hex colors) and `getCandidatePartyColor(candidateId: string): string` function with `#9CA3AF` fallback, following the `candidateImageSource.ts` pattern in `src/utils/candidatePartyColor.ts`

**Checkpoint**: Party color utility available for import

---

## Phase 2: US1 + US2 — Core Grid & Uniform Visual Treatment (Priority: P1)

**Goal**: Replace the 2-column scrollable FlatList grid with a compact 3-column View-based grid of fixed-size circular avatar cards that fits on screen without scrolling. All cards identical dimensions, all avatars identical circular size.

**Independent Test**: Open the Candidates tab — all 7 candidates visible without scrolling, all cards same size, all avatars same circular size with party color rings, names and parties displayed below.

### Implementation

- [x] T002 [US1] Rewrite `CandidateGallery` component — replace `FlatList` with View-based row rendering: split shuffled candidates into rows of 3, render full rows with 8px horizontal gap, render incomplete last row centered via `justifyContent: "center"`, container padding 12px, vertical gap 8px between rows; preserve `CandidateGalleryProps` interface, `deterministicShuffle`/`dailySeed` ordering, and empty-state fallback in `src/components/candidates/CandidateGallery.tsx`
- [x] T003 [US2] Implement new `CandidateCardItem` — 72px circular avatar (`borderRadius: 36`, `resizeMode="cover"`), 3px party color border ring via `getCandidatePartyColor`, fixed card width (1/3 container minus gaps), fixed card height (~130px), center-aligned name (`font-display-medium text-xs`, `numberOfLines={1}`) and party (`font-body text-[10px]`, `numberOfLines={1}`) below avatar, placeholder avatar (Ionicons `person` icon, same 72px circle) when no photo; remove `DistrictBlockCard` wrapper in `src/components/candidates/CandidateGallery.tsx`

**Checkpoint**: Grid displays all 7 candidates on one screen, uniform cards and avatars, party color rings visible — US1 and US2 acceptance scenarios pass

---

## Phase 3: US3 — Navigate to Candidate Detail (Priority: P2)

**Goal**: Tapping a candidate card in normal mode navigates to their detail page.

**Independent Test**: Tap any candidate → navigates to detail page; navigate back → returns to grid.

### Implementation

- [x] T004 [US3] Wire tap navigation in `CandidateCardItem` — in normal mode (`compareMode` is false/undefined), `onPress` calls `onCandidatePress(item.id)`; wrap card in `Pressable` with `accessibilityRole="button"`, `accessibilityLabel="{name}, {party}"`, minimum touch target 44px in `src/components/candidates/CandidateGallery.tsx`

**Checkpoint**: Tap navigation works — US3 acceptance scenarios pass

---

## Phase 4: US4 — Compare Candidates (Priority: P2)

**Goal**: Compare mode selection indicators adapted to circular avatar layout.

**Independent Test**: Tap Compare FAB → grid enters compare mode → tap candidates to select/deselect → confirm navigates to comparison view.

### Implementation

- [x] T005 [US4] Implement compare mode indicators in `CandidateCardItem` — when `compareMode` is active: show checkmark-circle badge (16px, Ionicons) at bottom-right of avatar overlapping the edge, swap party color ring for accent-coral ring when selected, apply `bg-accent-coral-light` background tint on selected card; on tap call `onToggleCompare(item.id)`; add `accessibilityState={{ selected: isSelected }}` in `src/components/candidates/CandidateGallery.tsx`

**Checkpoint**: Compare mode works end-to-end with new layout — US4 acceptance scenarios pass

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Animation, final validation

- [x] T006 Add `FadeInDown` entrance animation with staggered delay (`index * 50ms`, 400ms duration) and press scale animation (0.97 on press in, 1 on press out via `withTiming`) using react-native-reanimated; respect `useReducedMotion` to skip animations when enabled in `src/components/candidates/CandidateGallery.tsx`
- [x] T007 Run quickstart.md validation — verify all 6 scenarios: (1) all 7 candidates visible without scrolling, (2) all cards same size + avatars same circular size, (3) party color rings visible, (4) tap navigates to detail, (5) compare mode selection + confirm works, (6) fits on 360x640 screen

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **US1+US2 (Phase 2)**: Depends on T001 (party color utility)
- **US3 (Phase 3)**: Depends on Phase 2 (card must exist to add navigation)
- **US4 (Phase 4)**: Depends on Phase 3 (card with navigation must exist to add compare mode)
- **Polish (Phase 5)**: Depends on Phase 4 (all functionality in place before adding animation + validation)

### Within Phases

- T002 → T003 (grid structure before card implementation)
- T004 depends on T003 (card must exist)
- T005 depends on T004 (navigation handler establishes Pressable pattern)
- T006 depends on T005 (all functionality before adding animation)
- T007 depends on T006 (full implementation before validation)

### Parallel Opportunities

- T001 is the only [P] task (separate file). All other tasks modify the same file (`CandidateGallery.tsx`) sequentially.

---

## Parallel Example

```bash
# T001 can run independently while planning Phase 2:
Task: "Create party color utility in src/utils/candidatePartyColor.ts"

# All remaining tasks (T002–T007) are sequential on CandidateGallery.tsx
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: US1 + US2 (T002–T003)
3. **STOP and VALIDATE**: All 7 candidates visible, uniform cards, party color rings
4. Grid is usable (but no tap navigation or compare yet)

### Incremental Delivery

1. T001 → Party color utility ready
2. T002–T003 → Grid renders correctly (MVP!)
3. T004 → Tap navigation works
4. T005 → Compare mode works
5. T006 → Animations polished
6. T007 → Full validation

---

## Notes

- All tasks except T001 modify `src/components/candidates/CandidateGallery.tsx` — strict sequential execution required
- T001 creates the only new file: `src/utils/candidatePartyColor.ts`
- No files outside these two are modified (candidates.tsx, candidateImageSource.ts, shuffle.ts, schema.ts, candidates.json all unchanged)
- No test tasks included (not requested in spec)
- Party color values from data-model.md: Belliard=#00A650, Grégoire=#ED1C24, Chikirou=#C9452E, Dati=#0066CC, Bournazel=#FF8C00, Knafo=#1B2A4A, Mariani=#0D2240

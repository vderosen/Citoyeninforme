# Tasks: Comparison Selector Redesign (v2 — Single-Page Live Design)

**Input**: Design documents from `/specs/015-comparison-selector-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No test tasks — tests not explicitly requested in the feature specification.

**Organization**: Tasks grouped by user story. US2/US3/US4 are independent component tasks (different files) that can run in parallel. US1 assembles them into the final screen. US5 is verification/polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (i18n Cleanup)

**Purpose**: Remove obsolete i18n keys before component changes

- [ ] T001 Remove unused step/CTA i18n keys from `src/i18n/locales/fr/comparison.json` — keep only 5 keys: `title`, `minimumCandidates`, `positionNotDocumented`, `source`, `sources`. Delete all other keys: `selectCandidates`, `selectTheme`, `noPositionAvailable`, `noDataExplanation`, `backToCandidates`, `stepIndicator`, `candidatesSection`, `themeSection`, `selectedCount_one`, `selectedCount_other`, `allThemes`, `compareCta`, `selectMinimum`, `summaryText`

---

## Phase 2: Foundational (File Deletions)

**Purpose**: Remove components replaced by the new design — MUST complete before US1 rewrite

**WARNING**: These deletions will cause temporary import errors in `src/app/comparison.tsx` until T007 rewrites it.

- [ ] T002 [P] Delete `src/components/comparison/CandidateSelectCard.tsx` — replaced by compact avatar bar items in CandidateAvatarBar (AD-2)
- [ ] T003 [P] Delete `src/components/comparison/ComparisonBottomBar.tsx` — no validation step in live design (AD-1, FR-014)

**Checkpoint**: Obsolete files removed. Component creation can begin.

---

## Phase 3: User Story 2 — Compact Horizontal Candidate Avatar Bar (Priority: P1)

**Goal**: Replace large vertical CandidateSelectCard list with a compact horizontal scrollable avatar bar (~60px height) that shows all ~12 candidates and toggles selection with full-card color change.

**Independent Test**: Open comparison screen, scroll avatar bar horizontally, verify all candidates visible, tap to select/deselect, confirm coral-light/coral selected state vs warm-gray unselected state, verify max 4 enforcement.

### Implementation for User Story 2

- [ ] T004 [P] [US2] Create `CandidateAvatarBar` component in `src/components/comparison/CandidateAvatarBar.tsx` — horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`, each item is a `PressableScale` wrapping `CandidateAvatar` (size 36, showRing={false}) + name `Text` below. Props: `{ candidates: Candidate[], selectedIds: string[], onToggle: (id: string) => void, maxSelected?: number }` (default maxSelected=4). Selected state: `bg-accent-coral-light` + `border-accent-coral` (2px) on full item. Unselected: `bg-[#F3F4F6]`. Max reached + unselected: `opacity-50`, tap is no-op. Item ~72px wide × ~60px tall. Min 44×44pt tap target (FR-003, FR-004, FR-005, FR-006, FR-015)

**Checkpoint**: CandidateAvatarBar component ready for integration.

---

## Phase 4: User Story 3 — Theme Chips with Auto-Selection (Priority: P2)

**Goal**: Modify existing ThemeChipSelector to use horizontal scroll, remove "Tous les thèmes" option, make selectedThemeId non-nullable. Parent will auto-select first theme on mount.

**Independent Test**: Render ThemeChipSelector with themes array and a selectedThemeId, verify horizontal scroll, verify no "All themes" chip, verify single-selection behavior.

### Implementation for User Story 3

- [ ] T005 [P] [US3] Modify `ThemeChipSelector` in `src/components/comparison/ThemeChipSelector.tsx` — change layout from `flex-row flex-wrap` to horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`. Remove the "Tous les thèmes" virtual chip (the one with `id: null`). Change `selectedThemeId` prop type from `string | null` to `string`. Change `onSelectTheme` param type from `string | null` to `string`. Keep existing chip styles (selected: `bg-civic-navy text-text-inverse`, default: `bg-warm-gray text-civic-navy`), PressableScale, accessibilityRole="tab" (FR-007, FR-008, AD-3)

**Checkpoint**: ThemeChipSelector adapted for live design.

---

## Phase 5: User Story 4 — Live Positions Zone (Priority: P2)

**Goal**: Clean up ComparisonView by removing unused props and fixing the party color bug. The component already handles empty state, side-by-side (2 candidates), and horizontal scroll (3-4 candidates).

**Independent Test**: Render ComparisonView with 2 selected candidates and an activeThemeId, verify position cards appear with correct party color bar (not gray fallback), verify no theme header rendered.

### Implementation for User Story 4

- [ ] T006 [P] [US4] Modify `ComparisonView` in `src/components/candidates/ComparisonView.tsx` — remove unused props from interface: `themes`, `onThemeChange`, `onCandidateToggle`. Remove or hide the theme header rendering (`activeTheme.icon + activeTheme.name` section). Fix party color bar: replace `candidate.partyColor || "#9CA3AF"` with `getCandidatePartyColor(candidate.id)` (import from `src/utils/candidatePartyColor.ts`). Keep all existing layout logic: empty state (<2 selected), side-by-side (2 candidates, `flex-1`), horizontal scroll (3-4 candidates, `width: 240`). Keep position card content: name, party, summary, details, sources, TrustBadge (FR-010, FR-011, AD-4)

**Checkpoint**: ComparisonView cleaned up and party color bug fixed.

---

## Phase 6: User Story 1 — Single-Page Live Comparison (Priority: P1)

**Goal**: Complete rewrite of comparison.tsx — single ScrollView with 3 stacked zones (CandidateAvatarBar, ThemeChipSelector, ComparisonView), reactive state, no steps, no validation button. Positions update instantly on candidate toggle or theme switch.

**Independent Test**: Navigate to /comparison with pre-selected candidates, verify single page loads with positions visible immediately, toggle candidates and switch themes to confirm instant updates, verify no step indicator or "Comparer" button exists.

**Dependencies**: Requires T004 (CandidateAvatarBar), T005 (ThemeChipSelector), T006 (ComparisonView) to be complete.

### Implementation for User Story 1

- [ ] T007 [US1] Complete rewrite of `src/app/comparison.tsx` — remove all step-based logic (`step` state, step 1/step 2 rendering, transitions). Remove imports of deleted `CandidateSelectCard` and `ComparisonBottomBar`. State: `const [selectedIds, setSelectedIds] = useState<string[]>([])` and `const [activeThemeId, setActiveThemeId] = useState<string>("")`. useEffect for pre-selection: parse `params.selected` by splitting on commas, validate against candidates list. useEffect for auto-theme: `if (themes.length > 0) setActiveThemeId(themes[0].id)`. toggleCandidate handler: if selected → remove, if not selected and count < maxSelected (4) → add. Render: single vertical `ScrollView` with `bg-warm-white` background containing `CandidateAvatarBar` (all candidates, selectedIds, toggleCandidate), `ThemeChipSelector` (themes, activeThemeId, setActiveThemeId), `ComparisonView` (candidates, selectedIds, filtered positions by activeThemeId, activeThemeId). No bottom bar, no step indicator (FR-001, FR-002, FR-009, FR-013, AD-1, AD-5)

**Checkpoint**: Full comparison screen works as single live page. Pre-selected candidates show positions immediately.

---

## Phase 7: User Story 5 — Empty State Guidance (Priority: P3)

**Goal**: Verify that when fewer than 2 candidates are selected, the positions zone shows the guidance message and the avatar bar + theme chips remain interactive.

**Dependencies**: Requires T007 (comparison.tsx rewrite) to be complete.

### Implementation for User Story 5

- [ ] T008 [US5] Verify and adjust empty state behavior in `src/app/comparison.tsx` — ensure ComparisonView receives correct props so it displays the `minimumCandidates` i18n message ("Sélectionnez au moins 2 candidats pour comparer") when `selectedIds.length < 2`. Verify candidate bar and theme chips are not disabled/hidden during empty state. Test direct navigation (no `params.selected`) shows all candidates unselected + first theme auto-selected + empty state message (FR-012)

**Checkpoint**: Empty state works correctly. All user stories complete.

---

## Phase 8: Polish & Validation

**Purpose**: Final validation across all stories

- [ ] T009 Verify all imports are clean — no references to deleted `CandidateSelectCard` or `ComparisonBottomBar` remain anywhere in codebase. Check `src/app/comparison.tsx` and any barrel exports
- [ ] T010 Run quickstart.md manual test validation: 13-step flow (single page, 3 zones, toggle candidates, switch themes, side-by-side vs horizontal scroll, empty state) + 5 edge cases (max 5th candidate rejected, no position placeholder, no photo initials fallback, narrow screen scroll, direct navigation empty state)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: No dependencies on Phase 1 — can run in parallel with it
- **US2, US3, US4 (Phases 3-5)**: Can all run in parallel after Phase 2 (they touch different files)
- **US1 (Phase 6)**: Depends on T004, T005, T006 completion (assembles all components)
- **US5 (Phase 7)**: Depends on T007 completion (verifies integrated behavior)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US2 (P1)**: Independent — creates new `CandidateAvatarBar.tsx` (no shared files)
- **US3 (P2)**: Independent — modifies `ThemeChipSelector.tsx` (no shared files)
- **US4 (P2)**: Independent — modifies `ComparisonView.tsx` (no shared files)
- **US1 (P1)**: Depends on US2 + US3 + US4 — assembles all three into `comparison.tsx`
- **US5 (P3)**: Depends on US1 — verifies empty state in integrated screen

### Parallel Opportunities

- T001 can run in parallel with T002/T003 (different files)
- T002 and T003 can run in parallel (different file deletions)
- T004, T005, T006 can ALL run in parallel (three different files, zero interdependencies)

---

## Parallel Example: Component Creation (Phases 3-5)

```text
# These three tasks touch different files and have zero dependencies on each other:
T004: Create CandidateAvatarBar in src/components/comparison/CandidateAvatarBar.tsx
T005: Modify ThemeChipSelector in src/components/comparison/ThemeChipSelector.tsx
T006: Modify ComparisonView in src/components/candidates/ComparisonView.tsx

# After all three complete, assemble:
T007: Rewrite comparison.tsx with all three components
```

---

## Implementation Strategy

### MVP First (US2 + US3 + US4 + US1)

1. Complete Phase 1: i18n cleanup (T001)
2. Complete Phase 2: File deletions (T002, T003)
3. Complete Phases 3-5 in parallel: Component creation/modification (T004, T005, T006)
4. Complete Phase 6: Screen rewrite (T007)
5. **STOP and VALIDATE**: Test the full single-page live comparison flow
6. Complete Phase 7: Empty state verification (T008)
7. Complete Phase 8: Polish (T009, T010)

### Incremental Delivery

1. T001 + T002 + T003 → Clean slate (no old components)
2. T004 + T005 + T006 → All components ready (can be done in parallel)
3. T007 → Full screen works → **This is the MVP**
4. T008 → Edge case polish
5. T009 + T010 → Validation complete

---

## Notes

- No new dependencies required — uses only existing packages
- Net file change: +1 created (CandidateAvatarBar), -2 deleted (CandidateSelectCard, ComparisonBottomBar) = -1 total
- All state is ephemeral (local useState) — no store or persistence changes
- ThemeChipSelector is only consumed by comparison.tsx — modifications are safe
- ComparisonView is only consumed by comparison.tsx — prop changes are safe
- CandidateAvatar is shared but only its usage changes (size=36, showRing=false) — component itself untouched

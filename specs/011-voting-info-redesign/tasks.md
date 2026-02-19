# Tasks: Voting Info Cards Redesign

**Input**: Design documents from `/specs/011-voting-info-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in spec — no test tasks included. Visual verification via quickstart.md checklist.

**Organization**: Tasks grouped by user story. All implementation happens in 2 files: `src/components/home/VotingInfoCard.tsx` (rewrite) and `src/i18n/locales/fr/home.json` (update).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Add new translation keys needed by the redesigned component

- [x] T001 [P] Add votingMethod translation keys (inPerson, proxy, mail, other) to src/i18n/locales/fr/home.json

---

## Phase 2: Foundational (Shared Helpers & Types)

**Purpose**: Define view-layer types, constants, and helper functions used by all 3 card sections

- [x] T002 [P] Define view-layer types (TemporalStatus, TimelineEntry, VotingMethodDisplay) and constants (FRENCH_MONTHS array, VOTING_METHOD_CONFIG icon/titleKey mapping) at the top of src/components/home/VotingInfoCard.tsx
- [x] T003 Implement formatFrenchDate(isoDate: string) helper returning "D MMM YYYY" format with uppercase French month abbreviations in src/components/home/VotingInfoCard.tsx
- [x] T004 Implement groupAndClassifyDates(keyDates: LogisticsDate[]) helper returning TimelineEntry[] with date grouping, label merging (` · ` separator), chronological sorting, and past/next/future classification in src/components/home/VotingInfoCard.tsx

**Checkpoint**: All shared helpers ready — user story sections can now be implemented sequentially

---

## Phase 3: User Story 1 — Scan Key Election Dates at a Glance (Priority: P1) — MVP

**Goal**: Replace the flat key dates list with a vertical timeline showing grouped dates with temporal indicators

**Independent Test**: Load the Home screen with Paris 2026 data. Verify 4 timeline entries (not 6), correct past/next/future dot styles, date badges above labels, no text overflow.

### Implementation for User Story 1

- [x] T005 [US1] Rewrite the keyDates section as a vertical timeline with: absolute-positioned vertical line (w-[2px] bg-civic-navy opacity-15), temporal dots (past: 12px bg-text-caption, next: 14px bg-accent-coral with ring, future: 12px hollow border-civic-navy), date badges (font-display-semibold text-xs text-civic-navy), and merged label text per plan.md Design Details §1 in src/components/home/VotingInfoCard.tsx

**Checkpoint**: Key Dates section fully functional — date grouping reduces 6 entries to 4, temporal indicators visible, no overflow on 320px screens

---

## Phase 4: User Story 2 — Understand Eligibility Conditions Clearly (Priority: P2)

**Goal**: Replace the flat eligibility bullet list with numbered sub-cards

**Independent Test**: Load the Home screen and verify 3 eligibility conditions each in a white sub-card with a numbered circle indicator, text wrapping naturally.

### Implementation for User Story 2

- [x] T006 [US2] Rewrite the eligibility section as numbered sub-cards: bg-white rounded-lg p-3 cards inside parent container, 24px bg-civic-navy number circles with white text, flex-row items-start gap-3 layout, gap-2 spacing between cards per plan.md Design Details §2 in src/components/home/VotingInfoCard.tsx

**Checkpoint**: Eligibility section fully functional — numbered sub-cards with natural text wrapping

---

## Phase 5: User Story 3 — Review Voting Methods with Full Details (Priority: P3)

**Goal**: Replace the flat voting methods bullet list with icon sub-cards that surface requirements data

**Independent Test**: Load the Home screen and verify each voting method shows its type-specific icon, translated title, description, and requirements (when present). Verify requirements line is hidden when absent.

### Implementation for User Story 3

- [x] T007 [US3] Rewrite the votingMethods section as icon sub-cards: bg-white rounded-lg p-3 cards, header row with Ionicons 20px + font-display-semibold title (using VOTING_METHOD_CONFIG mapping and i18n keys), font-body description, and conditional requirements row (information-circle-outline 14px + text-xs text-text-caption) per plan.md Design Details §3 in src/components/home/VotingInfoCard.tsx

**Checkpoint**: Voting Methods section fully functional — icons, titles, descriptions, and requirements all rendered

---

## Phase 6: Polish & Verification

**Purpose**: Edge case validation and regression checks

- [x] T008 Verify edge cases in src/components/home/VotingInfoCard.tsx: empty arrays hide sections (FR-008), all-same-date grouping merges into single entry, unknown voting method type uses fallback icon (help-circle-outline), all-past dates show no highlighted entry
- [x] T009 Run quickstart.md visual verification: 4 timeline entries from 6 raw dates, temporal indicator styles at different device dates, 320px narrow screen test, empty data test
- [x] T010 Run npm test && npm run lint to verify no regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: T002 can run in parallel with T001 (different files). T003 and T004 depend on T002 (types must be defined first)
- **User Stories (Phase 3-5)**: All depend on Phase 2 completion (helpers must exist)
  - US1, US2, US3 are independent sections within the same file — execute sequentially in priority order
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T002-T004 (helpers). No dependency on other stories.
- **User Story 2 (P2)**: Depends on T002 (types only). No dependency on US1 or US3.
- **User Story 3 (P3)**: Depends on T001 (translation keys) and T002 (types/config). No dependency on US1 or US2.

### Within Each User Story

- Single implementation task per story (each section is self-contained)
- Each story replaces one section of the existing component

### Parallel Opportunities

- T001 (home.json) and T002 (VotingInfoCard.tsx types) can run in parallel — different files
- Within VotingInfoCard.tsx, tasks are sequential (same file)

---

## Parallel Example: Setup + Foundational

```bash
# These can run in parallel (different files):
Task T001: "Add votingMethod translation keys to src/i18n/locales/fr/home.json"
Task T002: "Define view-layer types and constants in src/components/home/VotingInfoCard.tsx"

# Then sequentially in VotingInfoCard.tsx:
Task T003: "Implement formatFrenchDate helper"
Task T004: "Implement groupAndClassifyDates helper"
Task T005: "Rewrite keyDates section as vertical timeline"  # MVP complete here
Task T006: "Rewrite eligibility section as numbered sub-cards"
Task T007: "Rewrite votingMethods section as icon sub-cards"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Add translation keys
2. Complete Phase 2: Define types + implement helpers
3. Complete Phase 3: Rewrite keyDates as timeline
4. **STOP and VALIDATE**: Timeline renders correctly with grouped dates and temporal indicators
5. Fixes the primary overflow bug — deployable immediately

### Incremental Delivery

1. T001-T004 → Foundation ready
2. T005 → Key Dates Timeline (MVP — fixes overflow bug)
3. T006 → Eligibility Sub-Cards (visual upgrade)
4. T007 → Voting Methods Sub-Cards (surfaces hidden requirements data)
5. T008-T010 → Edge cases verified, lint/test clean

---

## Notes

- All implementation tasks target the same file (VotingInfoCard.tsx) — execute sequentially
- The component grows from ~67 lines to ~200 lines — this is a rewrite, not a patch
- No new npm dependencies — uses existing NativeWind, Ionicons, react-i18next
- No data schema changes — all transformations are view-layer only
- Total: 10 tasks across 6 phases

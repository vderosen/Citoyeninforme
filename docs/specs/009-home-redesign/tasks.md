# Tasks: Redesign de la page d'accueil (Home Screen)

**Input**: Design documents from `/specs/009-home-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No test tasks included (no automated UI tests requested in specification).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No setup needed — no new dependencies, no new files, no project structure changes. All work is refactoring of existing components.

(No tasks in this phase)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational/blocking work needed. All existing stores, i18n keys, and types are already in place. The 4 user stories modify independent components.

(No tasks in this phase)

**Checkpoint**: Foundation ready — all required data (Election, ElectionLogistics, SurveyStatus, i18n keys) is already available in existing stores.

---

## Phase 3: User Story 1 — Decouvrir le contexte de l'election (Priority: P1) MVP

**Goal**: Display a hero section at the top of the home screen showing the election type, city, year, and the purpose tagline. The user understands instantly what the app is about.

**Independent Test**: Open the app. Verify the hero displays "Elections municipales · Paris 2026" and the tagline "Comprendre, comparer, choisir..." without any interaction.

### Implementation for User Story 1

- [x] T001 [US1] Update HeroBlock to use `heroHeading` i18n key with `{{type}}` interpolation in `src/components/home/HeroBlock.tsx` — Replace `{election.city} {election.year}` with `t("heroHeading", { type: election.type, city: election.city, year: election.year })`. Keep the purpose tagline as-is (already rendered).
- [x] T002 [US1] Import and add HeroBlock to the home screen in `src/app/(tabs)/index.tsx` — Add `import { HeroBlock } from "../../components/home/HeroBlock"` and render `<HeroBlock election={election} />` as the first child of ScrollView, before all other sections.

**Checkpoint**: Hero section visible at the top of the home screen with election context and tagline.

---

## Phase 4: User Story 2 — Consulter les informations pratiques de vote (Priority: P1)

**Goal**: Display voting information (key dates, eligibility, voting methods) in 3 separate visual cards, always expanded, each with a thematic icon. No accordion behavior.

**Independent Test**: Open the app and scroll down. Verify all 3 sub-sections (dates, eligibility, voting methods) are visible in separate cards with icons, without any tap/interaction. Verify that if a sub-section has 0 items, its card is not shown.

### Implementation for User Story 2

- [x] T003 [US2] Refactor VotingInfoCard to remove accordion and render 3 separate cards in `src/components/home/VotingInfoCard.tsx` — Remove `useState(false)`, remove the `Pressable` expand/collapse wrapper, remove the `Ionicons` chevron. Replace with 3 independent card Views, each wrapped in a `View` with `bg-warm-gray rounded-xl p-4` styling. Each card gets a thematic Ionicons icon: `calendar-outline` for keyDates, `checkmark-circle-outline` for eligibility, `document-text-outline` for votingMethods. Each card only renders if its data array has length > 0. Keep existing data rendering logic (map over items) inside each card. Use a `gap-3` wrapper View around the 3 cards.

**Checkpoint**: Three separate voting info cards visible by default on the home screen, each with icon and data. Empty sections are hidden.

---

## Phase 5: User Story 3 — Acceder au sondage selon son statut (Priority: P2)

**Goal**: Adapt the survey button based on survey status: standard CTA button (not hero card) when not_started or in progress; discreet text link at the bottom of the page when completed.

**Independent Test**: Test 3 states — (1) With survey not_started: verify a standard button "Tester mes idees" appears below the hero. (2) With survey in progress: verify "Reprendre le sondage" button appears in the same position. (3) With survey completed: verify the hero button disappears and a discreet "Refaire le sondage" text link appears after the voting info cards.

### Implementation for User Story 3

- [x] T004 [US3] Refactor PrimaryShortcuts to render a standard CTA button (not hero card) in `src/components/home/PrimaryShortcuts.tsx` — Remove `DistrictBlockCard` wrapping and `PressableScale` with coral hero styling. Replace with a simple `Pressable` button using `bg-accent-coral rounded-xl px-5 py-4 flex-row items-center gap-3` styling (standard button, not full-width hero). Keep the surveyLabel logic and `onStartSurvey` handler. Only render when `surveyStatus !== "completed"`. Update accessibility attributes.
- [x] T005 [US3] Add conditional survey button placement and retake link in `src/app/(tabs)/index.tsx` — Render `PrimaryShortcuts` only when `surveyStatus !== "completed"`, positioned after HeroBlock. Add an inline "Refaire le sondage" text link (`Pressable` with `Text` styled as `text-accent-coral text-sm font-body-medium text-center`) after VotingInfoCard, only when `surveyStatus === "completed"`. The retake link calls `handleStartSurvey`. Use i18n key `home.retakeSurvey`.

**Checkpoint**: Survey button adapts to all 3 statuses. Non-completed: standard button below hero. Completed: discreet text link at bottom.

---

## Phase 6: User Story 4 — Etre rassure sur la fiabilite de l'app (Priority: P3)

**Goal**: Replace the TrustCard (title + badges) with a discreet trust banner showing only the neutrality statement with a shield icon. No defensive title, no non_documente/incertain badges.

**Independent Test**: Open the app. Verify the trust banner shows a shield icon with the neutrality text. Verify there is NO "Pourquoi faire confiance" title and NO "Non documente" or "Incertain" badges.

### Implementation for User Story 4

- [x] T006 [US4] Refactor TrustCard to a discreet trust banner in `src/components/home/TrustCard.tsx` — Remove the `TrustBadge` import and all 3 badge renders. Remove the `tHome("trustTitle")` heading Text. Replace with a horizontal row (`flex-row items-center gap-2`) containing an `Ionicons` `shield-checkmark-outline` icon (size 16, color `#1B2A4A`) and the `t("neutralityStatement")` text in `font-body text-xs text-text-caption leading-relaxed`. Change the outer container from `bg-warm-gray rounded-xl p-4` to `mx-4 px-4 py-3 bg-warm-gray/50 rounded-lg` for a subtler appearance. Import `Ionicons` from `@expo/vector-icons`.

**Checkpoint**: Trust banner is discreet, no title, no badges, shield icon + neutrality text only.

---

## Phase 7: Polish & Integration

**Purpose**: Wire everything together with correct section ordering and verify the full page flow.

- [x] T007 Finalize section ordering in `src/app/(tabs)/index.tsx` — Ensure the ScrollView children are ordered per FR-009: (1) HeroBlock, (2) PrimaryShortcuts (if not completed), (3) TrustCard (banner), (4) VotingInfoCard (if logistics), (5) retake link (if completed), (6) lastUpdated footer. Add appropriate spacing (`gap-4` or padding) between sections for visual breathing room. Remove any unused imports (e.g., if PrimaryShortcuts no longer imports DistrictBlockCard).
- [x] T008 Run quickstart.md verification checklist in Expo dev client — Verify all 6 checkpoints from quickstart.md: hero displays election context, survey button as standard CTA, trust banner is discreet, 3 voting info cards visible, completed state shows retake link at bottom, scroll order matches spec.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Empty — no setup needed
- **Phase 2 (Foundational)**: Empty — all prerequisites exist
- **Phases 3-6 (User Stories)**: All independent — each modifies a different component file
  - US1 (T001-T002): `HeroBlock.tsx` + `index.tsx`
  - US2 (T003): `VotingInfoCard.tsx`
  - US3 (T004-T005): `PrimaryShortcuts.tsx` + `index.tsx`
  - US4 (T006): `TrustCard.tsx`
- **Phase 7 (Polish)**: Depends on all user stories — final integration in `index.tsx`

### User Story Dependencies

- **US1 (P1)**: No dependencies. Can start immediately.
- **US2 (P1)**: No dependencies. Can start immediately.
- **US3 (P2)**: No dependencies on US1/US2. Can start immediately but T005 touches `index.tsx` (shared with T002 and T007).
- **US4 (P3)**: No dependencies. Can start immediately.

**Note**: T002 (US1), T005 (US3), and T007 (Polish) all modify `index.tsx`. These should be executed sequentially to avoid merge conflicts. Recommended order: T002 → T005 → T007.

### Parallel Opportunities

- T001, T003, T004, T006 can all run in parallel (different component files)
- T002 and T005 must be sequential (both modify index.tsx)
- T007 must run last (final integration of all changes in index.tsx)

---

## Parallel Example

```bash
# Phase 3-6: All component refactors can run in parallel:
Task T001: "Update HeroBlock in src/components/home/HeroBlock.tsx"
Task T003: "Refactor VotingInfoCard in src/components/home/VotingInfoCard.tsx"
Task T004: "Refactor PrimaryShortcuts in src/components/home/PrimaryShortcuts.tsx"
Task T006: "Refactor TrustCard in src/components/home/TrustCard.tsx"

# Then sequential index.tsx changes:
Task T002: "Add HeroBlock to index.tsx"
Task T005: "Add conditional survey placement to index.tsx"
Task T007: "Finalize section ordering in index.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (HeroBlock format tweak)
2. Complete T002 (wire HeroBlock into index.tsx)
3. **STOP and VALIDATE**: Hero section visible with election context
4. This alone delivers visible value — users see what the app is about

### Incremental Delivery

1. T001 + T002 → Hero section live (MVP)
2. T003 → Voting info always visible in cards
3. T004 + T005 → Survey button deprioritized
4. T006 → Trust banner simplified
5. T007 → Final integration and ordering verification
6. T008 → Full verification against quickstart.md

### Optimal Single-Developer Order

Since one developer, minimize context switching on index.tsx:

1. T001 (HeroBlock.tsx) → T003 (VotingInfoCard.tsx) → T004 (PrimaryShortcuts.tsx) → T006 (TrustCard.tsx) — all component refactors first
2. T002 + T005 + T007 — all index.tsx changes in one pass
3. T008 — final verification

---

## Notes

- All changes are refactors of existing files — no new files created
- No new i18n keys needed — all translations already exist
- No new npm dependencies — Ionicons already available via @expo/vector-icons
- The `ResumeCard.tsx` and `ThemeFeed.tsx` components are not used on the current home page and are not affected by this redesign
- `TrustBadge` component stays unchanged — it's still used in candidate detail pages
- Survey statuses `computing` and `results_ready` are transient and won't be visible on the home screen

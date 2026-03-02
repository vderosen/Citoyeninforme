# Tasks: Onboarding Redesign

**Input**: Design documents from `/specs/006-onboarding-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/
**Artistic Direction Reference**: `assets/materials/onboarding/onboarding_artistic_direction.png`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and prepare i18n keys for all 5 onboarding steps.

- [x] T001 Create the `src/components/onboarding/` directory for all onboarding step components per the project structure in plan.md
- [x] T002 Replace `src/i18n/locales/fr/onboarding.json` with step-prefixed i18n keys covering all 5 screens. Use dot-notation nesting (`step1.title`, `step1.description`, `step2.title`, `step2.bullet1`, etc.) per research.md Decision 6. French copy must match `assets/materials/onboarding/onboarding_artistic_direction.png`: screen 1 "Comprendre avant de choisir.", screen 2 "Neutre, sourcé, vérifiable.", screen 3 "Trois façons de commencer", screen 4 "Ce que Lucide fait – et ne fait pas", screen 5 "Prêt·e ?". Include all bullet items, card labels, check/X items, CTA labels, and the progress format string.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared layout component and horizontal pager that all steps depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Create the shared `OnboardingStep` layout component in `src/components/onboarding/OnboardingStep.tsx`. This component receives props for: title (string), illustration (React node or icon name), content (React children), CTA label + onPress handler, and current step index / total steps for the progress indicator. It renders a full-screen layout with: SafeAreaView wrapper, ScrollView for overflow, centered title in `font-display-bold text-civic-navy`, illustration zone (64-80px icon area), flexible content area, primary CTA button (`bg-accent-coral rounded-xl py-4`), and "N/5" progress text at the bottom. Follow the card-style visual rhythm from `assets/materials/onboarding/onboarding_artistic_direction.png`. Use existing NativeWind classes from tailwind.config.js: `bg-warm-white`, `text-civic-navy`, `font-display-bold`, `font-body`, `bg-accent-coral`.
- [x] T004 Create the `OnboardingPager` component in `src/components/onboarding/OnboardingPager.tsx`. Implement a horizontal `FlatList` with `pagingEnabled`, `showsHorizontalScrollIndicator={false}`, and `bounces={false}` per research.md Decision 1. Track the current page index via `onMomentumScrollEnd` (compute index from `contentOffset.x / layoutWidth`). Expose an `onNext` callback that calls `scrollToIndex({ index: currentIndex + 1, animated: true })` and an `onComplete(target)` callback that calls `completeOnboarding()` from the app store then `router.replace(ENTRY_POINT_ROUTES[target])`. Define the 5-step array per the contract in `contracts/onboarding-navigation.ts` with keys: "purpose", "neutrality", "contexts", "trust", "ready". Each FlatList item renders the step's component, passing `onNext` and `onComplete` as props. Use `getItemLayout` for optimal FlatList performance since all pages are the same width.

**Checkpoint**: Pager infrastructure ready — step components can now be created in parallel.

---

## Phase 3: User Story 1 - Step-by-Step Onboarding Journey (Priority: P1) — MVP

**Goal**: First-time users see a 5-step paginated onboarding flow. Each step has a title, illustration, content, and a primary CTA button that advances to the next step. A progress indicator shows "N/5" at the bottom.

**Independent Test**: Launch the app as a new user → 5 distinct screens appear sequentially → each button tap advances → progress indicator updates correctly → final step completes onboarding.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create `StepPurpose` component in `src/components/onboarding/StepPurpose.tsx`. This is screen 1/5 following `assets/materials/onboarding/onboarding_artistic_direction.png`. Render using `OnboardingStep` layout with: title from `t("step1.title")` ("Comprendre avant de choisir."), a placeholder Ionicons `search` icon (size 72, color civic-navy) for the illustration, body text from `t("step1.description")` explaining that Lucide helps read and compare municipal programs neutrally and citing sources, and CTA label `t("step1.cta")` ("Commencer") wired to `onNext`.
- [x] T006 [P] [US1] Create `StepNeutrality` component in `src/components/onboarding/StepNeutrality.tsx`. This is screen 2/5 following `assets/materials/onboarding/onboarding_artistic_direction.png`. Render using `OnboardingStep` layout with: title from `t("step2.title")` ("Neutre, sourcé, vérifiable."), a placeholder Ionicons `shield-checkmark` icon (size 72, color civic-navy), three checkmark-prefixed bullet items from `t("step2.bullet1")` through `t("step2.bullet3")` about faithful summaries, visible sources, and questions to understand trade-offs. Use Ionicons `checkmark-circle` (color signal-green) as bullet prefix. CTA label `t("step2.cta")` ("Continuer") wired to `onNext`.
- [x] T007 [P] [US1] Create `StepModes` component in `src/components/onboarding/StepModes.tsx`. This is screen 3/5 following `assets/materials/onboarding/onboarding_artistic_direction.png`. Render using `OnboardingStep` layout with: title from `t("step3.title")` ("Trois façons de commencer"), no global illustration (icons are per-card instead). Display three cards (`bg-warm-gray rounded-xl p-4 gap-3`) each with an Ionicons icon, card title from `t("step3.card1.title")` etc., and card description from `t("step3.card1.description")` etc. Cards: (1) clipboard-outline → "Questionnaire citoyen" / "Clarifiez vos priorités", (2) people-outline → "Explorer les candidats" / "Comparer thème par thème", (3) chatbubble-outline → "Assistant Lucide" / "Poser une question". CTA label `t("step3.cta")` ("Continuer") wired to `onNext`.
- [x] T008 [P] [US1] Create `StepTrust` component in `src/components/onboarding/StepTrust.tsx`. This is screen 4/5 following `assets/materials/onboarding/onboarding_artistic_direction.png`. Render using `OnboardingStep` layout with: title from `t("step4.title")` ("Ce que Lucide fait – et ne fait pas") with italic emphasis on "et ne fait pas". Two groups: (1) "does" items with Ionicons `checkmark-circle` in signal-green: `t("step4.does1")` (Informations sourcées), `t("step4.does2")` (Expliquer · Sourcer · Mettre en contexte); (2) "doesn't" items with Ionicons `close-circle` in signal-red: `t("step4.doesNot1")` (Pas de consigne de vote), `t("step4.doesNot2")` (Pas de scoring partisan), `t("step4.doesNot3")` (Pas de ciblage politique). CTA label `t("step4.cta")` ("J'ai compris") wired to `onNext`.
- [x] T009 [P] [US1] Create initial `StepReady` component in `src/components/onboarding/StepReady.tsx`. This is screen 5/5 following `assets/materials/onboarding/onboarding_artistic_direction.png`. Render using `OnboardingStep` layout with: title from `t("step5.title")` ("Prêt·e ?"), a placeholder Ionicons `chatbubbles` icon (size 72, color civic-navy), body text from `t("step5.description")` encouraging the user to start with the survey. For now, include a single primary CTA `t("step5.cta")` ("Démarrer le questionnaire") wired to `onComplete("survey")`. The branching CTAs will be added in US2.
- [x] T010 [US1] Replace `src/app/onboarding.tsx` to host the `OnboardingPager` component. Remove all existing content (the old single-screen scroll layout). Import and render `<OnboardingPager />` inside a `<SafeAreaView className="flex-1 bg-warm-white">`. The pager handles all step rendering, navigation, and completion logic internally.
- [x] T011 [US1] Verify the complete 5-step flow works end-to-end: (1) app launch as new user shows step 1, (2) each CTA button advances to the next step, (3) progress indicator updates from "1/5" to "5/5", (4) step 5 CTA completes onboarding and navigates to the home tab, (5) restarting the app skips onboarding. Fix any issues found. Validate visual layout matches `assets/materials/onboarding/onboarding_artistic_direction.png` overall structure.

**Checkpoint**: At this point, the 5-step onboarding flow is fully functional with button navigation, progress indicators, and single-CTA completion. User Story 1 is independently testable.

---

## Phase 4: User Story 2 - Branching Entry Point Selection (Priority: P1)

**Goal**: Screen 5/5 offers three entry points instead of one: primary CTA to start the survey, plus two secondary links to explore candidates or ask a question. Each completes onboarding and routes to the correct tab.

**Independent Test**: Navigate to step 5 → tap each of the three options → verify each routes to the correct tab (home, candidates, assistant) and marks onboarding as complete.

### Implementation for User Story 2

- [x] T012 [US2] Upgrade `StepReady` in `src/components/onboarding/StepReady.tsx` to include three entry point options per `assets/materials/onboarding/onboarding_artistic_direction.png` screen 5. Keep the primary CTA button ("Démarrer le questionnaire", `bg-accent-coral rounded-xl py-4`) calling `onComplete("survey")`. Below it, add two secondary text links styled as `text-civic-navy font-display-medium text-base` with subtle underline or tap highlight: "Explorer les candidats" calling `onComplete("candidates")` and "Poser une question" calling `onComplete("assistant")`. Use i18n keys `t("step5.secondary1")` and `t("step5.secondary2")`. All three options are vertically stacked with clear visual hierarchy: primary button is prominent, secondary links are understated.
- [x] T013 [US2] Verify all three branching routes work correctly: (1) "Démarrer le questionnaire" → `/(tabs)/` (home tab), (2) "Explorer les candidats" → `/(tabs)/candidates`, (3) "Poser une question" → `/(tabs)/assistant`. For each: confirm `hasCompletedOnboarding` is set to `true` and subsequent app launches skip onboarding. Validate against `assets/materials/onboarding/onboarding_artistic_direction.png` screen 5 layout.

**Checkpoint**: User Stories 1 AND 2 are both complete. The onboarding flow has full navigation and branching entry points.

---

## Phase 5: User Story 3 - Onboarding Content Communication (Priority: P2)

**Goal**: Each of the 5 screens communicates its specific message with the appropriate visual structure: plain text (screen 1), checkmark bullets (screen 2), icon cards (screen 3), check/X grouped list (screen 4), and branching CTAs with illustration (screen 5). All content matches the artistic direction.

**Independent Test**: Read through all 5 screens and verify each conveys its message with the correct visual elements (illustration, bullet list, card layout, check/X list, CTA options) matching `assets/materials/onboarding/onboarding_artistic_direction.png`.

### Implementation for User Story 3

- [x] T014 [P] [US3] Polish `StepPurpose` visual layout in `src/components/onboarding/StepPurpose.tsx` to match `assets/materials/onboarding/onboarding_artistic_direction.png` screen 1. Ensure: title is large and bold (`text-3xl font-display-bold`), illustration is centered with adequate spacing, body text is readable (`font-body text-base text-text-body`) with comfortable line height, overall vertical rhythm has generous padding between sections. The screen should feel spacious and inviting, not cramped.
- [x] T015 [P] [US3] Polish `StepNeutrality` visual layout in `src/components/onboarding/StepNeutrality.tsx` to match `assets/materials/onboarding/onboarding_artistic_direction.png` screen 2. Ensure: each bullet is a horizontal row with the green checkmark icon (20px) left-aligned and text wrapping naturally beside it, bullets have `gap-4` vertical spacing, the overall list is visually balanced below the illustration.
- [x] T016 [P] [US3] Polish `StepModes` visual layout in `src/components/onboarding/StepModes.tsx` to match `assets/materials/onboarding/onboarding_artistic_direction.png` screen 3. Ensure: each card has a left-aligned icon (28-32px), title in `font-display-medium`, and description in `font-body text-sm text-text-body`. Cards have `bg-warm-gray rounded-xl p-4` with subtle shadow-card. Cards are stacked vertically with `gap-3`.
- [x] T017 [P] [US3] Polish `StepTrust` visual layout in `src/components/onboarding/StepTrust.tsx` to match `assets/materials/onboarding/onboarding_artistic_direction.png` screen 4. Ensure: "does" group and "doesn't" group are visually separated (either with a divider or spacing). Green checkmark items use `text-signal-green` icon, red X items use `text-signal-red` icon. Title has the italic emphasis on "et ne fait pas" (use `<Text className="italic">` for that segment). Items have consistent left alignment with icon + text rows.
- [x] T018 [US3] Polish `StepReady` visual layout in `src/components/onboarding/StepReady.tsx` to match `assets/materials/onboarding/onboarding_artistic_direction.png` screen 5. Ensure: illustration (chat bubble icon) is centered above the encouraging message, primary CTA button is prominent and full-width, secondary links are centered below with adequate spacing. Add the progress "5/5" indicator. Overall screen should feel like a confident "ready to go" moment.
- [x] T019 [US3] Final content review pass across all 5 screens. Verify: (1) all i18n keys render correctly with no missing translations, (2) all French copy matches `assets/materials/onboarding/onboarding_artistic_direction.png` exactly, (3) visual hierarchy is consistent across all steps (title size, spacing, CTA positioning, progress indicator placement), (4) each step scrolls gracefully if content overflows on smaller screens.

**Checkpoint**: All content screens match the artistic direction. User Story 3 is complete.

---

## Phase 6: User Story 4 - Swipe Navigation Between Steps (Priority: P3)

**Goal**: Users can swipe left/right between onboarding steps as an alternative to button navigation.

**Independent Test**: Swipe left on any screen → next screen appears. Swipe right → previous screen appears. Swipe right on step 1 → nothing happens. Swipe left on step 5 → nothing happens.

### Implementation for User Story 4

- [x] T020 [US4] Verify horizontal swipe navigation works in `src/components/onboarding/OnboardingPager.tsx`. Since FlatList with `pagingEnabled` provides swipe natively (per research.md Decision 1), confirm: (1) swiping left on step N shows step N+1, (2) swiping right on step N shows step N-1, (3) the progress indicator updates after swipe settles via `onMomentumScrollEnd`, (4) swipe animations are smooth (60fps). If any boundary issues exist (e.g., rubber-banding past step 1 or step 5), fix by ensuring `bounces={false}` on the FlatList. Reference `assets/materials/onboarding/onboarding_artistic_direction.png` for the expected navigation flow between screens.
- [x] T021 [US4] Verify boundary conditions: (1) swipe right on step 1 does nothing (already at start), (2) swipe left on step 5 does nothing (already at end), (3) the FlatList `scrollEnabled` remains true so swiping is always available on all steps. Test on both iOS and Android if possible.

**Checkpoint**: All 4 user stories are complete. Full onboarding flow with button + swipe navigation, branching entry points, and polished content.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, responsive behavior, and final validation.

- [x] T022 [P] Verify overflow scrolling on small screens (320px width): each step's `OnboardingStep` ScrollView container must scroll vertically if content exceeds viewport height. Test step 4 (most content-heavy with 5 check/X items) on a small device or simulator.
- [x] T023 [P] Verify layout on tablets and landscape orientation: content should remain centered with `max-w-lg` or similar constraint so it doesn't stretch edge-to-edge on wide screens. Add max-width constraint to `OnboardingStep` if needed.
- [x] T024 Run `npm run lint` and `npx tsc --noEmit` to verify no lint errors or type errors across all new and modified files.
- [x] T025 Verify onboarding persistence end-to-end: (1) complete onboarding via any entry point, (2) force-close and reopen the app → goes directly to tabs, (3) clear AsyncStorage → onboarding reappears. Validate against `assets/materials/onboarding/onboarding_artistic_direction.png` that the overall experience matches the intended flow.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (directory + i18n must exist) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (pager + shared layout must exist)
- **US2 (Phase 4)**: Depends on Phase 3 (StepReady must exist from US1 before upgrading)
- **US3 (Phase 5)**: Depends on Phase 3 (step components must exist before polishing)
- **US4 (Phase 6)**: Depends on Phase 2 (pager must exist) — can run in parallel with US1 if needed
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Depends on US1 (needs StepReady component to upgrade)
- **US3 (P2)**: Depends on US1 (needs step components to polish)
- **US4 (P3)**: Can start after Phase 2 — but practically verifies what US1 already enables

### Within Each User Story

- Step components marked [P] can be created in parallel (different files)
- Wiring step into pager depends on step component being created
- Verification tasks depend on all implementation tasks in that story

### Parallel Opportunities

- T005, T006, T007, T008, T009 can all run in parallel (5 separate files)
- T014, T015, T016, T017 can all run in parallel (polishing different files)
- T022, T023 can run in parallel (different concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all step components in parallel (5 different files):
Task: "Create StepPurpose in src/components/onboarding/StepPurpose.tsx"
Task: "Create StepNeutrality in src/components/onboarding/StepNeutrality.tsx"
Task: "Create StepModes in src/components/onboarding/StepModes.tsx"
Task: "Create StepTrust in src/components/onboarding/StepTrust.tsx"
Task: "Create StepReady in src/components/onboarding/StepReady.tsx"

# Then sequentially:
Task: "Replace src/app/onboarding.tsx to host OnboardingPager"
Task: "Verify 5-step flow end-to-end"
```

## Parallel Example: User Story 3

```bash
# Launch all polish tasks in parallel (4 different files):
Task: "Polish StepPurpose visual layout"
Task: "Polish StepNeutrality visual layout"
Task: "Polish StepModes visual layout"
Task: "Polish StepTrust visual layout"

# Then sequentially:
Task: "Polish StepReady visual layout"
Task: "Final content review pass across all 5 screens"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T004)
3. Complete Phase 3: User Story 1 (T005-T011)
4. **STOP and VALIDATE**: The onboarding flow works with button navigation and progress indicators
5. Deploy/demo if ready — this alone is a major improvement over the single-screen scroll

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 → 5-step flow with button nav → Test independently → **MVP!**
3. Add US2 → Branching entry points on step 5 → Test independently
4. Add US3 → Polished content matching artistic direction → Test independently
5. Add US4 → Swipe navigation verified → Test independently
6. Polish → Edge cases, responsive, lint → Ship it

### Key Reference

All visual decisions reference `assets/materials/onboarding/onboarding_artistic_direction.png` as the source of inspiration for layout, content, and interaction patterns.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Every task references `assets/materials/onboarding/onboarding_artistic_direction.png` as artistic direction
- No new npm dependencies required — uses only existing packages
- Existing `src/stores/app.ts` and `src/app/_layout.tsx` are NOT modified
- Commit after each phase or logical group of tasks
- Stop at any checkpoint to validate the story independently

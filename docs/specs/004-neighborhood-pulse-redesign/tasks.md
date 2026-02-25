# Tasks: Neighborhood Pulse Visual Redesign

**Input**: Design documents from `/specs/004-neighborhood-pulse-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/design-tokens.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install new dependencies required by the redesign

- [x] T001 Install @expo-google-fonts/space-grotesk and @expo-google-fonts/inter packages via `npx expo install`

---

## Phase 2: Foundational (Design Tokens + Fonts + Navigation Chrome)

**Purpose**: Core design system infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add design tokens (colors, fontFamily, boxShadow) to tailwind.config.js per specs/004-neighborhood-pulse-redesign/contracts/design-tokens.md — colors: warm-white, warm-gray, civic-navy, civic-navy-light, accent-coral, accent-coral-dark, accent-coral-light, text-primary, text-body, text-caption, text-inverse, signal-green, signal-amber, signal-red, party-fallback; fontFamily: display-bold (SpaceGrotesk_700Bold), display-semibold (SpaceGrotesk_600SemiBold), display-medium (SpaceGrotesk_500Medium), body (Inter_400Regular), body-medium (Inter_500Medium); boxShadow: card, elevated
- [x] T003 [P] Create DistrictBlockCard wrapper component with clipCorner prop ('top-right' | 'bottom-left' | 'none'), using overflow hidden + absolutely-positioned rotated View for subtle corner clip (~16px diagonal) in src/components/ui/DistrictBlockCard.tsx
- [x] T004 [P] Create SteppedDivider section divider component with city-skyline stepped pattern (~4px height) using SVG Path or series of small Rect elements, warm-gray on warm-white in src/components/ui/SteppedDivider.tsx
- [x] T005 [P] Load Space Grotesk (Medium, SemiBold, Bold) + Inter (Regular, Medium) fonts via useFonts() hook with SplashScreen.preventAutoHideAsync() gate, and update header/navigation bar colors to civic-navy background + warm-white text in src/app/_layout.tsx
- [x] T006 [P] Update tab bar to civic-navy active icon color, text-caption inactive color, block/bar active indicator shape (not full-width fill), warm-white background, civic-navy top border in src/app/(tabs)/_layout.tsx

**Checkpoint**: Foundation ready — design tokens available, fonts loaded, navigation chrome updated. User story implementation can now begin.

---

## Phase 3: User Story 1 — Distinctive First Impression (Priority: P1) 🎯 MVP

**Goal**: Home screen communicates confident civic identity through hero block, action shortcuts, editorial theme feed, and trust footer — all using the Neighborhood Pulse design language.

**Independent Test**: Open the app fresh and evaluate whether the home screen communicates civic identity, trust, and clear next actions through visual design alone. Verify Space Grotesk headlines, Inter body text, navy/coral color palette, warm surfaces, and district-block shapes.

### Implementation for User Story 1

- [x] T007 [P] [US1] Redesign HeroBlock with full-width navy background, coral accent text, Space Grotesk bold tagline (28-32px), and subtle district-block pattern as background texture in src/components/home/HeroBlock.tsx
- [x] T008 [P] [US1] Redesign PrimaryShortcuts: three action blocks (Survey, Candidates, Assistant) using DistrictBlockCard wrapper, icon + verb label, subtle tint variations per block, coral accent marking primary/next action in src/components/home/PrimaryShortcuts.tsx
- [x] T009 [P] [US1] Redesign ThemeFeed with editorial horizontal-scroll cards: Space Grotesk card titles, topic color bar on top, DistrictBlockCard clip shape, warm-gray card surfaces in src/components/home/ThemeFeed.tsx
- [x] T010 [P] [US1] Redesign TrustCard as trust footer: warm-gray (#F0EDE8) background section, navy text explaining app neutrality and data sources, Inter body font, distinct visual separation from content above in src/components/home/TrustCard.tsx
- [x] T011 [P] [US1] Migrate VotingInfoCard to design tokens: warm-gray surface, civic-navy headings in Space Grotesk, text-body in Inter, accent-coral for interactive elements in src/components/home/VotingInfoCard.tsx
- [x] T012 [P] [US1] Migrate ResumeCard to design tokens: warm-gray surface, civic-navy headings in Space Grotesk, text-body in Inter, card shadow in src/components/home/ResumeCard.tsx
- [x] T013 [US1] Update home screen layout: integrate redesigned HeroBlock, PrimaryShortcuts, SteppedDivider between sections, ThemeFeed, and TrustCard footer; set warm-white (#FAFAF8) canvas background in src/app/(tabs)/index.tsx
- [x] T014 [P] [US1] Update hero tagline strings and any new home screen copy in src/i18n/locales/fr/home.json

**Checkpoint**: Home screen delivers distinctive civic first impression. User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 — Editorial Candidate Browsing (Priority: P2)

**Goal**: Candidate gallery and profiles present each candidate with visual personality — party color bars, district-block shapes, editorial typography, and expandable theme blocks.

**Independent Test**: Navigate to Candidates tab, browse gallery, tap into individual profiles. Verify party color bars, district-block clip on cards, Space Grotesk names, stance teasers, and editorial profile layout.

### Implementation for User Story 2

- [x] T015 [P] [US2] Redesign CandidateGallery: party color bar at top of each card (from candidate data, party-fallback for none), DistrictBlockCard clip shape, Space Grotesk name, Inter party name, one-line stance teaser in src/components/candidates/CandidateGallery.tsx
- [x] T016 [P] [US2] Redesign CandidateProfileCard with editorial layout: large photo header, Space Grotesk name overlapping image, expandable theme blocks with topic color bars, civic-navy structure, warm-gray content surfaces in src/components/candidates/CandidateProfileCard.tsx
- [x] T017 [P] [US2] Migrate PositionCard to design tokens: civic-navy headings, text-body content, warm-gray surface, card shadow in src/components/candidates/PositionCard.tsx
- [x] T018 [P] [US2] Migrate ComparisonView to design tokens: civic-navy headings, accent-coral highlights, warm-gray card surfaces in src/components/candidates/ComparisonView.tsx
- [x] T019 [P] [US2] Migrate candidates ThemeFilter to design tokens: civic-navy labels, accent-coral active state, warm-gray inactive pills in src/components/candidates/ThemeFilter.tsx
- [x] T020 [US2] Update candidates tab screen with warm-white canvas, design token typography for screen title in src/app/(tabs)/candidates.tsx
- [x] T021 [US2] Update candidate detail screen integrating editorial CandidateProfileCard layout, warm-white canvas, civic-navy header in src/app/candidate/[id].tsx

**Checkpoint**: Candidate gallery and profiles display editorial visual personality. User Story 2 fully functional and testable independently.

---

## Phase 5: User Story 3 — Participatory Survey Experience (Priority: P3)

**Goal**: Survey flow feels like civic participation — block progress bars, display-font questions, substantial answer blocks with coral selection, editorial result charts.

**Independent Test**: Complete the full survey flow (intro → questions → results). Verify block progress indicator, Space Grotesk question text, coral selection states, and editorial horizontal bar chart results.

### Implementation for User Story 3

- [x] T022 [P] [US3] Redesign ProgressBar with individual blocks (one per question) that fill with accent-coral as user advances, not a thin continuous line, in src/components/survey/ProgressBar.tsx
- [x] T023 [P] [US3] Redesign QuestionCard: Space Grotesk question text, generous whitespace, answer options as substantial pressable blocks with accent-coral border + accent-coral-light fill on selection in src/components/survey/QuestionCard.tsx
- [x] T024 [P] [US3] Redesign AlignmentRanking with editorial horizontal bar charts: candidate photos, Space Grotesk percentages, civic-navy bars, accent-coral highlight for top match in src/components/survey/AlignmentRanking.tsx
- [x] T025 [P] [US3] Migrate ResultsProfile to design tokens: civic-navy headings, text-body content, accent-coral highlights in src/components/survey/ResultsProfile.tsx
- [x] T026 [P] [US3] Migrate ContradictionCard to design tokens: signal-amber indicator, civic-navy text, warm-gray surface in src/components/survey/ContradictionCard.tsx
- [x] T027 [P] [US3] Migrate CivicPrimer to design tokens: civic-navy headings, text-body content, warm-gray surface in src/components/survey/CivicPrimer.tsx
- [x] T028 [P] [US3] Migrate TieExplanation to design tokens: civic-navy headings, text-body content in src/components/survey/TieExplanation.tsx
- [x] T029 [P] [US3] Update survey stack navigation colors to civic-navy header, warm-white background in src/app/survey/_layout.tsx
- [x] T030 [P] [US3] Update survey intro screen with Space Grotesk heading, civic styling, accent-coral CTA button in src/app/survey/intro.tsx
- [x] T031 [US3] Update survey questions screen integrating redesigned ProgressBar and QuestionCard in src/app/survey/questions.tsx
- [x] T032 [US3] Update survey results screen integrating editorial AlignmentRanking and ResultsProfile in src/app/survey/results.tsx

**Checkpoint**: Survey flow delivers participatory civic experience. User Story 3 fully functional and testable independently.

---

## Phase 6: User Story 4 — Alive and Responsive Interactions (Priority: P4)

**Goal**: Subtle, purposeful motion makes the app feel alive — staggered entrances, parallax scroll, press feedback, and smooth transitions. All motion respects reduce-motion preference.

**Independent Test**: Navigate between screens, scroll through lists, tap interactive elements. Verify staggered fade-in, hero parallax, scale press feedback, and slide-up transitions. Toggle system reduce-motion and confirm all animations are suppressed.

### Implementation for User Story 4

- [x] T033 [P] [US4] Create useMotionPreference hook wrapping useReducedMotion() from react-native-reanimated, returning { shouldAnimate: boolean } in src/hooks/useMotionPreference.ts
- [x] T034 [P] [US4] Create useStaggeredEntrance hook providing FadeInDown.delay(index * staggerMs).duration(400) entering animation config, gated by useMotionPreference, in src/hooks/useStaggeredEntrance.ts
- [x] T035 [US4] Add staggered fade-in entrance animations to candidate gallery list items in src/components/candidates/CandidateGallery.tsx using useStaggeredEntrance
- [x] T036 [US4] Add staggered fade-in entrance animations to ThemeFeed horizontal scroll items in src/components/home/ThemeFeed.tsx using useStaggeredEntrance
- [x] T037 [US4] Add staggered fade-in entrance animations to AlignmentRanking result items in src/components/survey/AlignmentRanking.tsx using useStaggeredEntrance
- [x] T038 [US4] Add hero parallax scroll effect: useAnimatedScrollHandler tracking scrollY, interpolate hero translateY at 0.5x scroll speed, gated by useMotionPreference in src/app/(tabs)/index.tsx
- [x] T039 [US4] Add subtle scale press feedback (Animated.View scale 1.0 → 0.97 → 1.0) to PrimaryShortcuts action blocks, candidate cards, survey answer blocks, and theme feed cards — gated by useMotionPreference
- [x] T040 [US4] Add slide-up screen transitions with ease-out timing for stack navigators in src/app/_layout.tsx and src/app/survey/_layout.tsx, gated by useMotionPreference

**Checkpoint**: App feels alive with purposeful motion. All animations disabled when reduce-motion is active. User Story 4 fully functional.

---

## Phase 7: User Story 5 — Premium Accessible Experience (Priority: P5)

**Goal**: Accessibility features are beautiful design elements — coral focus outlines, generous visual targets, WCAG-compliant contrast, scalable typography, and a persistent language switcher.

**Independent Test**: Navigate with keyboard/switch control, enable screen reader, set 200% text scale, toggle reduce-motion. Verify coral focus outlines, correct contrast ratios, scalable layout, and language switcher visibility from every screen.

### Implementation for User Story 5

- [x] T041 [P] [US5] Add coral focus outline style (2px accent-coral border with 2px offset outer glow) to all focusable elements via global style or shared utility in global.css and/or src/utils/accessibility.ts
- [x] T042 [P] [US5] Create LanguageSwitcher component: FR / EN text toggle (no flags), updates react-i18next language, styled with civic-navy text, accent-coral active indicator in src/components/shell/LanguageSwitcher.tsx
- [x] T043 [US5] Integrate LanguageSwitcher into tab bar header area, visible from all tab screens in src/app/(tabs)/_layout.tsx
- [x] T044 [US5] Audit all coral text usage across codebase: ensure accent-coral (#E8553A) only on large text (≥18pt bold), replace small coral text with civic-navy or accent-coral-dark (#C23D22, 4.5:1 AA-compliant)
- [x] T045 [US5] Validate layout at 200% system text scale across all 12 screens: fix any overflow, broken hierarchy, or truncated content — ensure Space Grotesk headings maintain visual hierarchy

**Checkpoint**: Accessibility is premium, not an afterthought. User Story 5 complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Migrate remaining screens and components not covered by user stories, validate consistency, clean up

- [x] T046 [P] Migrate assistant screen to design tokens: civic-navy header, warm-white canvas in src/app/(tabs)/assistant.tsx
- [x] T047 [P] Migrate MessageBubble to design tokens: civic-navy user bubbles or accent-coral accents, warm-gray assistant bubbles in src/components/assistant/MessageBubble.tsx
- [x] T048 [P] Migrate ChatArea to design tokens: warm-white background, civic-navy input border in src/components/assistant/ChatArea.tsx
- [x] T049 [P] Migrate ContextPrompts to design tokens: warm-gray pill backgrounds, civic-navy text in src/components/assistant/ContextPrompts.tsx
- [x] T050 [P] Migrate CandidateSelector to design tokens: civic-navy text, accent-coral selection in src/components/assistant/CandidateSelector.tsx
- [x] T051 [P] Migrate ModeSelector to design tokens: civic-navy text, accent-coral active state in src/components/assistant/ModeSelector.tsx
- [x] T052 [P] Migrate comparison screen to design tokens: civic-navy headings, warm-white canvas, warm-gray cards in src/app/comparison.tsx
- [x] T053 [P] Migrate onboarding screen to Neighborhood Pulse design language: civic-navy text, accent-coral CTAs, Space Grotesk headings in src/app/onboarding.tsx
- [x] T054 [P] Migrate shared/EmptyState to design tokens: civic-navy text, warm-gray surface in src/components/shared/EmptyState.tsx
- [x] T055 [P] Migrate shared/ErrorState to design tokens: signal-red indicator, civic-navy text in src/components/shared/ErrorState.tsx
- [x] T056 [P] Migrate shared/LoadingState to design tokens: accent-coral spinner/indicator in src/components/shared/LoadingState.tsx
- [x] T057 [P] Migrate shared/FeedbackAction to design tokens: accent-coral interactive elements in src/components/shared/FeedbackAction.tsx
- [x] T058 [P] Migrate shared/TrustBadge to design tokens: signal-green verified indicator, civic-navy text in src/components/shared/TrustBadge.tsx
- [x] T059 [P] Migrate shared/SourceReference to design tokens: text-caption color, civic-navy links in src/components/shared/SourceReference.tsx
- [x] T060 [P] Migrate ui/SourceReference to design tokens: text-caption color in src/components/ui/SourceReference.tsx
- [x] T061 [P] Migrate ui/ThemeFilter to design tokens: civic-navy labels, accent-coral active state in src/components/ui/ThemeFilter.tsx
- [x] T062 [P] Add language switcher labels (FR/EN) to i18n common namespace in src/i18n/locales/fr/common.json
- [x] T063 Remove all remaining hardcoded hex colors — search entire src/ for inline hex values (#FFFFFF, #2563EB, #111827, #6B7280, #E5E7EB, etc.) and replace with design token classes
- [x] T064 Run ESLint and TypeScript type-check (`npm run lint && npx tsc --noEmit`) — fix any issues
- [x] T065 Run Expo build validation (`npx expo export --platform web`) — verify no runtime errors
- [x] T066 Run quickstart.md testing checklist: fonts load (no flash), all screens use token colors, clip shape renders on all platforms, animations respect reduce-motion, coral text WCAG AA compliant, 48px touch targets, 200% text scale, language switcher visible from all screens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion — home screen redesign
- **US2 (Phase 4)**: Depends on Phase 2 completion — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2 completion — can run in parallel with US1/US2
- **US4 (Phase 6)**: Depends on Phase 2 completion — best results after US1/US2/US3 since animations apply to redesigned screens
- **US5 (Phase 7)**: Depends on Phase 2 completion — contrast audit most effective after color migration complete
- **Polish (Phase 8)**: Depends on Phase 2 completion — can start after foundational, but best after US1-US3

### User Story Dependencies

- **US1 (P1)**: After Phase 2. No dependencies on other stories.
- **US2 (P2)**: After Phase 2. Uses DistrictBlockCard from T003. No dependency on US1.
- **US3 (P3)**: After Phase 2. No dependencies on US1 or US2.
- **US4 (P4)**: After Phase 2. Touches files modified in US1/US2/US3 (ThemeFeed, CandidateGallery, AlignmentRanking, index.tsx). **Recommended**: implement after US1-US3 to avoid merge conflicts.
- **US5 (P5)**: After Phase 2. Contrast audit (T044) and text scale validation (T045) are most effective after all screens have been migrated. **Recommended**: implement after US1-US3.

### Within Each User Story

- Components marked [P] can be implemented in parallel (different files)
- Screen-level tasks (integrating components) should come after their component tasks
- Core redesigns before secondary migrations

### Parallel Opportunities

- **Phase 2**: T003, T004, T005, T006 can all run in parallel (after T002)
- **US1**: T007, T008, T009, T010, T011, T012, T014 can all run in parallel; T013 after components
- **US2**: T015, T016, T017, T018, T019 can all run in parallel; T020, T021 after components
- **US3**: T022-T030 can all run in parallel; T031, T032 after components
- **US4**: T033, T034 in parallel; then T035-T040
- **US5**: T041, T042 in parallel; then T043-T045
- **Polish**: T046-T062 can ALL run in parallel (different files); T063-T066 sequential after all migrations

---

## Parallel Example: User Story 1

```bash
# Launch all home component redesigns in parallel (different files):
Task: "Redesign HeroBlock in src/components/home/HeroBlock.tsx"
Task: "Redesign PrimaryShortcuts in src/components/home/PrimaryShortcuts.tsx"
Task: "Redesign ThemeFeed in src/components/home/ThemeFeed.tsx"
Task: "Redesign TrustCard in src/components/home/TrustCard.tsx"
Task: "Migrate VotingInfoCard in src/components/home/VotingInfoCard.tsx"
Task: "Migrate ResumeCard in src/components/home/ResumeCard.tsx"
Task: "Update home strings in src/i18n/locales/fr/home.json"

# Then integrate on the screen (depends on component tasks above):
Task: "Update home screen layout in src/app/(tabs)/index.tsx"
```

## Parallel Example: Polish Phase

```bash
# Launch ALL component migrations in parallel (17 independent files):
Task: "Migrate assistant screen in src/app/(tabs)/assistant.tsx"
Task: "Migrate MessageBubble in src/components/assistant/MessageBubble.tsx"
Task: "Migrate ChatArea in src/components/assistant/ChatArea.tsx"
# ... all T046-T062 in parallel

# Then sequential validation:
Task: "Remove hardcoded hex colors"
Task: "Run lint and type-check"
Task: "Run build validation"
Task: "Run testing checklist"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T006) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T007-T014)
4. **STOP and VALIDATE**: Open app, verify home screen civic identity
5. Deploy/demo if ready — this alone transforms the first impression

### Incremental Delivery

1. Setup + Foundational → Design system ready
2. Add US1 → Test independently → **MVP demo** (home screen redesign)
3. Add US2 → Test independently → Candidate browsing polished
4. Add US3 → Test independently → Survey experience polished
5. Add US4 → Test independently → Motion layer adds life
6. Add US5 → Test independently → Accessibility premium
7. Polish → All screens consistent → Ship

### Recommended Sequential Order

For a single developer, the recommended execution order is:

1. Phase 1 → Phase 2 → **US1** → **US2** → **US3** → **US4** → **US5** → Polish

This order ensures each story builds on completed visual foundations, minimizes merge conflicts (especially for US4 motion), and delivers testable increments at every checkpoint.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Phase 2
- No test tasks included (not requested in specification)
- Commit after each task or logical group (e.g., all parallel component migrations)
- Stop at any checkpoint to validate story independently
- Reference contracts/design-tokens.md for exact color/font/shadow values
- Reference research.md R7 for WCAG contrast constraints (coral only for large text)

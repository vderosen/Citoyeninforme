# Research: Onboarding Redesign

**Feature**: 006-onboarding-redesign
**Date**: 2026-02-15

## Decision 1: Pager Implementation Strategy

**Decision**: Use React Native's built-in `FlatList` with `horizontal` + `pagingEnabled` props.

**Rationale**: FlatList pagination is native on both iOS and Android, provides swipe gestures out of the box, and requires zero new dependencies. It handles lazy rendering of off-screen pages and integrates naturally with `scrollToIndex` for programmatic navigation (button taps). Performance is well-established for small page counts (5 pages).

**Alternatives considered**:
- **react-native-pager-view**: Superior native gestures and interruptible animations, but requires adding a new dependency (violates the "no new packages" constraint from plan). Overkill for a 5-page static onboarding.
- **ScrollView with pagingEnabled**: Simpler API but renders all children eagerly. Acceptable for 5 lightweight pages, but FlatList's lazy rendering is preferred as best practice.
- **react-native-reanimated Carousel**: Would provide spring-based transitions, but adds significant complexity for minimal visual gain on a simple sequential flow.

## Decision 2: Step Component Architecture

**Decision**: One shared `OnboardingStep` layout component + five content components (`StepPurpose`, `StepNeutrality`, `StepModes`, `StepTrust`, `StepReady`).

**Rationale**: Each step has the same outer structure (SafeArea, scroll container, title, illustration zone, content area, CTA zone, progress indicator) but different inner content (plain text, bullet list, card grid, check/X list, branching CTAs). A shared layout avoids repeating the outer structure 5 times while keeping each step's content isolated and easy to edit.

**Alternatives considered**:
- **Single component with config object**: Pass all 5 steps as a data array with type-discriminated content. Rejected because the content structures are too different (text vs. cards vs. check/X lists) — a single renderer would need excessive conditional branching.
- **Five fully independent screens**: No shared layout. Rejected because it duplicates the padding, progress indicator, title styling, and illustration zone across all 5 files.

## Decision 3: Illustration Approach

**Decision**: Use Ionicons from `@expo/vector-icons` as placeholder illustrations, sized large (64-80px) with civic-navy color. Each step gets a relevant icon.

**Rationale**: Custom hand-drawn SVG illustrations matching the artistic direction are a design deliverable that shouldn't block development. Ionicons are already installed, render at any size, and provide adequate visual anchoring. Icon choices: `search` (step 1), `shield-checkmark` (step 2), `grid` (step 3), `checkmark-done` (step 4), `chatbubbles` (step 5).

**Alternatives considered**:
- **Custom SVG components**: Better visual fidelity to the artistic direction, but requires illustration design work that is out of scope for this feature.
- **No illustrations**: Faster to build, but the screens would feel text-heavy and lose the visual rhythm of the reference design.
- **Lottie animations**: Rich but adds a dependency and asset pipeline complexity for minimal value in a static flow.

## Decision 4: Navigation Between Steps

**Decision**: Combine FlatList swipe with explicit `scrollToIndex` on button tap. Disable FlatList's default scroll indicator. Track current page via `onMomentumScrollEnd` callback.

**Rationale**: FlatList natively handles horizontal swiping with `pagingEnabled`. For button taps, `scrollToIndex({ index, animated: true })` provides programmatic advancement. The `onMomentumScrollEnd` event gives the settled page index after any swipe or programmatic scroll, keeping the progress indicator in sync.

**Alternatives considered**:
- **State-only navigation (no FlatList)**: Swap components via `useState` with animated transitions via Reanimated. Simpler state management but loses native scroll physics and requires custom gesture handling for swipe support.
- **Expo Router nested routes**: Each step as a separate route (`/onboarding/1`, `/onboarding/2`...). Rejected because it adds routing complexity and makes swipe gestures between routes non-trivial.

## Decision 5: Branching Navigation on Step 5

**Decision**: Three handler functions on Step 5 that each call `completeOnboarding()` then `router.replace()` with the target tab route.

**Rationale**: The existing `completeOnboarding()` action in the Zustand store sets the persistent flag. The root layout's navigation guard will prevent the user from returning to onboarding. Each handler targets a specific tab route: `/(tabs)/` (home/survey), `/(tabs)/candidates`, `/(tabs)/assistant`.

**Alternatives considered**:
- **Single handler with parameter**: `handleComplete(target: string)`. Functionally equivalent but slightly less readable than three named handlers. Either approach works; three handlers was chosen for clarity in the step component.

## Decision 6: i18n Key Structure

**Decision**: Expand the existing `onboarding.json` namespace with prefixed keys per step: `step1.title`, `step1.description`, `step2.title`, `step2.bullet1`, etc.

**Rationale**: Keeps all onboarding text in one file (existing pattern), uses dot-notation nesting for organization, and allows each step's content to be found quickly. The old flat keys (`welcome`, `description`, etc.) will be replaced entirely.

**Alternatives considered**:
- **Separate i18n file per step**: 5 files with 5 namespace registrations. Rejected as excessive for ~40 total keys.
- **Keep old keys and add new ones**: Preserves backward compatibility but creates confusion between the old single-screen keys and new step-based keys. Clean replacement is clearer.

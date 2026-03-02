# Research: Unified Candidates View

**Feature**: 018-unified-candidates-view
**Date**: 2026-02-20

## R1: Avatar Ordering Strategy (Constitution I Compliance)

**Decision**: Use `deterministicShuffle(candidates, dailySeed())` for avatar bar ordering.

**Rationale**: Constitution Principle I requires "alphabetical or randomized per session—never ranked by editorial choice." The current `CandidateGallery` already uses this pattern (daily shuffle). The current `CandidateAvatarBar` in the comparison screen does NOT shuffle — it renders candidates in store order, which is JSON insertion order. The unified view must fix this by applying the daily shuffle to maintain neutrality compliance.

**Alternatives considered**:
- Alphabetical sorting: Would satisfy Constitution I but produces a static, predictable order that could create primacy bias (first candidate always gets more attention).
- Store-order (current comparison): Not compliant — JSON insertion order could be perceived as editorial.
- Random per session (not daily): Would cause confusion if user switches tabs and avatar order changes.

## R2: State Management Approach

**Decision**: Local component state (`useState`) in the rewritten `candidates.tsx`.

**Rationale**: The spec explicitly states "Selection state is ephemeral (not persisted across sessions)" (Assumptions section). A Zustand store would be over-engineering — the state doesn't need to be shared with other screens (comparison and profile routes are being removed). The selection state (`selectedIds: string[]`) and active theme (`activeThemeId: string`) are the only mutable values.

**Alternatives considered**:
- Zustand store: Would persist across tab switches but spec says "users start fresh each time they open the tab." Local state naturally resets on tab unmount if `lazy: true` (current config). However, with Expo Router tab caching, the component may stay mounted. Using `useFocusEffect` to reset is unnecessary complexity — users expect their selection to persist while the tab is visible.
- URL params: Would enable deep linking but adds complexity and the spec marks deep linking as out of scope.

**Clarification**: "Start fresh each time" likely means fresh per app session, not per tab switch. Local `useState` achieves this since state resets when the component unmounts (app restart). If the tab stays mounted (Expo Router behavior), the selection persists during the session — this is expected and desirable UX.

## R3: View Transition Animation

**Decision**: Use `LayoutAnimation.configureNext()` for smooth transitions between empty/profile/comparison states.

**Rationale**: The spec requires "transitions between states MUST be visually smooth, not jarring" (FR-012). `LayoutAnimation` is the simplest approach — it automatically animates layout changes without explicit animation values. It's already available in React Native (no additional dependency). `react-native-reanimated` is available too, but `LayoutAnimation` is simpler for conditional rendering transitions.

**Alternatives considered**:
- `react-native-reanimated` entering/exiting animations: More control but requires wrapping each view context in `Animated.View`. Overkill for conditional content swapping.
- Opacity fade with `Animated.Value`: Manual animation management. More code for marginal visual improvement.
- No animation: Would violate FR-012.

**Implementation note**: Call `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` before each state change that affects the content area. This handles height/position transitions automatically.

## R4: Route Cleanup Strategy

**Decision**: Delete route files and remove Stack.Screen registrations. No redirect/fallback needed.

**Rationale**: The `candidate/[id]` and `comparison` routes are only reached via programmatic navigation (`router.push`) from `candidates.tsx`. There are no external deep links configured for these routes. Once `candidates.tsx` is rewritten to use inline views, no code path will navigate to these routes.

**Files to delete**:
- `src/app/candidate/[id].tsx` — standalone profile page
- `src/app/comparison.tsx` — standalone comparison page

**Stack.Screen registrations to remove** from `src/app/_layout.tsx`:
- `<Stack.Screen name="candidate/[id]" />`
- `<Stack.Screen name="comparison" options={{ title: "Comparaison" }} />`

**Alternatives considered**:
- Keep routes as redirects: Adds dead code. No external URLs point to these routes.
- Deprecation period: Unnecessary for an app with no published deep link contract.

## R5: CandidateProfileCard Adaptation

**Decision**: Reuse `CandidateProfileCard` as-is. Its `ThemeTabBar` integration is self-contained.

**Rationale**: The component already includes a `ThemeTabBar` internally (manages its own `activeThemeId` state). For single-candidate display in the unified view, we simply render `<CandidateProfileCard>` below the avatar bar. The component handles theme switching internally. No prop changes needed.

**Consideration**: The profile card has its own `ThemeTabBar` while the comparison context also needs a `ThemeTabBar`. In the unified view, when switching from 1→2 candidates, the theme bar "moves" from inside the profile card to an external position above the comparison columns. This is acceptable as a visual transition — the user's mental model is "I'm now comparing, so the view changed."

**Alternative approach rejected**: Extract `ThemeTabBar` from `CandidateProfileCard` and make it external for both contexts. This would require significant refactoring of `CandidateProfileCard` for minimal benefit, and other features using the profile card would break.

## R6: Translation Keys for Empty State

**Decision**: Add 2 new keys to `src/i18n/locales/fr/candidates.json`.

**New keys**:
- `"emptyStateTitle"`: "Explorez les candidats" — inviting, action-oriented
- `"emptyStateDescription"`: "Appuyez sur un candidat pour voir son profil, ou sélectionnez-en plusieurs pour les comparer." — clear guidance per FR-008

**Rationale**: The empty state guidance message (US-3) needs dedicated translation keys. Existing keys don't cover this use case. The `emptyGallery` / `emptyGalleryDescription` keys are for the data-not-loaded error state, not the normal empty selection state.

## R7: CandidateGallery Removal Impact

**Decision**: Delete `CandidateGallery.tsx` and its sub-component `CandidateCardItem` (if separate). Verify no other imports exist.

**Rationale**: The gallery (3-column grid with card items) is entirely replaced by the avatar bar as the primary candidate selection mechanism. The gallery is only imported in `src/app/(tabs)/candidates.tsx`.

**Verification needed during implementation**:
- Grep for `CandidateGallery` imports — should only be `candidates.tsx`
- Grep for `CandidateCardItem` imports — likely only `CandidateGallery.tsx`
- Confirm no test files reference these components

## R8: Debate Button in Comparison Context

**Decision**: Hide debate button in comparison context (FR-009 acceptance scenario 2).

**Rationale**: The spec states "no debate button is shown (debate is single-candidate only)." The debate feature requires a single candidate context — comparing multiple candidates and debating makes no sense in the current assistant personalization flowl. The `CandidateProfileCard` component includes the debate button, so it's naturally hidden when the view switches from profile to comparison.

No additional code needed — the button only exists in `CandidateProfileCard`, which only renders in single-candidate context.

# Research: Frontend Redesign

**Feature**: 002-frontend-redesign
**Date**: 2026-02-15
**Status**: Complete

## R-001: Expo Router Tab Navigation Pattern

**Decision**: Use Expo Router's `(tabs)/` group layout with a `Tabs` component from `expo-router/tabs` for the 3-tab bottom navigation.

**Rationale**: Expo Router natively supports tab-based layouts via file-system grouping. Placing routes inside `src/app/(tabs)/` automatically creates a tab navigator. The `(tabs)/_layout.tsx` file defines the tab bar configuration using `<Tabs>` from `expo-router/tabs`, which wraps React Navigation's `createBottomTabNavigator`. This is the standard, documented approach for Expo Router 6.x and avoids custom navigation libraries.

**Alternatives considered**:
- **Manual tab switching with state**: Rejected because it would bypass Expo Router's native navigation, breaking deep links and back navigation.
- **React Navigation directly (without Expo Router)**: Rejected because the project already uses Expo Router for file-based routing, and mixing navigators adds complexity.

**Key implementation details**:
- Tab screens: `(tabs)/index.tsx` (Accueil), `(tabs)/assistant.tsx` (Assistant), `(tabs)/candidates.tsx` (Candidats)
- Stack screens above tabs: `candidate/[id].tsx`, `comparison.tsx`, `survey/*`, `onboarding.tsx`
- Root layout wraps `<Stack>`, tabs group is nested inside
- Tab bar icons and labels are configured in `(tabs)/_layout.tsx`

---

## R-002: Tab State Preservation

**Decision**: Rely on Expo Router's default tab behavior, which keeps each tab mounted when switching. Use `unmountOnBlur: false` (default) in tab screen options.

**Rationale**: By default, React Navigation's bottom tab navigator keeps all tab screens mounted in memory. When switching tabs, the previous tab's component tree remains mounted, preserving scroll position and local state. This matches the spec requirement (FR-001) for tabs preserving scroll position and state.

**Alternatives considered**:
- **Manual scroll position persistence with refs**: Rejected as unnecessary - default tab behavior already preserves component state.
- **Zustand-based scroll position tracking**: Over-engineered for this use case. Only needed if tabs were unmounted.

**Key implementation details**:
- `unmountOnBlur: false` is the default, no action needed
- ScrollView/FlatList scroll positions are preserved automatically
- Assistant tab's conversation state persists via Zustand store (already manages messages)

---

## R-003: Deep Linking Between Tabs with Context

**Decision**: Use Expo Router's `router.push()` with route params for cross-tab deep links. For "Ask about this" from candidate/theme to Assistant, use the assistant store's `setPreloadedContext()` method before navigating.

**Rationale**: Expo Router supports passing params via `router.push('/assistant?context=candidate-a&mode=comprendre')`. However, for complex context (full candidate data, theme details), storing context in the Zustand assistant store before navigation is cleaner than URL params. The assistant tab reads preloaded context on mount/focus.

**Alternatives considered**:
- **URL search params only**: Rejected for complex objects. Would work for simple IDs but not for pre-filled prompt text.
- **React Context across tabs**: Rejected because Zustand already manages cross-component state and adding a Context provider adds unnecessary layering.

**Key implementation details**:
- "Ask about this" action: `useAssistantStore.setState({ preloadedContext, mode })` then `router.push('/(tabs)/assistant')`
- "Comparer" action from candidate profile: `router.push('/comparison?candidates=id1,id2')`
- "Debattre" action from candidate profile: `useAssistantStore.setState({ mode: 'debattre', selectedCandidateId })` then `router.push('/(tabs)/assistant')`

---

## R-004: Card-Based UI Pattern with NativeWind

**Decision**: Implement cards as reusable View components with consistent NativeWind utility classes. Define a base card style pattern (rounded corners, shadow, padding, background) applied consistently across all card types.

**Rationale**: NativeWind (Tailwind for React Native) supports shadow, border-radius, and spacing utilities. A consistent card pattern (`rounded-2xl bg-white shadow-sm p-4`) creates the uniform visual language the spec requires. No additional UI library needed beyond NativeWind + base React Native components.

**Alternatives considered**:
- **Gluestack Card component**: Rejected because gluestack-ui v3's Card component adds abstraction over basic View styling with limited customization. NativeWind utility classes provide more control with less overhead.
- **Custom Card primitive component**: Considered but rejected as premature abstraction. NativeWind classes are composable; a shared `className` pattern achieves consistency without a wrapper component. If needed later, extraction is trivial.

**Key implementation details**:
- Base card pattern: `className="rounded-2xl bg-white shadow-sm p-4 mb-3"`
- Candidate card: Adds `overflow-hidden` for photo clipping, fixed aspect ratio
- Action card (shortcuts): Larger padding, bold text, icon left-aligned
- Info card (voting, trust): Subtle border, muted background variant

---

## R-005: Assistant Tab vs Floating Panel Architecture

**Decision**: Replace the floating ChatbotFAB + ChatbotPanel overlay with a dedicated full-screen Assistant tab. The chatbot store is renamed to assistant store and gains conversation persistence.

**Rationale**: The spec explicitly calls for a center tab (FR-026) with a visible mode selector. A floating panel is inherently secondary and hidden behind a FAB button. A full tab gives the assistant equal weight with the other two intents, matches the "3 simple user intents" design philosophy, and provides more screen real estate for chat, mode selection, and source references.

**Alternatives considered**:
- **Keep floating panel + also add tab**: Rejected as confusing (two entry points to the same feature). The tab alone is sufficient and cleaner.
- **Bottom sheet instead of tab**: Rejected because it still treats the assistant as secondary and doesn't provide persistent mode selector visibility.

**Key implementation details**:
- Remove `ChatbotFAB.tsx` and `ChatbotPanel.tsx`
- Create `(tabs)/assistant.tsx` as full-screen chat with mode selector at top
- Rename `chatbot.ts` store to `assistant.ts`, add MMKV persistence for conversation history
- Preserve SSE streaming architecture in chatbot service (no changes to API layer)

---

## R-006: Candidate Gallery Equal-Weight Layout

**Decision**: Use a 2-column FlatList grid for the candidate gallery. Each card has identical dimensions with candidate photo, name, and party. No card is visually larger, bolder, or more prominently positioned than any other.

**Rationale**: A grid layout with `numColumns={2}` and equal `flex` per item guarantees visual parity. Combined with the existing deterministic shuffle (daily seed from `utils/shuffle.ts`), this ensures no candidate receives positional advantage. The 2-column layout works well on mobile screens for 4 candidates (2 rows) and scales to more candidates.

**Alternatives considered**:
- **Single column list**: Rejected because it creates positional bias (first candidate is most visible) and wastes screen space.
- **3-column grid**: Rejected because cards would be too small on mobile to show candidate photos and names readably.
- **Horizontal scroll**: Rejected because it hides candidates off-screen, creating unequal visibility.

**Key implementation details**:
- `FlatList` with `numColumns={2}`, `columnWrapperStyle` for equal gap
- Card dimensions: fixed height via `aspectRatio`, photo fills top half, text below
- Shuffle order: existing `deterministicShuffle()` with daily rotation
- Each card is `Pressable` navigating to `/candidate/[id]`

---

## R-007: Survey Mid-Progress Persistence

**Decision**: Extend the existing survey Zustand store with MMKV persistence to save in-progress answers (not just completed results). The store already persists via `zustandStorage`; the change is ensuring `currentQuestionIndex` and partial `answers` are included in the persisted state.

**Rationale**: The spec requires that users can close the app mid-survey and resume (User Story 4, scenario 7). The current store persists completed results but the `status` and `currentQuestionIndex` fields must also survive app restarts. Since the store already uses MMKV persistence middleware, this is a configuration change, not an architecture change.

**Alternatives considered**:
- **Separate MMKV key for survey progress**: Rejected as unnecessary duplication. The Zustand persist middleware already handles the full state.
- **No persistence until completion**: Rejected because it violates the spec requirement for mid-survey resume.

---

## R-008: Onboarding and First-Time User State

**Decision**: Create a new `app.ts` Zustand store with MMKV persistence tracking `hasCompletedOnboarding: boolean`. On first launch, the root layout checks this flag and renders the onboarding screen. After onboarding, the flag is set to `true` and the user proceeds to the tabs.

**Rationale**: A simple boolean flag persisted in MMKV is the lightest approach. The onboarding screen is a stack screen above the tabs (not a tab itself), shown conditionally from the root layout.

**Alternatives considered**:
- **AsyncStorage flag**: Rejected because the project already uses MMKV and adding AsyncStorage is unnecessary.
- **Onboarding as first tab screen with conditional redirect**: Rejected because it adds routing complexity and flash of wrong screen.

---

## R-009: Feedback Storage Strategy

**Decision**: Store feedback signals in MMKV as a JSON array. Each feedback entry contains: timestamp, screen context (candidate ID / theme ID / assistant mode), feedback type ("unclear" | "missing" | "general"), and optional user text. No server-side submission in MVP.

**Rationale**: The spec states feedback is stored locally for later aggregation (Assumptions section). MMKV is already available and handles JSON serialization. The feedback is lightweight (text + metadata) and accumulates slowly (user-initiated action), so storage size is not a concern.

**Alternatives considered**:
- **SQLite table for feedback**: Rejected as over-engineered for simple append-only storage that doesn't need querying.
- **Server submission with offline queue**: Rejected as out of scope for MVP per spec assumptions.

---

## R-010: Migration from Feature 001 Route Structure

**Decision**: Replace the feature 001 route structure with the new 3-tab layout. The new route files under `(tabs)/` implement the canonical navigation model. Feature 001's flat routes (`index.tsx`, `learn.tsx`) and floating chatbot components are superseded. Services, data layer, and utilities remain untouched.

**Rationale**: Since this is a frontend-only redesign on a new feature branch, a clean replacement is safer than incremental migration. Feature 001's route files are replaced with the new tab-based structure. Shared components (PositionCard, SourceReference, ContradictionCard) are refactored in place to support the new design without breaking their interfaces.

**Steps**:
1. Create `(tabs)/_layout.tsx` with 3-tab configuration (Accueil, Assistant, Candidats)
2. Move `index.tsx` content to `(tabs)/index.tsx`, redesign as new Accueil
3. Split `learn.tsx` into `(tabs)/candidates.tsx` (gallery) and `(tabs)/assistant.tsx` (full-screen chat)
4. Remove `learn.tsx` and feature 001's floating chatbot components (ChatbotFAB, ChatbotPanel)
5. Create `candidate/[id].tsx` for candidate profiles (extracted from Learn into dedicated stack screen)
6. Create `comparison.tsx` as standalone stack screen (extracted from Learn)
7. Rename survey routes: `context.tsx` → `intro.tsx`
8. Add `onboarding.tsx` stack screen
9. Reorganize components into feature directories
10. Update all imports

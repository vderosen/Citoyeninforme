# Research: Swipe Survey Redesign

**Feature**: 019-swipe-survey-redesign
**Date**: 2026-02-20

## R1: Gesture Handling Library

**Decision**: Use `react-native-gesture-handler` (Gesture API v2) with `react-native-reanimated` for swipe detection and animation.

**Rationale**:
- `react-native-gesture-handler` v2.28.0 is already available as a transitive dependency (via expo-router, react-native-screens)
- `react-native-reanimated` v4.1.1 is already a direct dependency and actively used throughout the codebase (12+ component files)
- The modern `Gesture.Pan()` API runs gesture recognition on the native thread, ensuring 60fps
- `runOnJS` bridge allows calling Zustand store actions from worklet context
- No new dependency installation needed; just add `react-native-gesture-handler` as an explicit direct dependency for clarity

**Alternatives considered**:
- **React Native PanResponder**: Built-in but JS-thread bound, would cause jank during animations. Rejected.
- **react-native-swipeable**: Third-party wrapper, adds dependency for a use case easily handled by gesture-handler + reanimated. Rejected.
- **Custom touch event handling**: Low-level, hard to get right across platforms. Rejected.

## R2: Four-Direction Swipe Detection

**Decision**: Use a threshold-based direction detection algorithm with dead zone and dominant axis logic.

**Rationale**:
The swipe needs to distinguish 4 directions reliably. The algorithm:

1. **Dead zone**: If displacement < 120px in both axes, snap card back (no swipe registered)
2. **Dominant axis**: Compare `|translationX|` vs `|translationY|`
   - If `|translationX| > |translationY|`: horizontal swipe → left (translationX < 0) or right (translationX > 0)
   - If `|translationY| > |translationX|`: vertical swipe → up (translationY < 0) or down (translationY > 0)
3. **Velocity boost**: Also check velocity for quick flick gestures — if `|velocityX| > 800` or `|velocityY| > 800`, reduce the displacement threshold to 60px

This gives clear separation between the 4 directions while the dead zone prevents accidental swipes.

**Alternatives considered**:
- **Angle-based detection** (compute atan2 of translation vector): More mathematically elegant but harder to tune thresholds for 4 quadrants. The dominant-axis approach is simpler and equally effective.
- **Velocity-only detection**: Unreliable for slow, deliberate swipes. Rejected.

## R3: Scoring Model — Adapter Pattern

**Decision**: Create a pure adapter function that converts `StatementCard[]` to `QuestionDefinition[]` (matching) and `SurveyQuestion[]` (contradiction detection), preserving the existing matching algorithm unchanged.

**Rationale**:
The existing `computeMatching()` function takes `QuestionDefinition[]` with options that have `themeScores`. The contradiction detection takes `SurveyQuestion[]` with the same structure. Rather than modifying these services, we create a bridge:

Each `StatementCard` has `baseScores: Record<string, number>` (e.g., `{ transport: 1 }`). The adapter generates 4 virtual options per card:

| Swipe Direction | Option ID suffix | Multiplier | Example: baseScores = { transport: 1 } |
|----------------|-----------------|------------|----------------------------------------|
| Right (agree) | `-agree` | ×1 | { transport: 1 } |
| Left (disagree) | `-disagree` | ×(-1) | { transport: -1 } |
| Up (strongly agree) | `-strongly_agree` | ×2 | { transport: 2 } |
| Down (strongly disagree) | `-strongly_disagree` | ×(-2) | { transport: -2 } |

The store records: `answers["s01"] = "s01-agree"` — matching the option ID convention.

At computation time:
1. Adapter converts statement cards → `QuestionDefinition[]`
2. Pass `{ answers, importanceWeights: {}, questions: adapted, candidates }` to `computeMatching()`
3. The matching algorithm's default weight of 0.5 applies to all themes (line 88: `importanceWeights[themeId] ?? 0.5`)
4. Pass to `detectContradictions(themeScores, answers, adaptedSurveyQuestions)` unchanged

**Key insight**: The matching algorithm already defaults importance weights to 0.5 for missing entries. By passing an empty `importanceWeights: {}`, all themes get equal weight automatically. This aligns with the spec assumption that the importance slider is removed.

**Alternatives considered**:
- **Modify `computeMatching()` to accept pre-computed theme scores**: Would require changing the function signature and all callers. Higher risk, more changes. Rejected.
- **Embed 4 options directly in the data file**: Redundant data (every card would repeat the same 4-option pattern). Rejected in favor of runtime adapter.

## R4: Statement Card Data Design

**Decision**: ~18 statement cards (2–3 per theme), each a single political affirmation with `baseScores` for scoring.

**Rationale**:
- 8 themes × 2 cards minimum = 16 cards. Adding 2 cross-theme cards = 18 total.
- At ~5 seconds per card (read + swipe), 18 cards = 90 seconds. Well under the 2-minute SC-001 target.
- `baseScores` are typically `{ primaryTheme: 1 }` with optional secondary theme contributions (e.g., `{ transport: 1, ecologie: 0.5 }`)
- The score range per card per theme is [-2, +2] after applying the direction multiplier, matching the current system's range
- Aggregate theme scores will be larger (more data points per theme) but the matching algorithm uses relative differences, so this scales correctly

**Card content principles** (Constitution I — Neutrality):
- Each statement is a clear political affirmation (not a question)
- Phrased in the positive voice: "Paris devrait..." or "Il faut..."
- No leading language, no emotionally loaded terms
- Cover the spectrum of political positions across each theme

## R5: Visual Feedback During Drag

**Decision**: Use animated overlays showing direction-specific icons and labels with opacity proportional to drag distance.

**Rationale**:
- As the user drags the card, an overlay appears showing the action label:
  - Right: "D'accord" with ✓ icon (green tint)
  - Left: "Pas d'accord" with ✗ icon (red tint)
  - Up: "Coup de cœur" with ❤️ icon (gold tint)
  - Down: "Catastrophe" with ⚡ icon (dark tint)
- Overlay opacity = `Math.min(1, displacement / threshold)` — gradually appears as drag progresses
- Card tilts slightly in the drag direction (rotation = `translationX / 20` degrees for horizontal)
- All animations run on the UI thread via reanimated worklets

**Reduced motion behavior** (FR-016):
- When `useReducedMotion()` returns true: disable card rotation and flight animation
- Card simply fades out (opacity → 0) instead of flying off-screen
- Overlay feedback still appears (static, no animation)
- Button alternatives become the primary input method

## R6: Undo Implementation

**Decision**: Maintain a stack of swiped cards in component state. Undo pops the last card and clears its answer from the store.

**Rationale**:
- The SwipeStack component keeps a local array `swipedCards: { card: StatementCard, direction: SwipeDirection }[]`
- Undo pops the last entry, re-inserts the card at the top of the deck, and calls `store.clearAnswer(cardId)`
- Only one level of undo (last swipe only) per the spec — the stack is used but only the last element is undoable
- The undo animation reverses the swipe: card flies back from the edge to center position

## R7: Progress Persistence

**Decision**: Persist swipe progress after each swipe via Zustand persist middleware (existing `survey-state` key).

**Rationale**:
- The existing `useSurveyStore` already uses Zustand `persist` middleware with AsyncStorage
- After each swipe, the store's `answers` record is updated, which triggers persistence
- Additionally, `currentQuestionIndex` (renamed conceptually to `currentCardIndex`) tracks position
- On app restart, the survey resumes at the correct card with previous answers intact
- If the dataset version changes (`isResultsStale`), incomplete progress is reset (existing behavior)

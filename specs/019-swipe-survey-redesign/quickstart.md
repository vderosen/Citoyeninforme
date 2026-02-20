# Quickstart: Swipe Survey Redesign

**Feature**: 019-swipe-survey-redesign
**Date**: 2026-02-20

## Integration Scenarios

### Scenario 1: Complete Swipe Survey (Happy Path)

**Preconditions**: User has completed onboarding, civic intro screen shown, election dataset loaded.

1. User navigates from intro.tsx → questions.tsx
2. The `SwipeStack` loads `statementCards` from election store, shuffles them
3. The first card appears with statement text, theme icon, and theme name
4. User swipes right (agree) on the first card
   - Card animates off-screen to the right
   - Store records: `answers["s01"] = "s01-agree"`
   - Progress updates: "1 / 18"
5. User continues swiping through all 18 cards (mix of directions)
6. After the last card is swiped:
   - Store sets status to `"computing"`
   - `swipeAdapter.statementCardsToQuestionDefs(cards)` converts cards to `QuestionDefinition[]`
   - `computeMatching({ answers, importanceWeights: {}, questions: adapted, candidates })` runs
   - `detectContradictions(themeScores, answers, adaptedSurveyQuestions)` runs
   - Store receives `UserProfile` with theme scores, candidate ranking, contradictions
   - Router navigates to results.tsx

**Expected output**: Results screen shows theme profile, candidate ranking sorted by alignment %, and any detected contradictions.

### Scenario 2: Strong Opinions (Up/Down Swipes)

**Preconditions**: Same as Scenario 1.

1. User swipes UP (coup de cœur) on 2 transport cards
   - Each card's `baseScores.transport` is multiplied by 2
   - Aggregate transport score = ~4 (2 cards × baseScore 1 × multiplier 2)
2. User swipes DOWN (catastrophe) on 2 ecology cards
   - Each card's `baseScores.ecologie` is multiplied by -2
   - Aggregate ecology score = ~-4
3. User swipes right/left on remaining cards (moderate opinions)

**Expected output**: Theme profile shows transport as strongly positive, ecology as strongly negative. The transport↔ecology contradiction rule should NOT trigger (rule checks transport < -1 AND ecology > 1, but here transport is positive). Candidate ranking reflects strong transport preference.

### Scenario 3: Contradiction Detection

**Preconditions**: Same as Scenario 1.

1. User swipes UP on budget cards (strongly agrees with fiscal discipline)
   - Aggregate budget score > 1
2. User swipes UP on social cards (strongly agrees with social spending)
   - Aggregate social score > 1

**Expected output**: The budget↔social contradiction rule triggers (budget > 1 AND social > 1, severity: high). Results screen shows contradiction card explaining the tension.

### Scenario 4: Undo Last Swipe

**Preconditions**: User has swiped at least 1 card.

1. User swipes right on card "s05"
   - Store records: `answers["s05"] = "s05-agree"`
   - Progress: "5 / 18"
2. User taps the undo button
   - Card "s05" returns to the top of the stack with reverse animation
   - Store clears: `delete answers["s05"]`
   - Progress: "4 / 18"
3. User swipes DOWN on card "s05" instead
   - Store records: `answers["s05"] = "s05-strongly_disagree"`

**Expected output**: The final results reflect the corrected answer (strongly disagree, not agree).

### Scenario 5: Accessible Button Input

**Preconditions**: Same as Scenario 1.

1. User taps the "D'accord" button (instead of swiping right)
   - Card animates off-screen to the right (same animation as swipe)
   - Store records the same answer format: `answers["s01"] = "s01-agree"`
2. User completes the entire survey using only buttons

**Expected output**: Identical results to Scenario 1 if the same directions are chosen. No difference in scoring between swipe and button input.

### Scenario 6: Resume Incomplete Survey

**Preconditions**: User started survey, swiped 8 cards, force-quit the app.

1. User reopens the app and navigates to the survey
2. Store hydrates from AsyncStorage: `answers` has 8 entries, `currentQuestionIndex = 8`
3. SwipeStack skips the first 8 cards and shows card 9

**Expected output**: User resumes from card 9 / 18. Previous answers are preserved.

### Scenario 7: Reduced Motion

**Preconditions**: Device has "Reduce Motion" accessibility setting enabled.

1. User swipes a card
   - Card fades out (opacity 0) instead of flying off-screen
   - No rotation animation during drag
   - Direction feedback overlay still appears (static)
2. User taps accessible buttons
   - Card fades out with same reduced animation

**Expected output**: Full functionality preserved, no motion-intensive animations.

### Scenario 8: All Same Direction

**Preconditions**: Same as Scenario 1.

1. User swipes RIGHT on every single card (agrees with everything)
2. Survey completes, matching runs

**Expected output**: All theme scores are positive (sum of baseScores × 1 for each card). Candidate ranking computed normally. Possible contradictions if conflicting themes both score > 1. This is a valid expression of opinion per spec edge cases.

## Adapter Verification

The adapter function must satisfy:

```
For every StatementCard c with baseScores { t1: v1, t2: v2 }:
  - agree option themeScores       = { t1: v1,     t2: v2 }
  - disagree option themeScores    = { t1: -v1,    t2: -v2 }
  - strongly_agree themeScores     = { t1: 2*v1,   t2: 2*v2 }
  - strongly_disagree themeScores  = { t1: -2*v1,  t2: -2*v2 }
```

And: `computeMatching` with adapter-produced questions returns the same `MatchingOutput` structure as the current QCM flow (same types, same algorithm, just different input data).

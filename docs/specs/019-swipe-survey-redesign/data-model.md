# Data Model: Swipe Survey Redesign

**Feature**: 019-swipe-survey-redesign
**Date**: 2026-02-20

## New Entities

### StatementCard

A political affirmation card that the user swipes to express their opinion.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Unique identifier (e.g., "s01") | Required, unique across dataset |
| electionId | string | Links to parent election | Must match election.id |
| text | string | The political affirmation text | Required, non-empty |
| themeIds | string[] | Associated theme(s) | 1+ entries, each must exist in themes |
| baseScores | Record<string, number> | Scoring values for "agree" direction | Keys must be valid theme IDs, values typically 0.5–1.0 |
| order | number | Default display order | Required, positive integer |

**Scoring mechanics**: When the user swipes, the `baseScores` are multiplied by a direction multiplier:
- Swipe right (agree): ×1
- Swipe left (disagree): ×(-1)
- Swipe up (strongly agree): ×2
- Swipe down (strongly disagree): ×(-2)

**Example**:
```json
{
  "id": "s01",
  "electionId": "paris-municipales-2026",
  "text": "Paris devrait investir massivement dans les transports en commun, même en réduisant la place de la voiture.",
  "themeIds": ["transport"],
  "baseScores": { "transport": 1, "ecologie": 0.5 },
  "order": 1
}
```

If the user swipes up (strongly agree): `transport += 2, ecologie += 1`
If the user swipes left (disagree): `transport -= 1, ecologie -= 0.5`

### SwipeDirection (enum)

The four possible swipe directions.

| Value | Meaning | Multiplier | Option ID suffix |
|-------|---------|------------|-----------------|
| `"agree"` | Swipe right | ×1 | `-agree` |
| `"disagree"` | Swipe left | ×(-1) | `-disagree` |
| `"strongly_agree"` | Swipe up (coup de cœur) | ×2 | `-strongly_agree` |
| `"strongly_disagree"` | Swipe down (catastrophe) | ×(-2) | `-strongly_disagree` |

### SwipeResponse (derived)

A user's reaction to a statement card. Stored in the Zustand survey store as `answers[cardId] = optionId`.

| Field | Type | Description |
|-------|------|-------------|
| cardId | string | The statement card's id |
| optionId | string | `{cardId}-{direction}` (e.g., "s01-agree") |

This format is compatible with the existing `answers: Record<string, string>` in the survey store.

## Modified Entities

### ElectionDataset (schema.ts)

Add `statementCards` field:

```typescript
export interface ElectionDataset {
  election: Election;
  candidates: Candidate[];
  themes: Theme[];
  positions: Position[];
  surveyQuestions: SurveyQuestion[];  // Kept for backward compatibility
  statementCards: StatementCard[];    // NEW: used by swipe survey
  civicFacts: CivicFact[];
  logistics: ElectionLogistics;
}
```

### SurveyState (survey store)

Adapted state shape — the `answers` record continues to map card IDs to option IDs (e.g., `"s01" → "s01-agree"`). The `importanceWeights` field becomes unused (empty object passed to matching, defaults to 0.5).

| Field | Change | Notes |
|-------|--------|-------|
| `status` | No change | Same 6 states |
| `currentQuestionIndex` | Semantic rename to "current card index" | Same field, different context |
| `answers` | Format change | Value changes from option IDs like "q01-a" to "s01-agree" |
| `importanceWeights` | Deprecated | Always `{}` — matching defaults to 0.5 per theme |
| `profile` | No change | Same UserProfile structure |
| `datasetVersion` | No change | Same staleness tracking |

## Adapter Function

### `swipeAdapter.statementCardsToQuestionDefs(cards: StatementCard[]): QuestionDefinition[]`

Converts statement cards to the format expected by `computeMatching()`.

**Input**: `StatementCard[]`
**Output**: `QuestionDefinition[]` where each card produces one "question" with 4 options

```
For each card:
  → QuestionDefinition {
      id: card.id,
      themeIds: card.themeIds,
      options: [
        { id: "{card.id}-agree",             themeScores: baseScores × 1 },
        { id: "{card.id}-disagree",          themeScores: baseScores × (-1) },
        { id: "{card.id}-strongly_agree",    themeScores: baseScores × 2 },
        { id: "{card.id}-strongly_disagree", themeScores: baseScores × (-2) },
      ]
    }
```

### `swipeAdapter.statementCardsToSurveyQuestions(cards: StatementCard[]): SurveyQuestion[]`

Converts statement cards to the format expected by `detectContradictions()`.

Same logic as above but produces `SurveyQuestion` objects with full fields (`electionId`, `text`, `order`).

## Data File: statement-cards.json

**Location**: `src/data/elections/paris-2026/statement-cards.json`
**Count**: ~18 cards (2–3 per theme, some cross-theme)
**Structure**: Array of `StatementCard` objects

### Card Distribution by Theme

| Theme | Cards | Cross-theme? |
|-------|-------|--------------|
| Transport & Mobilité | 2 primary + 1 shared with Écologie | Yes |
| Logement | 2 | No |
| Sécurité | 2 | No |
| Écologie & Environnement | 2 primary + 1 shared with Transport | Yes |
| Budget & Finances | 2 primary + 1 shared with Social | Yes |
| Culture & Patrimoine | 2 | No |
| Éducation & Jeunesse | 2 | No |
| Social & Solidarité | 2 primary + 1 shared with Budget | Yes |

Total: ~18 cards. Each theme gets at least 2 data points (SC-003).

## Relationship Diagram

```
statement-cards.json
        │
        ▼
  StatementCard[]
        │
        ├──→ SwipeStack (UI component)
        │         │
        │         ├── SwipeCard (gesture + animation)
        │         ├── SwipeOverlay (visual feedback)
        │         └── SwipeButtons (accessible alternatives)
        │
        └──→ swipe-adapter.ts
                  │
                  ├──→ QuestionDefinition[] ──→ computeMatching() ──→ CandidateMatchResult[]
                  │
                  └──→ SurveyQuestion[] ──→ detectContradictions() ──→ ContradictionResult[]
```

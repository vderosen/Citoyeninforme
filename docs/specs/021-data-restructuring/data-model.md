# Data Model: Restructuration des Donnees Electorales

**Branch**: `021-data-restructuring` | **Date**: 2026-02-21
**Source**: Spec key entities + research decisions

## Entity Relationship Diagram

```text
┌──────────────────────────────────────────────────────────────┐
│                    election.json                              │
│                                                              │
│  ┌──────────────┐                                            │
│  │   Election   │                                            │
│  │              │     ┌────────────────┐                     │
│  │ id           │     │ElectionLogistics│                    │
│  │ city         │     │                │                     │
│  │ type         │     │ keyDates       │                     │
│  │ year         │     │ eligibility    │                     │
│  │ votingRules  │     │ votingMethods  │                     │
│  │ timeline     │     │ locations      │                     │
│  │ dataVersion  │     │ officialSources│                     │
│  │ lastUpdated  │     └────────────────┘                     │
│  └──────────────┘                                            │
│                       ┌────────────────┐                     │
│                       │   CivicFact    │                     │
│                       │                │                     │
│                       │ id             │                     │
│                       │ text           │                     │
│                       │ category       │                     │
│                       │ source         │                     │
│                       │ order          │                     │
│                       └────────────────┘                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    candidates.json                            │
│                                                              │
│  ┌────────────┐       ┌────────────┐                         │
│  │   Theme    │       │  Candidate │──┐                      │
│  │            │       │            │  │                       │
│  │ id         │       │ id         │  │  ┌──────────┐        │
│  │ name       │       │ name       │  ├──│ Position │        │
│  │ icon       │       │ party      │  │  │          │        │
│  │ description│       │ bio        │  │  │ themeId  │        │
│  │ displayOrder│      │ style      │  │  │ summary  │        │
│  └─────┬──────┘       │ programUrl │  │  │ details  │        │
│        │              └────────────┘  │  │ sourceIds│        │
│        │                              │  │ measures │        │
│        │         N:1                  │  │ verified │        │
│        │◄─────────────────────────────┘  └────┬─────┘        │
│        │                                      │              │
│        │                                ┌─────┴─────┐        │
│        │                                │  Measure  │        │
│        │                                │           │        │
│        │                                │ text      │        │
│        │                                │ sourceIds │        │
│        │                                └───────────┘        │
│        │                                      │              │
│        │                                      │ ref          │
│  ┌─────┴──────────────────────────────────────┴─────┐        │
│  │              sources (dictionary)                 │        │
│  │                                                   │        │
│  │   key → { title, url, type, accessDate }          │        │
│  └───────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      survey.json                             │
│                                                              │
│  ┌────────────────┐        ┌────────────────┐                │
│  │ SurveyQuestion │        │ StatementCard  │                │
│  │                │        │                │                │
│  │ id             │        │ id             │                │
│  │ text           │        │ text           │                │
│  │ themeIds  ─────┼── ref  │ themeIds ──────┼── ref to       │
│  │ options        │  to    │ baseScores     │  Theme.id      │
│  │ order          │  Theme │ order          │                │
│  └────────────────┘        └────────────────┘                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   UserProfile    │  (stored locally on device — NOT in dataset)
│                  │
│ surveyAnswers    │
│ themeScores      │
│ importanceWeights│
│ contradictions   │
│ candidateRanking │
│ completedAt      │
└──────────────────┘
```

## File Schemas

### election.json — Institutional data

```typescript
interface ElectionFile {
  election: {
    id: string;
    city: string;
    type: string;
    year: number;
    votingRules: VotingRules;
    timeline: ElectionTimeline;
    dataVersion: string;
    lastUpdated: string;
  };
  logistics: {
    keyDates: LogisticsDate[];
    eligibility: EligibilityStep[];
    votingMethods: VotingMethod[];
    locations: VotingLocation[];
    officialSources: SourceReference[];
  };
  civicFacts: CivicFactEntry[];
}

interface CivicFactEntry {
  id: string;
  text: string;
  category: "governance" | "voting" | "institutions";
  source: SourceReference;
  order: number;
}
```

**Note**: `electionId` is removed from logistics and civicFacts — implicit by file.

### candidates.json — Campaign data

```typescript
interface CandidatesFile {
  themes: ThemeEntry[];
  candidates: CandidateEntry[];
  sources: Record<string, SourceReference>;
}

interface ThemeEntry {
  id: string;
  name: string;
  icon: string;
  description: string;
  displayOrder: number;
}

interface CandidateEntry {
  id: string;
  name: string;
  party: string;
  bio: string;
  communicationStyle: string;
  programSourceUrl: string;
  photoUrl?: string;
  partyColor?: string;
  positions: PositionEntry[];
}

interface PositionEntry {
  themeId: string;
  summary: string;
  details: string;
  sourceIds: string[];
  measures: MeasureEntry[];
  lastVerified: string;
}

interface MeasureEntry {
  text: string;
  sourceIds: string[];
}
```

**Note**: `id`, `electionId`, and `candidateId` are removed from Position — all implicit by nesting. Sources are referenced by ID from the `sources` dictionary.

### survey.json — Interactive data

```typescript
interface SurveyFile {
  surveyQuestions: SurveyQuestionEntry[];
  statementCards: StatementCardEntry[];
}

interface SurveyQuestionEntry {
  id: string;
  text: string;
  themeIds: string[];
  options: SurveyOption[];
  order: number;
}

interface StatementCardEntry {
  id: string;
  text: string;
  themeIds: string[];
  baseScores: Record<string, number>;
  order: number;
}
```

**Note**: `electionId` is removed from both — implicit by file.

## Runtime Types (store API — unchanged)

The loader reconstructs these flat types from the file schemas above. These are what components consume and they remain unchanged:

```typescript
// Unchanged — components see exactly the same types
interface Position {
  id: string;           // Generated: `${candidateId}-${themeId}`
  candidateId: string;  // Injected from parent candidate
  themeId: string;
  summary: string;
  details: string;
  sources: SourceReference[];  // Dereferenced from sourceIds
  measures: Measure[];         // NEW — passed through from file
  lastVerified: string;
}

// NEW type
interface Measure {
  text: string;
  sourceIds: string[];  // NOTE: kept as IDs in runtime type too, sources
                        // can be resolved via position.sources or the store
}
```

**Important**: The `Position` type in `schema.ts` gains a `measures` field. Since existing positions have `measures: []` (empty array), no consuming component breaks — they simply don't access a field they didn't know about.

## Validation Rules

### election.json
- `election.id` is required and non-empty
- `election.city`, `election.year`, `election.dataVersion` are required
- `logistics.officialSources` must have at least 1 entry
- `civicFacts[].source` is required (Principle II)

### candidates.json
- Each `themes[].id` must be unique
- Each `candidates[].id` must be unique
- Each `candidates[].positions[].themeId` must reference an existing theme
- Each (candidateId, themeId) pair must be unique (no duplicate positions)
- Each `sourceIds[]` entry must reference an existing key in the `sources` dictionary
- `measures` can be empty but must be a valid array
- Each measure's `sourceIds` must reference existing keys in `sources`

### survey.json
- Each `surveyQuestions[].id` must be unique
- Each `surveyQuestions[].themeIds[]` must reference a theme from candidates.json
- Each question must have at least 2 options
- Each `statementCards[].id` must be unique
- Each `statementCards[].themeIds[]` must reference a theme
- Each `statementCards[].baseScores` key must reference a theme

### Cross-file validation
- Theme IDs referenced in survey.json must exist in candidates.json themes array

## State Transitions

No changes to survey or chatbot state machines. Data loading remains synchronous from bundled JSON.

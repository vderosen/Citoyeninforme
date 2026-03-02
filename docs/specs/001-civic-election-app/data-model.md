# Data Model: Lucide Civic Election App MVP

**Branch**: `001-civic-election-app` | **Date**: 2026-02-13
**Source**: Spec key entities + research decisions

## Entity Relationship Diagram

```text
┌──────────────┐
│   Election   │──────────────────────────────────────────┐
│              │                                           │
│ id           │       ┌────────────┐                      │
│ city         │───1:N─│  Candidate │──┐                   │
│ type         │       │            │  │                   │
│ year         │       │ id         │  │                   │
│ votingRules  │       │ name       │  │  ┌──────────────┐ │
│ timeline     │       │ party      │  ├──│   Position   │ │
└──────┬───────┘       │ bio        │  │  │              │ │
       │               │ style      │  │  │ id           │ │
       │               │ programUrl │  │  │ summary      │ │
       │               └────────────┘  │  │ details      │ │
       │                               │  │ sources      │ │
       │               ┌────────────┐  │  │ measures ────┼─┐
       │───────────1:N─│   Theme    │──┘  └──────┬───────┘ │
       │               │            │  N:1  │ N:1│    1:N  │
       │               │ id         │◄──────┘    │         │
       │               │ name       │        ┌───┴───────┐ │
       │               │ icon       │        │  Measure  │ │
       │               │ description│        │           │ │
       │               └─────┬──────┘        │ text      │ │
       │                     │               │ sourceIds │ │
       │                     │ N:M           └───────────┘ │
       │               ┌─────┴──────────┐                  │
       │───────────1:N─│ SurveyQuestion │                  │
       │               │                │                  │
       │               │ id             │                  │
       │               │ text           │                  │
       │               │ options        │                  │
       │               │ themeIds       │                  │
       │               └────────────────┘                  │
       │                                                   │
       │               ┌────────────────┐                  │
       │───────────1:N─│ StatementCard  │                  │
       │               │                │                  │
       │               │ id             │                  │
       │               │ text           │                  │
       │               │ themeIds       │                  │
       │               │ baseScores     │                  │
       │               │ order          │                  │
       │               └────────────────┘                  │
       │                                                   │
       │               ┌────────────────┐                  │
       │───────────1:N─│   CivicFact    │                  │
       │               │                │                  │
       │               │ id             │                  │
       │               │ text           │                  │
       │               │ category       │                  │
       │               │ source         │                  │
       │               └────────────────┘                  │
       │                                                   │
       │               ┌────────────────┐                  │
       └───────────1:1─│ElectionLogistics│─────────────────┘
                       │                │
                       │ keyDates       │
                       │ eligibility    │
                       │ votingMethods  │
                       │ locations      │
                       │ officialSources│
                       └────────────────┘

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

Note: In the file format (candidates.json), positions are stored nested within
each candidate object. The data loader flattens them into a separate Position[]
array when building the in-memory ElectionDataset.
```

## Entity Definitions

### Election

The root entity for a deployment. One election per app instance.

```typescript
interface Election {
  id: string;                    // e.g., "paris-municipales-2026"
  city: string;                  // e.g., "Paris"
  type: string;                  // e.g., "Élections municipales"
  year: number;                  // e.g., 2026
  votingRules: VotingRules;
  timeline: ElectionTimeline;
  dataVersion: string;           // Semantic version for dataset auditing
  lastUpdated: string;           // ISO 8601 date
}

interface VotingRules {
  rounds: number;                // e.g., 2 for French municipal elections
  description: string;           // Human-readable voting system description
}

interface ElectionTimeline {
  registrationDeadline: string;  // ISO 8601 date
  firstRound: string;            // ISO 8601 date
  secondRound?: string;          // ISO 8601 date (optional)
}
```

**Validation rules**:
- `id` must be unique and follow the pattern `{city}-{type}-{year}` in kebab-case
- `year` must be a 4-digit number
- `dataVersion` must follow semantic versioning
- `lastUpdated` must be a valid ISO 8601 date

---

### Candidate

A person running in the election.

```typescript
interface Candidate {
  id: string;                    // e.g., "anne-hidalgo"
  electionId: string;            // FK to Election.id
  name: string;                  // Full display name
  party: string;                 // Party or list name
  bio: string;                   // Short biography (2-3 sentences)
  communicationStyle: string;    // Describes tone for Candidate Context chatbot
  programSourceUrl: string;      // URL to official program document
  photoUrl?: string;             // Optional candidate photo
}
```

**Validation rules**:
- `id` must be unique within an election
- `name` must not be empty
- `programSourceUrl` must be a valid URL
- `communicationStyle` is used by the Candidate Context system prompt (Principle I: no editorial bias in style description)

---

### Theme

A major policy area. Consistent taxonomy across all candidates (Content & Data Standards).

```typescript
interface Theme {
  id: string;                    // e.g., "transport"
  electionId: string;            // FK to Election.id
  name: string;                  // Display name, e.g., "Transport & Mobilité"
  icon: string;                  // Icon identifier for UI
  description: string;           // Short description of what this theme covers
  displayOrder: number;          // For consistent (non-editorial) ordering
}
```

**Validation rules**:
- `id` must be unique within an election
- All candidates must have positions evaluated against the same set of themes (no ad-hoc themes per candidate)
- `displayOrder` is for logical grouping only — candidate ordering within a theme is always alphabetical/randomized (Principle I)

---

### Position

A candidate's stance on a specific theme. The core content unit.

```typescript
interface Position {
  id: string;                    // e.g., "anne-hidalgo-transport"
  candidateId: string;           // FK to Candidate.id
  themeId: string;               // FK to Theme.id
  summary: string;               // 1-2 sentence summary
  details: string;               // Full position description (expandable in UI)
  sources: SourceReference[];    // At least one source required (Principle II)
  measures: Measure[];           // Concrete measures for this position (can be empty)
  lastVerified: string;          // ISO 8601 date — when sources were last checked
}

interface SourceReference {
  title: string;                 // e.g., "Programme municipal 2026"
  url: string;                   // Link to original document
  type: "program" | "statement" | "interview" | "official";
  accessDate: string;            // ISO 8601 date
}
```

**Validation rules**:
- Each (candidateId, themeId) pair must be unique
- `sources` array must have at least 1 entry (Principle II: Source-Grounded Truth)
- `url` in sources must be a valid URL
- `measures` can be an empty array if no concrete measures are documented
- If a candidate has no position on a theme, there is NO Position record — the UI displays "Pas de position documentée" (spec Edge Case 1)

---

### Measure

A concrete, actionable measure within a candidate's position on a theme. Measures are nested within positions in the file format (`candidates.json`) and flattened by the loader.

```typescript
interface Measure {
  text: string;                  // Description of the concrete measure
  sourceIds: string[];           // References to keys in the sources dictionary
}
```

**Validation rules**:
- `sourceIds` must reference existing keys in the normalized sources dictionary (defined in `candidates.json`)
- `text` must not be empty

---

### SurveyQuestion

A question in the preference questionnaire, linked to one or more themes.

```typescript
interface SurveyQuestion {
  id: string;                    // e.g., "q01"
  electionId: string;            // FK to Election.id
  text: string;                  // Question text in French
  themeIds: string[];            // FK to Theme.id — which themes this question measures
  options: SurveyOption[];       // Answer choices
  order: number;                 // Display order in questionnaire
}

interface SurveyOption {
  id: string;                    // e.g., "q01-a"
  text: string;                  // Answer text in French
  themeScores: Record<string, number>;  // Theme ID → score contribution
  // Scores are symmetric — no option inherently favors any candidate
  // (Principle I: No hidden weighting)
}
```

**Validation rules**:
- `themeIds` must reference valid Theme.ids
- All options must have scores for the same set of theme IDs
- Score ranges must be consistent across all questions (e.g., -2 to +2)
- The sum of possible scores across all questions must be balanced — no theme can be structurally over- or under-weighted unless the user explicitly prioritizes it

---

### StatementCard

A statement used in the swipe-based survey. Each card presents a political statement that the user can agree or disagree with.

```typescript
interface StatementCard {
  id: string;                    // e.g., "sc01"
  electionId: string;            // FK to Election.id
  text: string;                  // Statement text in French
  themeIds: string[];            // FK to Theme.id — which themes this statement relates to
  baseScores: Record<string, number>;  // CandidateId → base alignment score
  order: number;                 // Display order in the swipe stack
}
```

**Validation rules**:
- `id` must be unique within an election
- `themeIds` must reference valid Theme.ids
- `baseScores` keys must reference valid Candidate.ids
- `order` determines the default card presentation sequence

---

### CivicFact

Educational content for the civic context mini-module shown before the survey.

```typescript
interface CivicFact {
  id: string;                    // e.g., "fact-01"
  electionId: string;            // FK to Election.id
  text: string;                  // Fact text in French
  category: "governance" | "voting" | "institutions";
  source: SourceReference;       // Must be sourced (Principle II)
  order: number;                 // Display order in mini-module
}
```

**Validation rules**:
- `source` is required (Principle II)
- `category` must be one of the defined enum values
- Facts must be verifiable and non-editorial (Principle I)

---

### ElectionLogistics

Practical voting information.

```typescript
interface ElectionLogistics {
  electionId: string;            // FK to Election.id (1:1 relationship)
  keyDates: LogisticsDate[];
  eligibility: EligibilityStep[];
  votingMethods: VotingMethod[];
  locations: VotingLocation[];
  officialSources: SourceReference[];
}

interface LogisticsDate {
  label: string;                 // e.g., "Date limite d'inscription"
  date: string;                  // ISO 8601 date
  description?: string;
}

interface EligibilityStep {
  order: number;
  text: string;                  // e.g., "Être inscrit sur les listes électorales"
}

interface VotingMethod {
  type: "in-person" | "proxy" | "mail";
  description: string;
  requirements?: string;
}

interface VotingLocation {
  name: string;
  address: string;
  hours?: string;
  notes?: string;
}
```

**Validation rules**:
- `officialSources` must have at least one entry verified against government sources (Constitution: Content & Data Standards)
- All dates must be valid ISO 8601

---

### UserProfile

Stored locally on device only. NOT part of the election dataset.

```typescript
interface UserProfile {
  surveyAnswers: Record<string, string>;     // QuestionId → selected OptionId
  themeScores: Record<string, number>;       // ThemeId → computed score
  importanceWeights: Record<string, number>; // ThemeId → user-assigned importance (0-1)
  contradictions: Contradiction[];           // Detected preference inconsistencies
  candidateRanking: CandidateMatch[];        // Sorted by alignment score
  completedAt: string;                       // ISO 8601 timestamp
}

interface Contradiction {
  themeA: string;                // Theme ID
  themeB: string;               // Theme ID
  description: string;          // Human-readable explanation
  severity: "low" | "medium" | "high";
}

interface CandidateMatch {
  candidateId: string;          // FK to Candidate.id
  alignmentScore: number;       // 0-100 percentage
  justification: ThemeJustification[];
}

interface ThemeJustification {
  themeId: string;
  alignment: "agree" | "partial" | "disagree";
  weight: number;               // How much this theme contributed to the score
}
```

**Validation rules**:
- `alignmentScore` must be 0-100
- `importanceWeights` values must be 0-1 and are set by the user (Principle I: no hidden weighting)
- UserProfile is NEVER sent to a server without explicit user consent (Principle VII)

## Storage

Election data is stored as bundled JSON files (3 files per election) and loaded into an in-memory Zustand store at app startup. No database is used.

## File Organization

Each election's data is split into 3 JSON files, organized by domain concern:

- **`election.json`**: Institutional data — election metadata, logistics (key dates, eligibility, voting methods), and civic facts. This data is static and comes from official government sources.
- **`candidates.json`**: Campaign data — themes, candidates with their positions nested inline (each candidate contains a `positions` array with `measures`), and a normalized `sources` dictionary. The loader flattens nested positions into a separate `Position[]` array when building the in-memory `ElectionDataset`.
- **`survey.json`**: Interactive data — survey questions (with options and theme scores) and statement cards (for the swipe-based survey). This data drives the user-facing questionnaire and matching algorithm.

Files are located at `src/data/elections/{election-id}/` (e.g., `src/data/elections/paris-2026/`).

## State Transitions

### Survey Flow State

```text
NOT_STARTED → CIVIC_CONTEXT → QUESTIONNAIRE → COMPUTING → RESULTS_READY
     │              │               │                          │
     └──────────────┴───────────────┘                          │
           (user can abandon at any point)                     │
                                                               ▼
                                                         COMPLETED
                                                    (profile persisted)
```

### Chatbot Context State

```text
CLOSED → OPEN (context selection) → LEARN_MODE
                                → CANDIDATE_MODE (candidate selection) → ACTIVE
                                → DEBATE_MODE (requires survey completion) → ACTIVE
```

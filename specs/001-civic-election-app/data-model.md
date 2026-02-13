# Data Model: Lucide Civic Election App MVP

**Branch**: `001-civic-election-app` | **Date**: 2026-02-13
**Source**: Spec key entities + research decisions

## Entity Relationship Diagram

```text
┌──────────────┐
│   Election   │──────────────────────────────────────┐
│              │                                       │
│ id           │       ┌────────────┐                  │
│ city         │───1:N─│  Candidate │──┐               │
│ type         │       │            │  │               │
│ year         │       │ id         │  │               │
│ votingRules  │       │ name       │  │  ┌──────────┐ │
│ timeline     │       │ party      │  ├──│ Position │ │
└──────┬───────┘       │ bio        │  │  │          │ │
       │               │ style      │  │  │ id       │ │
       │               │ programUrl │  │  │ summary  │ │
       │               └────────────┘  │  │ details  │ │
       │                               │  │ sources  │ │
       │               ┌────────────┐  │  └──────────┘ │
       │───────────1:N─│   Theme    │──┘       │       │
       │               │            │     N:1  │  N:1  │
       │               │ id         │◄─────────┘       │
       │               │ name       │                  │
       │               │ icon       │                  │
       │               │ description│                  │
       │               └─────┬──────┘                  │
       │                     │                         │
       │                     │ N:M                     │
       │               ┌─────┴──────────┐              │
       │───────────1:N─│ SurveyQuestion │              │
       │               │                │              │
       │               │ id             │              │
       │               │ text           │              │
       │               │ options        │              │
       │               │ themeIds       │              │
       │               └────────────────┘              │
       │                                               │
       │               ┌────────────────┐              │
       │───────────1:N─│   CivicFact    │              │
       │               │                │              │
       │               │ id             │              │
       │               │ text           │              │
       │               │ category       │              │
       │               │ source         │              │
       │               └────────────────┘              │
       │                                               │
       │               ┌────────────────┐              │
       └───────────1:1─│ElectionLogistics│─────────────┘
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
  communicationStyle: string;    // Describes tone for Candidate Mode chatbot
  programSourceUrl: string;      // URL to official program document
  photoUrl?: string;             // Optional candidate photo
}
```

**Validation rules**:
- `id` must be unique within an election
- `name` must not be empty
- `programSourceUrl` must be a valid URL
- `communicationStyle` is used by the Candidate Mode system prompt (Principle I: no editorial bias in style description)

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
- If a candidate has no position on a theme, there is NO Position record — the UI displays "Pas de position documentée" (spec Edge Case 1)

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

## SQLite Schema

The election dataset JSON files are loaded into SQLite on first launch for efficient querying.

```sql
CREATE TABLE elections (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  type TEXT NOT NULL,
  year INTEGER NOT NULL,
  voting_rules TEXT NOT NULL,       -- JSON
  timeline TEXT NOT NULL,           -- JSON
  data_version TEXT NOT NULL,
  last_updated TEXT NOT NULL
);

CREATE TABLE candidates (
  id TEXT PRIMARY KEY,
  election_id TEXT NOT NULL REFERENCES elections(id),
  name TEXT NOT NULL,
  party TEXT NOT NULL,
  bio TEXT NOT NULL,
  communication_style TEXT NOT NULL,
  program_source_url TEXT NOT NULL,
  photo_url TEXT
);

CREATE TABLE themes (
  id TEXT PRIMARY KEY,
  election_id TEXT NOT NULL REFERENCES elections(id),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL
);

CREATE TABLE positions (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id),
  theme_id TEXT NOT NULL REFERENCES themes(id),
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  sources TEXT NOT NULL,            -- JSON array of SourceReference
  last_verified TEXT NOT NULL,
  UNIQUE(candidate_id, theme_id)
);

CREATE TABLE survey_questions (
  id TEXT PRIMARY KEY,
  election_id TEXT NOT NULL REFERENCES elections(id),
  text TEXT NOT NULL,
  theme_ids TEXT NOT NULL,          -- JSON array of theme IDs
  options TEXT NOT NULL,            -- JSON array of SurveyOption
  display_order INTEGER NOT NULL
);

CREATE TABLE civic_facts (
  id TEXT PRIMARY KEY,
  election_id TEXT NOT NULL REFERENCES elections(id),
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('governance', 'voting', 'institutions')),
  source TEXT NOT NULL,             -- JSON SourceReference
  display_order INTEGER NOT NULL
);

CREATE TABLE election_logistics (
  election_id TEXT PRIMARY KEY REFERENCES elections(id),
  key_dates TEXT NOT NULL,          -- JSON array
  eligibility TEXT NOT NULL,        -- JSON array
  voting_methods TEXT NOT NULL,     -- JSON array
  locations TEXT NOT NULL,          -- JSON array
  official_sources TEXT NOT NULL    -- JSON array
);
```

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

### Chatbot Mode State

```text
CLOSED → OPEN (mode selection) → LEARN_MODE
                                → CANDIDATE_MODE (candidate selection) → ACTIVE
                                → DEBATE_MODE (requires survey completion) → ACTIVE
```

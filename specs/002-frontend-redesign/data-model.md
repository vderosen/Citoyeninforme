# Data Model: Frontend Redesign

**Feature**: 002-frontend-redesign
**Date**: 2026-02-15
**Status**: Complete

## Overview

The frontend redesign does not change the core election data model. All existing entities (Election, Candidate, Theme, Position, SurveyQuestion, CivicFact, ElectionLogistics, SourceReference) remain unchanged. The changes are limited to **client-side state** additions for the new navigation model, assistant persistence, and feedback storage.

## Unchanged Entities (from 001-civic-election-app)

These entities are read-only from the frontend perspective. They are loaded from bundled JSON into the election Zustand store and SQLite database. No schema changes.

- **Election** — city, year, voting rules, timeline, data version
- **Candidate** — name, party, bio, communication style, photo, program URL
- **Theme** — name, icon, description, display order
- **Position** — candidate stance on a theme, with summary, details, sources
- **SurveyQuestion** — question text, theme mapping, weighted options
- **CivicFact** — pre-survey civic learning facts
- **ElectionLogistics** — key dates, eligibility, voting methods, locations
- **SourceReference** — title, URL, type, access date

## New/Modified Client-Side State

### AppState (new store: `app.ts`)

Tracks application-level state that persists across sessions.

| Field | Type | Default | Persisted | Description |
|-------|------|---------|-----------|-------------|
| hasCompletedOnboarding | boolean | false | Yes (MMKV) | Whether the user has completed the first-time onboarding flow |
| lastActiveTab | string | "index" | Yes (MMKV) | Last active tab route name, for restoring on relaunch |

**State transitions**:
- `hasCompletedOnboarding`: `false` → `true` (one-way, set after onboarding complete)
- `lastActiveTab`: Updated on every tab switch

---

### AssistantState (renamed from ChatbotState: `assistant.ts`)

Replaces the current `chatbot.ts` store. Adds conversation persistence and mode-specific state.

| Field | Type | Default | Persisted | Description |
|-------|------|---------|-----------|-------------|
| mode | "comprendre" \| "parler" \| "debattre" | "comprendre" | Yes (MMKV) | Active assistant mode |
| selectedCandidateId | string \| null | null | Yes (MMKV) | Selected candidate for "parler" mode |
| messages | ChatMessage[] | [] | Yes (MMKV) | Full conversation history |
| isStreaming | boolean | false | No | Whether SSE stream is active |
| preloadedContext | AssistantContext \| null | null | No | Context passed from deep link navigation |

**New type: AssistantContext**

| Field | Type | Description |
|-------|------|-------------|
| type | "candidate" \| "theme" \| "survey_result" | What triggered the navigation |
| candidateId | string \| null | Candidate ID if navigated from candidate profile |
| themeId | string \| null | Theme ID if navigated from theme feed |
| promptText | string \| null | Pre-filled starter prompt |

**ChatMessage** (unchanged from existing):

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique message identifier |
| role | "user" \| "assistant" \| "system" | Message sender |
| content | string | Message text content |
| timestamp | string | ISO 8601 timestamp |
| sources | SourceReference[] | Sources cited in this message (assistant only) |

**State transitions for mode**:
- Any mode → Any mode (user selects via ModeSelector)
- On mode switch: conversation history is preserved, assistant behavior changes
- "parler" mode requires `selectedCandidateId` to be set

---

### SurveyState (modified: `survey.ts`)

Minor additions to support mid-survey persistence and dataset version tracking.

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| currentQuestionIndex | number | **Now persisted** | Previously only in memory; now survives app restart |
| answers | Record\<string, string\> | **Now persisted** | Previously only in memory until completion |
| importanceWeights | Record\<string, number\> | **Now persisted** | Previously only in memory until completion |
| status | SurveyStatus | **Now persisted** | Track "in_progress" across restarts |
| datasetVersion | string \| null | **New** | Election data version at time of survey completion, for stale result detection |

**SurveyStatus** values (unchanged):
`"not_started"` → `"civic_context"` → `"questionnaire"` → `"computing"` → `"results_ready"` → `"completed"`

---

### FeedbackEntry (new, stored in MMKV as JSON array)

No Zustand store — simple MMKV key `"feedback_entries"` holding a JSON array.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique feedback identifier (UUID) |
| timestamp | string | ISO 8601 when feedback was submitted |
| screen | string | Screen context: "candidate", "assistant", "comparison", "survey" |
| entityId | string \| null | Relevant entity ID (candidate ID, theme ID) |
| type | "unclear" \| "missing" \| "general" | Feedback category |
| text | string \| null | Optional user-provided details |

---

## Entity Relationship Summary

```
Election (1) ──── has many ──── Candidate (N)
Election (1) ──── has many ──── Theme (N)
Election (1) ──── has one  ──── ElectionLogistics (1)
Election (1) ──── has many ──── SurveyQuestion (N)
Election (1) ──── has many ──── CivicFact (N)

Candidate (1) ─── has many ──── Position (N)
Theme (1) ─────── has many ──── Position (N)
Position (1) ──── has many ──── SourceReference (N)

SurveyQuestion (1) ── maps to ── Theme (N) [via themeIds]
SurveyQuestion (1) ── has many ── SurveyOption (N)

--- Client-side only (not in election dataset) ---

AppState (singleton) ── persisted in MMKV
AssistantState (singleton) ── persisted in MMKV
SurveyState (singleton) ── persisted in MMKV
FeedbackEntry[] ── persisted in MMKV
```

## Validation Rules

All existing validation rules from feature 001 remain in effect:

- Every Position MUST have at least one SourceReference
- Every CivicFact MUST have exactly one SourceReference
- Candidate IDs MUST be unique within an Election
- Theme IDs MUST be unique within an Election
- SurveyQuestion themeIds MUST reference existing Theme IDs
- SurveyOption themeScores keys MUST reference existing Theme IDs

New validation rules for client state:

- AssistantState in "parler" mode MUST have a non-null `selectedCandidateId` that references a valid Candidate ID
- SurveyState `datasetVersion` MUST match the current Election's `dataVersion` for results to be considered current; mismatches trigger a "results may be outdated" warning
- FeedbackEntry `screen` MUST be one of the defined screen values

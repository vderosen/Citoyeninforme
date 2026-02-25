# Data Model: 013-comparison-redesign

**Date**: 2026-02-19
**Branch**: `013-comparison-redesign`

## Summary

No new data entities or schema changes required. This feature operates entirely on existing data structures. The changes are purely in the UI/presentation layer.

## Existing Entities (referenced, not modified)

### Candidate
- `id`: string — unique identifier (e.g., `"david-belliard"`)
- `name`: string — full display name (e.g., `"David Belliard"`)
- `party`: string — party name
- `partyColor?`: string — optional, NOT populated in current data

### Theme
- `id`: string — unique identifier (e.g., `"transport"`)
- `name`: string — display name (e.g., `"Transport & Mobilité"`)
- `icon`: string — Ionicons name (e.g., `"train"`)
- `displayOrder`: number — sort order

### Position
- `candidateId`: string — FK to Candidate
- `themeId`: string — FK to Theme
- `summary`: string — brief position text
- `details`: string — extended position text
- `sources`: Source[] — array of source references

## Derived Data (computed at render time)

### Candidate Initials
- Derived from `candidate.name` by splitting on spaces and taking first character of first and last words
- Not stored; computed in the new `CandidateAvatar` component

### Party Color
- Retrieved via `getCandidatePartyColor(candidate.id)` utility
- Hardcoded mapping in `src/utils/candidatePartyColor.ts`
- Fallback: `#9CA3AF`

### Candidate Image
- Retrieved via `getCandidateImageSource(candidate)` utility
- Local bundled images in `assets/images/candidates/`
- Fallback: `null` (triggers initials display)

## Data Flow

```
Route param: selected="id1,id2"
  → split(",") → string[]
  → filter against candidates[] → Candidate[]
  → for each candidate + activeThemeId → find Position
  → render comparison cards with avatar + position content
```

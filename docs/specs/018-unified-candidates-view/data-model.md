# Data Model: Unified Candidates View

**Feature**: 018-unified-candidates-view
**Date**: 2026-02-20

## Entities (unchanged — reused from election store)

This feature introduces no new data entities. All entities are consumed from the existing election store (`src/stores/election.ts`).

### Candidate (existing)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| electionId | string | Parent election |
| name | string | Full display name |
| party | string | Political party name |
| bio | string | Short biography |
| communicationStyle | string | Personality descriptor for chatbot |
| programSourceUrl | string | URL to official program |
| photoUrl | string? | Optional photo URL |
| partyColor | string? | Hex color for party visual |

### Theme (existing)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (e.g., "transport") |
| electionId | string | Parent election |
| name | string | Display name (e.g., "Transport & Mobilité") |
| icon | string | Emoji icon (e.g., "🚇") |
| description | string | Theme description |
| displayOrder | number | Sort order (ascending) |

### Position (existing)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| candidateId | string | FK to Candidate |
| themeId | string | FK to Theme |
| summary | string | One-line position summary |
| details | string | Extended explanation |
| sources | SourceReference[] | Verifiable sources |
| lastVerified | string | ISO date of last verification |

## Component State Model (new — local to unified view)

The unified candidates screen manages ephemeral state via React `useState`. No Zustand store needed.

### UnifiedCandidatesScreen State

| State Variable | Type | Initial Value | Description |
|---------------|------|---------------|-------------|
| selectedIds | string[] | [] | Currently selected candidate IDs (0-4) |
| activeThemeId | string | themes[0]?.id ?? "" | Active theme for comparison context |

### Derived State (computed, not stored)

| Derived Value | Expression | Description |
|--------------|------------|-------------|
| viewMode | `selectedIds.length === 0 ? "empty" : selectedIds.length === 1 ? "profile" : "comparison"` | Current display context |
| shuffledCandidates | `deterministicShuffle(candidates, dailySeed())` | Daily-randomized candidate order for avatar bar |
| selectedCandidate | `getCandidateById(selectedIds[0])` | Single candidate (profile context only) |
| selectedPositions | `getPositionsForCandidate(selectedIds[0])` | Positions for profile context |
| maxReached | `selectedIds.length >= 4` | Whether selection limit is reached |

### State Transitions

```
                 tap candidate
    [EMPTY] ─────────────────────> [PROFILE]
       ↑                              │
       │ tap same candidate            │ tap 2nd candidate
       │ (deselect)                    ↓
       └──────────────────────── [COMPARISON]
                                      │ ↑
                  deselect to 1 ──────┘ │
                  tap additional ────────┘
                  (up to max 4)
```

**State transition rules**:
1. EMPTY → PROFILE: User taps any unselected candidate
2. PROFILE → EMPTY: User taps the selected candidate (deselect)
3. PROFILE → COMPARISON: User taps a second candidate
4. COMPARISON → COMPARISON: User taps to add/remove candidates (stays 2-4)
5. COMPARISON → PROFILE: User deselects down to 1 remaining candidate
6. COMPARISON → EMPTY: Not directly possible (deselecting from 2 goes to PROFILE with 1 remaining)

## Component Hierarchy

```
UnifiedCandidatesScreen (candidates.tsx)
├── CandidateAvatarBar          [REUSED — selection UI]
│   └── CandidateAvatar[]       [REUSED — individual avatar items]
│
├── if viewMode === "empty":
│   └── EmptyStateGuidance      [NEW — inline JSX, not separate component]
│
├── if viewMode === "profile":
│   └── CandidateProfileCard    [REUSED — includes ThemeTabBar internally]
│       ├── ThemeTabBar          [REUSED — self-contained theme selection]
│       ├── PositionCard         [REUSED — position display]
│       └── FeedbackAction       [REUSED — flag modal]
│
└── if viewMode === "comparison":
    ├── ThemeTabBar              [REUSED — external, for comparison context]
    └── ComparisonView           [REUSED — side-by-side columns]
```

## Props Flow

```
ElectionStore
  │
  ├── candidates ──→ deterministicShuffle() ──→ CandidateAvatarBar.candidates
  ├── themes ──→ CandidateProfileCard.themes / ThemeTabBar.themes
  ├── positions ──→ CandidateProfileCard.positions / ComparisonView.positions
  ├── getCandidateById() ──→ resolve selectedIds[0] for profile context
  └── getPositionsForCandidate() ──→ resolve positions for profile context

Local State
  │
  ├── selectedIds ──→ CandidateAvatarBar.selectedIds
  │                   ComparisonView.selectedCandidateIds
  │
  └── activeThemeId ──→ ThemeTabBar.activeThemeId (comparison context only)
                        ComparisonView.activeThemeId

Callbacks
  │
  ├── toggleCandidate() ──→ CandidateAvatarBar.onToggle
  ├── setActiveThemeId() ──→ ThemeTabBar.onSelectTheme
  └── handleDebate() ──→ CandidateProfileCard.onDebate
```

## Translation Keys

### New keys (candidates.json)

| Key | Value (fr) | Used in |
|-----|-----------|---------|
| emptyStateTitle | "Explorez les candidats" | Empty state heading |
| emptyStateDescription | "Appuyez sur un candidat pour voir son profil, ou sélectionnez-en plusieurs pour les comparer." | Empty state body |

### Existing keys reused

| Key | Namespace | Used in |
|-----|-----------|---------|
| candidates:debate | candidates | Profile debate button |
| candidates:positionsByTheme | candidates | Profile section header |
| candidates:noPositionDocumented | candidates | Missing position fallback |
| comparison:minimumCandidates | comparison | ComparisonView minimum message |
| common:feedbackSignal | common | Profile feedback flag |

### Keys to deprecate (no longer needed after removal of gallery)

| Key | Reason |
|-----|--------|
| candidates:gallery | Gallery heading removed |
| candidates:compare | FAB button removed |
| candidates:compareConfirm | Compare confirmation bar removed |
| candidates:compareCancel | Compare confirmation bar removed |
| candidates:compareCount | Compare counter removed |
| candidates:emptyGallery | Gallery empty state removed |
| candidates:emptyGalleryDescription | Gallery empty state removed |

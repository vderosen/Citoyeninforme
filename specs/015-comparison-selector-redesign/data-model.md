# Data Model: Comparison Selector Redesign

**Feature**: 015-comparison-selector-redesign
**Date**: 2026-02-20

## Existing Entities (no changes)

### Candidate (from `src/data/schema.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (e.g., `"david-belliard"`) |
| `electionId` | `string` | Parent election reference |
| `name` | `string` | Full display name (e.g., `"David Belliard"`) |
| `party` | `string` | Political party name |
| `bio` | `string` | Candidate biography |
| `communicationStyle` | `string` | Communication style descriptor |
| `programSourceUrl` | `string` | URL to official program document |
| `photoUrl?` | `string` | Optional remote photo URL |
| `partyColor?` | `string` | Optional party color (not populated in data) |

**Party color resolution**: `getCandidatePartyColor(candidate.id)` → hardcoded map in `src/utils/candidatePartyColor.ts`, fallback `#9CA3AF`.

**Photo resolution**: `getCandidateImageSource(candidate)` → local bundled images in `assets/images/candidates/`, fallback to `photoUrl`, fallback to `null`.

### Theme (from `src/data/schema.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (e.g., `"transport"`) |
| `electionId` | `string` | Parent election reference |
| `name` | `string` | Display name (e.g., `"Transport & Mobilité"`) |
| `icon` | `string` | Ionicons icon name (e.g., `"train"`, `"home"`) |
| `description` | `string` | Theme description |
| `displayOrder` | `number` | Sort order |

### Position (from `src/data/schema.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `candidateId` | `string` | Reference to Candidate |
| `themeId` | `string` | Reference to Theme |
| `summary` | `string` | Brief position summary |
| `details` | `string` | Full position details |
| `sources` | `SourceReference[]` | Verification sources |
| `lastVerified` | `string` | Last verification date |

## Component Interfaces (new / modified)

### CandidateAvatarBar Props (NEW)

```typescript
interface CandidateAvatarBarProps {
  candidates: Candidate[];
  selectedIds: string[];
  onToggle: (candidateId: string) => void;
  maxSelected?: number;  // Default: 4
}
```

**Behavior**:
- Renders all candidates in a horizontal `ScrollView`
- Each item: `CandidateAvatar` (36px, no ring) + name label below
- Selected state: `bg-accent-coral-light` + `border-accent-coral` 2px on full item area
- Unselected state: `bg-[#F3F4F6]` (warm gray), no border
- Max reached + unselected: `opacity: 0.5`, tap is no-op
- Item dimensions: ~72px width × ~60px height
- Min tap target: 44×44pt (accessibility)

### ThemeChipSelector Props (MODIFIED)

```typescript
interface ThemeChipSelectorProps {
  themes: Theme[];
  selectedThemeId: string;              // Changed: was string | null
  onSelectTheme: (themeId: string) => void;  // Changed: was string | null
}
```

**Changes from current**:
- Removed `null` option — no more "Tous les thèmes" chip
- Layout changed from `flex-row flex-wrap` to horizontal `ScrollView`
- Sorts themes by `displayOrder` (unchanged)
- Single-selection behavior (unchanged)

**Chip states** (unchanged):
| State | Background | Text Color |
|-------|-----------|------------|
| Default | `bg-warm-gray` | `text-civic-navy` |
| Selected | `bg-civic-navy` | `text-text-inverse` |

### ComparisonView Props (MODIFIED)

```typescript
interface ComparisonViewProps {
  candidates: Candidate[];
  selectedCandidateIds: string[];
  positions: Position[];
  activeThemeId: string;
  // Removed: themes, onThemeChange, onCandidateToggle (unused internally)
}
```

**Changes from current**:
- Removed `themes` prop — no longer renders theme header internally
- Removed `onThemeChange` prop — parent handles theme switching
- Removed `onCandidateToggle` prop — parent handles candidate toggling
- Fixed party color: uses `getCandidatePartyColor(candidate.id)` instead of `candidate.partyColor`

## Screen State Model

```typescript
// Local state in comparison.tsx — NOT persisted
interface ComparisonScreenState {
  selectedIds: string[];       // 0-4 candidate IDs
  activeThemeId: string;       // Always set (first theme on mount)
}
// Removed: step (no step-based flow)
```

**State transitions**:
- Initial: `selectedIds=[] (or from params), activeThemeId=themes[0].id`
- Tap candidate avatar: Toggle ID in `selectedIds` (max 4 when adding)
- Tap theme chip: Set `activeThemeId`
- No "Comparer" action — positions update reactively

## i18n Keys (comparison.json — updated)

**Keys to keep**:
```json
{
  "title": "Comparaison",
  "minimumCandidates": "Sélectionnez au moins 2 candidats pour comparer",
  "positionNotDocumented": "Position non documentée",
  "source": "Source",
  "sources": "Sources"
}
```

**Keys to remove** (no longer used):
- `selectCandidates` — no selection prompt
- `selectTheme` — no theme prompt
- `noPositionAvailable` — unused (positions always show per-candidate)
- `noDataExplanation` — unused
- `backToCandidates` — no step navigation
- `stepIndicator` — no steps
- `candidatesSection` — no section headers
- `themeSection` — no section headers
- `selectedCount_one` / `selectedCount_other` — no counter
- `allThemes` — no "All themes" option
- `compareCta` — no compare button
- `selectMinimum` — replaced by `minimumCandidates`
- `summaryText` — no bottom bar summary

**Net result**: 5 keys retained, 13 keys removed. No new keys needed — `minimumCandidates` already matches the spec's empty state message (FR-012).

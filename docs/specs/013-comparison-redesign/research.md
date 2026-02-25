# Research: 013-comparison-redesign

**Date**: 2026-02-19
**Branch**: `013-comparison-redesign`

## R1: Candidate pre-selection bug — root cause

**Decision**: The bug is in `comparison.tsx:22-28`. The `params.selected` parameter arrives as a comma-separated string (e.g., `"david-belliard,emmanuel-gregoire"`) from `candidates.tsx:41` where `selectedForCompare.join(",")` is used. However, the `useEffect` treats `params.selected` as a single ID instead of splitting it.

**Fix**: Replace the `useEffect` with `params.selected.split(",")` to correctly parse all candidate IDs.

**Rationale**: Direct string split is the simplest fix. The CSV format is already established by the candidates screen.

**Alternatives considered**:
- Passing IDs as JSON array → Overcomplicated for URL params
- Using a shared Zustand store → Unnecessary coupling for ephemeral comparison state

## R2: Theme icons rendered as text — root cause

**Decision**: The `theme.icon` field in `themes.json` contains Ionicons name strings (e.g., `"train"`, `"wallet"`, `"heart"`). These are rendered as raw text via `{theme.icon}` in JSX instead of using `<Ionicons name={theme.icon} />`.

**Fix**: Replace `{theme.icon}` with `<Ionicons name={theme.icon as any} size={16} />` in ThemeFilter and ComparisonView.

**Rationale**: The icon names are already Ionicons-compatible names. The fix is straightforward.

**Icon name validation**:
| themes.json value | Valid Ionicons name? | Notes |
|---|---|---|
| `train` | Yes | `train` or `train-outline` |
| `home` | Yes | `home` or `home-outline` |
| `shield` | Yes | `shield` or `shield-outline` |
| `leaf` | Yes | `leaf` or `leaf-outline` |
| `wallet` | Yes | `wallet` or `wallet-outline` |
| `palette` | Possibly not | Ionicons uses `color-palette` — needs runtime check; if invalid, update data to `color-palette` |
| `book` | Yes | `book` or `book-outline` |
| `heart` | Yes | `heart` or `heart-outline` |

**Note**: `palette` may need to be changed to `color-palette` in the JSON data. This should be verified at implementation time. If invalid, update `themes.json` to use `color-palette`.

**Affected files** (theme.icon as text):
- `src/components/candidates/ThemeFilter.tsx:55`
- `src/components/candidates/ComparisonView.tsx:54`
- `src/components/candidates/CandidateProfileCard.tsx:97`
- `src/components/home/ThemeFeed.tsx:61`

**Scope decision**: Fix in ThemeFilter and ComparisonView (comparison feature scope). The other files (CandidateProfileCard, ThemeFeed) also have the same bug but are outside this feature's scope — they can be fixed as a follow-up.

## R3: Party color availability

**Decision**: Use the existing `getCandidatePartyColor(candidateId)` utility function from `src/utils/candidatePartyColor.ts`. Do NOT use `candidate.partyColor` from the schema.

**Rationale**: The `partyColor` field is optional in the schema and is NOT populated in `candidates.json`. The utility function has a complete hardcoded mapping for all 7 Paris 2026 candidates with a `#9CA3AF` fallback. This is the same approach used in `CandidateGallery.tsx`.

**Alternatives considered**:
- Adding `partyColor` to candidates.json → Mixes presentation into data layer (rejected per design decision in 010-candidates-grid-redesign/research.md)
- Using `candidate.partyColor || fallback` → Would always hit fallback since field is empty

## R4: Candidate avatar approach

**Decision**: Create a reusable `CandidateAvatar` component that displays a circular avatar with:
1. The candidate's actual photo (from `getCandidateImageSource()`) as primary
2. Initials on party-colored background as fallback

**Rationale**: All 7 candidates already have photos in `assets/images/candidates/`. Using real photos is better UX than initials. Initials serve as a clean fallback for future candidates without photos.

**Alternatives considered**:
- Initials only (no photos) → Wastes existing photo assets
- Photos only (no fallback) → Would show broken state for candidates without photos
- Inline implementation (no component) → Same avatar pattern needed in comparison cards AND selector pills — a shared component avoids duplication

**Initials derivation**: Split `candidate.name` by spaces, take first character of first and last words. Examples:
- "David Belliard" → "DB"
- "Pierre-Yves Bournazel" → "PB"
- "Sophia Chikirou" → "SC"

## R5: Uniform card height strategy

**Decision**: Use flexbox stretch alignment to make comparison cards equal height within their row. For overflow position content, use a ScrollView within each card or truncate with ellipsis.

**Rationale**: Flexbox `alignItems: "stretch"` naturally equalizes sibling heights in a row. This is the simplest CSS-based approach and doesn't require JavaScript height measurement.

**Alternatives considered**:
- Fixed card height with scroll → Too rigid, poor UX for short content
- JavaScript onLayout measurement → Complex, causes layout flicker
- Max-height with truncation → Loses information

**Implementation**: Wrap the comparison cards in a `flex-row` container with implicit stretch alignment (React Native default for `alignItems` in `flexDirection: "row"`).

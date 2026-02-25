# Research: Candidates Grid Redesign

**Branch**: `010-candidates-grid-redesign` | **Date**: 2026-02-19

## R-001: FlatList vs View-based grid for 3 columns with centered last row

**Decision**: Replace FlatList with a View-based grid using `flexWrap: "wrap"` and manually calculated item widths.

**Rationale**: FlatList's `numColumns` prop does not support centering an incomplete last row — it left-aligns remaining items with empty space on the right. FR-009 requires centered last rows. With only 7-9 items (no virtualization benefit), a simple View + `flexWrap` layout is simpler and gives full control over alignment. The last row can be centered by rendering it as a separate row with `justifyContent: "center"`.

**Alternatives considered**:
- FlatList with `numColumns={3}` + invisible spacer items: Hacky, fragile with varying counts, adds phantom items to data.
- FlatList with `columnWrapperStyle` centering: `columnWrapperStyle` applies to ALL rows, not just the last one. No per-row control.
- ScrollView + FlatList hybrid: Unnecessary complexity for 7-9 static items.

## R-002: Party color source

**Decision**: Add a `PARTY_COLORS` map in a new utility similar to `candidateImageSource.ts`, keyed by candidate ID. Do NOT modify the election JSON schema.

**Rationale**: The `partyColor` field exists on the `Candidate` interface but is not populated in `candidates.json` (all 7 candidates lack it). Currently the gallery falls back to `#9CA3AF` for all candidates. Rather than modifying the election data schema (which requires schema validation and impacts the city-agnostic architecture — Constitution Principle III), the colors should be injected at the UI layer, similar to how local images are already handled via `candidateImageSource.ts`. This keeps election data clean and the color assignment as a presentation concern.

**Alternatives considered**:
- Add `partyColor` to each candidate in `candidates.json`: Would work but mixes presentation concerns into the data layer. Also requires updating the data loader and potentially the schema validation.
- Derive colors from party name hash: Would produce arbitrary colors with no meaningful association to actual party branding.

## R-003: Avatar size and card height for no-scroll on 360x640 screens

**Decision**: Avatar diameter: 72px. Card height: ~130px (72px avatar + ~58px for name, party text, and padding). Grid gap: 8px vertical, 8px horizontal. Container padding: 12px.

**Rationale**: On a 360x640 screen, after accounting for the tab bar (~50px), header (~56px), and status bar (~24px), the available content area is roughly 510px. With 3 rows of ~130px cards + 2 × 8px gaps + 2 × 12px container vertical padding = 130×3 + 16 + 24 = 430px. This leaves ~80px of breathing room for the FAB button. An 80px avatar would make cards ~140px tall, leaving less room (140×3 + 40 = 460px, only ~50px for FAB — tight). 72px provides better balance.

**Alternatives considered**:
- 80x80px avatars (~140px cards): Works but is tight on 640px height screens. The FAB button might overlap content.
- 64x64px avatars (~120px cards): Too small for recognizable photos. Candidate identification suffers.
- Responsive avatar sizing: Over-engineering for a known range of 7-9 candidates. Fixed size ensures uniformity (FR-002, FR-005).

## R-004: Compare mode indicator placement on circular avatars

**Decision**: Use a checkmark badge positioned at the bottom-right of the circular avatar (overlapping the avatar edge), plus a colored ring around the avatar when selected.

**Rationale**: The current compare mode uses a checkmark icon at the top-right corner of the rectangular card. With circular avatars, the most natural placement is a badge on the avatar itself. A ring (border) change provides a clear visual state change, and the badge icon confirms the selection. This is a standard pattern in contact/avatar selection UIs.

**Alternatives considered**:
- Overlay on the entire card: Obscures the candidate info, reduces readability.
- Checkbox separate from avatar: Takes additional space that we don't have in a compact card.
- Only ring, no badge: Subtle; might be missed by users or those with color vision deficiency.

## R-005: Party color indicator design

**Decision**: Use a 3px colored border ring around the circular avatar. The party color serves as the avatar's border.

**Rationale**: The current design uses a 4px horizontal color bar at the top of each card. With circular avatars, a colored border ring is the natural equivalent — it's immediately visible, doesn't take extra vertical space, and integrates cleanly with the circular shape. The ring also doubles as a visual container for the avatar, improving the overall design coherence.

**Alternatives considered**:
- Small colored dot/badge: Too subtle, hard to notice at small sizes.
- Colored background behind the avatar: Would require more vertical space and reduce the compact design benefit.
- Colored underline below name: Disconnected from the avatar, less immediate visual association.

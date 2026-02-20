# Research: Comparison Selector Redesign

**Feature**: 015-comparison-selector-redesign
**Date**: 2026-02-20

## R-1: Horizontal scrollable candidate avatar bar pattern

**Decision**: Use a horizontal `ScrollView` with individually pressable avatar items, each showing a circular `CandidateAvatar` (36px) and a name label below. The entire item area changes background color on selection.

**Rationale**: A horizontal ScrollView is the standard React Native pattern for horizontally scrollable content. `FlatList` would add overhead for ~12 items with no virtualization benefit. Each item is ~72px wide × ~60px tall, fitting comfortably in a single horizontal bar.

**Alternatives considered**:
- `FlatList` (horizontal): Rejected — virtualization overhead is unnecessary for ~12 items. ScrollView is simpler and has no blank-space rendering issues.
- Vertical list of cards (current design): Rejected — wastes vertical space that should show position content.
- Grid layout: Rejected — still takes too much vertical space for ~12 candidates.

**Selection visual pattern**:
- Selected: `bg-accent-coral-light` (#FDF4F2) + `border-accent-coral` (#E8553A) 2px border on full item area
- Unselected: `bg-[#F3F4F6]` (warm gray) with no border
- Max reached + unselected: Same as unselected but with `opacity: 0.5`

**Rationale for full-card color change**: A border-only or ring-only indicator is hard to scan at a glance. Changing the entire item background provides instant visual feedback — the user sees at a glance which candidates are selected without inspecting individual borders.

## R-2: CandidateAvatar reuse in compact bar

**Decision**: Reuse the existing `CandidateAvatar` component (`src/components/candidates/CandidateAvatar.tsx`) at 36px size with `showRing={false}` inside the avatar bar items.

**Rationale**: CandidateAvatar already handles photo display with initials fallback and party-color background. At 36px, it fits within the ~60px height constraint (36px avatar + 8px gap + 16px name text). The party-color ring is disabled because the full-card background color change replaces it as the visual indicator.

**Alternatives considered**:
- New avatar component: Rejected — CandidateAvatar already does exactly what we need.
- Larger avatar (44px default): Rejected — would push total item height beyond 60px.

## R-3: ThemeChipSelector adaptation

**Decision**: Modify the existing `ThemeChipSelector` to use horizontal `ScrollView` instead of `flex-row flex-wrap`, remove the "Tous les thèmes" virtual chip, and change `selectedThemeId` from `string | null` to `string`.

**Rationale**: The new design requires single-theme selection with the first theme auto-selected. "All themes" is unnecessary when positions are displayed for one theme at a time. Horizontal scroll is more compact than wrapping and visually consistent with the avatar bar above.

**Impact analysis**:
- `ThemeChipSelector` is only used in `comparison.tsx` — no other consumers affected.
- The `allThemes` i18n key can be removed.
- The `null` ID convention is eliminated — `selectedThemeId` always has a value.

**Alternatives considered**:
- Keep wrapping layout: Rejected — the spec requires horizontal scrollable chips (FR-007).
- Keep "All themes" with first-theme default: Rejected — adds UI clutter for a feature that shows one theme at a time. Auto-selecting the first specific theme is simpler.

## R-4: ComparisonView reuse for live position rendering

**Decision**: Reuse the existing `ComparisonView` (`src/components/candidates/ComparisonView.tsx`) for the positions zone, with minor modifications.

**Rationale**: ComparisonView already implements the exact layout specified in FR-010 and FR-011:
- Side-by-side columns for 2 candidates (`flex-1`)
- Horizontal scroll with fixed 240px columns for 3-4 candidates
- Position cards with party color bar, name, party, summary, details, sources, TrustBadge
- Empty state (< 2 candidates) with guidance message

**Modifications needed**:
1. Remove `onThemeChange` and `onCandidateToggle` props — they exist in the interface but are never called internally. Parent handles all selection logic.
2. Remove or make optional the theme header (`activeTheme.icon + activeTheme.name`) — redundant with the ThemeChipSelector visible above.
3. Fix party color bar: replace `candidate.partyColor || "#9CA3AF"` with `getCandidatePartyColor(candidate.id)` since `partyColor` field is not populated in the data model.

**Alternatives considered**:
- New PositionCardsZone component: Rejected — would duplicate ~80% of ComparisonView's logic.
- Inline position rendering in comparison.tsx: Rejected — keeps the file bloated. ComparisonView already encapsulates this well.

## R-5: Reactive state management (no steps)

**Decision**: The comparison screen uses two local state variables with no step transitions:

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [activeThemeId, setActiveThemeId] = useState<string>("");
```

Positions are derived in each render: `positions.filter(p => selectedIds.includes(p.candidateId) && p.themeId === activeThemeId)`. No explicit "update" or "refresh" action — React re-renders handle it.

**Rationale**: The simplest possible state model. Two variables, no step machine, no transitions. The position rendering is a pure function of `(selectedIds, activeThemeId, positions)` — changing any input triggers a re-render with updated output (FR-009).

**Alternatives considered**:
- Zustand slice for comparison state: Rejected — state is ephemeral and screen-local. No persistence or cross-screen sharing needed.
- `useReducer` with actions: Rejected — adds ceremony for a simple 2-variable state.

## R-6: Pre-selection parameter parsing

**Decision**: Retain the existing `useEffect` that parses `params.selected` by splitting on commas and validating each ID against the candidates list.

```tsx
useEffect(() => {
  if (params.selected) {
    const ids = params.selected.split(",").filter(id =>
      candidates.some(c => c.id === id)
    );
    if (ids.length > 0) setSelectedIds(ids);
  }
}, [params.selected, candidates]);
```

**Rationale**: This was already fixed in the current codebase (from 013-comparison-redesign). It correctly handles the comma-separated IDs passed from the candidates grid FAB navigation (FR-013).

**Combined with auto-theme-selection**: When the screen loads with pre-selected candidates AND the first theme auto-selected, positions appear immediately — satisfying SC-001 (zero taps to see results).

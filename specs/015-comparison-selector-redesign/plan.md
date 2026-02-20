# Implementation Plan: Comparison Selector Redesign

**Branch**: `015-comparison-selector-redesign` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-comparison-selector-redesign/spec.md`

## Summary

Redesign the comparison screen (`src/app/comparison.tsx`) from a 2-step flow (select → validate → results) into a single live page with three vertically stacked zones: a horizontal scrollable candidate avatar bar, horizontal scrollable theme chips, and an instant position results zone. All validation buttons, step indicators, and the ComparisonBottomBar are removed. Positions update reactively when the user toggles candidates or switches themes — zero navigation, zero taps to see content when pre-selected candidates arrive from the candidates grid.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3 (Ionicons), react-i18next 15.4.1
**Storage**: N/A — no storage changes; comparison state is ephemeral (local `useState` in component)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS, Android, Web (Expo managed workflow)
**Project Type**: Mobile
**Performance Goals**: 60fps scroll, instant selection feedback (<100ms tap response)
**Constraints**: Min 44×44pt tap targets (WCAG 2.1 AA), 4.5:1 contrast ratio, offline-capable, max 4 candidates selectable
**Scale/Scope**: ~12 candidates, 8 themes, single screen redesign touching ~5 files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Neutrality & Non-Prescription | ✅ PASS | Candidate avatars maintain existing data order (no editorial ranking). Selection is user-driven. |
| II. Source-Grounded Truth | ✅ PASS | UI-only redesign — no content or factual claims changed. Position sources preserved. |
| III. City-Agnostic Architecture | ✅ PASS | All data sourced from `useElectionStore`; no Paris-specific logic added. Components use generic utilities. |
| IV. Critical Thinking Over Persuasion | ✅ PASS | Live comparison encourages free exploration of candidate positions across themes. |
| V. Structured Data as Single Source of Truth | ✅ PASS | Candidates, themes, positions from election store; no shadow data. |
| VI. Simplicity & MVP Discipline | ✅ PASS | Reduces complexity: removes step flow, removes ComparisonBottomBar. Net file deletion. |
| VII. Privacy & Trust | ✅ PASS | No new data collected, stored, or transmitted. |

**Gate result: PASS** — No violations. No Complexity Tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/015-comparison-selector-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── comparison.tsx                          # MODIFY: Complete rewrite — single-page live layout
├── components/
│   ├── candidates/
│   │   ├── CandidateAvatar.tsx                 # KEEP: Reused in avatar bar items
│   │   ├── ComparisonView.tsx                  # MODIFY: Remove theme header, clean up unused props
│   │   └── ThemeFilter.tsx                     # KEEP: Used by candidates tab, untouched
│   └── comparison/
│       ├── CandidateAvatarBar.tsx              # CREATE: Horizontal scrollable candidate avatar bar
│       ├── CandidateSelectCard.tsx             # DELETE: Replaced by compact avatar bar items
│       ├── ThemeChipSelector.tsx               # MODIFY: Horizontal scroll, remove "Tous les thèmes", non-nullable selectedThemeId
│       └── ComparisonBottomBar.tsx             # DELETE: No validation step in live design
├── i18n/
│   └── locales/
│       └── fr/
│           └── comparison.json                 # MODIFY: Remove step/CTA keys, add empty state key
└── utils/
    ├── candidatePartyColor.ts                  # KEEP: Used by CandidateAvatar
    └── candidateImageSource.ts                 # KEEP: Used by CandidateAvatar
```

**Structure Decision**: Single mobile project structure. New `CandidateAvatarBar` goes in `src/components/comparison/` since it's specific to the comparison screen. `CandidateAvatar` stays in `src/components/candidates/` as a shared component. Net change: +1 file created, -2 files deleted = -1 file total.

## Architecture Decisions

### AD-1: Single-page live layout (no steps)

The comparison screen becomes a single `ScrollView` with three stacked zones. No `step` state, no transitions, no "Comparer" button. Local state is just `selectedIds: string[]` and `activeThemeId: string`.

When the user toggles a candidate or switches a theme, React's re-render cycle updates the positions zone instantly (derived from state + store data, no async fetch).

**Rationale**: The spec exists to eliminate the 5-step redundant flow. A single page with reactive state is the simplest implementation that satisfies FR-001, FR-002, and FR-009.

### AD-2: CandidateAvatarBar — new horizontal scroll component

Created in `src/components/comparison/CandidateAvatarBar.tsx`:
- Horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}`
- Each item: `CandidateAvatar` (36px) + name label below, wrapped in `PressableScale`
- Selected state: `bg-accent-coral-light` + `border-accent-coral` (2px) on full item area
- Unselected state: `bg-[#F3F4F6]` (warm gray)
- Item width: ~72px (avatar 36px + padding + name), height: ~60px total
- Enforces 2-4 selection limit: tapping a 5th candidate is a no-op

**Rationale**: Compact avatars (~60px height) replace the large vertical CandidateSelectCard list, freeing vertical space for position content — the actual value of the feature. Horizontal scroll fits ~12 candidates without vertical space waste. Full-card color change (not just a border ring) provides instant scannability (FR-003, FR-004).

### AD-3: ThemeChipSelector adaptation

Modifications to existing `src/components/comparison/ThemeChipSelector.tsx`:
- Remove "Tous les thèmes" virtual chip — every theme is a real theme
- Change layout from `flex-row flex-wrap` to horizontal `ScrollView`
- Change `selectedThemeId` prop type from `string | null` to `string` (non-nullable)
- First theme (by `displayOrder`) auto-selected on mount in parent

**Rationale**: The spec requires the first theme to be auto-selected (FR-008) so positions appear immediately. "All themes" is unnecessary when the goal is instant, focused comparison on one theme at a time. Horizontal scroll matches the avatar bar pattern and is more compact than wrapping (FR-007).

### AD-4: ComparisonView adaptation for live layout

The existing `ComparisonView` already handles:
- Empty state (< 2 candidates) → guidance message
- Side-by-side layout for 2 candidates → `flex-1` columns
- Horizontal scroll for 3-4 candidates → `width: 240` columns
- Position cards with party color bar, name, party, summary, details, sources, TrustBadge

Modifications:
- Remove `onThemeChange` and `onCandidateToggle` props (unused internally; parent handles selection)
- Remove/make optional the theme header rendering (theme is already visible in the chips zone above)
- Fix party color: use `getCandidatePartyColor(candidate.id)` instead of `candidate.partyColor` (which is always null)

**Rationale**: Reusing ComparisonView maximizes code reuse and preserves tested position rendering logic. The unused props and redundant theme header are cleanup, not new features (FR-010, FR-011).

### AD-5: Pre-selection parameter parsing

The existing `useEffect` for `params.selected` (comma-split + validate) is retained as-is. It correctly parses pre-selected candidate IDs from the candidates grid FAB navigation.

Additionally, a new `useEffect` auto-selects the first theme when themes are loaded:
```tsx
useEffect(() => {
  if (themes.length > 0) setActiveThemeId(themes[0].id);
}, [themes]);
```

**Rationale**: Combined with pre-selected candidates, this ensures positions appear immediately on load — zero taps to see content (FR-008, FR-013, SC-001).

## Complexity Tracking

> No violations — table intentionally empty.

## Post-Design Constitution Re-check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Neutrality | ✅ PASS | Candidate display order unchanged from data source. |
| II. Source-Grounded | ✅ PASS | No content changes. Sources on position cards preserved. |
| III. City-Agnostic | ✅ PASS | All components data-driven via election store. |
| IV. Critical Thinking | ✅ PASS | Live comparison with free candidate/theme toggling encourages exploration. |
| V. Single Source | ✅ PASS | No new data stores introduced. |
| VI. Simplicity | ✅ PASS | Net reduction in complexity: -2 files, -1 state variable (step), -1 component (bottom bar). |
| VII. Privacy | ✅ PASS | No data persistence changes. |

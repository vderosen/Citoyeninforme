# Quickstart: Unified Candidates View

**Feature**: 018-unified-candidates-view
**Date**: 2026-02-20

## Overview

Replace the three-screen candidates flow (grid → profile → comparison) with a single adaptive screen. The avatar bar is always visible; content below changes based on selection count.

## Prerequisites

- Branch `018-unified-candidates-view` checked out
- `npm install` completed (no new dependencies)
- Expo dev server running: `npx expo start`

## Implementation Order

### Step 1: Add translation keys

**File**: `src/i18n/locales/fr/candidates.json`

Add two new keys for the empty state guidance:
```json
"emptyStateTitle": "Explorez les candidats",
"emptyStateDescription": "Appuyez sur un candidat pour voir son profil, ou sélectionnez-en plusieurs pour les comparer."
```

### Step 2: Rewrite the candidates screen

**File**: `src/app/(tabs)/candidates.tsx`

Replace the entire content. The new screen structure:

1. **Imports**: election store, CandidateAvatarBar, CandidateProfileCard, ComparisonView, ThemeTabBar, shuffle utils
2. **State**: `selectedIds: string[]` and `activeThemeId: string`
3. **Computed**: `shuffledCandidates` via `deterministicShuffle(candidates, dailySeed())`
4. **Layout**:
   - `SafeAreaView` wrapper
   - `ScrollView` containing:
     - `CandidateAvatarBar` (always visible, uses shuffled candidates)
     - Conditional content based on `selectedIds.length`:
       - **0**: Empty state with title + description text
       - **1**: `CandidateProfileCard` with debate callback
       - **2-4**: External `ThemeTabBar` + `ComparisonView`

Key callbacks:
- `toggleCandidate(id)`: Add/remove from `selectedIds` (max 4)
- `handleDebate()`: `selectMode("candidate")` → `selectCandidate(id)` → `router.push("/(tabs)/assistant")`

Use `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` before updating `selectedIds` for smooth transitions.

### Step 3: Remove obsolete routes

**Delete files**:
- `src/app/candidate/[id].tsx`
- `src/app/comparison.tsx`

**Update** `src/app/_layout.tsx`:
- Remove `<Stack.Screen name="candidate/[id]" />`
- Remove `<Stack.Screen name="comparison" options={{ title: "Comparaison" }} />`

### Step 4: Remove CandidateGallery

**Delete file**: `src/components/candidates/CandidateGallery.tsx`

Verify no other files import it (should only be the old `candidates.tsx`).

### Step 5: Verify and test

1. **Empty state**: Open Candidats tab → see avatar bar + guidance message
2. **Profile context**: Tap one candidate → profile appears below with debate button
3. **Comparison context**: Tap second candidate → side-by-side comparison appears
4. **Deselect**: Tap selected candidate → returns to previous state
5. **Max selection**: With 4 selected, 5th candidate appears dimmed
6. **Theme navigation**: Switch themes in both profile and comparison contexts
7. **Debate launch**: Tap debate button → assistant opens in "candidate" context

## Key Files Reference

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(tabs)/candidates.tsx` | REWRITE | Unified view screen |
| `src/app/_layout.tsx` | UPDATE | Remove 2 Stack.Screen entries |
| `src/i18n/locales/fr/candidates.json` | UPDATE | Add empty state keys |
| `src/app/candidate/[id].tsx` | DELETE | Profile now inline |
| `src/app/comparison.tsx` | DELETE | Comparison now inline |
| `src/components/candidates/CandidateGallery.tsx` | DELETE | Replaced by avatar bar |

## Reused Components (no changes needed)

| Component | Location | Role |
|-----------|----------|------|
| CandidateAvatarBar | `src/components/comparison/` | Avatar selection bar (max 4, toggle, dimming) |
| CandidateProfileCard | `src/components/candidates/` | Full profile with internal ThemeTabBar |
| ComparisonView | `src/components/candidates/` | Side-by-side position columns |
| ThemeTabBar | `src/components/candidates/` | Animated horizontal theme tabs |
| CandidateAvatar | `src/components/candidates/` | Avatar with party ring |
| PositionCard | `src/components/candidates/` | Expandable position display |

## Architecture Notes

- **No new components**: The empty state is simple enough to be inline JSX (a View with two Text elements)
- **No new stores**: Selection state is local `useState`, ephemeral by design
- **No new dependencies**: All required packages are already installed
- **Shuffle compliance**: Use `deterministicShuffle(candidates, dailySeed())` from `src/utils/shuffle.ts` for Constitution I compliance
- **Debate navigation**: Follow existing pattern from `candidate/[id].tsx` → `selectMode("candidate")` → `selectCandidate(id)` → `router.push("/(tabs)/assistant")`

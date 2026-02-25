# Quickstart: 013-comparison-redesign

**Date**: 2026-02-19
**Branch**: `013-comparison-redesign`

## Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- Branch `013-comparison-redesign` checked out

## Setup

```bash
git checkout 013-comparison-redesign
npm install
npx expo start
```

## Files to Modify

### Bug fixes (P1)
1. **`src/app/comparison.tsx`** — Fix `params.selected` parsing (split CSV string)
2. **`src/components/candidates/ThemeFilter.tsx`** — Render `theme.icon` as `<Ionicons>` component
3. **`src/components/candidates/ComparisonView.tsx`** — Render theme icon as `<Ionicons>` in header

### New component
4. **`src/components/candidates/CandidateAvatar.tsx`** (NEW) — Reusable avatar with photo/initials + party color

### Card redesign (P2)
5. **`src/components/candidates/ComparisonView.tsx`** — Add avatar, uniform height, visual hierarchy

### Pill redesign (P3)
6. **`src/app/comparison.tsx`** — Add mini avatar to candidate selector pills

### Data fix (if needed)
7. **`src/data/elections/paris-2026/themes.json`** — Fix `"palette"` → `"color-palette"` if invalid

## Verification

1. **Pre-selection**: From Candidates tab, select 2 candidates → "Voir la comparaison" → both should be pre-selected
2. **Theme icons**: All 8 theme pills show graphical icons, not text words
3. **Avatars**: Comparison cards show circular photo avatars with party-color borders
4. **Uniform height**: Side-by-side cards are the same height
5. **Selector pills**: Each pill shows a mini avatar next to the name

## Testing

```bash
npm test
npm run lint
```

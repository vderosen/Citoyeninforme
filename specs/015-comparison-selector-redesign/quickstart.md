# Quickstart: Comparison Selector Redesign

**Feature**: 015-comparison-selector-redesign
**Date**: 2026-02-20

## Prerequisites

- Node.js 18+, npm
- Expo CLI (`npx expo`)
- CandidateAvatar component already exists in codebase

## Setup

```bash
# From repo root
npm install
npx expo start
```

No new dependencies required — this feature uses only existing packages.

## Key Files to Modify/Create/Delete

### Created
| File | Purpose |
|------|---------|
| `src/components/comparison/CandidateAvatarBar.tsx` | Horizontal scrollable candidate avatar bar with selection toggle |

### Modified
| File | What changes |
|------|-------------|
| `src/app/comparison.tsx` | Complete rewrite: single-page live layout with 3 stacked zones, no steps |
| `src/components/candidates/ComparisonView.tsx` | Remove unused props, remove theme header, fix party color |
| `src/components/comparison/ThemeChipSelector.tsx` | Horizontal scroll, remove "Tous les thèmes", non-nullable selectedThemeId |
| `src/i18n/locales/fr/comparison.json` | Remove 13 step/CTA keys, keep 5 essential keys |

### Deleted
| File | Why |
|------|-----|
| `src/components/comparison/CandidateSelectCard.tsx` | Replaced by compact avatar bar items |
| `src/components/comparison/ComparisonBottomBar.tsx` | No validation step — live design has no CTA button |

### Unchanged (important context)
| File | Why |
|------|-----|
| `src/components/candidates/CandidateAvatar.tsx` | Reused in avatar bar items (36px, no ring) |
| `src/components/candidates/ThemeFilter.tsx` | Used by candidates tab, untouched |
| `src/utils/candidatePartyColor.ts` | Party color lookup used by CandidateAvatar + ComparisonView fix |
| `src/utils/candidateImageSource.ts` | Photo source lookup used by CandidateAvatar |
| `src/stores/election.ts` | Data source for candidates, themes, positions — no changes |

## Testing the Feature

### Manual test flow

1. Open the app → Navigate to Candidats tab
2. Tap the coral "Comparer" FAB → Select 2+ candidates → Tap "Voir la comparaison"
3. Verify: **Single page** with three zones:
   - Top: Horizontal scrollable avatar bar (~60px), pre-selected candidates have coral-light background + coral border
   - Middle: Horizontal scrollable theme chips, first theme already selected
   - Bottom: Position cards for selected candidates on the active theme
4. Verify: **No step indicator**, no "Comparer" button, no bottom bar
5. Tap an unselected candidate in the avatar bar → Position card appears instantly
6. Tap a selected candidate → Position card disappears instantly
7. Tap a different theme chip → Positions update instantly
8. Scroll the avatar bar horizontally → All ~12 candidates accessible
9. Scroll theme chips horizontally → All themes accessible
10. With 2 candidates: Position cards side-by-side (full width)
11. Select a 3rd candidate: Cards switch to horizontal scroll (240px each)
12. Deselect all → Empty state: "Sélectionnez au moins 2 candidats pour comparer"
13. Theme chips and avatar bar remain interactive during empty state

### Edge cases to test

- Select 4 candidates, try to select a 5th → Tap is rejected (no-op)
- Candidate with no position on active theme → Shows "Position non documentée" placeholder
- Candidate with no photo → Shows initials on party-colored circle
- Narrow screen (320px) → Avatar bar and chips scroll horizontally, cards adapt
- Direct navigation without pre-selected candidates → All unselected, empty state shown, first theme selected

### Automated tests
```bash
npm test -- --testPathPattern="comparison"
```

## Design Tokens Reference

| Token | Value | Usage in this feature |
|-------|-------|----------------------|
| `bg-warm-white` | `#FAFAF8` | Screen background |
| `bg-[#F3F4F6]` | `#F3F4F6` | Unselected avatar item background |
| `bg-accent-coral-light` | `#FDF4F2` | Selected avatar item background |
| `accent-coral` | `#E8553A` | Selected avatar item border |
| `bg-warm-gray` | `#F0EDE8` | Default theme chip background, position card background |
| `bg-civic-navy` | `#1B2A4A` | Selected theme chip background |
| `text-civic-navy` | `#1B2A4A` | Headings, labels, default chip text |
| `text-text-body` | `#3D3D3D` | Position details text |
| `text-text-caption` | `#6B7280` | Party name, secondary text |
| `text-text-inverse` | `#FAFAF8` | Text on dark/coral backgrounds |
| `font-display-medium` | SpaceGrotesk 500 | Candidate names, position titles |
| `font-body-medium` | Inter 500 | Chip text |
| `font-body` | Inter 400 | Position body text |

## Component Hierarchy

```
ComparisonScreen (comparison.tsx)
├── [Header: "Comparaison" — from _layout.tsx stack config]
├── ScrollView (vertical, full page)
│   ├── CandidateAvatarBar (horizontal scroll)
│   │   └── PressableScale[] (one per candidate)
│   │       ├── CandidateAvatar (36px, no ring)
│   │       └── Text (candidate name, 1 line)
│   ├── ThemeChipSelector (horizontal scroll)
│   │   └── PressableScale[] (one per theme)
│   │       └── Text (theme name)
│   └── ComparisonView (positions zone)
│       ├── [if < 2 selected] Text (empty state message)
│       └── [if ≥ 2 selected] ScrollView (horizontal if >2)
│           └── View[] (position cards)
│               ├── View (party color bar, 4px)
│               ├── Text (candidate name)
│               ├── Text (party)
│               ├── Text (summary)
│               ├── Text (details)
│               └── SourceReference[] / TrustBadge
```

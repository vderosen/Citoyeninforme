# Quickstart: Candidates Grid Redesign

**Branch**: `010-candidates-grid-redesign` | **Date**: 2026-02-19

## What This Feature Does

Redesigns the candidates page from a scrollable 2-column grid with square images and DistrictBlockCard wrappers to a compact 3-column grid with circular avatars that fits entirely on screen without scrolling.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/candidates/CandidateGallery.tsx` | **Major rewrite** — Replace FlatList with View-based 3-column grid, replace DistrictBlockCard + square images with circular avatars, add party color ring, adapt compare context indicators, center incomplete last row |
| `src/utils/candidatePartyColor.ts` | **New file** — Party color map keyed by candidate ID (mirrors candidateImageSource.ts pattern) |

## Files NOT Modified

| File | Reason |
|------|--------|
| `src/app/(tabs)/candidates.tsx` | Compare context logic, FAB button, and confirmation bar are untouched. Only `CandidateGallery` internals change. |
| `src/utils/candidateImageSource.ts` | Image source lookup unchanged. |
| `src/utils/shuffle.ts` | Shuffle algorithm unchanged. |
| `src/data/schema.ts` | Candidate interface unchanged. |
| `src/data/elections/paris-2026/candidates.json` | Election data unchanged. |

## Key Design Decisions

1. **View-based grid** instead of FlatList — enables centering the incomplete last row (only 7-9 items, no virtualization needed)
2. **72px circular avatars** with `resizeMode="cover"` — uniform sizing regardless of source image dimensions
3. **3px party-colored border ring** around avatars — replaces the 4px horizontal color bar
4. **Fixed card height** — avatar (72px) + text area + padding ≈ 130px per card
5. **Party colors** injected at UI layer via utility map — keeps election data schema clean

## How to Test

1. Open the Candidates tab — all 7 candidates should be visible without scrolling
2. Verify all cards are the same size and all avatars are the same circular size
3. Verify party color rings are visible around each avatar
4. Tap a candidate — should navigate to detail page
5. Tap Compare FAB → tap candidates → confirm — comparison flow works
6. Check on small screen (360x640) — grid should still fit without scrolling

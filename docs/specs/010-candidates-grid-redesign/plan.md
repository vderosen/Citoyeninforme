# Implementation Plan: Candidates Grid Redesign

**Branch**: `010-candidates-grid-redesign` | **Date**: 2026-02-19 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-candidates-grid-redesign/spec.md`

## Summary

Redesign the candidates page gallery from a 2-column scrollable grid with square images and DistrictBlockCard wrappers to a compact 3-column grid with 72px circular avatars, party-colored border rings, fixed card heights, and centered incomplete rows — all fitting on a single screen without scrolling. The change is isolated to `CandidateGallery.tsx` (major rewrite) plus a new party color utility. The candidates screen, data layer, shuffle logic, and compare context behavior are preserved.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3, react-i18next 15.4.1
**Storage**: N/A — no storage changes
**Testing**: Jest + React Native Testing Library (no existing tests for this component)
**Target Platform**: iOS 15+ / Android 10+ / Expo Go, minimum viewport 360x640px
**Project Type**: Mobile (Expo managed workflow)
**Performance Goals**: Grid renders within 1 second of data availability (SC-006). 60fps animations.
**Constraints**: All 7-9 candidates visible without scrolling on 360x640px+. All cards identical dimensions. All avatars identical circular size.
**Scale/Scope**: 1 component rewrite, 1 new utility file. 7 candidates (Paris 2026 MVP), supports up to 9.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| I. Neutrality & Non-Prescription | **PASS** | Equal card dimensions, equal avatar sizes, daily shuffle preserved. No candidate gets more visual prominence than another. FR-002, FR-005, FR-009, FR-013 directly enforce this. |
| II. Source-Grounded Truth | **PASS** | No factual content changes. Candidate data (name, party) displayed as-is from election dataset. |
| III. City-Agnostic Architecture | **PASS** | No changes to election data schema or core logic. Party colors are injected at the presentation layer via a utility map (same pattern as candidateImageSource.ts). Grid works for any candidate count up to 9. |
| IV. Critical Thinking Over Persuasion | **N/A** | No interactive/reasoning feature changes. |
| V. Structured Data as Single Source of Truth | **PASS** | Election dataset unchanged. Party color map is a presentation utility, not a data source. |
| VI. Simplicity & MVP Discipline | **PASS** | Minimal change: 1 component rewrite + 1 utility file. No new screens, tabs, or features. Fixes 3 identified UX problems (unequal cards, unequal photos, scrolling). |
| VII. Privacy & Trust | **N/A** | No user data handling changes. |

**Pre-Phase 0 gate**: PASSED — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/010-candidates-grid-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: design decisions
├── data-model.md        # Phase 1: entity overview (no changes)
├── quickstart.md        # Phase 1: implementation guide
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/(tabs)/
│   └── candidates.tsx              # Candidates screen (UNCHANGED)
├── components/
│   └── candidates/
│       └── CandidateGallery.tsx    # MAJOR REWRITE — 3-column circular avatar grid
├── utils/
│   ├── candidateImageSource.ts     # Image source map (UNCHANGED)
│   ├── candidatePartyColor.ts      # NEW — Party color map by candidate ID
│   └── shuffle.ts                  # Shuffle utility (UNCHANGED)
└── data/
    └── schema.ts                   # Candidate interface (UNCHANGED)
```

**Structure Decision**: Single mobile project. Changes scoped to `src/components/candidates/` (1 rewrite) and `src/utils/` (1 new file). No new directories. Follows existing project conventions.

## Complexity Tracking

> No constitution violations. No complexity justification needed.

## Post-Design Constitution Re-check

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Neutrality | **PASS** | Fixed card heights + fixed avatar sizes + daily shuffle + centered last row = equal visual treatment confirmed. |
| III. City-Agnostic | **PASS** | Party color utility follows the candidateImageSource pattern — Paris-specific data isolated in a map, function interface is generic. |
| VI. Simplicity | **PASS** | View-based grid (no FlatList) is simpler for 7-9 items. No over-engineering. |

**Post-Phase 1 gate**: PASSED.

# Implementation Plan: Comparison Tab Redesign

**Branch**: `013-comparison-redesign` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-comparison-redesign/spec.md`

## Summary

Fix two critical bugs in the comparison screen (candidate pre-selection not working due to CSV parsing error, theme icons displayed as raw text instead of graphical icons) and redesign the comparison cards with candidate avatars, uniform heights, and improved visual hierarchy. Add mini avatars to the candidate selector pills.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, NativeWind 4.1.23, @expo/vector-icons 15.0.3 (Ionicons), react-i18next 15.4.1
**Storage**: N/A — no storage changes
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS, Android, Web (Expo managed)
**Project Type**: Mobile (React Native / Expo)
**Performance Goals**: 60 fps scrolling, instant theme switching
**Constraints**: All changes scoped to comparison screen and its components; no data schema changes
**Scale/Scope**: 4 files modified, 1 new component, ~150 lines changed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Neutrality & Non-Prescription | PASS | Candidate cards and pills use identical visual treatment for all candidates. No editorial ranking. Avatar display order unchanged. |
| II. Source-Grounded Truth | PASS | No changes to source attribution. SourceReference components remain in comparison cards. |
| III. City-Agnostic Architecture | PASS | No Paris-specific logic added. Avatar derives initials from generic `candidate.name`. Party colors come from existing utility. Theme icons use generic `theme.icon` field. |
| IV. Critical Thinking Over Persuasion | PASS | Feature encourages comparison ("show alternatives"). No persuasion elements. |
| V. Structured Data as Single Source of Truth | PASS | All data still comes from the single election dataset. No shadow copies. Party colors stay in the utility mapping (existing pattern). |
| VI. Simplicity & MVP Discipline | PASS | No new tabs or screens. Changes are scoped to existing comparison stack screen. One new reusable component (CandidateAvatar) replaces inline duplication. |
| VII. Privacy & Trust | PASS | No user data collected or stored. Comparison is ephemeral and local. |

**Gate result**: ALL PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/013-comparison-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── comparison.tsx                    # MODIFY: fix params parsing, add mini avatars to pills
├── components/
│   └── candidates/
│       ├── CandidateAvatar.tsx           # NEW: reusable avatar component
│       ├── ComparisonView.tsx            # MODIFY: add avatar, uniform height, icon fix
│       └── ThemeFilter.tsx               # MODIFY: render icons as Ionicons
├── data/
│   └── elections/
│       └── paris-2026/
│           └── themes.json              # MODIFY (if needed): fix "palette" icon name
└── utils/
    ├── candidatePartyColor.ts           # EXISTING: used for avatar background colors
    └── candidateImageSource.ts          # EXISTING: used for avatar photos
```

**Structure Decision**: All changes fit within the existing `src/` structure. One new component (`CandidateAvatar.tsx`) is added to `src/components/candidates/` following the established pattern of candidate-related components in that directory.

## Complexity Tracking

> No constitution violations — this section is intentionally empty.

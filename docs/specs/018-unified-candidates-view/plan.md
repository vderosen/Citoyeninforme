# Implementation Plan: Unified Candidates View

**Branch**: `018-unified-candidates-view` | **Date**: 2026-02-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/018-unified-candidates-view/spec.md`

## Summary

Merge the candidates grid, individual candidate profile, and comparison view into a single adaptive screen within the Candidats tab. The CandidateAvatarBar becomes the persistent selection mechanism at the top: 0 selected = empty state with guidance, 1 selected = inline profile, 2-4 selected = side-by-side comparison. Removes 2 standalone routes (`candidate/[id]`, `comparison`) and the `CandidateGallery` grid component.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3 (Ionicons), react-i18next 15.4.1, Zustand 5.0.3
**Storage**: N/A — selection state is ephemeral (local component state, not persisted)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS, Android, Web (Expo managed workflow)
**Project Type**: Mobile app (React Native / Expo)
**Performance Goals**: View responds to selection changes within 300ms (SC-005)
**Constraints**: Max 4 candidates selectable simultaneously; 7 candidates for Paris 2026 MVP
**Scale/Scope**: 7 candidates, 8 themes, single screen rewrite

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Neutrality & Non-Prescription | PASS | Avatar bar uses `deterministicShuffle(candidates, dailySeed())` — same daily-randomized ordering as current gallery. No editorial ordering. |
| II. Source-Grounded Truth | PASS | No change to data presentation. Positions, sources, and trust badges remain unchanged. |
| III. City-Agnostic Architecture | PASS | Uses generic `Candidate`, `Theme`, `Position` interfaces from election store. No Paris-specific logic. |
| IV. Critical Thinking Over Persuasion | PASS | Debate access maintained via inline button (FR-009). Comparison view encourages exploration. |
| V. Single Source of Truth | PASS | All candidate/theme/position data flows from election store. No shadow copies. |
| VI. Simplicity & MVP Discipline | PASS | REDUCES complexity: 3 screens → 1 screen. Removes 2 routes and 1 component. The "Candidats" tab now covers browse + view + compare intents. No new tabs added. Constitution note: "Additional screens (e.g., candidate profiles, comparison) are presented as stack screens" — we are removing these stack screens in favor of inline display, which is simpler. |
| VII. Privacy & Trust | PASS | Selection state is ephemeral (useState). No user data stored or transmitted. |

**Gate result: ALL PASS — no violations. Complexity Tracking not required.**

## Project Structure

### Documentation (this feature)

```text
specs/018-unified-candidates-view/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research & decisions
├── data-model.md        # Phase 1: component/state model
├── quickstart.md        # Phase 1: implementation guide
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx           # UPDATE: remove comparison header action if any
│   │   └── candidates.tsx        # REWRITE: unified view (avatar bar → content area)
│   └── _layout.tsx               # UPDATE: remove candidate/[id] and comparison Stack.Screens
│
├── components/
│   ├── candidates/
│   │   ├── CandidateProfileCard.tsx   # KEEP: reuse for single-candidate view (minor prop tweak)
│   │   ├── ComparisonView.tsx         # KEEP: reuse for multi-candidate view
│   │   ├── ThemeTabBar.tsx            # KEEP: reuse as-is
│   │   ├── CandidateAvatar.tsx        # KEEP: reuse as-is
│   │   ├── PositionCard.tsx           # KEEP: reuse as-is
│   │   └── CandidateGallery.tsx       # DELETE: replaced by avatar bar
│   └── comparison/
│       └── CandidateAvatarBar.tsx     # KEEP: reuse as-is (primary selection UI)
│
├── i18n/locales/fr/
│   └── candidates.json               # UPDATE: add empty state guidance keys
│
├── stores/
│   └── election.ts                    # KEEP: no changes needed
│
└── utils/
    └── shuffle.ts                     # KEEP: reuse deterministicShuffle + dailySeed

# Files to DELETE:
# src/app/candidate/[id].tsx          — profile now inline in candidates tab
# src/app/comparison.tsx              — comparison now inline in candidates tab
# src/components/candidates/CandidateGallery.tsx — replaced by CandidateAvatarBar
```

**Structure Decision**: Mobile app, single-project. The feature modifies 3 existing files (candidates.tsx, _layout.tsx, candidates.json), deletes 3 files (candidate/[id].tsx, comparison.tsx, CandidateGallery.tsx), and reuses 5 existing components without modification.

## Complexity Tracking

> No constitution violations — section intentionally empty.

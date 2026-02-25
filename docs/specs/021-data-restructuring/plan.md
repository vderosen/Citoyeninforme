# Implementation Plan: Restructuration des Donnees Electorales

**Branch**: `021-data-restructuring` | **Date**: 2026-02-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-data-restructuring/spec.md`

## Summary

Consolidate 8 fragmented JSON data files into 3 domain-organized files (institutional, campaign, interactive), introduce the Measure entity for countable concrete proposals, normalize source references via a shared dictionary, update the data loader to flatten nested structures back to the existing store API (zero breaking change), and clean up dead SQLite infrastructure code.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23
**Storage**: Bundled JSON files (static imports via Metro bundler), Zustand in-memory store
**Testing**: Jest + RNTL (existing `tests/unit/loader.test.ts`)
**Target Platform**: iOS, Android, Web (Expo managed workflow)
**Project Type**: Mobile (cross-platform)
**Performance Goals**: Data loading time must not regress perceptibly (currently near-instant from bundled JSON)
**Constraints**: Zero breaking change on store API — all consuming components must work without modification
**Scale/Scope**: 3 JSON files (down from 8), ~50KB total data, 7 candidates, 8 themes, 15 positions, 18 statement cards

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Notes |
|-----------|---------|-------|
| I. Neutrality | PASS | Data restructuring does not change candidate presentation or ordering. |
| II. Source-Grounded Truth | STRENGTHENED | Source normalization ensures single point of update for each source. Measures inherit source references via `sourceIds`. |
| III. City-Agnostic | PASS | 3-file structure is per-election directory (`elections/{city-year}/`). No city-specific logic introduced. |
| IV. Critical Thinking | N/A | No interactive feature changes. |
| V. Single Source of Truth | STRENGTHENED | Reduces duplication (sources normalized, `electionId` implicit). Loader reconstructs flat structures from single authoritative files. |
| VI. Simplicity & MVP | STRENGTHENED | 8 files → 3 files. ~200 lines of dead SQLite code removed. |
| VII. Privacy & Trust | N/A | No user data changes. |
| Content & Data Standards | PASS | Schema validation is updated to cover new structure (sourceId integrity, themeId integrity, measures validation). |

**Gate result**: PASS — all principles satisfied or strengthened.

## Project Structure

### Documentation (this feature)

```text
specs/021-data-restructuring/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── election-data.ts # Updated contracts
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── schema.ts                          # MODIFY — add Measure, SourceMap; update Position; remove electionId from entities
│   ├── loader.ts                          # REWRITE — load 3 files, flatten positions, dereference sourceIds, updated validation
│   ├── database.native.ts                 # DELETE — dead SQLite code
│   ├── database.web.ts                    # DELETE — dead SQLite web stub
│   └── elections/
│       └── paris-2026/
│           ├── election.json              # NEW — institutional (merge old election.json + logistics.json + civic-facts.json)
│           ├── candidates.json            # NEW — campaign (merge old candidates.json + themes.json + positions.json + sources dict)
│           ├── survey.json                # NEW — interactive (merge old survey-questions.json + statement-cards.json)
│           ├── [old election.json]        # DELETE
│           ├── [old candidates.json]      # DELETE
│           ├── [old themes.json]          # DELETE
│           ├── [old positions.json]       # DELETE
│           ├── [old survey-questions.json] # DELETE
│           ├── [old statement-cards.json] # DELETE
│           ├── [old civic-facts.json]     # DELETE
│           └── [old logistics.json]       # DELETE
├── stores/
│   └── election.ts                        # NO CHANGE — store API unchanged
├── components/
│   └── home/
│       └── QuickStatsBand.tsx             # MODIFY — positionCount → measureCount
├── app/
│   └── (tabs)/
│       └── index.tsx                      # MODIFY — compute measures count from positions
└── i18n/
    └── locales/
        └── fr/
            └── home.json                  # MODIFY — add statMeasures, remove statPositions

tests/
└── unit/
    └── loader.test.ts                     # REWRITE — test new 3-file loading, flattening, source dereferencing, validation

specs/
└── 001-civic-election-app/
    ├── data-model.md                      # UPDATE — reflect new structure, add Measure, remove SQLite schema
    └── contracts/
        └── election-data.ts               # UPDATE — reflect new types
```

**Structure Decision**: Existing React Native project structure. This feature modifies data layer files only. No new directories needed. Store and component layers have minimal changes (QuickStatsBand prop rename, Home page measure count computation).

## Complexity Tracking

No constitution violations to justify.

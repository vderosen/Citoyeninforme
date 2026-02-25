# Tasks: Restructuration des Donnees Electorales

**Input**: Design documents from `/specs/021-data-restructuring/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in spec. Loader tests are rewritten as part of US1 since they are integral to the data layer validation.

**Organization**: Tasks grouped by user story. US1 and US3 are combined into a single phase because source normalization is integral to the new candidates.json file structure (they share all implementation files).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Includes exact file paths in descriptions

---

## Phase 1: Foundational (Schema Update)

**Purpose**: Update TypeScript types that all subsequent tasks depend on

- [X] T001 Add Measure interface and update Position interface with measures field in src/data/schema.ts

**Checkpoint**: Schema types ready — all user story tasks can reference the updated types.

---

## Phase 2: US1 & US3 — Data Consolidation + Source Normalization (P1 + P3)

**Goal**: Replace 8 fragmented JSON files with 3 domain-organized files. Source references are normalized into a dictionary in candidates.json (satisfies US3). Loader flattens nested structures back to existing store API.

**Independent Test**: App launches, all screens display identical data to before. `npm test` passes. No TypeScript compilation errors.

### Data Files (can be created in parallel)

- [X] T002 [P] [US1] Create new src/data/elections/paris-2026/election.json by merging old election.json + logistics.json + civic-facts.json into ElectionFile schema (see contracts/election-data.ts)
- [X] T003 [P] [US1] Create new src/data/elections/paris-2026/candidates.json by merging old candidates.json + themes.json + positions.json into CandidatesFile schema with positions nested under candidates, sources dictionary normalized (also satisfies US3), and empty measures arrays in src/data/elections/paris-2026/candidates.json
- [X] T004 [P] [US1] Create new src/data/elections/paris-2026/survey.json by merging old survey-questions.json + statement-cards.json into SurveyFile schema (removing electionId from entries) in src/data/elections/paris-2026/survey.json

### Loader Rewrite

- [X] T005 [US1] Rewrite src/data/loader.ts to import 3 new JSON files, flatten nested positions into Position[] with candidateId injected, dereference sourceIds into SourceReference[] objects, inject electionId into all entities, and validate referential integrity (themeIds, sourceIds, uniqueness)
- [X] T006 [US1] Rewrite tests/unit/loader.test.ts to test new 3-file loading, position flattening, source dereferencing (US3), electionId injection, and validation error detection for broken themeId/sourceId references

### Cleanup Old Files

- [X] T007 [US1] Delete 8 old JSON files from src/data/elections/paris-2026/: election.json (old), candidates.json (old), themes.json, positions.json, survey-questions.json, statement-cards.json, civic-facts.json, logistics.json

**Checkpoint**: App loads data from 3 new files. All existing screens render identically. Loader tests pass. Source normalization (US3) is fully implemented.

---

## Phase 3: US2 — Measures Visibility on Home Page (P2)

**Goal**: Home page displays total measures count instead of positions count.

**Independent Test**: QuickStatsBand shows "{N} mesures" where N is the sum of all measures across all positions of all candidates.

- [X] T008 [P] [US2] Add statMeasures key ("mesures") to src/i18n/locales/fr/home.json and remove statPositions key
- [X] T009 [US2] Update src/components/home/QuickStatsBand.tsx to accept measureCount prop instead of positionCount and use t("statMeasures") label
- [X] T010 [US2] Update src/app/(tabs)/index.tsx to compute measureCount as positions.reduce((sum, p) => sum + p.measures.length, 0) and pass it to QuickStatsBand

**Checkpoint**: Home page displays "0 mesures" (or actual count if measures are populated). Label reads "mesures" not "positions".

---

## Phase 4: US4 — Dead Code Cleanup (P4)

**Goal**: Remove unused SQLite infrastructure code.

**Independent Test**: App builds and runs without errors after deletion. No import warnings.

- [X] T011 [P] [US4] Delete src/data/database.native.ts (198 lines of unused SQLite code)
- [X] T012 [P] [US4] Delete src/data/database.web.ts (12 lines of unused web stub)

**Checkpoint**: No dead code remains. `npx tsc --noEmit` passes. App runs normally.

---

## Phase 5: Polish & Documentation

**Purpose**: Update upstream documentation to reflect new structure

- [X] T013 [P] Update specs/001-civic-election-app/data-model.md to reflect 3-file structure, add Measure entity, remove SQLite schema section
- [X] T014 [P] Update specs/001-civic-election-app/contracts/election-data.ts to match new file schemas and runtime types from specs/021-data-restructuring/contracts/election-data.ts
- [X] T015 Run full validation: npx tsc --noEmit, npm test, verify quickstart.md integration scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 & US3 (Phase 2)**: Depends on Phase 1 (schema types)
- **US2 (Phase 3)**: Depends on Phase 2 (measures field exists on Position, loader produces it)
- **US4 (Phase 4)**: Depends on Phase 2 (loader rewrite removes database import)
- **Polish (Phase 5)**: Depends on all previous phases

### Within Phase 2 (US1 & US3)

- T002, T003, T004 can run in parallel (different files)
- T005 depends on T002, T003, T004 (loader imports the new files)
- T006 depends on T005 (tests test the new loader)
- T007 depends on T005 (old files must not be imported before deletion)

### Within Phase 3 (US2)

- T008 can start immediately (i18n file)
- T009 depends on T008 (uses new i18n key)
- T010 depends on T009 (passes prop to updated component)

### Parallel Opportunities

```bash
# Phase 2 data files (all in parallel):
T002: election.json
T003: candidates.json
T004: survey.json

# Phase 4 dead code (all in parallel):
T011: database.native.ts
T012: database.web.ts

# Phase 5 documentation (in parallel):
T013: data-model.md
T014: contracts/election-data.ts
```

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2)

1. Complete Phase 1: Update schema.ts
2. Complete Phase 2: Create 3 JSON files → Rewrite loader → Tests → Delete old files
3. **STOP and VALIDATE**: App works identically, tests pass, `tsc --noEmit` clean
4. This covers US1 (P1) + US3 (P3) — the structural foundation

### Incremental Delivery

1. Phase 1 + Phase 2 → Data consolidation complete (MVP)
2. Phase 3 → Measures visible on Home page
3. Phase 4 → Dead code removed
4. Phase 5 → Documentation updated, full validation

---

## Notes

- US1 and US3 are combined because source normalization is part of the candidates.json file structure — they cannot be implemented separately
- The loader rewrite (T005) is the most complex task: it reads 3 files, flattens nested positions, dereferences sourceIds, injects electionId, and validates integrity
- Zero breaking change constraint: store API (getPositionsForCandidate, getPositionsForTheme, getPositionForCandidateTheme) must remain identical
- Measures arrays will be empty initially (migration phase) — this is expected and valid
- T007 (delete old files) must happen AFTER T005 (loader rewrite) to avoid broken imports

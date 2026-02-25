# Research: Restructuration des Donnees Electorales

**Branch**: `021-data-restructuring` | **Date**: 2026-02-21

## Summary

No critical unknowns identified. The feature uses existing technologies (TypeScript, bundled JSON, Zustand store) and does not introduce new dependencies. All decisions are driven by the existing codebase structure and spec requirements.

## Decisions

### D1: 3-file split strategy

**Decision**: Organize data into `election.json` (institutional), `candidates.json` (campaign), `survey.json` (interactive).

**Rationale**: Files are grouped by update frequency and domain responsibility:
- `election.json`: Institutional data (rules, dates, logistics) — rarely changes after initial setup
- `candidates.json`: Campaign content (candidates, themes, positions, measures, sources) — updated regularly as campaigns evolve
- `survey.json`: Interactive content (quiz questions, swipe statement cards) — updated independently from campaign data

**Alternatives considered**:
- Single file: Too large and conflates domains
- 2 files (institutional + everything else): Survey content has different update lifecycle than campaign data
- Keep 8 files: Current pain point — too fragmented, duplication-prone

### D2: Measures as nested array within positions

**Decision**: Add `measures: Measure[]` array to each position, where each measure has `text` and `sourceIds`.

**Rationale**: Measures are always specific to a position (candidate + theme). Nesting them within positions preserves data locality and makes it obvious which measures belong where. The `sourceIds` reference the normalized source dictionary.

**Alternatives considered**:
- Separate measures collection with foreign keys: Adds unnecessary indirection for data that is always consumed with its parent position
- Free-text measures in the `details` field: Not structured, not countable, violates FR-005/FR-006

### D3: Source normalization via string ID dictionary

**Decision**: Store sources as `Record<string, SourceReference>` in the candidates file. Positions and measures reference sources via `sourceIds: string[]`.

**Rationale**: Current dataset has 15 positions sharing ~10 unique source URLs. The same source (e.g., "Le programme - Emmanuel Gregoire 2026") appears in 4 positions. A dictionary eliminates this duplication and ensures consistency when a source URL changes.

**Alternatives considered**:
- Keep inline sources: Current approach — duplication-prone, error-prone when updating
- Separate sources.json file: Unnecessary file separation for a dictionary that is always consumed with positions

### D4: Loader flattening strategy

**Decision**: The loader reads the 3 new files and reconstructs the same flat `ElectionDataset` structure consumed by the Zustand store. No store API changes.

**Rationale**: Zero breaking change for all consuming components. The store's `positions: Position[]` array, with `candidateId` and `themeId` fields, continues to work identically. Only the loader's internal transformation changes.

**Alternatives considered**:
- Update store to match nested structure: Would require changes to every component that reads positions — high blast radius, no user value

### D5: Dead code removal scope

**Decision**: Delete `database.native.ts`, `database.web.ts`, and the `export { initializeDatabase }` line from `loader.ts`.

**Rationale**: `initializeDatabase()` is exported from `loader.ts` but never imported by any consumer. The `_layout.tsx` root layout only calls `loadBundledDataset()`. The SQLite infrastructure is 200+ lines of unused code. Also remove the SQLite schema section from `data-model.md`.

**Alternatives considered**:
- Keep for potential future use: Violates Principle VI (YAGNI). If SQLite is needed later, it will need to match the new data model anyway.

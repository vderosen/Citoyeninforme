# Quickstart: Restructuration des Donnees Electorales

**Branch**: `021-data-restructuring` | **Date**: 2026-02-21

## Integration Scenarios

### Scenario 1: App startup with new data files

**Steps**:
1. App starts → `_layout.tsx` calls `loadBundledDataset()`
2. Loader imports 3 JSON files (election.json, candidates.json, survey.json)
3. Loader flattens nested positions → `Position[]` with `candidateId` injected
4. Loader dereferences `sourceIds` → `SourceReference[]` objects
5. Loader injects `electionId` into candidates, themes, civicFacts, surveyQuestions, statementCards, logistics
6. Loader validates referential integrity (themeIds, sourceIds, uniqueness)
7. Returns `ElectionDataset` → Zustand store `loadDataset(dataset)`

**Expected**: All screens render identically to current 8-file version. No visible change except Home page shows "mesures" instead of "positions".

### Scenario 2: Home page measures count

**Steps**:
1. Home screen reads `positions` from store
2. Computes `measureCount = positions.reduce((sum, p) => sum + p.measures.length, 0)`
3. Passes `measureCount` to `QuickStatsBand`
4. QuickStatsBand displays: `{measureCount} mesures`

**Expected**: Stat band shows total measures count. If all measures arrays are empty (migration phase), displays `0 mesures`.

### Scenario 3: Candidate profile page (no changes needed)

**Steps**:
1. CandidateProfileCard calls `getPositionsForCandidate(candidateId)`
2. Store returns `Position[]` with `sources: SourceReference[]` (fully resolved)
3. Component renders positions exactly as before

**Expected**: Zero visual change. The `measures` field exists on positions but is not rendered (not part of current UI).

### Scenario 4: Comparison view (no changes needed)

**Steps**:
1. ComparisonView calls `getPositionForCandidateTheme(candidateId, themeId)`
2. Returns `Position | undefined` with full source objects
3. PositionCard renders summary, details, sources

**Expected**: Zero visual change.

### Scenario 5: Data validation catches broken references

**Steps**:
1. A position references `sourceIds: ["nonexistent-source"]`
2. Loader's validation checks `sourceIds` against `sources` dictionary keys
3. Validation throws: "Position david-belliard-transport: unknown sourceId nonexistent-source"

**Expected**: App fails to load with clear error message identifying the broken reference.

### Scenario 6: Survey and swipe (no changes needed)

**Steps**:
1. Survey screen reads `surveyQuestions` from store
2. Swipe screen reads `statementCards` from store
3. Both have `electionId` injected by loader, `themeIds` reference valid themes

**Expected**: Zero visual change. Survey scoring works identically.

## Verification Checklist

- [ ] `npm test` passes (loader tests cover new 3-file structure)
- [ ] App launches on iOS simulator without errors
- [ ] App launches on Android emulator without errors
- [ ] App launches on web without errors
- [ ] Home page shows "X mesures" stat (or "0 mesures" if measures not yet populated)
- [ ] Candidates tab shows all 7 candidates with correct data
- [ ] Each candidate profile shows correct positions
- [ ] Comparison view works for any 2 candidates
- [ ] Survey flow completes successfully
- [ ] Swipe mode works with all 18 statement cards
- [ ] No TypeScript compilation errors (`npx tsc --noEmit`)
- [ ] No console warnings about missing data or broken references

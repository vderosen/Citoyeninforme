# Data Pipeline (Paris 2026)

This folder hosts **data preparation** workflows that transform fact-checked sources
into the app-ready dataset under `src/data/elections/paris-2026/`.

## Current source

- `data_pipeline/rag_sources_by_vass/`
  - `sources.jsonl` contains source metadata (candidate, URL, dates, etc.)
  - `text_clean/*.json` contains extracted text (the actual input for processing)

## Goal

Generate `src/data/elections/paris-2026/positions.json` from the RAG sources
while keeping the rest of the dataset manual or semi-manual:

- Manual/semi-manual: `candidates.json`, `civic-facts.json`, `election.json`,
  `logistics.json`, `themes.json`
- Independent/editorial: `survey-questions.json`
- Pipeline output: `positions.json`

## Pipeline outline (conceptual)

1. **Normalize candidates**
   - Map Vass candidate labels to app `candidateId` values.

2. **Extract + classify passages**
   - Read `text_clean/*.json`.
   - Identify passages relevant to app themes in `themes.json`.
   - Assign passages to one of the 8 themes.

3. **Synthesize positions**
   - For each `(candidateId, themeId)`:
     - `summary` (1–2 sentences)
     - `details` (3–6 sentences)
     - `sources` from `sources.jsonl`
     - `lastVerified` = pipeline run date

4. **Write output**
   - Create/overwrite `src/data/elections/paris-2026/positions.json`.

## Notes

- If a candidate has no material for a theme, **no position entry is created**.
- The RAG export does **not** cover all candidates in the app dataset (e.g.,
  `david-belliard` is missing), so those positions must be handled separately.
- `sources.jsonl` currently includes duplicate/error rows and a `Test` record.
  These should be filtered out in the pipeline.

## Next step (optional)

If you want a scripted pipeline, we can add:

- `data_pipeline/scripts/ingest-rag-paris-2026.js`
- `data_pipeline/config/mappings.json` (candidate + theme mappings)
- `data_pipeline/output/positions.json` (generated preview)


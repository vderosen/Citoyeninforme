# Lucide v2 - Project Context

## What We're Doing
We are building **Lucide**, a city-agnostic civic app using Expo and React Native. The current MVP focuses exclusively on the **Paris 2026 municipal election**. 

The fundamental principle of the app is **neutral, source-grounded information** without editorial bias or voting recommendations. All data is structured, heavily sourced, and loaded locally on the device to respect privacy.

## What is the End Goal
The end goal is to provide citizens with tools for election learning and critical thinking about political programs. The app includes:
1. **Discover Flow:** Context, key logistics, and shortcuts.
2. **Candidate Exploration & Comparison:** Side-by-side theme comparisons and structured candidate profiles.
3. **Civic Survey:** A deterministic questionnaire where users compare their preferences to candidates' actual positions, resulting in a weighted match and contradiction analysis.
4. **Chatbot Assistant:** A local-first proxy AI that can:
   - *Comprendre*: Answer questions neutrally using the election dataset.
   - *Parler*: Adopt a candidate's persona but strictly limited to their documented program.
   - *Débattre*: Act as a Socratic agent to challenge the user's survey results and explore political trade-offs.

## What We've Done Already
- **Core Architecture Built:** React Native + Expo structure is live, featuring local state management (Zustand) and a local LLM proxy for the assistant.
- **Frontend Implementations:** Home, Candidate grids, comparison views, survey swiping, and onboarding flows have gone through multiple iterations (up to redesign specs `015-comparison-selector-redesign`, `019-swipe-survey-redesign`, etc.).
- **Data Source Migration (`proposals.json`):** The app now loads statement cards directly from `data_pipeline/proposals/proposals.json` instead of the old hand-crafted `survey.json`. The loader (`src/data/loader.ts`) dynamically groups proposals by `card_id`, resolves candidate short names (e.g. "Dati") to full IDs (e.g. "rachida-dati") via an alias table, and handles opposing-candidate "VS" cards. This produces **131 unique cards** across 6 candidates.
- **Candidate Cleanup:** David Belliard was removed from `candidates.json` as he has no proposals in the dataset. The `SurveyQuestion` and `SurveyOption` types were deleted from `schema.ts` as they are no longer needed.
- **Direct Scoring Engine:** The matching engine (`services/matching.ts`) uses a direct integer point system (+2/+1/0/-1/-2) per candidate per card swipe. A card's `candidateIds` all gain points equally; `opposingCandidateIds` get inverted scores. Each candidate carries a full `cardBreakdown` array for transparency.
- **Candidate-Balanced Shuffle:** Cards are ordered by a greedy coverage scheduler (`utils/shuffle.ts → balancedShuffle`). At each step it picks the card whose candidates are most underrepresented so far, ensuring fair exposure at any stopping point. The order is seeded per day for determinism.
- **Results Podium:** A gamified podium component (`components/survey/Podium.tsx`) shows the top 3 candidates in a classic 2nd|1st|3rd layout with party-colored bars. Ties are handled: candidates with the same score share the same rank and bar height.
- **Candidate Breakdown:** Tapping a candidate on the results page opens a score breakdown showing every card interaction. Each card row is tappable — it opens a description modal showing the card's explanation.
- **Updated Tutorial Overlay:** The swipe tutorial reflects the current 5-button + horizontal-swipe model (no more vertical swipe or double-tap references).
- **Card Counter Removed:** The "X / Y" counter was removed from the progress bar; only the colored dots remain.
- **Data Ingestion Pipeline:** The `data_pipeline/` directory contains the full ingestion, extraction, structuring, and normalization pipeline for candidate programs, producing `proposals.json` as the source of truth.
- **Chatbot Assistant:** A local-first proxy AI with three modes: *Comprendre* (neutral Q&A), *Parler* (candidate persona), *Débattre* (Socratic challenge).

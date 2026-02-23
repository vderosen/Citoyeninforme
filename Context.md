# Lucide v2 – Project Context

## What We're Doing

We are building **Lucide**, a city-agnostic civic app using Expo and React Native. The current MVP focuses exclusively on the **Paris 2026 municipal election**.

The fundamental principle of the app is **neutral, source-grounded information** without editorial bias or voting recommendations. All data is structured, heavily sourced, and loaded locally on the device to respect privacy.

---

## What is the End Goal

The end goal is to provide citizens with tools for election learning and critical thinking about political programs. The app includes:

1. **Discover Flow:** Context, key logistics, and shortcuts.
2. **Candidate Exploration & Comparison:** Side-by-side theme comparisons and structured candidate profiles.
3. **Civic Survey:** A deterministic questionnaire where users compare their preferences to candidates' actual positions, resulting in a weighted match and contradiction analysis.
4. **Chatbot Assistant:** A local-first proxy AI that can:
   - *Comprendre*: Answer questions neutrally using the election dataset.
   - *Parler*: Adopt a candidate's persona but strictly limited to their documented program.
   - *Débattre*: Act as a Socratic agent to challenge the user's survey results and explore political trade-offs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81.5 + Expo SDK 54 (managed workflow) |
| Router | Expo Router 6.0 (file-based, tab + stack navigation) |
| Language | TypeScript 5.9.2 |
| State | Zustand 5.0.3 |
| Styling | NativeWind 4.1.23 + Tailwind CSS 3.4.17 |
| UI Library | @gluestack-ui/themed 1.1.73 |
| Animations | react-native-reanimated 4.1.1 |
| Icons | @expo/vector-icons 15.0.3 (Ionicons) |
| Gestures | react-native-gesture-handler 2.28.0 |
| i18n | react-i18next 15.4.1 |
| Fonts | @expo-google-fonts/space-grotesk, Inter |
| Storage (native) | AsyncStorage via Zustand persist middleware |
| Storage (web) | localStorage via Zustand persist middleware |
| Chat backend | OpenAI Node SDK (proxied — Gemini via OpenAI-compatible endpoint) |
| Error tracking | Sentry (@sentry/react-native) |

---

## Screen Map & Routes

All tab screens live under `src/app/(tabs)/`. Additional screens are stacked on top.

| Route | File | Description |
|---|---|---|
| `/` (Home) | `(tabs)/index.tsx` | Entry dashboard: election overview, shortcuts |
| `/candidates` | `(tabs)/candidates.tsx` | Candidate grid + comparison selector; deep dives into per-candidate profiles |
| `/cards` | `(tabs)/cards.tsx` | Survey card deck (swipe quiz) |
| `/matches` | `(tabs)/matches.tsx` | Results podium + candidate breakdown |
| `/assistant` | `(tabs)/assistant.tsx` | Chatbot (Comprendre / Parler / Débattre modes) |
| `/survey/intro` | `survey/intro.tsx` | Pre-survey intro screen |
| `/survey/candidate-breakdown` | `survey/candidate-breakdown.tsx` | Per-candidate card-by-card score breakdown |
| `/onboarding` | `onboarding.tsx` | First-launch onboarding flow |
| `/privacy-consent` | `privacy-consent.tsx` | GDPR consent screen |
| `/settings` | `settings.tsx` | User settings: privacy, crash reporting, reset |

---

## Data Architecture

### Election Dataset (`src/data/elections/paris-2026/`)

| File | Type | Updated By |
|---|---|---|
| `candidates.json` | Static | Manual |
| `election.json` | Static | Manual (includes themes, civic facts, logistics, statement cards) |

`election.json` is the primary dataset. It contains the full election object including:
- `candidates[]` — 5 active candidates (Hidalgo, Dati, Beaune, Belliard excluded, etc.)
- `themes[]` — 8 thematic categories
- `positions[]` — per-candidate × per-theme stances (summary + details + sources)
- `statementCards[]` — 131 anonymous policy cards used in the survey
- `civicFacts[]` — factual election context snippets
- `logistics` — date, voting rules, eligibility info

### Data Loader (`src/data/loader.ts`)

The loader parses `election.json` and produces a hydrated `ElectionDataset` object that's fed into the `election` Zustand store. Key responsibilities:
- Groups proposals by `card_id`
- Resolves candidate short-name aliases (e.g. `"Dati"` → `"rachida-dati"`) via a built-in alias table
- Handles "VS" cards where `opposingCandidateIds` receive inverted scores
- Produces **131 unique `StatementCard` objects** across 5 active candidates

### Data Schema (`src/data/schema.ts`)

Core TypeScript types: `Election`, `Candidate`, `Theme`, `Position`, `StatementCard`, `CivicFact`, `ElectionLogistics`, `ElectionDataset`. The now-removed `SurveyQuestion` / `SurveyOption` types must **not** be re-added.

---

## State Management (Zustand Stores)

All stores are in `src/stores/`. Persisted stores use AsyncStorage on native and localStorage on web.

### `app` (key: `app-state`)
Persisted. Tracks app lifecycle flags.
- `hasCompletedOnboarding` — drives the onboarding gate
- `hasSeenSwipeTutorial` — shows/hides the swipe tutorial overlay
- `privacyConsentVersion` / `consentTimestamp` — GDPR
- `crashReportingOptIn` — Sentry opt-in

### `election` (no persistence)
In-memory only. Loaded once on app start from `election.json` via `loader.ts`.
- `candidates`, `themes`, `positions`, `statementCards`, `civicFacts`, `logistics`
- Exposes selector helpers: `getCandidateById`, `getThemeById`, `getPositionsForCandidate`, etc.

### `survey` (key: `survey-state`)
Persisted. Drives the entire survey flow.
- `status`: `idle | civic-context | questionnaire-active | computing | completed`
- `answers`: `Record<card_id, optionId>` — all card votes
- `profile`: computed `UserProfile` with per-candidate scores and `cardBreakdown[]`
- `datasetVersion`: used to detect stale results when the dataset is updated

### `assistant` (key: `assistant-state`)
Partially persisted. Conversations are persisted; debate state and follow-up suggestions are **ephemeral** (in-memory only).
- `mode`: `comprendre | parler | débattre`
- `selectedCandidateId`: active candidate for Parler mode
- `conversations`: `Record<conversationKey, ChatMessage[]>`
- `debateTurns`: ephemeral — NOT saved across sessions

---

## Survey & Scoring Engine

**File:** `src/services/matching.ts`

Scoring uses a direct integer point system per swipe:
- Strong agree → **+2**; Agree → **+1**; Neutral → **0**; Disagree → **−1**; Strong disagree → **−2**

Each card's `candidateIds` gain points equally. Cards with `opposingCandidateIds` apply **inverted** scores to those candidates. Every candidate carries a full `cardBreakdown[]` array for per-card transparency.

**Balanced Shuffle:** `src/utils/shuffle.ts → balancedShuffle`
Cards are ordered by a greedy coverage scheduler. At each step it picks the card whose candidates are most underrepresented, ensuring fair exposure at any stopping point. Order is **seeded per day** for determinism — do not hardcode or randomize card order.

---

## Key Components

| Component | Path | Notes |
|---|---|---|
| `Podium` | `components/survey/Podium.tsx` | Top-3 candidates, party-colored bars, tie-aware heights |
| `SwipeCard` | `components/survey/` | Horizontal swipe + 5-button bar (no vertical swipe) |
| `Tutorial overlay` | `components/survey/` | Swipe tutorial, shows once (`hasSeenSwipeTutorial`) |
| `CandidateBreakdown` | `app/survey/candidate-breakdown.tsx` | Card-by-card score rows, tappable → description modal |
| `AssistantChat` | `components/assistant/` | Streaming chat with markdown display |

---

## Chatbot & Backend

**Setup doc:** `CHATBOT_SETUP.md`

The assistant uses a **local-first proxy** — the app calls a self-hosted backend (not OpenAI directly). The backend URL is set via `EXPO_PUBLIC_CHAT_API_URL` in `.env`.

Key services:
- `services/chatbot.ts` — Comprendre / Parler mode requests
- `services/debate.ts` — Débattre mode (15 KB of Socratic turn logic)
- `services/suggestions.ts` — follow-up suggestion generation

The Gemini API key (`GEMINI_API_KEY`) is used **server-side only**, never exposed to the client.

---

## i18n

**Setup:** `src/i18n/index.ts` + `src/i18n/locales/fr/`

- **Only French (`fr`)** is currently supported — do not add hardcoded UI strings.
- All user-visible text must use `t('key')` from `react-i18next`.
- Locale files are split by screen/feature under `locales/fr/` (10 namespace files).
- The `i18n` instance is initialized in `src/i18n/index.ts` and imported once in the root layout.

---

## Testing

**Runner:** Jest (`jest.config.js`)
**Command:** `npm test && npm run lint`

| Suite | Location | Covers |
|---|---|---|
| Unit tests | `tests/unit/` | `crash-reporting`, `data-export`, `input-sanitizer`, `network`, `rate-limiter` |
| Contract tests | `tests/contract/` | API contract validation |
| Snapshot/component | `specs/` (155 files) | Component-level specs |

Tests use standard Jest + React Native Testing Library. When adding new services, add a corresponding test in `tests/unit/`.

---

## Data Pipeline (`data_pipeline/`)

The pipeline transforms raw source documents into `src/data/elections/paris-2026/positions.json`.

**Workflow:**
```
rag_sources_by_vass/
  sources.jsonl         ← source metadata (candidate, URL, dates)
  text_clean/*.json     ← extracted text per document
        ↓
  [LLM: classify + synthesize per (candidateId, themeId)]
        ↓
src/data/elections/paris-2026/positions.json   ← app-ready output
```

**Manual / semi-manual files** (do not overwrite with pipeline output):
`candidates.json`, `themes.json`, `civic-facts.json`, `election.json`, `logistics.json`

**Notes:**
- `sources.jsonl` contains duplicate/error rows and a `Test` record — filter these out.
- If a candidate has no material for a theme, no position entry is created (sparse is correct).

---

## Guardrails & Known Constraints

- **Do not re-add `SurveyQuestion` / `SurveyOption` types** — removed intentionally in `021-data-restructuring`.
- **David Belliard is excluded** from `candidates.json` and has no proposals in the dataset. Do not add him back without a full data source.
- **Card order is day-seeded** — never randomize or hardcode card order; always use `balancedShuffle`.
- **No vertical swipe** — the survey uses horizontal swipe only (left/right). The 5-button bar handles scoring intensity.
- **No card counter** — the `X / Y` counter was intentionally removed; only colored progress dots remain.
- **Ties are valid** — results can show multiple candidates at the same rank and bar height; handle this in all results-related UI.
- **Hardcoded strings are a bug** — always use `t('key')` for any user-visible text.
- **Debate state is ephemeral** — `debateTurns` in the assistant store are NOT persisted. Do not attempt to persist them.
- **Privacy-first** — all user data stays on-device. No analytics, no user tracking, no remote data collection.

---

## What We've Built (Milestone Summary)

- **Core Architecture:** React Native + Expo + Zustand + local AI proxy
- **Frontend:** Home, Candidate grid, comparison views, survey swipe deck, onboarding, privacy consent, settings — through iterations up to spec `021-data-restructuring`
- **Survey Engine:** Direct integer scoring, balanced shuffle, results podium with tie handling, per-candidate card breakdowns
- **Chatbot:** Streaming assistant with 3 modes (Comprendre / Parler / Débattre), Socratic debate turns, follow-up suggestions
- **Data Pipeline:** RAG ingestion and LLM structuring pipeline producing `positions.json` from candidate source documents

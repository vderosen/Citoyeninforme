# Citoyen Informé – Project Context

## What We're Doing

We are building **Citoyen Informé**, a city-agnostic civic app using Expo and React Native. The current MVP focuses exclusively on the **Paris 2026 municipal election**.

The fundamental principle of the app is **neutral, source-grounded information** without editorial bias or voting recommendations. All data is structured, heavily sourced, and loaded locally on the device to respect privacy.

---

## What is the End Goal

The end goal is to provide citizens with tools for election learning and critical thinking about political programs. The app includes:

1. **Discover Flow:** Context, key logistics, and shortcuts.
2. **Candidate Exploration & Comparison:** Side-by-side theme comparisons and structured candidate profiles.
3. **Civic Survey (Cartes Swipe):** A deterministic questionnaire where users compare their preferences to candidates' actual positions, resulting in a weighted match and contradiction analysis.
4. **Assistant IA:** A local-first proxy AI that can:
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
| Deployment | Railway (Backend Proxy) |

---

## Screen Map & Routes

All tab screens live under `src/app/(tabs)/`. Additional screens are stacked on top.

| Route | File | Description |
|---|---|---|
| `/` (Home) | `(tabs)/index.tsx` | Entry dashboard: election overview, shortcuts |
| `/candidates` | `(tabs)/candidates.tsx` | Candidate grid + comparison selector; deep dives into per-candidate profiles |
| `/cards` | `(tabs)/cards.tsx` | Cartes Swipe (survey card deck) |
| `/matches` | `(tabs)/matches.tsx` | Results podium + candidate breakdown |
| `/assistant` | `(tabs)/assistant.tsx` | Assistant IA (Comprendre / Parler / Débattre modes) |
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
| `election.json` | Static | Manual (includes themes, civic facts, logistics, metadata) |
| `proposals.json` | Generated | Pipeline (`data_pipeline/proposals/proposals.json`) |

`election.json` and `candidates.json` provide the structural backbone. `proposals.json` provides the actual policy cards.

### Data Loader (`src/data/loader.ts`)

The loader parses the JSON files and produces a hydrated `ElectionDataset` object. Key responsibilities:
- Groups proposals by `card_id` from `proposals.json` to create **Statement Cards**.
- Resolves candidate short-name aliases (e.g. `"Dati"` → `"rachida-dati"`).
- Handles "VS" cards where `opposingCandidateIds` receive inverted scores.
- Produces **~131 unique `StatementCard` objects** across candidates.

### Data Schema (`src/data/schema.ts`)

Core TypeScript types: `Election`, `Candidate`, `Theme`, `Position`, `StatementCard`, `CivicFact`, `ElectionLogistics`, `ElectionDataset`.

---

## State Management (Zustand Stores)

All stores are in `src/stores/`. Persisted stores use AsyncStorage on native and localStorage on web.

### `app` (key: `app-state`)
Persisted. Tracks app lifecycle flags.
- `hasCompletedOnboarding` — drives the onboarding gate
- `hasSeenSwipeTutorial` — shows/hides the swipe tutorial overlay
- `privacyConsentVersion` / `consentTimestamp` — GDPR

### `election` (no persistence)
In-memory only. Loaded once on app start via `loader.ts`.
- `candidates`, `themes`, `positions`, `statementCards`, `civicFacts`, `logistics`

### `survey` (key: `survey-state`)
Persisted. Drives the entire survey flow.
- `status`: `idle | civic-context | questionnaire-active | computing | completed`
- `answers`: `Record<card_id, optionId>` — all card votes
- `profile`: computed `UserProfile` with per-candidate scores and `cardBreakdown[]`

### `assistant` (key: `assistant-state`)
Partially persisted.
- `mode`: `comprendre | parler | débattre`
- `selectedCandidateId`: active candidate for Parler mode
- `conversations`: `Record<conversationKey, ChatMessage[]>`

---

## Survey & Scoring Engine

**File:** `src/services/matching.ts`

Scoring uses a direct integer point system per swipe:
- Strong agree → **+2**; Agree → **+1**; Neutral → **0**; Disagree → **−1**; Strong disagree → **−2**

**Balanced Shuffle:** `src/utils/shuffle.ts → balancedShuffle`
Cards are ordered by a greedy coverage scheduler to ensure fair exposure. Order is **seeded per day** for determinism.

---

## Key Components

| Component | Path | Notes |
|---|---|---|
| `Podium` | `components/survey/Podium.tsx` | Top-3 candidates, party-colored bars, tie-aware heights |
| `SwipeStack` | `components/survey/SwipeStack.tsx` | 3D stack effect for survey cards |
| `SwipeCard` | `components/survey/` | Horizontal swipe + 5-button bar (no vertical swipe) |
| `Tutorial overlay` | `components/survey/` | Swipe tutorial, shows once (`hasSeenSwipeTutorial`) |
| `CandidateBreakdown` | `app/survey/candidate-breakdown.tsx` | Card-by-card score rows, tappable → description modal |
| `AssistantChat` | `components/assistant/` | Streaming chat with markdown display |

---

## Assistant IA & Backend

**Setup doc:** `CHATBOT_SETUP.md`

The assistant uses a **local-first proxy** hosted on Railway. The backend URL is set via `EXPO_PUBLIC_CHAT_API_URL` in `.env`.

**RAG Assistant (v2):**
- Replaced prompt-stuffing with **embedding-based retrieval**.
- Improved context window management for more accurate answers.
- `services/chatbot.ts` handles Comprendre / Parler mode.
- `services/debate.ts` handles Débattre mode (Socratic logic).

---

## i18n

**Setup:** `src/i18n/index.ts` + `src/i18n/locales/fr/`

- **Only French (`fr`)** is currently supported.
- All user-visible text must use `t('key')` from `react-i18next`.

---

## Testing

**Runner:** Jest (`jest.config.js`)
**Command:** `npm test && npm run lint`

Tests use standard Jest + React Native Testing Library. Component-level specs are located in `specs/`.

---

## Data Pipeline (`data_pipeline/`)

The pipeline transforms raw source documents into structured data used by the app.

**Workflow:**
1. **Ingest:** Collect source metadata in `sources_input.csv`.
2. **Extract:** Clean text from PDFs/HTML.
3. **Structure & Normalize:** LLM-based categorization of proposals.
4. **Deploy:** Results are saved to `data_pipeline/proposals/proposals.json` for app loading.

---

## Guardrails & Known Constraints

- **App Branding:** Finalized as **Citoyen Informé**. No "Lucide" references.
- **Survey Naming:** Use **Cartes Swipe** or **Questionnaire** in UI.
- **Card order is day-seeded** — never randomize or hardcode card order; always use `balancedShuffle`.
- **No vertical swipe** — the survey uses horizontal swipe only.
- **Ties are valid** — results can show multiple candidates at the same rank; handled by `Podium`.
- **Privacy-first** — all user data stays on-device.

---

## What We've Built (Milestone Summary)

- **Branding & UI:** Finalized branding as "Citoyen Informé". Implemented 3D stack effect and 5-button scoring for Cartes Swipe.
- **Architecture:** Full React Native + Expo + Zustand stack. Switched to `proposals.json` sourced from pipeline.
- **Assistant IA:** Deployed v2 RAG system on Railway using embedding retrieval for efficient and accurate answers.
- **Survey Engine:** Direct integer scoring, balanced shuffle, and tie-aware podium display.
- **Data Pipeline:** End-to-end pipeline from PDF ingestion to structured JSON output.

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
4. **Assistant IA:** A single civic chat powered by a local-first proxy AI. It answers questions neutrally from the election dataset and can optionally keep candidate-focused conversation context.

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
| Chat backend | Gemini `gemini-2.0-flash` via native Gemini API |
| Embeddings | Gemini `gemini-embedding-001` (768 dims) — index build + live queries |
| Deployment | Railway (Backend Proxy at `https://lucide-rag-production.up.railway.app`) |

---

## Screen Map & Routes

All tab screens live under `src/app/(tabs)/`. Additional screens are stacked on top.

| Route | File | Description |
|---|---|---|
| `/` (Home) | `(tabs)/index.tsx` | Entry dashboard: election overview, shortcuts |
| `/candidates` | `(tabs)/candidates.tsx` | Candidate grid + comparison selector; deep dives into per-candidate profiles |
| `/cards` | `(tabs)/cards.tsx` | Cartes Swipe (survey card deck) |
| `/matches` | `(tabs)/matches.tsx` | Results podium + candidate breakdown |
| `/assistant` | `(tabs)/assistant.tsx` | Assistant IA (single chat experience) |
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
- `selectedCandidateId`: optional candidate context for chat
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

The assistant uses a **RAG proxy** hosted on Railway (`https://lucide-rag-production.up.railway.app`). The backend URL is set via `EXPO_PUBLIC_LLM_PROXY_URL` in `.env`. Authentication uses `EXPO_PUBLIC_LLM_PROXY_API_KEY` (shared secret).

**RAG System (v2 — current):**
- `scripts/rag-proxy.js` — the deployed Railway server. On each request it:
  1. Embeds the user query with Gemini `gemini-embedding-001`
  2. Runs cosine similarity search over `data_pipeline/rag_index.json`
  3. Auto-detects candidate names in the query text (surname + first name variants) and applies a candidate filter
  4. Builds a grounded system prompt from retrieved chunks
  5. Streams the response from Gemini `gemini-2.0-flash` via SSE
- `data_pipeline/rag_index.json` — pre-built vector index: **707 chunks**, 6 candidates, **768-dim Gemini embeddings**, ~20 MB.
- `scripts/build-rag-index.js` — rebuilds the index from `data_pipeline/rag_sources_by_vass/text_clean/`. Uses `GEMINI_API_KEY`.
- `scripts/test-rag-coverage.js` — validates retrieval for all 6 candidates (18/18 tests pass, cosine sim 0.56–0.83).
- `src/services/chatbot.ts` — app-side XHR client. Sends messages + optional `candidate_filter` to `/api/chat`, streams SSE back to UI.

**RAG Index Coverage:**
| Candidate | Chunks |
|---|---|
| Bournazel | 118 |
| Chikirou | 201 |
| Dati | 63 |
| Gregoire | 181 |
| Knafo | 118 |
| Mariani | 26 |

**Rate limits (Railway proxy):** 5 req/min · 25 req/hour · 50 req/day per IP.

---

## i18n

**Setup:** `src/i18n/index.ts` + `src/i18n/locales/fr/`

- **Only French (`fr`)** is currently supported.
- All user-visible text must use `t('key')` from `react-i18next`.

---

## Testing

### Unit Tests
**Runner:** Jest (`jest.config.js`)
**Command:** `npm test && npm run lint`
Tests use standard Jest + React Native Testing Library. Component-level specs are located in `docs/specs/`.

### E2E Tests (Detox)
**Runner:** Detox + Jest (`e2e/`)
**Tests:** `survey.test.ts`, `podium.test.ts`, `candidates.test.ts`
Covers onboarding dismissal, tab navigation, survey card swiping (via `testID`), podium rendering, and candidate carousel visibility. Uses `testID` props (`active-card`, `active-card-overlay`, `podium-container`, `podium-rank-1`, etc.) for reliable element targeting.

### Visual Debugging (iOS Simulator MCP)
**Tool:** `@mseep/ios-simulator-mcp` (configured in `.gemini/antigravity/mcp_config.json`)
**Purpose:** AI-driven visual inspection of the native iOS app — **not a test framework**. Use for ad-hoc "does this look right?" checks, layout debugging, and exploratory testing during development.
**Capabilities:** Screenshots (`xcrun simctl`), tap/swipe/accessibility tree (`idb`).
**Setup notes:**
- The MCP server PATH must include the `idb` venv: `mcp-server-simulator-ios-idb/venv/bin`
- Metro must start with `--localhost` flag: `npx expo start --ios --localhost`

### Testing Stack Summary
| Tool | Purpose | CI-ready |
|---|---|---|
| Jest | Unit/component tests | ✅ |
| Detox | Automated native E2E regression | ✅ |
| iOS Simulator MCP | Ad-hoc AI visual debugging | ❌ (interactive only) |

Detox and MCP overlap on flow coverage but serve different purposes: Detox gives deterministic pass/fail assertions; MCP gives the AI agent visual eyes into the simulator for aesthetic and layout inspection.

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
- **Assistant IA:** Deployed v2 RAG system on Railway using Gemini embedding retrieval. All 6 candidates verified working.
- **Survey Engine:** Direct integer scoring, balanced shuffle, and tie-aware podium display.
- **Data Pipeline:** End-to-end pipeline from PDF ingestion to structured JSON output.

---

## App Store Submission Status

**App Store Connect:**
- App name: **Citoyen Informé**
- Bundle ID: `com.vderosen.citoyeninforme`
- SKU: `CITOYENINFORME2026`
- Primary language: French
- Platform: iOS
- EAS project ID: `d5072e7c-4376-4909-a6dc-9e87cfeef99a`

## Update Strategy (Always Apply This First)

- Use **OTA** (`eas update`) for JS/content/UI fixes (for example fonts, colors, text, logic in `src/**`).
- Use **Store release** (`eas build` + `eas submit`) for native/binary changes (`app.json`, native dependencies, `ios/**`, `android/**` when tracked).
- Full playbook and examples: `docs/release-strategy.md`.

**EAS Build config (`eas.json`):**
- Production profile: iOS App Bundle (AAB), auto-increment build number
- `appleId` and `ascAppId` must be filled in `eas.json` before running `eas submit`

**Build commands:**
```bash
eas build --platform ios --profile production   # creates IPA (~15 min)
eas submit --platform ios --latest              # submits to App Store Connect
```

**Website URLs (all live and verified):**
| Purpose | URL |
|---|---|
| Privacy Policy | `https://citoyeninforme.fr/politique-de-confidentialite` |
| Support | `https://citoyeninforme.fr/support` |
| Terms of Use | `https://citoyeninforme.fr/conditions-utilisation` |

---

## Recent Changes (2026-02-24)

- **RAG embedding fix:** Switched `build-rag-index.js` from OpenAI `text-embedding-3-small` (1536 dims) to Gemini `gemini-embedding-001` (768 dims) to match the live proxy. Rebuilt `rag_index.json`. Added candidate name auto-detection in `rag-proxy.js`. All 6 candidates now answer reliably.
- **Pre-deployment i18n fixes:** Replaced hardcoded French strings in `cards.tsx` and `matches.tsx` with `t()` calls. Added 4 new keys to `survey.json` and `accessedOn` to `common.json`.
- **Asset fix:** Renamed `assets/images/Splash-icon.png` → `splash-icon.png` (case-sensitive Linux EAS build fix).
- **Store cleanup:** Removed dead `importanceWeights: {}` from `survey.ts` initial state.
- **Config fixes:** Updated `supportUrl` and `tosUrl` in `app.json` from `lucide.app` to `citoyeninforme.fr`. Fixed privacy policy fallback URL in `settings.tsx`.
- **Social Sharing:** Added `react-native-view-shot` to generate an image from the podium results on the client device so that it could be shared directly via `expo-sharing`.

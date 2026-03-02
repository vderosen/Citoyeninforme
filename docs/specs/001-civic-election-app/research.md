# Research: Lucide Civic Election App MVP

**Branch**: `001-civic-election-app` | **Date**: 2026-02-13
**Purpose**: Resolve all technology decisions for the implementation plan.

## Decision 1: Application Framework

**Decision**: Expo (managed workflow) with SDK 54+, React Native 0.80+

**Rationale**: The user specified React Native for cross-platform mobile. Expo managed workflow is the recommended approach for new React Native projects in 2026. It provides:
- Zero native configuration — faster development cycle
- EAS Build/Submit for streamlined iOS/Android deployment
- Access to all Expo modules (SQLite, Localization, etc.) out of the box
- Supported exit path to bare workflow if custom native modules are ever needed

This app has no custom native module requirements (LLM calls are HTTP-based, storage uses Expo-supported libraries), making managed workflow the ideal choice.

**Alternatives considered**:
- Bare React Native: More control over native code, but adds iOS/Android build complexity with no benefit for this use case.
- Flutter: Strong cross-platform alternative, but the user explicitly chose React Native.

---

## Decision 2: Navigation

**Decision**: Expo Router (file-based routing)

**Rationale**: Expo Router is built on React Navigation and adds file-based routing conventions. For this app with a simple page structure (Home, Learn, Survey flow, chatbot overlay), file-based routing reduces boilerplate and provides automatic deep linking. The route structure maps directly to the app's 2-page + survey-flow architecture.

**Alternatives considered**:
- React Navigation 7 (manual): More flexible for complex navigation patterns, but this app's navigation is simple enough that file-based routing is cleaner.

---

## Decision 3: State Management

**Decision**: Zustand v5

**Rationale**: Zustand provides minimal-boilerplate state management with built-in persist middleware (integrates with MMKV for local storage). Three stores cover the app's needs:
1. `election` store — loaded election dataset (candidates, themes, positions)
2. `survey` store — survey answers, results, user profile (persisted to MMKV)
3. `chatbot` store — conversation history, active context, selected candidate

Zustand's ~3KB bundle size aligns with the <50MB constraint. No provider wrapping needed, which simplifies the component tree.

**Alternatives considered**:
- Redux Toolkit: Significant boilerplate for a small app. The survey matching algorithm is a pure function — it doesn't need Redux middleware.
- React Context: Would work for simple cases, but survey state persistence and chatbot conversation management benefit from Zustand's persist middleware.
- Jotai: Atom-based approach is elegant but less intuitive for this team's needs.

---

## Decision 4: Local Storage

**Decision**: react-native-mmkv for key-value data, expo-sqlite for structured election data

**Rationale**: Two storage layers serve different needs:
- **MMKV** (key-value): 20x faster than AsyncStorage. Stores user survey results, preference profiles, app settings. Synchronous API simplifies code. Integrates directly with Zustand's persist middleware.
- **expo-sqlite** (relational): Stores the election dataset after initial load from bundled JSON. Enables efficient queries like "all positions for candidate X on theme Y" without loading the entire dataset into memory.

The bundled JSON files in `src/data/elections/paris-2026/` are loaded into SQLite on first launch, providing instant offline access.

**Alternatives considered**:
- AsyncStorage alone: Deprecated by the React Native community, 6MB limit on Android, significantly slower.
- WatermelonDB: Powerful lazy-loading ORM, but overkill for a read-heavy dataset of ~100 records.
- SQLite alone: Would work, but MMKV is faster for simple key-value operations (user profile, settings).

---

## Decision 5: Internationalization

**Decision**: react-i18next with react-native-localize

**Rationale**: react-i18next is the most widely adopted i18n solution for React Native (2M+ weekly downloads). It provides:
- Proper French pluralization rules out of the box
- Namespace-based translation files (one per feature: home, learn, survey, chatbot)
- react-native-localize detects device locale for automatic language selection
- TypeScript support for translation keys

French is the default and fallback language. Translation files live in `src/i18n/locales/fr/`. The i18n hooks are in place for future languages, but only French ships for MVP per Principle VI.

**Alternatives considered**:
- i18n-js: Simpler but fewer features (no namespace support, weaker TypeScript integration).
- react-intl (FormatJS): Good alternative but less popular in the React Native ecosystem.

---

## Decision 6: UI Component Library

**Decision**: gluestack-ui v3 (unstyled components) + NativeWind v4 (Tailwind for RN)

**Rationale**: This combination provides:
- **Accessibility**: gluestack-ui v3 ships with WCAG-compliant components (proper ARIA roles, focus management, screen reader support) — directly satisfying FR-020.
- **Styling**: NativeWind v4 brings Tailwind CSS utility classes to React Native. Compiles ahead-of-time with no runtime style overhead. Enables rapid UI iteration.
- **Customization**: Unstyled base components can be themed to match Lucide's brand identity without fighting a design system (unlike Material Design in react-native-paper).

**Alternatives considered**:
- React Native Paper: Material Design may not match the neutral, civic tone of the app. Would require significant customization to not look like a Google product.
- Tamagui: Excellent performance compiler, but smaller community and steeper learning curve.
- Custom components only: Would require building accessibility from scratch, significantly increasing development time.

---

## Decision 7: LLM Integration

**Decision**: OpenAI GPT API via a lightweight backend proxy

**Rationale**: The chatbot requires an LLM for single chat (general, candidate, and comparison). Key design:
- **Provider**: OpenAI GPT (GPT-4o or latest available model) — strong conversational French, excellent instruction-following for system prompts (critical for neutrality constraints), supports long context for the election dataset. The user has free OpenAI credits, making this the pragmatic choice.
- **Architecture**: API keys must NOT be embedded in the mobile app. A minimal backend proxy (serverless function on Cloudflare Workers or AWS Lambda) forwards requests to the OpenAI API. The proxy adds the API key, enforces rate limiting, and strips sensitive headers.
- **Streaming**: Server-Sent Events for real-time token streaming to the mobile client — essential for chatbot UX. OpenAI's streaming API returns SSE-compatible chunks natively.
- **Context management**: Each chatbot context has a dedicated system prompt. The election dataset relevant context is injected into the system prompt. Conversation history is maintained per-session in the Zustand chatbot store.

**Alternatives considered**:
- Anthropic Claude: Strong instruction-following and French. Viable alternative if switching providers later, since the proxy architecture is provider-agnostic.
- Direct API calls from mobile: Security risk — API key would be extractable from the app binary. The proxy is a necessary architectural addition.
- On-device LLM: Not feasible for the quality required by the Socratic assistant personalization flow. On-device models lack the reasoning capability needed.

**Note on Principle VI**: The backend proxy is the one server-side component. It is stateless, has no database, and serves only as an API key vault + rate limiter. This is the simplest architecture that satisfies the security constraint.

---

## Decision 8: Testing Strategy

**Decision**: Jest (unit) + React Native Testing Library (component) + Detox (E2E)

**Rationale**:
- **Jest**: Included with Expo. Tests the deterministic matching algorithm (FR-009), contradiction detection, dataset validation, and all pure business logic.
- **React Native Testing Library (RNTL)**: Tests components the way users interact with them — by accessibility labels and roles, not implementation details. This directly validates WCAG compliance.
- **Detox**: The standard E2E framework for React Native. Tests critical user journeys: browsing candidates, completing the survey, using the chatbot.

**Priority testing areas** (per spec success criteria):
1. Survey matching determinism (SC-003): Property-based tests with fixed inputs → expected outputs
2. Chatbot source citation (SC-004): Integration tests against mock LLM responses
3. Dataset swappability (SC-008): Load a different election dataset and verify all features still work

**Alternatives considered**:
- Maestro: Simpler E2E setup, but Detox is more mature for React Native and offers better CI integration.
- Playwright/Appium: Cross-platform but not optimized for React Native internals.

---

## Decision 9: Election Data Architecture

**Decision**: Bundled JSON files, loaded into SQLite on first launch, with OTA update capability

**Rationale**: The election dataset is relatively small (~100 structured records across all entities). The architecture:
1. **Bundled**: JSON files ship inside the app binary at `src/data/elections/paris-2026/`. Ensures instant availability on first launch, no network dependency.
2. **SQLite cache**: On first launch, JSON is parsed, validated against the TypeScript schema, and inserted into SQLite. Subsequent reads use SQLite for efficient queries.
3. **OTA updates**: The app checks a remote endpoint for dataset version changes. Updated JSON can be downloaded and re-loaded into SQLite without an app store update. This handles the edge case of mid-deployment dataset updates (spec Edge Case 2).
4. **Swappability**: For a new election, replace the JSON files in `src/data/elections/{city-year}/` and update `election.json` with city-specific configuration. Zero code changes (FR-018, SC-008).

**Alternatives considered**:
- Remote API only: Requires network on first launch, breaks offline-first requirement.
- Bundled JSON only (no SQLite): Works for small datasets, but SQLite makes theme filtering and candidate comparison queries more efficient.
- CMS/headless API: Over-engineering for a curated dataset maintained by the development team.

---

## Decision 10: Accessibility Approach

**Decision**: gluestack-ui built-in accessibility + manual screen reader testing + eslint-plugin-jsx-a11y

**Rationale**: WCAG 2.1 AA compliance (FR-020) is achieved through:
1. **Component library**: gluestack-ui v3 provides accessible components with proper roles, labels, and focus management out of the box.
2. **Linting**: eslint-plugin-jsx-a11y catches missing accessibility props at dev time.
3. **Manual testing**: Automated tools catch ~30% of accessibility issues. VoiceOver (iOS) and TalkBack (Android) testing is required for the remaining 70%.
4. **Design guidelines**: Minimum 4.5:1 contrast ratio for text, 44x44pt minimum touch targets, visible focus indicators.

**Alternatives considered**:
- axe-core automated scanning: Useful supplement but insufficient alone — manual testing is mandatory for WCAG 2.1 AA.
- Building accessibility from scratch (without gluestack-ui): Feasible but significantly more work to get right.

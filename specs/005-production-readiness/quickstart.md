# Quickstart: Production Readiness

**Branch**: `005-production-readiness` | **Date**: 2026-02-15

## Prerequisites

- Node.js 18+ (for LLM proxy)
- Expo CLI (`npx expo`)
- EAS CLI (`npm install -g eas-cli`) — needed for build configuration
- Apple Developer Account ($99/year) — for iOS builds
- Google Play Developer Account ($25 one-time) — for Android builds
- Sentry account (free tier) — for crash reporting

## New Dependencies

```bash
# Mobile app — new packages
npx expo install @sentry/react-native @react-native-community/netinfo expo-file-system expo-sharing expo-constants

# No new proxy dependencies — rate limiting and auth are implemented in-place
```

## Environment Variables

Add to `.env`:

```bash
# Existing
OPENAI_API_KEY=sk-...
EXPO_PUBLIC_LLM_PROXY_URL=http://localhost:3001

# New — proxy authentication
LLM_PROXY_API_KEY=your-shared-secret-key-here
EXPO_PUBLIC_LLM_PROXY_API_KEY=your-shared-secret-key-here

# New — Sentry crash reporting
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# New — privacy policy
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://lucide.app/privacy-policy
```

## Development Workflow

### 1. Install dependencies

```bash
npm install
```

### 2. Start the proxy (with auth enabled)

```bash
npm run chat:proxy
```

The proxy now requires an `X-API-Key` header on `/api/chat` requests. In development, set `LLM_PROXY_API_KEY` in `.env` and the app reads it via `EXPO_PUBLIC_LLM_PROXY_API_KEY`.

### 3. Run the app

```bash
npx expo start
```

### 4. Run tests

```bash
npm test
```

New test files:
- `tests/unit/data-export.test.ts` — data export/delete logic
- `tests/unit/input-sanitizer.test.ts` — prompt injection sanitization
- `tests/unit/network.test.ts` — network status detection
- `tests/unit/rate-limiter.test.ts` — proxy rate limiter
- `tests/contract/proxy-api.test.ts` — proxy API contract

### 5. EAS Build (after setup)

```bash
# Development build (internal testing)
eas build --profile development --platform all

# Preview build (beta testers)
eas build --profile preview --platform all

# Production build (store submission)
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Key Implementation Order

1. **App store setup** (app.json + eas.json) — foundation for everything
2. **Privacy consent screen** — legal prerequisite, gates all features
3. **Error boundary + crash reporting** — catch issues during development of remaining features
4. **LLM proxy hardening** — security before any public testing
5. **Settings screen** — houses consent info, data controls, crash reporting toggle
6. **Data export & deletion** — GDPR compliance
7. **Offline mode** — UX improvement
8. **Prompt injection guardrails** — defense hardening
9. **Store metadata** — final submission preparation

## Files Changed Summary

| Category | New Files | Modified Files |
|----------|-----------|---------------|
| Screens | `privacy-consent.tsx`, `settings.tsx` | `_layout.tsx`, `(tabs)/_layout.tsx`, `assistant.tsx` |
| Components | `ErrorBoundary.tsx`, `OfflineBanner.tsx`, `PrivacySection.tsx`, `DataSection.tsx`, `AboutSection.tsx` | — |
| Services | `crash-reporting.ts`, `data-export.ts`, `network.ts` | `chatbot.ts` |
| Stores | — | `app.ts` |
| Hooks | `useNetworkStatus.ts` | — |
| Prompts | — | `comprendre-mode.ts`, `parler-mode.ts`, `debattre-mode.ts` |
| Utils | `input-sanitizer.ts` | — |
| i18n | `privacy.json`, `settings.json`, `errors.json` | — |
| Proxy | — | `llm-proxy.js` |
| Config | `eas.json` | `app.json` |
| Tests | 5 new test files | — |

# Quickstart: Frontend Redesign

**Feature**: 002-frontend-redesign
**Date**: 2026-02-15

## Prerequisites

- Node.js 18+ installed
- Expo CLI: `npx expo` (no global install needed)
- Git on branch `002-frontend-redesign`
- For native: iOS Simulator (macOS) or Android emulator with Expo Go

## Getting Started

```bash
# 1. Switch to feature branch
git checkout 002-frontend-redesign

# 2. Install dependencies (no new packages needed)
npm install

# 3. Start the development server
npm start

# 4. Run on platform
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm run web       # Web browser
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest tests/component/CandidateGallery.test.tsx

# Run tests in watch mode
npx jest --watch
```

## LLM Proxy (for Assistant tab)

The Assistant tab requires the LLM proxy for chat responses.

```bash
# In a separate terminal
npm run chat:proxy
# Starts on http://localhost:3001
```

Ensure `EXPO_PUBLIC_LLM_PROXY_URL=http://localhost:3001` is set (default in the proxy script).

## Key File Locations

| What | Where |
|------|-------|
| Tab navigation layout | `src/app/(tabs)/_layout.tsx` |
| Home screen | `src/app/(tabs)/index.tsx` |
| Assistant screen | `src/app/(tabs)/assistant.tsx` |
| Candidates screen | `src/app/(tabs)/candidates.tsx` |
| Candidate profile | `src/app/candidate/[id].tsx` |
| Comparison view | `src/app/comparison.tsx` |
| Survey flow | `src/app/survey/` |
| Onboarding | `src/app/onboarding.tsx` |
| Stores | `src/stores/` |
| Services (unchanged) | `src/services/` |
| Election data | `src/data/elections/paris-2026/` |
| i18n translations | `src/i18n/locales/fr/` |
| Shared components | `src/components/shared/` |

## Development Workflow

1. **Screens**: Edit route files in `src/app/`. Expo Router auto-registers routes.
2. **Components**: Create in the appropriate `src/components/{feature}/` directory.
3. **Stores**: Modify stores in `src/stores/`. Test store changes with unit tests.
4. **Translations**: Add keys to `src/i18n/locales/fr/{namespace}.json`. Use `t("namespace:key")` in components.
5. **Styles**: Use NativeWind (Tailwind) utility classes via `className` prop. See `global.css` for Tailwind config.

## Architecture Decisions

- **No new dependencies**: The redesign uses existing packages. No additional npm packages are needed.
- **Services unchanged**: `matching.ts`, `contradiction.ts`, `chatbot.ts` remain as-is. Only import paths may change.
- **Data layer unchanged**: `schema.ts`, `loader.ts`, `database.*.ts`, and bundled JSON are not modified.
- **Store renames**: `chatbot.ts` → `assistant.ts` (mode names: comprendre/parler/debattre instead of learn/candidate/debate).
- **Prompt renames**: `learn-mode.ts` → `comprendre-mode.ts`, `candidate-mode.ts` → `parler-mode.ts`, `debate-mode.ts` → `debattre-mode.ts`. Content unchanged; only file names and mode identifiers.

## Validation Checklist (during development)

- [ ] All 3 tabs render and preserve state when switching
- [ ] Context bar shows election city, year, and last update on all screens
- [ ] Candidate gallery shows equal-weight cards with no ranking
- [ ] Candidate profile shows positions with source badges
- [ ] Comparison view shows equal columns for 2+ candidates
- [ ] Survey preserves progress across app restarts
- [ ] Assistant mode selector switches between all 3 modes
- [ ] Deep links pass context correctly (candidate → assistant, theme → candidates)
- [ ] Trust badges are consistent across all screens
- [ ] Empty/loading/error states display correctly
- [ ] Screen reader navigation works logically
- [ ] All tap targets are at least 44x44 points
- [ ] All text scales with system font size

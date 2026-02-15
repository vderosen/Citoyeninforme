# Quickstart: Lucide Civic Election App MVP

**Branch**: `001-civic-election-app` | **Date**: 2026-02-13

## Prerequisites

- Node.js 20+ (LTS)
- Expo CLI (`npx expo`)
- iOS Simulator (Xcode 16+) or Android Emulator (API 30+)
- Expo Go app on physical device (optional)

## Setup

```bash
# Clone and checkout feature branch
git checkout 001-civic-election-app

# Install dependencies
npx expo install

# Start development server
npx expo start
```

## Project Initialization

This project uses Expo managed workflow. Initialize with:

```bash
npx create-expo-app lucide --template tabs
```

Then install additional dependencies:

```bash
# Navigation (included with Expo)
npx expo install expo-router expo-linking expo-constants

# State management
npm install zustand

# Local storage
npm install react-native-mmkv
npx expo install expo-sqlite

# Internationalization
npm install react-i18next i18next react-native-localize

# UI framework
npm install @gluestack-ui/themed nativewind
npm install --save-dev tailwindcss

# Testing
npm install --save-dev @testing-library/react-native detox
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/_layout.tsx` | Root layout — providers, i18n init, theme |
| `src/app/index.tsx` | Home screen |
| `src/app/learn.tsx` | Learn screen — candidate browser |
| `src/data/schema.ts` | TypeScript types for election dataset |
| `src/data/loader.ts` | Load + validate bundled JSON into SQLite |
| `src/services/matching.ts` | Deterministic survey matching algorithm |
| `src/services/chatbot.ts` | LLM API integration |
| `src/stores/survey.ts` | Zustand store for survey state |
| `src/stores/election.ts` | Zustand store for election data |

## Running Tests

```bash
# Unit tests
npx jest

# Component tests
npx jest --testPathPattern=component

# E2E tests (requires built app)
npx detox build --configuration ios.sim.debug
npx detox test --configuration ios.sim.debug
```

## Adding a New Election

To deploy for a different city/election:

1. Create a new directory: `src/data/elections/{city-year}/`
2. Populate with JSON files matching the schema in `contracts/election-data.ts`:
   - `election.json` — city, year, voting rules, timeline
   - `candidates.json` — all candidates
   - `themes.json` — policy themes (consistent taxonomy)
   - `positions.json` — candidate positions with sources
   - `survey-questions.json` — questionnaire mapped to themes
   - `civic-facts.json` — educational facts for civic module
   - `logistics.json` — dates, eligibility, locations
3. Update the data loader to point to the new directory
4. Add translations for the new language in `src/i18n/locales/{lang}/`
5. Build and deploy — zero code changes required

## Architecture Overview

```text
┌─────────────────────────────────────────┐
│               Mobile App                │
│  ┌──────────┐  ┌──────┐  ┌──────────┐  │
│  │   Home   │  │Learn │  │  Survey   │  │
│  │  Screen  │  │Screen│  │   Flow    │  │
│  └──────────┘  └──────┘  └──────────┘  │
│  ┌──────────────────────────────────┐   │
│  │      Floating Chatbot Overlay    │   │
│  │  Learn Mode│Candidate│Debate     │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌─────────┐  ┌────────┐  ┌─────────┐  │
│  │ Zustand  │  │  MMKV  │  │ SQLite  │  │
│  │ Stores   │  │  (KV)  │  │ (Data)  │  │
│  └─────────┘  └────────┘  └─────────┘  │
│                    │                    │
│  ┌─────────────────┴────────────────┐   │
│  │     Bundled Election JSON        │   │
│  │     src/data/elections/          │   │
│  └──────────────────────────────────┘   │
└────────────────────┬────────────────────┘
                     │ HTTPS (chatbot only)
              ┌──────┴──────┐
              │  LLM Proxy  │
              │ (stateless) │
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │ OpenAI API  │
              └─────────────┘
```

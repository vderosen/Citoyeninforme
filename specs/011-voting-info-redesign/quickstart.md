# Quickstart: Voting Info Cards Redesign

**Feature**: 011-voting-info-redesign
**Date**: 2026-02-19

## Prerequisites

- Node.js and npm installed
- Expo CLI (`npx expo`)
- Project dependencies installed (`npm install`)

## What This Feature Changes

**1 file rewritten**: `src/components/home/VotingInfoCard.tsx`
**1 file updated**: `src/i18n/locales/fr/home.json` (new translation keys)

No new dependencies. No data changes. No schema changes.

## Development Workflow

### 1. Start the dev server

```bash
npx expo start
```

Open the app on a simulator/device or web browser. Navigate to the Home (Accueil) tab and scroll to the voting info cards section.

### 2. Edit the component

The entire redesign happens in one file:

```
src/components/home/VotingInfoCard.tsx
```

The component receives `ElectionLogistics` as a prop and renders 3 sections:
- **Key Dates**: Vertical timeline with grouped dates and temporal indicators
- **Eligibility**: Numbered sub-cards
- **Voting Methods**: Icon sub-cards with requirements

### 3. Add translation keys

Add voting method display titles to `src/i18n/locales/fr/home.json`:

```json
{
  "votingMethod": {
    "inPerson": "En personne",
    "proxy": "Procuration",
    "mail": "Par correspondance",
    "other": "Autre"
  }
}
```

### 4. Test

- **Visual check**: Verify all 3 card sections render correctly on the Home screen
- **Date grouping**: The Paris 2026 dataset has 6 `keyDates` entries — verify they render as 4 timeline entries (March 15 and March 22 each group 2 entries)
- **Temporal indicators**: Change device date to test past/next/future styles
- **Narrow screen**: Test at 320px width to verify no overflow
- **Empty data**: Test with empty arrays to verify sections don't render

### 5. Verify

```bash
npm test && npm run lint
```

## Key Files Reference

| File | Role |
|------|------|
| `src/components/home/VotingInfoCard.tsx` | Component to rewrite |
| `src/i18n/locales/fr/home.json` | Translation keys |
| `src/data/schema.ts` | Type definitions (read-only reference) |
| `src/data/elections/paris-2026/logistics.json` | Test data (read-only reference) |
| `src/stores/election.ts` | Zustand store (no changes) |
| `src/app/(tabs)/index.tsx` | Home screen (no changes) |

# Data Model: 009-home-redesign

**Date**: 2026-02-19
**Feature**: [spec.md](./spec.md)

## Overview

This feature is a pure UI layout change. **No data model changes are required.** All data is already available through existing Zustand stores and i18n keys.

## Existing Entities Used (read-only)

### Election (from `useElectionStore`)

| Field | Type | Usage in Home Redesign |
|-------|------|----------------------|
| `type` | `string` | Hero heading: election type |
| `city` | `string` | Hero heading: city name |
| `year` | `number` | Hero heading: election year |
| `lastUpdated` | `string` | Footer: "Mis a jour le..." |

### ElectionLogistics (from `useElectionStore`)

| Field | Type | Usage in Home Redesign |
|-------|------|----------------------|
| `keyDates` | `LogisticsDate[]` | Info card 1: key dates |
| `eligibility` | `EligibilityStep[]` | Info card 2: eligibility conditions |
| `votingMethods` | `VotingMethod[]` | Info card 3: voting methods |

### SurveyStatus (from `useSurveyStore`)

| Value | CTA Behavior |
|-------|-------------|
| `"not_started"` | Standard button "Tester mes idees" below hero |
| `"civic_context"` | Standard button "Reprendre le sondage" below hero |
| `"questionnaire"` | Standard button "Reprendre le sondage" below hero |
| `"completed"` | Discreet text link "Refaire le sondage" at bottom |
| `"computing"` | N/A (transient state, not visible on home) |
| `"results_ready"` | N/A (transient state, not visible on home) |

## State Transitions

No new state transitions. The `handleStartSurvey` callback in `index.tsx` already handles routing based on survey status:
- `not_started` → `/survey/intro`
- `civic_context` / `questionnaire` → `/survey/questions`
- `completed` → `reset()` + `/survey/intro`

## New i18n Keys

None required. All keys already exist in `src/i18n/locales/fr/home.json` and `src/i18n/locales/fr/common.json`.

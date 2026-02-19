# Implementation Plan: Redesign de la page d'accueil (Home Screen)

**Branch**: `009-home-redesign` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-home-redesign/spec.md`

## Summary

Redesign the home screen layout to be more welcoming, informative, and better hierarchized. The changes are purely presentational — refactoring 4 existing components with no new data, no new dependencies, and no new i18n keys. Key changes: add a hero section with election context, deprioritize the survey button (standard CTA when active, discreet link when completed), display voting info by default in separate cards (no accordion), and simplify the trust block to a discreet banner without defensive badges.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, @expo/vector-icons 15.0.3 (Ionicons), react-native-reanimated 4.1.1
**Storage**: N/A (no storage changes — reads from existing Zustand stores)
**Testing**: Manual verification via Expo dev client (no automated UI tests for home screen currently)
**Target Platform**: iOS + Android + Web (Expo managed workflow)
**Project Type**: Mobile (React Native / Expo)
**Performance Goals**: 60 fps scroll, no layout shift on load
**Constraints**: No new npm dependencies. Use existing i18n keys. Respect design system palette (civic-navy, warm-gray, accent-coral, warm-white) and fonts (SpaceGrotesk, Inter).
**Scale/Scope**: 4 files modified, 0 new files, ~200 lines changed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicable | Status | Notes |
|-----------|-----------|--------|-------|
| I. Neutrality & Non-Prescription | Yes | PASS | Trust banner explicitly states neutrality. No candidate is mentioned or favored on the home screen. |
| II. Source-Grounded Truth | Yes | PASS | Trust banner states "informations sourcees et verifiables". Removing non_documente/incertain badges from home is justified — they remain in candidate detail pages where per-data qualification matters. |
| III. City-Agnostic Architecture | Yes | PASS | Hero uses election data from generic `Election` type (type, city, year). No Paris-specific hardcoding. The i18n key `heroHeading` uses `{{type}} · {{city}} {{year}}` template. |
| IV. Critical Thinking Over Persuasion | Marginal | PASS | Home screen is informational, not interactive. Survey CTA encourages exploration ("Tester mes idees") not persuasion. |
| V. Structured Data as Single Source of Truth | Yes | PASS | All data comes from `useElectionStore` (single dataset). No shadow copies. |
| VI. Simplicity & MVP Discipline | Yes | PASS | Pure layout refactor of existing components. No new features, tabs, or screens added. |
| VII. Privacy & Trust | N/A | PASS | No user data is collected or exposed by this change. |

**Pre-design gate**: PASS (all principles satisfied)

### Post-Design Re-check

No design changes affect the constitution check. The refactored components use the same data sources and render the same information in a different layout. The trust banner change (removing defensive badges) actually better aligns with Principle I (Neutrality) by presenting confidence without creating doubt.

**Post-design gate**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/009-home-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: data model (no changes)
├── quickstart.md        # Phase 1: quickstart guide
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (tabs)/
│       └── index.tsx              # Home screen — reorder sections, add HeroBlock
├── components/
│   └── home/
│       ├── HeroBlock.tsx          # Existing — reuse as hero (minor format tweak)
│       ├── PrimaryShortcuts.tsx   # Refactor — standard CTA button (no hero card)
│       ├── VotingInfoCard.tsx     # Refactor — 3 separate cards, no accordion
│       └── TrustCard.tsx          # Refactor — discreet banner, no badges
├── stores/
│   ├── election.ts                # Read-only (Election, ElectionLogistics)
│   └── survey.ts                  # Read-only (SurveyStatus)
└── i18n/
    └── locales/
        └── fr/
            ├── home.json          # Existing keys (no changes)
            └── common.json        # Existing keys (no changes)
```

**Structure Decision**: Expo managed mobile app. All changes are in `src/` under the existing component and page structure. No new directories or files needed.

## Complexity Tracking

> No constitution violations. Table left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

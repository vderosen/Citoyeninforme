# Implementation Plan: Neighborhood Pulse Visual Redesign

**Branch**: `004-neighborhood-pulse-redesign` | **Date**: 2026-02-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-neighborhood-pulse-redesign/spec.md`

## Summary

Transform the app's visual identity from generic Tailwind defaults to the "Neighborhood Pulse" civic design language. This is a visual-only redesign with no data model or business logic changes. The implementation centers on: (1) a centralized design token system in `tailwind.config.js` with navy/coral/warm palette, (2) Space Grotesk + Inter custom fonts via `@expo-google-fonts`, (3) a reusable district-block clip shape component, (4) screen-by-screen color and typography migration across all 43 TSX files, (5) motion layer using the already-installed `react-native-reanimated` v4, and (6) accessibility polish with WCAG AA contrast compliance and a persistent FR/EN language switcher.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: NativeWind 4.1.23, Tailwind CSS 3.4.17, react-native-reanimated 4.1.1, expo-font 14.0.11, @expo-google-fonts/space-grotesk (NEW), @expo-google-fonts/inter (NEW), react-native-svg (Expo built-in)
**Storage**: N/A — no storage changes
**Testing**: Jest 29.7 + React Native Testing Library 13.2 (unit), manual visual review (design), ESLint (lint)
**Target Platform**: iOS, Android, Web (Expo managed workflow)
**Project Type**: Mobile (single project, Expo Router file-based routing)
**Performance Goals**: 60fps animations, <100ms touch feedback, font loading before first paint
**Constraints**: No dark mode (light only), coral text only for large text (WCAG AA), reduce-motion preference respected
**Scale/Scope**: 12 screens, 31 components, 7 i18n namespaces — all require visual updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| I. Neutrality & Non-Prescription | PASS | Visual redesign only. No changes to candidate ordering, matching algorithm, or content presentation logic. All candidates continue to receive equal visual treatment (same card design, same typography, same layout). Party color bars come from existing dataset — no editorial color choices. |
| II. Source-Grounded Truth | PASS | No data layer changes. All source references and citations remain intact. |
| III. City-Agnostic Architecture | PASS | Design tokens are generic — no Paris-specific visual elements. Color palette, typography, and shapes work for any city/election. The hero tagline uses i18n strings (already city-parameterized). |
| IV. Critical Thinking Over Persuasion | PASS | Visual changes do not affect reasoning features. Survey matching, debate mode, and contradiction detection are untouched. |
| V. Structured Data as Single Source of Truth | PASS | No data changes. Design tokens are configuration, not election data. |
| VI. Simplicity & MVP Discipline | PASS | Keeps existing 3-tab structure (Accueil, Assistant, Candidats). No new screens or features added. The language switcher (FR/EN header toggle) is the only new UI element — it surfaces existing i18n infrastructure, not a new feature. |
| VII. Privacy & Trust | PASS | No data handling changes. No new analytics, storage, or network requests. |

**Result**: All 7 principles pass. No violations to justify.

**Post-Phase 1 Re-check**: Design artifacts (research.md, data-model.md, contracts/) confirmed — all visual-only. No constitution violations introduced by technical decisions.

## Project Structure

### Documentation (this feature)

```text
specs/004-neighborhood-pulse-redesign/
├── plan.md                          # This file
├── research.md                      # Phase 0: Technical research (8 decisions)
├── data-model.md                    # Phase 1: Design token schema (visual-only, no DB changes)
├── quickstart.md                    # Phase 1: Setup guide
├── contracts/
│   └── design-tokens.md            # Phase 1: Color, typography, shape token definitions
├── checklists/
│   └── requirements.md             # Spec quality validation (16/16 pass)
└── tasks.md                         # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/                              # Expo Router screens (12 files — ALL modified)
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Tab bar: navy/coral colors, block indicator
│   │   ├── index.tsx                # Home: hero parallax, updated layout
│   │   ├── assistant.tsx            # Chat: updated message bubbles, colors
│   │   └── candidates.tsx           # Gallery: party color bars, clip shape
│   ├── _layout.tsx                  # Root: font loading, header colors
│   ├── candidate/[id].tsx           # Profile: editorial layout
│   ├── comparison.tsx               # Comparison: updated colors
│   ├── onboarding.tsx               # Onboarding: new design language
│   └── survey/
│       ├── _layout.tsx              # Survey stack: updated navigation
│       ├── intro.tsx                # Intro: display font, civic styling
│       ├── questions.tsx            # Questions: block progress, coral selection
│       └── results.tsx              # Results: editorial bar charts
├── components/                       # UI components (31 existing + 4 NEW)
│   ├── home/                        # Home screen (6 files — ALL modified)
│   │   ├── HeroBlock.tsx            # Navy bg, coral accent, display font
│   │   ├── PrimaryShortcuts.tsx     # District-block shape, tint variations
│   │   ├── ThemeFeed.tsx            # Editorial cards, topic color bars
│   │   ├── TrustCard.tsx            # → Trust footer on warm-gray
│   │   ├── VotingInfoCard.tsx       # Updated colors
│   │   └── ResumeCard.tsx           # Updated colors
│   ├── candidates/                  # Candidate components (5 files — ALL modified)
│   ├── survey/                      # Survey components (7 files — ALL modified)
│   ├── assistant/                   # Chat components (5 files — ALL modified)
│   ├── shared/                      # Shared components (6 files — ALL modified)
│   ├── shell/
│   │   └── LanguageSwitcher.tsx     # NEW — FR/EN header toggle
│   └── ui/
│       ├── DistrictBlockCard.tsx    # NEW — Reusable clip shape wrapper
│       ├── SteppedDivider.tsx       # NEW — Section divider component
│       ├── SourceReference.tsx      # Modified colors
│       └── ThemeFilter.tsx          # Modified colors
├── hooks/                           # NEW directory
│   ├── useMotionPreference.ts       # NEW — Reduce motion hook
│   └── useStaggeredEntrance.ts      # NEW — Staggered animation utility
├── i18n/
│   └── locales/fr/
│       ├── home.json                # Updated hero tagline strings
│       └── common.json              # Language switcher labels
├── data/                            # UNCHANGED
├── services/                        # UNCHANGED
├── stores/                          # UNCHANGED
└── utils/                           # UNCHANGED

# Config files (root)
tailwind.config.js                    # Design tokens: colors, fonts, shadows
```

**Structure Decision**: Single mobile project (Expo managed). No new directories except `src/hooks/` for animation utilities and 4 new component files. The existing modular component structure maps directly to the spec's screen-by-screen approach.

## Complexity Tracking

> No constitution violations. No complexity justifications needed.

*Table intentionally left empty — all design decisions align with existing architecture and constitution principles.*

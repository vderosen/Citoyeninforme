# Implementation Plan: UI Polish — Navigation & Information Hierarchy

**Branch**: `003-ui-polish` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ui-polish/spec.md`

## Summary

Eliminate the redundant persistent election-info banner (ContextBar), introduce per-screen headers with proper navigation, add icons to the tab bar, and streamline the home screen's visual hierarchy. Pure UI/layout refactoring — no data model, business logic, or API changes.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, NativeWind 4.1.23, @gluestack-ui/themed 1.1.73, @expo/vector-icons 15.0.3, react-native-safe-area-context 5.6.0
**Storage**: N/A (no storage changes)
**Testing**: Jest 29.7 + @testing-library/react-native 13.2
**Target Platform**: iOS, Android, Web (Expo managed)
**Project Type**: Mobile (Expo)
**Performance Goals**: 60 fps navigation transitions, no perceptible layout shift
**Constraints**: Must not modify core logic (data loading, survey matching, chatbot, candidate data). Onboarding screen out of scope.
**Scale/Scope**: ~12 files modified across layouts, screens, and components. No new screens created.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Neutrality & Non-Prescription | PASS | No change to candidate ordering, presentation weight, or algorithmic behavior. Tab icons and headers are content-neutral. |
| II. Source-Grounded Truth | PASS | No change to data display, source references, or factual claims. |
| III. City-Agnostic Architecture | PASS | Election context (city, type, year) remains driven by the dataset — no hardcoded Paris references introduced. The compact hero heading still uses `election.city`, `election.type`, `election.year` from the store. |
| IV. Critical Thinking Over Persuasion | PASS | No change to interactive features (survey, chatbot, debate). |
| V. Structured Data as Single Source of Truth | PASS | No data sources added, removed, or duplicated. |
| VI. Simplicity & MVP Discipline | PASS | 3-tab structure preserved. No new tabs or screens added. Changes reduce visual clutter (simpler, not more complex). |
| VII. Privacy & Trust | PASS | No change to data storage, analytics, or user profile handling. |

**Gate result**: ALL PASS. No violations. Complexity Tracking not needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-polish/
├── plan.md              # This file
├── research.md          # Phase 0 output (icon choices, header patterns)
├── data-model.md        # N/A — no data model changes
├── quickstart.md        # Phase 1 output (setup & verification steps)
├── contracts/           # N/A — no API changes
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── _layout.tsx                 # MODIFY: Remove ContextBar, enable headers on pushed screens
│   ├── (tabs)/
│   │   ├── _layout.tsx             # MODIFY: Add tab icons, enable per-tab headers
│   │   ├── index.tsx               # MODIFY: Remove top SafeAreaView edge (header handles it)
│   │   ├── assistant.tsx           # MINOR: Adjust top padding (header now present)
│   │   └── candidates.tsx          # MINOR: Adjust top padding (header now present)
│   ├── candidate/[id].tsx          # MODIFY: Header now provided by Stack, remove manual SafeArea top
│   ├── comparison.tsx              # MODIFY: Remove manual back button, use Stack header
│   ├── survey/
│   │   ├── _layout.tsx             # MODIFY: Enable headers with contextual titles
│   │   ├── intro.tsx               # MODIFY: Remove manual back button (header handles it)
│   │   ├── questions.tsx           # MINOR: Adjust top padding
│   │   └── results.tsx             # MINOR: Adjust top padding
│   └── onboarding.tsx              # NO CHANGE (out of scope)
├── components/
│   ├── shell/
│   │   └── ContextBar.tsx          # DELETE: No longer used
│   ├── home/
│   │   ├── HeroBlock.tsx           # MODIFY: Compact single-line heading, remove big city text
│   │   └── ThemeFeed.tsx           # MODIFY: Add section title above horizontal list
│   │   └── PrimaryShortcuts.tsx    # MODIFY: Differentiate primary CTA from secondary actions
│   └── ...                         # Other components: NO CHANGE
├── i18n/locales/fr/
│   ├── common.json                 # MODIFY: Add header titles for pushed screens
│   └── home.json                   # MODIFY: Add theme section title, update hero text keys
└── ...                             # stores/, services/, data/: NO CHANGE
```

**Structure Decision**: Existing mobile structure preserved. No new directories. One file deleted (ContextBar.tsx), ~12 files modified.

## Complexity Tracking

> No violations found. This section is empty.

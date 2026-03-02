# Implementation Plan: UI Cleanup & UX Improvements

**Branch**: `007-ui-cleanup-ux` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-ui-cleanup-ux/spec.md`

## Summary

Streamline the app's UI across all three tabs and the candidate detail page. Remove the non-functional language switcher, reduce the home page to 3 essential elements (survey CTA, VotingInfoCard, TrustCard), refactor the assistant store to support isolated conversations keyed by context and candidate, redesign the candidates gallery with uniform cards and an inline compare selection flow, and simplify the candidate detail page to a single "assistant" CTA.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, @gluestack-ui/themed 1.1.73, react-native-reanimated 4.1.1
**Storage**: AsyncStorage (native) / localStorage (web) via Zustand persist middleware; key `"assistant-state"` for chat data
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS, Android, Web (Expo managed workflow)
**Project Type**: Mobile (cross-platform)
**Performance Goals**: 60 fps scroll on candidate gallery, instant context/candidate switching in assistant
**Constraints**: Offline-capable (all data local), conversation history must persist across app restarts
**Scale/Scope**: 7 candidates, 8 themes, 3 assistant contexts, ~50 screens/components affected by changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Neutrality & Non-Prescription | PASS | Candidate card ordering remains randomized daily (dailySeed shuffle). No editorial ranking introduced. Compare selection is user-driven. |
| II. Source-Grounded Truth | PASS | Candidate detail page retains all source references. No factual content removed. |
| III. City-Agnostic Architecture | PASS | No Paris-specific logic introduced. Conversation keys use generic candidateId, not city-specific data. |
| IV. Critical Thinking Over Persuasion | PASS | "assistant" CTA preserved as the single action from candidate detail, maintaining the debate-first approach. |
| V. Structured Data as Single Source of Truth | PASS | No new data sources introduced. All candidate/theme data still from single election dataset. |
| VI. Simplicity & MVP Discipline | PASS | This feature explicitly reduces clutter. Three-tab structure preserved. No new tabs or screens added. Compare flow reuses existing comparison page. |
| VII. Privacy & Trust | PASS | Conversation data remains local-only (AsyncStorage/localStorage). No server-side storage. TrustCard preserved on home page. |

**Gate result: PASS** — All 7 principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-ui-cleanup-ux/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # MODIFY: Remove LanguageSwitcher from headers
│   │   ├── index.tsx            # MODIFY: Strip to 3 elements (survey CTA, VotingInfoCard, TrustCard)
│   │   ├── assistant.tsx        # MODIFY: Use new conversation-keyed store API
│   │   └── candidates.tsx       # MODIFY: Remove ThemeFilter, add compare context
│   ├── candidate/[id].tsx       # MODIFY: Single "assistant" CTA, remove Compare/Ask buttons
│   └── comparison.tsx           # MINOR: Accept selectedIds from candidates page navigation
│
├── components/
│   ├── shell/
│   │   └── LanguageSwitcher.tsx  # DELETE: Component removed entirely
│   ├── home/
│   │   ├── HeroBlock.tsx         # UNUSED: No longer imported (keep file for now)
│   │   ├── PrimaryShortcuts.tsx  # MODIFY: Reduce to single survey CTA component
│   │   ├── ResumeCard.tsx        # UNUSED: No longer imported
│   │   ├── ThemeFeed.tsx         # UNUSED: No longer imported
│   │   ├── VotingInfoCard.tsx    # KEEP: No changes
│   │   └── TrustCard.tsx         # KEEP: No changes
│   ├── assistant/
│   │   ├── AssistantContextControls.tsx      # MODIFY: Redesign for clarity
│   │   ├── CandidateSelector.tsx # KEEP: Minor adjustments
│   │   ├── ChatArea.tsx          # MODIFY: Read from getCurrentMessages()
│   │   ├── ContextPrompts.tsx    # KEEP: No changes
│   │   └── MessageBubble.tsx     # KEEP: No changes
│   └── candidates/
│       ├── ThemeFilter.tsx       # UNUSED: No longer imported from candidates page
│       ├── CandidateGallery.tsx  # MODIFY: Uniform cards, selectable compare context
│       ├── CandidateProfileCard.tsx # MODIFY: Remove Compare/Ask action buttons
│       ├── ComparisonView.tsx    # KEEP: No changes
│       └── PositionCard.tsx      # KEEP: No changes
│
├── stores/
│   └── assistant.ts             # MODIFY: Refactor to conversation-keyed state
│
├── services/
│   └── data-export.ts           # MODIFY: Export all conversations (not flat messages)
│
└── i18n/locales/fr/
    ├── home.json                # MODIFY: Remove unused keys, update survey CTA labels
    ├── assistant.json           # MODIFY: Add conversation-related labels
    └── candidates.json          # MODIFY: Add compare context labels
```

**Structure Decision**: Existing mobile project structure preserved. No new directories. Changes are modifications to existing files with 1 file deletion (LanguageSwitcher) and 3 files becoming unused (HeroBlock, ResumeCard, ThemeFeed — kept in tree but no longer imported, to be cleaned up later if desired).

## Complexity Tracking

> No violations found. Table not needed.

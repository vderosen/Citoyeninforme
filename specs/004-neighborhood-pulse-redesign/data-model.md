# Data Model: Neighborhood Pulse Visual Redesign

**Branch**: `004-neighborhood-pulse-redesign` | **Date**: 2026-02-15

## Overview

This feature is a **visual-only redesign** — no data model changes are required. The existing election dataset schema, Zustand stores, and SQLite/MMKV storage remain unchanged.

The "entities" in this feature are **design abstractions** (tokens, typography scales, shape definitions) that live in configuration files, not in data storage.

## Design Token Schema

Design tokens are defined in `tailwind.config.js` and represent the single source of truth for all visual values.

### Color Tokens

| Token Name | Hex | Role | Usage |
|------------|-----|------|-------|
| `warm-white` | #FAFAF8 | Base canvas | Screen backgrounds |
| `warm-gray` | #F0EDE8 | Surface | Cards, section backgrounds |
| `civic-navy` | #1B2A4A | Primary | Headers, navigation, primary text |
| `civic-navy-5` | #1B2A4A @ 5% | Tinted surface | Featured sections |
| `accent-coral` | #E8553A | Accent/Energy | CTAs, active states, progress |
| `accent-coral-dark` | #C23D22 | Accessible accent | Small coral text (meets AA) |
| `body-text` | #3D3D3D | Body copy | Paragraphs, descriptions |
| `caption-text` | #6B7280 | Captions | Labels, metadata, secondary info |
| `signal-green` | #16A34A (muted) | Success | Source verified badges |
| `signal-amber` | #D97706 (muted) | Warning | Uncertain indicators |
| `signal-red` | #DC2626 (muted) | Error | Error states |
| `party-fallback` | #9CA3AF | Fallback | Candidates with no party color |

### Typography Tokens

| Token | Font | Weight | Size | Role |
|-------|------|--------|------|------|
| `display-hero` | Space Grotesk | 700 Bold | 28-32px | Hero/page titles |
| `display-section` | Space Grotesk | 600 SemiBold | 20px | Section headers |
| `display-card` | Space Grotesk | 500 Medium | 16-17px | Card titles |
| `display-stat` | Space Grotesk | 700 Bold | varies | Numbers, percentages |
| `body-regular` | Inter | 400 Regular | 15-16px | Body text |
| `body-emphasis` | Inter | 500 Medium | 15-16px | Emphasized body |
| `caption` | Inter | 500 Medium | 12-13px | Labels, captions |

### Spacing Tokens

Standard Tailwind 4px grid. No custom spacing tokens needed — the existing `p-4`, `gap-3`, `mb-6` patterns are well-established.

### Shadow Tokens

| Token | Values | Usage |
|-------|--------|-------|
| `shadow-card` | 0 1px 3px rgba(27,42,74,0.08) | Default card elevation |
| `shadow-elevated` | 0 4px 12px rgba(27,42,74,0.12) | Floating elements, modals |

## Component Shape Definitions

### District-Block Shape Variants

| Variant | Clip Corner | Clip Size | Applied To |
|---------|------------|-----------|------------|
| `clip-top-right` | Top-right | ~16px diagonal | Hero cards, candidate cards |
| `clip-bottom-left` | Bottom-left | ~16px diagonal | Section headers, theme feed cards |
| `clip-none` | None | — | Regular cards (default) |

### Stepped Divider

- Height: ~4px
- Pattern: City-skyline-silhouette stepping pattern
- Color: `warm-gray` (#F0EDE8) on `warm-white` background
- Implementation: SVG `<Path>` or series of small `<Rect>` elements

## Existing Data Model (Unchanged)

The following data structures remain untouched:

- **Election dataset** (`src/data/schema.ts`): Candidates, propositions, themes, sources
- **Survey store** (`src/stores/survey.ts`): Question responses, importance weights, results
- **App store** (`src/stores/app.ts`): Onboarding state, preferences
- **Assistant store** (`src/stores/assistant.ts`): Chat history, mode selection
- **Election store** (`src/stores/election.ts`): Loaded dataset, derived computations

No new entities, no schema migrations, no storage changes.

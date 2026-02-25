# Implementation Plan: Voting Info Cards Redesign

**Branch**: `011-voting-info-redesign` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-voting-info-redesign/spec.md`

## Summary

Redesign the `VotingInfoCard` component on the Home screen, replacing three flat bullet-list cards with visually distinct, ergonomic layouts: a vertical timeline for key dates (with date grouping and past/next/future indicators), numbered sub-cards for eligibility conditions, and icon-based sub-cards for voting methods (surfacing requirements data). No data schema changes, no new screens, no new dependencies — purely a component rewrite within the existing NativeWind + Ionicons design system.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: NativeWind 4.1.23, @expo/vector-icons 15.0.3 (Ionicons), react-i18next 15.4.1
**Storage**: N/A — no storage changes; data consumed from existing Zustand `election` store
**Testing**: Manual visual testing on iOS/Android/Web; snapshot testing optional
**Target Platform**: iOS, Android, Web (Expo managed workflow)
**Project Type**: Mobile (React Native cross-platform)
**Performance Goals**: 60 fps scroll; no perceptible delay rendering cards
**Constraints**: Must work on screens as narrow as 320px; no new npm dependencies
**Scale/Scope**: 1 component file rewrite (~67 lines → ~200 lines), 1 translation file update, 0 data changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicable | Status | Notes |
|-----------|-----------|--------|-------|
| I. Neutrality & Non-Prescription | Yes | PASS | Redesign displays the same data with equal treatment for all entries. No editorial ordering or emphasis beyond chronological timeline order (which is inherent to dates). |
| II. Source-Grounded Truth | Yes | PASS | All displayed information comes from the bundled election dataset (`logistics.json`). No new content is introduced. |
| III. City-Agnostic Architecture | Yes | PASS | Component consumes generic `ElectionLogistics` schema. No Paris-specific logic. Date grouping and temporal classification work with any dataset. |
| IV. Critical Thinking Over Persuasion | N/A | PASS | No interactive or persuasive elements in this redesign. |
| V. Structured Data as Single Source of Truth | Yes | PASS | Data comes from the single election dataset via the Zustand store. Date grouping is a view transformation, not a data change. |
| VI. Simplicity & MVP Discipline | Yes | PASS | No new screens, tabs, or navigation. Rewrites one existing component within the existing `(tabs)/index.tsx` Home screen. No new dependencies. |
| VII. Privacy & Trust | N/A | PASS | No user data involved. Displays public election logistics only. |

**Gate result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/011-voting-info-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── home/
│       └── VotingInfoCard.tsx    # PRIMARY — full rewrite of this component
├── i18n/
│   └── locales/
│       └── fr/
│           └── home.json         # Add new translation keys for voting method titles
├── data/
│   ├── schema.ts                 # NO CHANGES — existing types are sufficient
│   └── elections/
│       └── paris-2026/
│           └── logistics.json    # NO CHANGES — data stays as-is
└── app/
    └── (tabs)/
        └── index.tsx             # NO CHANGES — already renders <VotingInfoCard>
```

**Structure Decision**: Single component rewrite. The `VotingInfoCard.tsx` file currently exports one component with 3 inline sections. The redesign will either keep it as one larger component with internal helper functions, or extract sub-components (`KeyDatesTimeline`, `EligibilityCards`, `VotingMethodCards`) within the same file if readability benefits. No new files needed.

## Design Details

### 1. Key Dates — Vertical Timeline

**Date grouping algorithm** (view-layer only):
1. Parse `logistics.keyDates` array
2. Group entries by `date` field (ISO string comparison)
3. For each group, merge `label` values with ` · ` separator
4. Use first entry's `description` (or merge if both are informative)
5. Sort groups chronologically

**Temporal classification** (computed at render time):
- Compare each grouped date against `new Date()` (device time)
- `past`: date < today
- `next`: first date >= today (only one entry gets this status)
- `future`: date >= today but not the first one

**Date badge formatting**:
- Parse ISO date string → format as `"D MMM YYYY"` in French locale
- Month abbreviated uppercase: `FÉV`, `MARS`, `AVR`, etc.
- Use a simple formatting helper (no date library needed — `Intl.DateTimeFormat` or manual mapping for 12 month names)

**Visual structure per timeline entry**:
```
[dot] [date badge]
  |   [label text line 1]
  |   [label text line 2...]
```

- Dot: 12px circle, absolutely positioned on the left vertical line
- Vertical line: 2px wide, `bg-civic-navy opacity-15`, runs full height of timeline
- Content area: `ml-6` (left margin to clear dot + line)

**Dot styles by status**:
- Past: solid circle, `bg-text-caption` (#6B7280)
- Next: solid circle 14px, `bg-accent-coral` (#E8553A), with 4px ring `bg-accent-coral-light`
- Future: hollow circle, `border-2 border-civic-navy`

### 2. Eligibility Conditions — Numbered Sub-Cards

**Structure per condition**:
```
┌─────────────────────────────┐
│ [circle with number]  text  │
└─────────────────────────────┘
```

- Sub-card: `bg-white rounded-lg p-3` inside parent `bg-warm-gray rounded-xl p-4`
- Number circle: 24px, `bg-civic-navy`, white text centered, `font-display-semibold text-xs`
- Layout: `flex-row items-start gap-3`
- Text: `font-body text-sm text-text-body flex-1 flex-shrink`
- Spacing between sub-cards: `gap-2`

### 3. Voting Methods — Icon Sub-Cards

**Structure per method**:
```
┌─────────────────────────────┐
│ [icon]  Title               │
│ Description text...         │
│ [info-icon]  Requirements   │
└─────────────────────────────┘
```

- Sub-card: `bg-white rounded-lg p-3`
- Header row: `flex-row items-center gap-2` — Ionicons 20px + title text
- Description: `font-body text-sm text-text-body mt-1`
- Requirements (if present): `flex-row items-start gap-1 mt-2` — info icon 14px + `font-body text-xs text-text-caption`
- Spacing between sub-cards: `gap-2`

**Icon mapping**:

| `type` | Ionicons name | Display title (i18n key) |
|--------|--------------|-------------------------|
| `in-person` | `business-outline` | `votingMethod.inPerson` → "En personne" |
| `proxy` | `people-outline` | `votingMethod.proxy` → "Procuration" |
| `mail` | `mail-outline` | `votingMethod.mail` → "Par correspondance" |
| fallback | `help-circle-outline` | `votingMethod.other` → "Autre" |

### Translation Keys to Add

In `src/i18n/locales/fr/home.json`:
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

Existing keys (`keyDates`, `eligibility`, `votingMethods`) remain unchanged.

## Complexity Tracking

No constitution violations — table not needed.

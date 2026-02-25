# Data Model: Onboarding Redesign

**Feature**: 006-onboarding-redesign
**Date**: 2026-02-15

## Entities

### OnboardingStep (static configuration, not persisted)

Represents one screen in the 5-step onboarding flow. Defined as a TypeScript type used by the pager to render each step.

| Field | Type | Description |
|-------|------|-------------|
| key | string | Unique identifier (e.g., "purpose", "neutrality", "modes", "trust", "ready") |
| index | number (0-4) | Position in the flow, used for progress display (shown as index+1 of 5) |
| component | React component | The content component to render for this step |

**Notes**: Steps are defined as a static array in the pager component. No database storage. The content of each step (title, illustration, text, CTA label) is managed by its own component via i18n keys.

### OnboardingCompletion (persisted state)

Already exists in the `app-state` Zustand store. No changes needed.

| Field | Type | Description |
|-------|------|-------------|
| hasCompletedOnboarding | boolean | `false` until user selects an entry point on step 5, then `true` |

**Storage**: AsyncStorage via Zustand persist, key `"app-state"`.
**Lifecycle**: Set to `true` once, never reset (unless user clears app data).

### EntryPointChoice (ephemeral, not persisted)

The user's selection on step 5 determines navigation but is not stored.

| Choice | Target Route | Tab |
|--------|-------------|-----|
| "Démarrer le questionnaire" | `/(tabs)/` | Accueil (home) |
| "Explorer les candidats" | `/(tabs)/candidates` | Candidats |
| "Poser une question" | `/(tabs)/assistant` | Assistant |

**Notes**: The choice is consumed immediately for routing and not persisted. If analytics tracking is added later, this could be recorded, but that is out of scope.

## State Transitions

```
App Launch
    │
    ▼
┌─────────────────────┐
│  hasCompletedOnboarding  │
│       === false      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Onboarding Step 1   │◄──── swipe right (from step 2)
│  "Comprendre..."     │────► swipe left / "Commencer" → Step 2
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Onboarding Step 2   │◄──── swipe right (from step 3)
│  "Neutre, sourcé..." │────► swipe left / "Continuer" → Step 3
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Onboarding Step 3   │◄──── swipe right (from step 4)
│  "Trois façons..."   │────► swipe left → Step 4
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Onboarding Step 4   │◄──── swipe right (from step 5)
│  "Ce que Lucide..."  │────► swipe left / "J'ai compris" → Step 5
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Onboarding Step 5   │
│  "Prêt·e ?"          │
│                       │
│  ┌─ Survey ──────┐   │────► completeOnboarding() → /(tabs)/
│  ├─ Candidates ──┤   │────► completeOnboarding() → /(tabs)/candidates
│  └─ Assistant ───┘   │────► completeOnboarding() → /(tabs)/assistant
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  hasCompletedOnboarding  │
│       === true       │
│  (never shows again) │
└─────────────────────┘
```

## Relationships

- `OnboardingStep` → rendered by `OnboardingPager` as a FlatList item
- `OnboardingCompletion` → read by root layout navigation guard (`_layout.tsx`)
- `OnboardingCompletion` → written by Step 5 entry point handlers
- `EntryPointChoice` → consumed by `router.replace()` for initial tab selection

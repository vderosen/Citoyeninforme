# Quickstart: Onboarding Redesign

**Feature**: 006-onboarding-redesign
**Branch**: `006-onboarding-redesign`

## Prerequisites

- Node.js 18+, npm
- Expo CLI (`npx expo`)
- Existing dependencies already installed (`npm install`)

## No New Dependencies

This feature uses only existing packages. No `npm install` of new packages is required.

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/onboarding/OnboardingPager.tsx` | Horizontal FlatList pager managing step navigation and state |
| `src/components/onboarding/OnboardingStep.tsx` | Shared layout wrapper: title, illustration, content slot, CTA, progress |
| `src/components/onboarding/StepPurpose.tsx` | Screen 1 content: app introduction |
| `src/components/onboarding/StepNeutrality.tsx` | Screen 2 content: checkmark bullet list |
| `src/components/onboarding/StepModes.tsx` | Screen 3 content: three context cards |
| `src/components/onboarding/StepTrust.tsx` | Screen 4 content: does/doesn't check-X list |
| `src/components/onboarding/StepReady.tsx` | Screen 5 content: branching CTAs |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/onboarding.tsx` | Replace entire content with `<OnboardingPager />` host |
| `src/i18n/locales/fr/onboarding.json` | Replace flat keys with step-prefixed i18n keys |

## Files Unchanged

| File | Why |
|------|-----|
| `src/stores/app.ts` | Reuse existing `completeOnboarding()` and `hasCompletedOnboarding` |
| `src/app/_layout.tsx` | Existing navigation guard handles onboarding→tabs routing |
| `src/app/(tabs)/_layout.tsx` | Tab structure unchanged |

## Development Workflow

```bash
# 1. Checkout the branch
git checkout 006-onboarding-redesign

# 2. Start the dev server
npx expo start

# 3. Test on device/simulator
# Clear app data or use a fresh simulator to trigger onboarding

# 4. Run tests
npm test

# 5. Run lint
npm run lint
```

## Testing the Flow

To re-trigger onboarding after testing:
1. Clear AsyncStorage (or uninstall/reinstall the app)
2. The `hasCompletedOnboarding` flag in `app-state` must be `false`

## Key Architecture Decisions

- **FlatList pager** (not react-native-pager-view): Zero new dependencies, native pagination built in
- **Shared layout + separate content components**: DRY structure, isolated content per step
- **Placeholder icons** (not custom SVG): Unblocks development; illustrations can be swapped later
- **i18n dot-notation keys**: `step1.title`, `step2.bullet1`, etc. — organized by step

# Quickstart: Neighborhood Pulse Visual Redesign

**Branch**: `004-neighborhood-pulse-redesign` | **Date**: 2026-02-15

## Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- Existing project cloned and dependencies installed

## Setup

```bash
# Switch to feature branch
git checkout 004-neighborhood-pulse-redesign

# Install new font packages
npx expo install @expo-google-fonts/space-grotesk @expo-google-fonts/inter

# Start development server
npx expo start
```

## Key Files to Modify

### Phase A — Foundation (Design Tokens + Fonts)

| File | Change |
|------|--------|
| `tailwind.config.js` | Add colors, fontFamily, boxShadow tokens |
| `src/app/_layout.tsx` | Add `useFonts()` for Space Grotesk + Inter |
| `global.css` | Add `@layer` rules for typography utilities (if needed) |

### Phase B — Color + Shape Migration

| File | Change |
|------|--------|
| `src/app/_layout.tsx` | Update header colors to civic-navy |
| `src/app/(tabs)/_layout.tsx` | Update tab bar colors + active indicator |
| `src/components/ui/DistrictBlockCard.tsx` | NEW — Reusable clip shape wrapper |
| `src/components/ui/SteppedDivider.tsx` | NEW — Section divider component |
| All 31 component files | Replace Tailwind default classes with design tokens |

### Phase C — Home Screen Redesign

| File | Change |
|------|--------|
| `src/components/home/HeroBlock.tsx` | Navy bg, coral accent, display font |
| `src/components/home/PrimaryShortcuts.tsx` | District-block shape, tint variations |
| `src/components/home/ThemeFeed.tsx` | Editorial cards, topic color bars |
| `src/components/home/TrustCard.tsx` | → Trust footer on warm-gray |
| `src/i18n/locales/fr/home.json` | Update strings for new hero tagline |

### Phase D — Screen-by-Screen Polish

| File | Change |
|------|--------|
| `src/components/candidates/CandidateGallery.tsx` | Party color bars, clip shape |
| `src/components/candidates/CandidateProfileCard.tsx` | Editorial layout |
| `src/components/survey/ProgressBar.tsx` | Block-based progress |
| `src/components/survey/QuestionCard.tsx` | Display font, coral selection |
| `src/components/survey/AlignmentRanking.tsx` | Editorial bar charts |
| `src/app/survey/results.tsx` | Result screen styling |

### Phase E — Motion Layer

| File | Change |
|------|--------|
| `src/hooks/useMotionPreference.ts` | NEW — Reduce motion hook |
| `src/hooks/useStaggeredEntrance.ts` | NEW — Staggered animation hook |
| All list components | Add entering animations |
| `src/app/(tabs)/index.tsx` | Hero parallax scroll |
| All interactive elements | Scale press feedback |

### Phase F — Accessibility + i18n Polish

| File | Change |
|------|--------|
| `src/components/shell/LanguageSwitcher.tsx` | NEW — FR/EN toggle |
| `src/app/(tabs)/_layout.tsx` | Add language switcher to header |
| All focusable elements | Coral focus outline styles |

## Development Workflow

1. Start with `tailwind.config.js` — this is the single source of truth
2. Load fonts in `_layout.tsx` before any visual changes
3. Migrate colors screen-by-screen (home → candidates → survey → assistant)
4. Add motion last — it's polish, not structure
5. Test accessibility at each phase (contrast, touch targets, screen reader)

## Testing Checklist

- [ ] Fonts load correctly (no flash of system font)
- [ ] All screens use design token colors (no hardcoded hex)
- [ ] District-block clip renders on all platforms (iOS, Android, web)
- [ ] Staggered animations respect reduce-motion preference
- [ ] Coral text only used at ≥18pt bold (WCAG AA compliance)
- [ ] Touch targets ≥48px on all interactive elements
- [ ] Layout doesn't break at 200% text scale
- [ ] Language switcher visible from all screens

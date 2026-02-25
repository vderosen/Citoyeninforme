# Quickstart: 009-home-redesign

**Date**: 2026-02-19
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Prerequisites

- Branch `009-home-redesign` checked out
- `npm install` completed (no new dependencies)
- Expo dev server running (`npx expo start`)

## Files to Modify (4 files)

| File | Change |
|------|--------|
| `src/app/(tabs)/index.tsx` | Reorder sections, add HeroBlock, conditional survey button placement |
| `src/components/home/PrimaryShortcuts.tsx` | Refactor from hero card to standard CTA button |
| `src/components/home/VotingInfoCard.tsx` | Remove accordion, render 3 separate cards with icons |
| `src/components/home/TrustCard.tsx` | Replace card+badges with discreet banner |

## No New Files Needed

All changes are refactors of existing components. No new files, no new dependencies, no new i18n keys.

## Implementation Order

1. **TrustCard** — simplest change, independent of others
2. **VotingInfoCard** — remove accordion, add card layout
3. **PrimaryShortcuts** — refactor to standard button
4. **index.tsx** — wire everything together: add HeroBlock, reorder sections, add conditional survey link

## Verification

After implementation, verify on the Expo dev client:
1. Hero shows "Elections municipales · Paris 2026" + tagline
2. Survey button (not_started) appears as standard button below hero
3. Trust banner is discreet (no title, no badges)
4. Three voting info cards visible without interaction
5. Toggle survey store to "completed" — survey button moves to discreet link at bottom
6. Scroll order matches: Hero → CTA → Trust → Info cards → Retake link → Footer

# Quickstart: UI Polish — Navigation & Information Hierarchy

**Feature**: 003-ui-polish | **Date**: 2026-02-15

## Prerequisites

- Node.js 18+ installed
- Expo CLI (`npx expo`)
- Project dependencies installed (`npm install`)
- No new dependencies required — `@expo/vector-icons` is already in `package.json`

## Setup

```bash
git checkout 003-ui-polish
npm install   # ensure dependencies are current
```

## Development

```bash
npx expo start
```

Press `w` for web, `i` for iOS simulator, `a` for Android emulator.

## Verification Checklist

After implementation, verify these manually on at least one platform:

### 1. ContextBar Removed
- [ ] No election info banner at the top of any screen
- [ ] Home screen shows election info exactly once (in the hero area)

### 2. Tab Bar Icons
- [ ] All 3 tabs show icons above labels
- [ ] Active tab: filled icon + blue tint
- [ ] Inactive tabs: outline icon + gray tint
- [ ] Icons: home, chatbubble, people (Ionicons)

### 3. Tab Headers
- [ ] Home tab header shows "Lucide" (or app name)
- [ ] Assistant tab header shows "Assistant"
- [ ] Candidats tab header shows "Candidats"

### 4. Pushed Screen Headers
- [ ] Candidate detail: header with candidate name + back arrow
- [ ] Comparison: header with "Comparaison" + back arrow
- [ ] Survey intro: header with survey title + back arrow
- [ ] Survey questions: header with question title + back arrow
- [ ] Survey results: header with results title + back arrow
- [ ] All back arrows navigate to the previous screen

### 5. Home Screen Hierarchy
- [ ] Hero area: compact single-line heading (election type + city + year)
- [ ] Primary CTA (survey) is visually larger/more prominent
- [ ] Secondary actions (candidates, ask question) are side-by-side, smaller
- [ ] Theme section has a visible "Explorer par thème" title
- [ ] "Last updated" date appears as footnote at scroll bottom (or removed)

### 6. No Regressions
- [ ] All existing content still visible and functional
- [ ] Navigation between all screens works
- [ ] Survey flow completes without errors
- [ ] Chat/assistant functions normally
- [ ] Candidate gallery and profiles load correctly

## Testing

```bash
npm test         # unit tests
npm run lint     # linting
```

## Key Files Changed

| File | Change Type |
|------|-------------|
| `src/app/_layout.tsx` | Modified (remove ContextBar, configure Stack headers) |
| `src/app/(tabs)/_layout.tsx` | Modified (add icons, enable tab headers) |
| `src/app/(tabs)/index.tsx` | Modified (adjust SafeAreaView edges) |
| `src/app/(tabs)/assistant.tsx` | Modified (adjust padding) |
| `src/app/(tabs)/candidates.tsx` | Modified (adjust padding) |
| `src/app/candidate/[id].tsx` | Modified (use Stack header) |
| `src/app/comparison.tsx` | Modified (remove manual back button, use header) |
| `src/app/survey/_layout.tsx` | Modified (enable headers) |
| `src/app/survey/intro.tsx` | Modified (remove manual back button) |
| `src/components/shell/ContextBar.tsx` | Deleted |
| `src/components/home/HeroBlock.tsx` | Modified (compact heading) |
| `src/components/home/PrimaryShortcuts.tsx` | Modified (CTA hierarchy) |
| `src/components/home/ThemeFeed.tsx` | Modified (add section title) |
| `src/i18n/locales/fr/common.json` | Modified (add header titles) |
| `src/i18n/locales/fr/home.json` | Modified (add theme section title) |

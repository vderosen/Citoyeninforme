# Quickstart: UI Cleanup & UX Improvements

**Feature**: 007-ui-cleanup-ux | **Date**: 2026-02-19

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npx expo`)
- iOS Simulator, Android Emulator, or web browser

## Setup

```bash
# 1. Switch to the feature branch
git checkout 007-ui-cleanup-ux

# 2. Install dependencies (no new packages required)
npm install

# 3. Start the dev server
npx expo start
```

## What Changed — Quick Reference

### 1. Language Switcher Removed
- **Deleted**: `src/components/shell/LanguageSwitcher.tsx`
- **Modified**: `src/app/(tabs)/_layout.tsx` — removed all LanguageSwitcher imports and headerRight references
- **Verify**: Open any tab — no FR/EN toggle in the header

### 2. Home Page Simplified
- **Modified**: `src/app/(tabs)/index.tsx` — renders only SurveyCTA + VotingInfoCard + TrustCard
- **Modified**: `src/components/home/PrimaryShortcuts.tsx` — reduced to survey-only CTA
- **Unused**: HeroBlock, ResumeCard, ThemeFeed (files kept, no longer imported)
- **Verify**: Open the Home tab — should show 3 elements only

### 3. Assistant Conversations Isolated
- **Modified**: `src/stores/assistant.ts` — `messages: ChatMessage[]` → `conversations: Record<string, ChatMessage[]>`
- **Modified**: `src/app/(tabs)/assistant.tsx` — uses `getCurrentMessages()` instead of `state.messages`
- **Modified**: `src/components/assistant/ChatArea.tsx` — reads from new API
- **Modified**: `src/services/data-export.ts` — exports all conversations
- **Verify**:
  1. Send a message in "Comprendre" mode
  2. Switch to "Parler" with a candidate — different (empty) conversation
  3. Switch back to "Comprendre" — original message still there
  4. Close and reopen app — all conversations persist

### 4. Candidates Gallery Redesigned
- **Modified**: `src/app/(tabs)/candidates.tsx` — removed ThemeFilter, added compare mode state
- **Modified**: `src/components/candidates/CandidateGallery.tsx` — uniform cards, selectable mode
- **Verify**:
  1. Open Candidates tab — no theme filter toolbar, all cards same height
  2. Tap "Comparer" FAB — cards become selectable
  3. Select 2+ candidates, tap confirm — navigates to comparison page

### 5. Candidate Detail Streamlined
- **Modified**: `src/app/candidate/[id].tsx` or `src/components/candidates/CandidateProfileCard.tsx`
- **Verify**: Open any candidate — only "Debattre" button visible, no "Comparer" or "Poser une question"

## Key Files

| File | Role |
|------|------|
| `src/stores/assistant.ts` | Conversation state management (most complex change) |
| `src/app/(tabs)/index.tsx` | Home page layout |
| `src/app/(tabs)/candidates.tsx` | Candidates gallery + compare mode |
| `src/app/(tabs)/_layout.tsx` | Tab layout (header cleanup) |
| `src/app/candidate/[id].tsx` | Candidate detail page |
| `src/components/candidates/CandidateGallery.tsx` | Card grid rendering |
| `src/components/home/PrimaryShortcuts.tsx` | Survey CTA |

## Testing

```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Manual test checklist:
# □ Home: only 3 elements visible
# □ Home: survey CTA label adapts to survey status
# □ Assistant: conversations isolated per mode
# □ Assistant: conversations isolated per candidate in "parler" mode
# □ Assistant: conversations persist after app restart
# □ Candidates: no theme filter toolbar
# □ Candidates: all cards uniform height
# □ Candidates: compare mode works (select 2-4, navigate to comparison)
# □ Candidate detail: only "Debattre" button
# □ Candidate detail: "Debattre" opens correct isolated conversation
# □ No language switcher visible anywhere
# □ Migration: existing chat history migrated to "comprendre" key
```

## Migration Notes

**Assistant store migration (v0 → v1)**:
- Existing users with chat history will have their flat `messages[]` migrated to the `"comprendre"` conversation key on first app load
- This is a best-guess migration since the original messages were not tagged by mode
- No user action required — migration is automatic and transparent

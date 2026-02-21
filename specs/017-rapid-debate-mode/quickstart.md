# Quickstart: Rapid Debate Mode

**Feature**: 017-rapid-debate-mode
**Branch**: `017-rapid-debate-mode`

## Prerequisites

- Node.js 18+, npm
- Expo CLI (`npx expo`)
- Running LLM proxy server (see `EXPO_PUBLIC_LLM_PROXY_URL`)

## Setup

```bash
git checkout 017-rapid-debate-mode
npm install    # No new dependencies expected
npx expo start # Start dev server
```

## What Changes

### Modified Files

| File | Change |
|------|--------|
| `src/stores/assistant.ts` | Add debate state fields (`debateTurns`, `isDebateActive`, `isGeneratingTurn`, `debateStartThemeId`) and actions (`startDebate`, `selectDebateOption`, `addDebateTurn`, `endDebate`, `resetDebate`). Exclude debate fields from persistence. |
| `src/app/(tabs)/assistant.tsx` | Conditionally render `DebateArea` instead of `ChatArea` when mode is `"debattre"`. Wire up debate actions. |
| `src/services/prompts/debattre-mode.ts` | Add `buildDebateTurnPrompt()` function that instructs JSON-structured output. Keep existing `buildDebateModePrompt()` as fallback. |
| `src/i18n/locales/fr/assistant.json` | Add debate-specific translation keys (theme grid title, loading text, conclusion labels, button labels). |

### New Files

| File | Purpose |
|------|---------|
| `src/services/debate.ts` | Debate turn generation service. Sends to existing `/api/chat`, collects SSE response, parses JSON, validates structure. |
| `src/components/assistant/DebateArea.tsx` | Main debate UI container. Scrollable turn history + current options or theme grid or conclusion. |
| `src/components/assistant/DebateTurnCard.tsx` | Renders a single debate turn: AI statement bubble + options (if current) or selected option (if past). |
| `src/components/assistant/DebateOptionButton.tsx` | Single option button using PressableScale. Handles selected/unselected/disabled states. |
| `src/components/assistant/DebateConclusionCard.tsx` | Conclusion summary: themes explored, key insight, candidate proximity entries. |
| `src/components/assistant/DebateThemeGrid.tsx` | 2x4 grid of theme cards for no-survey debate start. |

### Not Changed

- `src/components/assistant/ChatArea.tsx` — untouched, still used for "comprendre" and "parler"
- `src/components/assistant/ModeSelector.tsx` — already supports "debattre" mode
- `src/services/chatbot.ts` — existing streaming service, not modified (debate service is separate)
- Backend proxy — no changes needed

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│ assistant.tsx                                │
│                                             │
│  ModeSelector (existing)                    │
│  ├── mode=comprendre → ChatArea (existing)  │
│  ├── mode=parler     → ChatArea (existing)  │
│  └── mode=debattre   → DebateArea (NEW)     │
│                                             │
│  DebateArea                                 │
│  ├── !isDebateActive && !hasProfile         │
│  │   → DebateThemeGrid                      │
│  ├── !isDebateActive && hasProfile          │
│  │   → auto-start (generate first turn)     │
│  ├── isDebateActive                         │
│  │   ├── FlatList of DebateTurnCards        │
│  │   ├── isGeneratingTurn → loading         │
│  │   └── "Terminer" button                  │
│  └── isConclusion                           │
│      └── DebateConclusionCard               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ debate.ts (service)                         │
│                                             │
│  generateDebateTurn()                       │
│  ├── buildDebateTurnPrompt() (JSON format)  │
│  ├── construct message history from turns   │
│  ├── XHR POST to /api/chat (SSE)           │
│  ├── collect full response text             │
│  ├── parse JSON + validate                  │
│  └── retry once on parse failure            │
│                                             │
│  generateConclusion()                       │
│  └── same flow with conclusion instruction  │
└─────────────────────────────────────────────┘
```

## Testing

```bash
npm test                    # Run all tests
npm test -- --grep debate   # Run debate-specific tests
```

### Manual Testing Checklist

1. Select "Débattre" mode with survey completed → debate auto-starts
2. Select "Débattre" mode without survey → theme grid appears
3. Tap a theme → first debate turn generated
4. Tap an option → next turn generated, previous choice shown in history
5. Complete 5+ turns → "conclude" option appears
6. Tap "Terminer le débat" → conclusion generated
7. Conclusion shows themes + insight + candidate proximity (if applicable)
8. Tap "Nouveau débat" → resets to start
9. Switch to another mode and back → debate state cleared
10. Kill and reopen app → no persisted debate state

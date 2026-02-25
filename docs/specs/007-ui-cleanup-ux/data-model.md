# Data Model: UI Cleanup & UX Improvements

**Feature**: 007-ui-cleanup-ux | **Date**: 2026-02-19

## Overview

This feature modifies the assistant store's state shape to support isolated conversations. No new database tables or data sources are introduced. All other data models (Election, Candidate, Theme, Position, Survey) remain unchanged.

## Entity Changes

### 1. Conversation (NEW concept, stored in assistant store)

A conversation is an independent message thread identified by a composite key.

**Key formula**:
```
mode === "parler" ? `parler:${candidateId}` : mode
```

**Examples**:
- `"comprendre"` — single conversation for factual questions
- `"parler:david-belliard"` — conversation with candidate David Belliard
- `"parler:rachida-dati"` — conversation with candidate Rachida Dati
- `"debattre"` — single conversation for debate mode

**Attributes**:
| Field | Type | Description |
|-------|------|-------------|
| key | string | Composite key (mode or mode:candidateId) |
| messages | ChatMessage[] | Ordered list of messages in this conversation |

Each `ChatMessage` retains its existing shape (no changes):
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique ID (`msg-{timestamp}-{counter}`) |
| role | "user" \| "assistant" | Message sender |
| content | string | Message text |
| sources | SourceRef[] \| undefined | Cited sources |
| timestamp | string | ISO timestamp |

### 2. Compare Selection (NEW transient state, local to candidates page)

Transient UI state for the multi-select compare flow on the candidates page. Not persisted.

| Field | Type | Description |
|-------|------|-------------|
| compareMode | boolean | Whether compare selection is active |
| selectedForCompare | string[] | Array of selected candidate IDs |

**Constraints**:
- Minimum 2 candidates to confirm comparison
- Maximum 4 candidates selectable
- State resets when leaving the candidates page or cancelling

## State Shape Changes

### Assistant Store (BEFORE)

```typescript
interface AssistantState {
  mode: AssistantMode;
  selectedCandidateId: string | null;
  messages: ChatMessage[];           // ← Flat array, shared across all contexts
  isStreaming: boolean;
  preloadedContext: AssistantContext | null;
}
```

**Persistence (BEFORE)**:
```typescript
partialize: (state) => ({
  mode: state.mode,
  selectedCandidateId: state.selectedCandidateId,
  messages: state.messages,           // ← Single flat array persisted
})
```

### Assistant Store (AFTER)

```typescript
interface AssistantState {
  mode: AssistantMode;
  selectedCandidateId: string | null;
  conversations: Record<string, ChatMessage[]>;  // ← Keyed by composite key
  isStreaming: boolean;
  preloadedContext: AssistantContext | null;

  // Existing actions (modified)
  selectMode: (mode: AssistantMode) => void;
  selectCandidate: (candidateId: string) => void;
  clearCandidate: () => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setPreloadedContext: (context: AssistantContext) => void;
  consumePreloadedContext: () => AssistantContext | null;
  resetConversation: () => void;

  // New actions/selectors
  getConversationKey: () => string;
  getCurrentMessages: () => ChatMessage[];
}
```

**Persistence (AFTER)**:
```typescript
partialize: (state) => ({
  mode: state.mode,
  selectedCandidateId: state.selectedCandidateId,
  conversations: state.conversations,   // ← Full record persisted
})
```

**Migration strategy**:
```typescript
migrate: (persistedState: any, version: number) => {
  if (version === 0 && persistedState.messages) {
    // Move flat messages to "comprendre" conversation
    return {
      ...persistedState,
      conversations: {
        comprendre: persistedState.messages,
      },
      messages: undefined,
    };
  }
  return persistedState;
},
version: 1,
```

## Unchanged Entities

The following entities are **not modified** by this feature:

- **Election** — metadata unchanged
- **Candidate** — structure unchanged (7 candidates)
- **Theme** — structure unchanged (8 themes)
- **Position** — structure unchanged
- **SurveyQuestion / SurveyOption** — unchanged
- **CivicFact** — unchanged
- **ElectionLogistics** — unchanged
- **UserProfile** (survey results) — unchanged
- **AppState** (onboarding, consent) — unchanged
- **SurveyState** — unchanged

## Data Flow Changes

### Assistant Message Flow (BEFORE)
```
User sends message
  → addMessage({ role: "user", ... }) appends to state.messages
  → sendChatMessage(mode, state.messages, ...) sends full history to API
  → API streams response
  → updateLastAssistantMessage(chunk) updates last item in state.messages
```

### Assistant Message Flow (AFTER)
```
User sends message
  → key = getConversationKey()  // e.g., "parler:david-belliard"
  → addMessage({ role: "user", ... }) appends to state.conversations[key]
  → sendChatMessage(mode, getCurrentMessages(), ...) sends conversation-specific history
  → API streams response
  → updateLastAssistantMessage(chunk) updates last item in state.conversations[key]
```

### Compare Flow (NEW)
```
User taps "Comparer" FAB on candidates page
  → compareMode = true (local state)
  → User taps candidate cards to toggle selection
  → selectedForCompare updated (local state)
  → User taps "Voir la comparaison" (enabled when 2+ selected)
  → router.push("/comparison", { selected: selectedIds.join(",") })
  → Comparison page reads params.selected, splits by ","
  → Existing ComparisonView renders selected candidates
```

### Navigation from Candidate Detail "Debattre" (UPDATED)
```
User taps "Debattre" on candidate/[id].tsx
  → selectMode("parler")
  → selectCandidate(candidate.id)
  → router.push("/(tabs)/assistant")
  → Assistant page reads mode="parler", selectedCandidateId=candidate.id
  → key = "parler:${candidate.id}"
  → getCurrentMessages() returns conversations[key] || []
  → If empty: fresh conversation shown
  → If existing: previous messages displayed
```

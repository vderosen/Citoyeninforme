# Store Interface Contracts: Frontend Redesign

**Feature**: 002-frontend-redesign
**Date**: 2026-02-15

## AppStore (new)

**File**: `src/stores/app.ts`
**Persistence**: MMKV via zustandStorage

```typescript
interface AppState {
  // State
  hasCompletedOnboarding: boolean;
  lastActiveTab: string;

  // Actions
  completeOnboarding: () => void;
  setLastActiveTab: (tab: string) => void;
}
```

### Behavior Contract

- `completeOnboarding()`: Sets `hasCompletedOnboarding` to `true`. One-way transition. Persisted immediately.
- `setLastActiveTab(tab)`: Records the active tab route name. Called on tab change. Used to restore last tab on app relaunch.

---

## AssistantStore

**File**: `src/stores/assistant.ts`
**Persistence**: MMKV via zustandStorage (messages, context, selectedCandidateId)

```typescript
type AssistantMode = "general" | "candidate" | "assistant";

interface AssistantContext {
  type: "candidate" | "theme" | "survey_result";
  candidateId: string | null;
  themeId: string | null;
  promptText: string | null;
}

interface AssistantState {
  // State
  context: AssistantMode;
  selectedCandidateId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  preloadedContext: AssistantContext | null;

  // Actions
  setMode: (context: AssistantMode) => void;
  selectCandidate: (candidateId: string) => void;
  clearCandidate: () => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setPreloadedContext: (context: AssistantContext | null) => void;
  consumePreloadedContext: () => AssistantContext | null;
  resetConversation: () => void;
}
```

### Behavior Contract

- `setConversationContext(context)`: Changes assistant context. If switching to "candidate" and no candidate selected, does not auto-select (UI must prompt). Conversation history is preserved across context switches.
- `selectCandidate(id)`: Sets `selectedCandidateId`. Only meaningful in "candidate" context but can be set preemptively.
- `addMessage(msg)`: Appends message to `messages` array. Persisted to MMKV.
- `updateLastAssistantMessage(content)`: Appends `content` to the last message with `role: "assistant"`. Used during SSE streaming. Only updates the in-memory state during streaming; persists on stream completion.
- `setPreloadedContext(ctx)`: Sets context from deep link navigation. Not persisted (ephemeral).
- `consumePreloadedContext()`: Returns current `preloadedContext` and sets it to `null`. Used by Assistant tab on focus to consume and display contextual starter prompts.
- `resetConversation()`: Clears `messages`, resets `context` to "general", clears `selectedCandidateId`. Persisted.

### Context Guardrails

- In "general" context: Responses must include source references. No debate-style challenges.
- In "candidate" context: `selectedCandidateId` must be non-null. Responses draw only from that candidate's positions.
- In "assistant" context: If survey results exist, they are included in the system prompt. If not, fallback to non-personalized debate.

---

## SurveyStore (modified)

**File**: `src/stores/survey.ts`
**Persistence**: MMKV via zustandStorage (all fields now persisted)

```typescript
type SurveyStatus =
  | "not_started"
  | "civic_context"
  | "questionnaire"
  | "computing"
  | "results_ready"
  | "completed";

interface SurveyState {
  // State (all persisted)
  status: SurveyStatus;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  importanceWeights: Record<string, number>;
  profile: UserProfile | null;
  datasetVersion: string | null;

  // Actions (unchanged signatures)
  startCivicContext: () => void;
  startQuestionnaire: () => void;
  answerQuestion: (questionId: string, optionId: string) => void;
  setImportanceWeight: (themeId: string, weight: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setComputing: () => void;
  setResults: (profile: UserProfile, datasetVersion: string) => void;
  complete: () => void;
  reset: () => void;

  // New actions
  isResultsStale: (currentDatasetVersion: string) => boolean;
}
```

### New Behavior

- `setResults(profile, datasetVersion)`: Now also stores `datasetVersion` alongside results.
- `isResultsStale(currentVersion)`: Returns `true` if `datasetVersion !== currentVersion`. Used by Home to show "Results may be outdated" warning.
- All in-progress state (`status`, `currentQuestionIndex`, `answers`, `importanceWeights`) now persisted to MMKV, enabling mid-survey resume.

---

## ElectionStore (unchanged)

**File**: `src/stores/election.ts`
**Persistence**: None (loaded from bundled data on each app start)

No changes to the ElectionStore interface. All existing selectors (`getCandidateById`, `getThemeById`, `getPositionsForCandidate`, `getPositionsForTheme`, `getPositionForCandidateTheme`) remain as-is.

---

## Feedback Service (new, not a Zustand store)

**File**: `src/services/feedback.ts`
**Storage**: Direct MMKV access via `storage.getItem("feedback_entries")`

```typescript
interface FeedbackEntry {
  id: string;
  timestamp: string;
  screen: "candidate" | "assistant" | "comparison" | "survey";
  entityId: string | null;
  type: "unclear" | "missing" | "general";
  text: string | null;
}

// Functions (not a store — simple read/write helpers)
function submitFeedback(entry: Omit<FeedbackEntry, "id" | "timestamp">): void;
function getFeedbackEntries(): FeedbackEntry[];
function clearFeedbackEntries(): void;
```

### Behavior Contract

- `submitFeedback()`: Generates UUID and timestamp, appends to MMKV array.
- `getFeedbackEntries()`: Reads and parses the MMKV array. Returns empty array if key does not exist.
- `clearFeedbackEntries()`: Removes the MMKV key. Used for data export/reset (future).

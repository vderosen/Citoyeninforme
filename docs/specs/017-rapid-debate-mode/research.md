# Research: Rapid Debate Context

**Feature**: 017-rapid-debate-context
**Date**: 2026-02-20

## R1: Streaming vs Non-Streaming for Structured JSON Responses

**Decision**: Collect the existing SSE stream into a full response string, then parse as JSON. No backend proxy changes needed.

**Rationale**:
- The current backend proxy (`/api/chat`) only supports SSE streaming
- Adding a new endpoint would require backend deployment coordination
- XHR `onload` already fires after the full response is collected — we just need to accumulate the text chunks and parse the final result
- GPT-4.1-nano reliably generates JSON when instructed via system prompt
- Debate responses are short (2-4 sentences + 3 options ≈ 150-300 tokens) — ~2-3s wait is acceptable without progressive rendering

**Alternatives Considered**:
- New `POST /api/chat/debate-turn` non-streaming endpoint: cleanest contract but requires backend changes and deployment coordination. Rejected for MVP.
- Streaming with delimiter parsing (e.g., `---OPTIONS---`): fragile, error-prone, harder to validate. Rejected.
- OpenAI structured outputs / function calling: would require proxy changes to pass `response_format`. Rejected for same reason as option 1.

## R2: System Prompt Strategy for Structured JSON Output

**Decision**: Create a new prompt builder `buildDebateTurnPrompt()` that instructs the LLM to respond exclusively in a specific JSON schema. Keep the existing `buildDebateModePrompt()` unchanged (it will be deprecated for debate but kept for backward compatibility).

**Rationale**:
- The current debate prompt produces free-text Socratic responses — fundamentally different output format
- A separate builder is cleaner than adding conditional branching to the existing prompt
- The JSON format instruction must be explicit and strict: schema definition, example, and "respond ONLY with valid JSON" directive
- The turn number should be injected so the LLM knows when to suggest conclusion (~turn 5-7)

**Alternatives Considered**:
- Modifying existing `buildDebateModePrompt()` with a `structured: boolean` flag: increases complexity of an already long prompt. Rejected.
- Post-processing free-text response with a second LLM call to extract structure: doubles latency and cost. Rejected.

## R3: State Management Approach

**Decision**: Extend the existing `assistant.ts` Zustand store with debate-specific state fields. Do NOT persist debate state to AsyncStorage.

**Rationale**:
- The assistant store already handles context switching, streaming state, and conversations per context
- Adding debate state alongside existing state avoids a separate store and the cross-store synchronization it would require
- Debate history is explicitly ephemeral (FR-012) — exclude from `partialize` persistence
- The `conversations["assistant"]` key from the old chat-based debate can be ignored/cleared

**Alternatives Considered**:
- Separate `debate.ts` store: cleaner separation but requires cross-store coordination for context switching. Rejected for MVP.
- Persisting debate state: spec explicitly requires ephemeral history. Rejected.

## R4: UI Architecture — DebateArea vs ChatArea

**Decision**: Create a new `DebateArea` component that replaces `ChatArea` when context is `"assistant"`. Conditional rendering in `assistant.tsx`.

**Rationale**:
- ChatArea is built around TextInput + MessageBubble — fundamentally different from the debate's option-card UI
- Attempting to add debate logic to ChatArea would create excessive branching and coupling
- A separate component keeps each context's UI self-contained and testable
- The existing `AssistantContextControls` already handles context switching — only the content area below it changes

**Alternatives Considered**:
- Adding context-conditional branches inside ChatArea: violates single responsibility, makes ChatArea harder to maintain. Rejected.
- Full-screen debate flow (separate route): loses the tab context and context-switching UX. Rejected.

## R5: Debate Turn Validation and Error Handling

**Decision**: Parse and validate the JSON response client-side with a strict schema check. Retry once on parse failure. Show user-friendly error with manual retry on second failure.

**Rationale**:
- GPT-4.1-nano occasionally produces malformed JSON (missing closing brace, trailing comma)
- A retry with the same prompt usually succeeds on second attempt
- Client-side validation ensures option count (2-4), required fields, and type correctness
- The validation function returns a typed `DebateTurn` or throws, keeping the service clean

**Alternatives Considered**:
- Server-side validation in proxy: requires backend changes. Rejected for MVP.
- Lenient parsing (accept partial JSON): could lead to broken UI states. Rejected.
- Multiple retries (3+): diminishing returns, increases latency. One retry is the sweet spot.

## R6: Context Window Management for Long Debates

**Decision**: After 10 turns, summarize the first N-5 turns into a single "conversation summary" message to keep the prompt within context limits.

**Rationale**:
- Each turn adds ~200-400 tokens to the message history (statement + selected option)
- After 10 turns: ~3000-4000 tokens of history + ~2000 tokens system prompt = ~5000-6000 tokens
- GPT-4.1-nano has sufficient context for 10+ turns, but summarization prevents degradation
- The summary preserves key themes, positions taken, and contradictions explored
- Full history remains visible in the UI (only the LLM prompt is summarized)

**Alternatives Considered**:
- Hard cap at 10 turns: too restrictive, users might want longer debates. Rejected.
- Sliding window (drop oldest turns): loses early context which may be important. Rejected.
- No management: risk of degraded coherence past ~15 turns. Rejected.

## R7: Reusable UI Components

**Decision**: Reuse `PressableScale` for debate option buttons. Create new components for `DebateTurnCard`, `DebateOptionButton`, `DebateConclusionCard`, and `DebateThemeGrid`.

**Rationale**:
- `PressableScale` provides the exact press animation pattern used in the survey (0.97x scale, 100ms/150ms timing, reduced-motion support)
- Debate option buttons need debate-specific styling (letter prefix, selection state, fade-out animation) — warrants a thin wrapper
- Theme grid for no-survey start is debate-specific but uses theme data from the election dataset
- Conclusion card is a unique layout not shared with other features

**Alternatives Considered**:
- Building debate options directly with Pressable: loses animation consistency with rest of app. Rejected.
- Reusing QuestionCard from survey: too coupled to survey-specific props (importance slider, question index). Rejected.

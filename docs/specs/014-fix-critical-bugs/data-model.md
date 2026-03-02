# Data Model: Fix Critical Bugs

**Feature**: 014-fix-critical-bugs
**Date**: 2026-02-20

## Overview

This feature modifies no data models. All changes are to service behavior, configuration, and test fixtures. This document records the existing data structures that are referenced by the fixes for traceability.

## Existing Entities (Read-Only Reference)

### Storage Keys Registry

The selective deletion fix (R9) requires a canonical list of Lucide-owned storage keys.

| Key | Owner | Type | Cleared By |
|-----|-------|------|------------|
| `app-state` | `src/stores/app.ts` | Zustand persist | `revokePrivacyConsent()` + `setCrashReportingOptIn(false)` + selective remove |
| `survey-state` | `src/stores/survey.ts` | Zustand persist | `reset()` + selective remove |
| `assistant-state` | `src/stores/assistant.ts` | Zustand persist | `resetConversation()` + selective remove |
| `feedback_entries` | `src/services/feedback.ts` | Direct zustandStorage | `clearFeedbackEntries()` + selective remove |

**Validation rule**: If a new Zustand persist store or direct storage key is added in the future, it MUST be added to the selective deletion list in `data-export.ts`.

### Assistant Store Shape (v1)

The test fix (R5) requires the mock to match the current store shape after migration.

```typescript
interface AssistantState {
  conversation_key: "general" | "candidate:<id>";
  selectedCandidateId: string | null;
  conversations: Record<string, ChatMessage[]>;  // v1 — NOT messages[]
  isStreaming: boolean;
  preloadedContext: AssistantContext | null;
}
```

**Migration**: v0 (`messages: ChatMessage[]`) → v1 (`conversations: Record<string, ChatMessage[]>`). The v0 `messages` array is wrapped into `{ general: messages }`.

### Sentry Configuration (Before → After)

| Setting | Before (Broken) | After (Fixed) |
|---------|-----------------|---------------|
| `sendDefaultPii` | `true` | `false` |
| `replaysSessionSampleRate` | `0.1` | Removed |
| `replaysOnErrorSampleRate` | `1` | Removed |
| `integrations` | `[mobileReplayIntegration(), feedbackIntegration()]` | `[]` (empty) |

## State Transitions

No new state machines. The existing crash reporting lifecycle is:

```
App Launch → Store Rehydration → useEffect fires with persisted value
  ├── optIn=true  → Sentry.init() called → isInitialized=true
  └── optIn=false → early return → isInitialized remains false

Runtime toggle:
  ├── optIn changes to true  → initCrashReporting(true) via useEffect
  └── optIn changes to false → initCrashReporting(false) → early return (Sentry stays initialized but captureException is gated by isInitialized flag)
```

**Note**: The current `initCrashReporting(false)` returns early without calling `Sentry.close()`. The `updateCrashReportingConsent` function handles closing, but the `useEffect` approach in `_layout.tsx` calls `initCrashReporting`, not `updateCrashReportingConsent`. This means toggling off via the dependency array won't actually close Sentry — it will just skip re-init. For a complete fix, the `useEffect` should call `updateCrashReportingConsent` instead of `initCrashReporting` when the value changes after initial load. This is noted as a design consideration in the quickstart.

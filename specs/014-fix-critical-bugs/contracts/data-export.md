# Service Contract: Data Export

**Feature**: 014-fix-critical-bugs
**Date**: 2026-02-20

## Overview

The data export service (`src/services/data-export.ts`) handles exporting user data to JSON and deleting all user data. This contract documents the defensive coding and selective deletion changes.

## Public API (Unchanged)

```typescript
function exportUserData(): Promise<string>       // Returns file URI
function deleteAllUserData(): Promise<void>
```

No API signature changes.

## Export Behavior Contract (CHANGED)

### Null Guards Added

| Location | Before | After |
|----------|--------|-------|
| `FileSystem.cacheDirectory` | Used directly (crashes if null) | Checked — throws descriptive error if null |
| `assistantState.conversations` | Used directly (crashes if undefined) | Falls back to `{}` via `?? {}` |
| `EncodingType.UTF8` | Enum reference (may not exist in current types) | String literal `'utf8'` |

### Export Output Shape (Unchanged)

```typescript
{
  exportVersion: "1.0",
  exportedAt: string,
  appVersion: string,
  consent: { policyVersion, acceptedAt },
  survey: { status, answers, importanceWeights, profile },
  assistant: {
    mode: string,
    selectedCandidateId: string | null,
    conversations: Record<string, Array<{ id, role, content, timestamp }>>
  },
  preferences: { hasCompletedOnboarding, lastActiveTab, crashReportingOptIn },
  feedback: Array<{ id, timestamp, screen, type, text }>
}
```

### Graceful Degradation

When `assistantState.conversations` is null/undefined, the export produces:
```json
{ "assistant": { "conversations": {} } }
```

## Deletion Behavior Contract (CHANGED)

### Before (Broken)
```
1. Reset individual store states (in-memory)
2. AsyncStorage.clear()  ← removes ALL keys from ALL packages
```

### After (Fixed)
```
1. Reset individual store states (in-memory)
2. AsyncStorage.multiRemove([
     'app-state',
     'survey-state',
     'assistant-state',
     'feedback_entries'
   ])  ← removes only Lucide keys
```

### Known Lucide Storage Keys

| Key | Source |
|-----|--------|
| `app-state` | `src/stores/app.ts` |
| `survey-state` | `src/stores/survey.ts` |
| `assistant-state` | `src/stores/assistant.ts` |
| `feedback_entries` | `src/services/feedback.ts` |

**Maintenance rule**: Any future storage key added by Lucide MUST be added to this list and to the `multiRemove` call.

# Data Model: Assistant Chat Redesign

**Feature Branch**: `008-assistant-chat-redesign`
**Date**: 2026-02-19

## Summary

This feature is a **pure UI redesign** — no data model changes are required. All existing entities, stores, and persistence mechanisms remain unchanged.

## Existing Entities (Unchanged)

### ChatMessage
Already contains all fields needed for the redesign:

| Field | Type | Used By |
|-------|------|---------|
| `id` | `string` | FlatList key, message identity |
| `role` | `"user" \| "assistant"` | Bubble styling, avatar display, markdown toggle |
| `content` | `string` | Message text — markdown rendered for assistant, plain text for user |
| `sources` | `{ title, url, entityType, entityId }[]?` | TrustBadge display below assistant bubbles |
| `timestamp` | `string` (ISO 8601) | **Now displayed** as per-message timestamps (FR-018) — previously stored but never rendered |

### AssistantState (Zustand store)
No new fields. Existing fields support all new features:

| Field | New Usage |
|-------|-----------|
| `mode` | Empty state icon/title/description selection |
| `selectedCandidateId` | Context-aware empty state prompts |
| `conversations` | Conversation keying unchanged |
| `isStreaming` | Typing indicator visibility, input disable state |
| `preloadedContext` | Context-aware prompt chips in empty state |
| `resetConversation()` | Called by new conversation button (already implemented in store) |

### AssistantContext
No changes. Existing structure supports all empty state prompt generation:

| Field | Type | Used By |
|-------|------|---------|
| `type` | `"candidate" \| "theme" \| "survey_result"` | Context-specific prompt generation |
| `candidateId` | `string \| null` | Candidate-specific prompts in parler mode |
| `themeId` | `string \| null` | Theme-specific prompts |
| `promptText` | `string \| null` | Direct prompt text |

## No New Storage

- No new MMKV/AsyncStorage keys
- No SQLite schema changes
- No new bundled JSON files
- No API contract changes (chatbot proxy untouched)

## I18N Keys (Already Defined)

The following keys exist in `src/i18n/locales/fr/assistant.json` but are currently unused. They will now be surfaced in the UI:

| Key | Value | New Usage |
|-----|-------|-----------|
| `comprendreModeDescription` | "Posez des questions sur les candidats et les programmes" | Empty state description |
| `parlerModeDescription` | "Discutez avec un candidat virtuel" | Empty state description |
| `debattreModeDescription` | "Mettez vos convictions à l'épreuve" | Empty state description |
| `newConversation` | "Nouvelle conversation" | New conversation button label |
| `resetConfirm` | "Voulez-vous effacer la conversation actuelle ?" | Confirmation dialog message |

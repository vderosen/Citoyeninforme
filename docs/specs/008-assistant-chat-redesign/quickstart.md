# Quickstart: Assistant Chat Redesign

**Feature Branch**: `008-assistant-chat-redesign`
**Date**: 2026-02-19

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npx expo`)
- iOS Simulator or Android Emulator (or physical device with Expo Go)

## Setup

```bash
# 1. Switch to feature branch
git checkout 008-assistant-chat-redesign

# 2. Install dependencies (includes new markdown lib)
npm install

# 3. Start Expo dev server
npx expo start
```

## New Dependency

One new npm package is required:

```bash
npm install react-native-markdown-display
```

This is a pure JS package — no native module linking or pod install needed.

## Testing the Changes

### Empty State (FR-001 to FR-004)
1. Open the app → navigate to the Assistant tab
2. If there are existing messages, clear them via the new conversation button
3. Verify each context (Comprendre, Parler, assistant) shows:
   - Context-specific icon (book, chat bubble, scale)
   - Context title and 1-2 line description
   - 2-3 suggested prompt chips
4. Tap a prompt chip → conversation should begin

### Input Bar (FR-005 to FR-008)
1. Type a message in the input field
2. Verify the send button is a circular icon (not text "Envoyer")
3. Tap send → input should visually clear immediately
4. Verify a border/shadow separates the input from the chat
5. During streaming: input and send button should be disabled

### Context Selector (FR-009 to FR-010)
1. View the context tabs
2. Verify each tab has an icon + readable text label
3. Switch between contexts and verify active state highlighting

### Typing Indicator (FR-011 to FR-012)
1. Send a message
2. Verify animated bouncing dots appear in an assistant-style bubble
3. Once the response starts streaming, dots should be replaced by actual text

### New Conversation (FR-013 to FR-015)
1. Have a conversation with messages
2. Verify "new conversation" icon is visible in the toolbar
3. Tap it → confirmation dialog should appear
4. Confirm → chat should reset to empty state
5. When conversation is empty, the button should be hidden

### Message Bubbles (FR-016 to FR-018)
1. Have a conversation
2. Verify assistant bubbles are white with shadow (not warm-gray)
3. Verify a small sparkles avatar icon appears next to assistant messages
4. Verify timestamps appear below each message

### Markdown Rendering (FR-019 to FR-021)
1. Ask the assistant a question that triggers formatted output (e.g., "Liste les candidats et leurs propositions principales")
2. Verify bold, lists, and headings render visually
3. Verify user messages render as plain text (no markdown)

### Scroll-to-Bottom (FR-022 to FR-024)
1. Have a long conversation (5+ messages)
2. Scroll up away from the bottom
3. Verify a floating chevron-down button appears
4. Tap it → chat scrolls to bottom, button disappears

### Feedback (FR-025 to FR-026)
1. Verify no permanent "Signaler un problème" link at the bottom
2. Tap the feedback icon in the toolbar
3. Verify the feedback form opens and works as before

### Context Prompts (FR-027 to FR-028)
1. In empty state, verify prompt chips have outlined borders (not flat gray)
2. Verify each chip has a small arrow icon indicating tappability

## File Map

Key files to modify:

| File | Changes |
|------|---------|
| `src/app/(tabs)/assistant.tsx` | Remove direct ContextPrompts/FeedbackAction, add toolbar row |
| `src/components/assistant/ChatArea.tsx` | Controlled input, send icon, separator, scroll-to-bottom, empty state integration |
| `src/components/assistant/MessageBubble.tsx` | New styling, avatar, timestamps, markdown rendering |
| `src/components/assistant/AssistantContextControls.tsx` | Add icons, increase text size |
| `src/components/assistant/ContextPrompts.tsx` | Outlined chips, arrow icon, flex-wrap layout |
| `src/components/assistant/EmptyState.tsx` | **NEW** — context icon, title, description, integrated prompts |
| `src/components/assistant/TypingIndicator.tsx` | **NEW** — animated 3-dot bouncing indicator |
| `src/components/assistant/ChatToolbar.tsx` | **NEW** — new conversation + feedback icon row |
| `src/components/assistant/ScrollToBottomButton.tsx` | **NEW** — floating FAB with animated visibility |

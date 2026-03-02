# Feature Specification: Assistant Chat Redesign

**Feature Branch**: `008-assistant-chat-redesign`
**Created**: 2026-02-19
**Status**: Draft
**Input**: UI/UX improvements for the assistant chat page — enriched empty state, modernized input bar, assistant context controls with icons, animated typing indicator, new conversation button, enhanced message bubbles, repositioned feedback action, markdown rendering, scroll-to-bottom button, visual context prompts.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — First Contact with the Assistant (Priority: P1)

A user opens the assistant tab for the first time (or after clearing a conversation). Instead of seeing a blank screen with placeholder text, they see an engaging empty state that explains the current context, shows an icon, a brief description of what the context does, and suggested prompts to get started. The user taps a suggested prompt and the conversation begins immediately.

**Why this priority**: The empty state is the first impression. A confusing or empty screen causes abandonment. This change directly addresses user onboarding within the assistant and leverages existing unused i18n keys (`comprendreModeDescription`, `parlerModeDescription`, `debattreModeDescription`).

**Independent Test**: Can be tested by opening the assistant tab in each context with no prior messages. Verifiable by visual inspection and interaction with suggested prompts.

**Acceptance Scenarios**:

1. **Given** the user has no messages in "Comprendre" context, **When** they open the assistant tab, **Then** they see a context-specific icon, the context title, a 1-2 line description, and 2-3 suggested prompt chips.
2. **Given** the user has no messages in "assistant avec contexte candidat" context and has selected a candidate, **When** they view the chat, **Then** the empty state shows context-specific prompts related to the selected candidate.
3. **Given** the user has no messages in "assistant" context, **When** they view the chat, **Then** the empty state shows debate-oriented suggested prompts.
4. **Given** the user taps a suggested prompt chip, **When** the prompt fires, **Then** the empty state disappears and the conversation begins with that prompt as the first user message.
5. **Given** the user has existing messages in a conversation, **When** they view the assistant tab, **Then** the empty state is not shown — only the conversation is visible.

---

### User Story 2 — Sending a Message with a Modern Input Bar (Priority: P1)

A user types a message in the chat input and sends it using a visually modern input bar. The send action is represented by a recognizable icon button (not text), the input visually clears after sending, and the input area is clearly separated from the chat content above.

**Why this priority**: The input bar is the primary interaction point. A text "Envoyer" button is non-standard for chat interfaces and the uncontrolled input that doesn't clear after send creates confusion.

**Independent Test**: Can be tested by typing a message, pressing send, and verifying the input clears and the message appears in the chat.

**Acceptance Scenarios**:

1. **Given** the user has typed a message, **When** they tap the send button, **Then** the message is sent and the input field visually clears to empty.
2. **Given** the input bar is visible, **When** the user looks at the send button, **Then** they see a recognizable send icon (not the word "Envoyer").
3. **Given** the chat has messages above the input, **When** the user views the screen, **Then** the input bar is visually separated from the message list by a subtle border or shadow.
4. **Given** the assistant is currently streaming a response, **When** the user views the input, **Then** the send button appears disabled and the input is not editable.

---

### User Story 3 — Understanding and Switching Contexts (Priority: P2)

A user looks at the assistant context controls and can quickly identify each context thanks to distinct icons and readable text. When they switch contexts, the active context is clearly highlighted.

**Why this priority**: The assistant context controls is how users access the three core experiences. Adding icons makes contexts instantly distinguishable and prevents the truncation issue with long labels like "assistant avec contexte candidat".

**Independent Test**: Can be tested by tapping each context tab and verifying visual distinctiveness and correct context switching.

**Acceptance Scenarios**:

1. **Given** the assistant context controls is visible, **When** the user looks at it, **Then** each context shows a distinct icon alongside its label.
2. **Given** a context is active, **When** the user views the selector, **Then** the active tab is clearly highlighted and distinguishable from inactive tabs.
3. **Given** the user taps a different context, **When** the context switches, **Then** the chat area updates to show the conversation for that context and the empty state updates if no messages exist.

---

### User Story 4 — Waiting for Assistant Response (Priority: P2)

A user sends a message and waits for the assistant to respond. They see an animated typing indicator (similar to iMessage/WhatsApp bouncing dots) inside a chat bubble, providing clear feedback that the assistant is processing their request.

**Why this priority**: Waiting without feedback creates uncertainty. An animated indicator is a standard chat UX pattern that reassures users the system is working.

**Independent Test**: Can be tested by sending a message and observing the typing indicator appears during streaming, then disappears when the response completes.

**Acceptance Scenarios**:

1. **Given** the user has sent a message, **When** the assistant is generating a response (streaming), **Then** a typing indicator with animated dots appears in an assistant-style bubble at the bottom of the message list.
2. **Given** the typing indicator is showing, **When** the assistant's first text chunk arrives, **Then** the typing indicator is replaced by the assistant's response bubble.
3. **Given** the assistant has finished responding, **When** the response is complete, **Then** no typing indicator is visible.

---

### User Story 5 — Starting a Fresh Conversation (Priority: P2)

A user who has been chatting wants to start over. They tap a "new conversation" button, confirm the action, and the conversation resets to the empty state for the current context.

**Why this priority**: Users currently have no way to clear a conversation. The i18n keys exist but no UI surfaces them. This is a basic chat feature.

**Independent Test**: Can be tested by having a conversation, tapping the new conversation button, confirming, and verifying the chat clears.

**Acceptance Scenarios**:

1. **Given** the user has messages in the current conversation, **When** they look at the screen, **Then** a "new conversation" button is visible (in the header area or near the assistant context controls).
2. **Given** the user taps the new conversation button, **When** the confirmation prompt appears, **Then** the user sees a clear message asking if they want to clear the current conversation.
3. **Given** the user confirms the reset, **When** the conversation clears, **Then** the chat returns to the enriched empty state for the current context.
4. **Given** the user has no messages in the current conversation, **When** they view the screen, **Then** the new conversation button is hidden.

---

### User Story 6 — Reading Assistant Responses with Better Bubbles (Priority: P3)

A user reads the assistant's responses in visually distinct bubbles that include a small assistant avatar icon and are styled differently from other gray UI elements. Timestamps are shown to give temporal context.

**Why this priority**: Currently assistant bubbles use the same gray as the assistant context controls, input field, and context prompts — they blend in. Adding an avatar and distinct color improves readability and gives the assistant a visual identity.

**Independent Test**: Can be tested by having a conversation and verifying assistant messages have distinct styling, an avatar icon, and timestamps.

**Acceptance Scenarios**:

1. **Given** the assistant sends a response, **When** the user views the message, **Then** the assistant bubble has a background color distinct from the input field and assistant context controls backgrounds.
2. **Given** the assistant sends a response, **When** the user views the message, **Then** a small assistant avatar or icon is visible next to the bubble.
3. **Given** a conversation has messages, **When** the user views the chat, **Then** timestamps are visible (either per-message or grouped by time block).

---

### User Story 7 — Reading Formatted Assistant Responses (Priority: P3)

A user asks a question that the assistant answers with structured formatting (bullet lists, bold text, headings). The response renders with proper markdown formatting instead of raw text.

**Why this priority**: The LLM generates markdown output but it's currently rendered as plain text, losing all formatting. This impacts readability for longer, structured answers.

**Independent Test**: Can be tested by asking the assistant a question that triggers a formatted response (e.g., listing candidates' positions) and verifying bold, lists, and headings render correctly.

**Acceptance Scenarios**:

1. **Given** the assistant sends a response containing markdown formatting, **When** the user views the message, **Then** bold text, bullet lists, and headings are rendered visually (not as raw markdown syntax).
2. **Given** the assistant is streaming a response with markdown, **When** the response is still building, **Then** the markdown renders progressively without visual glitches.
3. **Given** user messages contain markdown-like syntax, **When** displayed, **Then** user messages render as plain text (no markdown interpretation).

---

### User Story 8 — Navigating Long Conversations (Priority: P3)

A user scrolls up in a long conversation to re-read earlier messages. When they want to return to the latest messages, they tap a floating scroll-to-bottom button that appears when they are not at the bottom of the chat.

**Why this priority**: Quality-of-life improvement for longer conversations. Low effort, standard chat pattern.

**Independent Test**: Can be tested by scrolling up in a conversation and verifying a scroll-to-bottom button appears, then tapping it to return to the bottom.

**Acceptance Scenarios**:

1. **Given** the user is at the bottom of the chat, **When** they view the screen, **Then** no scroll-to-bottom button is visible.
2. **Given** the user has scrolled up away from the bottom, **When** they view the screen, **Then** a floating scroll-to-bottom button appears.
3. **Given** the user taps the scroll-to-bottom button, **When** the animation completes, **Then** the chat scrolls to the latest message and the button disappears.

---

### User Story 9 — Providing Feedback Unobtrusively (Priority: P3)

A user wants to signal a problem with an assistant response without the feedback mechanism taking up permanent screen space. The feedback action is accessible but does not consume a visible row at the bottom of every screen.

**Why this priority**: The current "Signaler un problème" link takes permanent space below the input bar. Repositioning it frees space for chat content while keeping it accessible.

**Independent Test**: Can be tested by verifying the feedback action is no longer a permanent bottom bar, but is still reachable through an alternative interaction.

**Acceptance Scenarios**:

1. **Given** the user views the assistant chat, **When** they look at the bottom of the screen, **Then** there is no permanent feedback link — the space is used by the chat and input bar only.
2. **Given** the user wants to provide feedback, **When** they interact with the designated trigger (e.g., header menu or long-press on a message), **Then** the feedback form opens.
3. **Given** the user submits feedback, **When** the submission completes, **Then** a brief confirmation is shown and the form closes.

---

### Edge Cases

- What happens when the user switches contexts while the assistant is streaming a response? The streaming should stop or continue in the background without affecting the new context's conversation.
- What happens when the user taps "new conversation" while the assistant is streaming? The reset should wait for streaming to stop, or cancel the stream before clearing.
- What happens when the markdown renderer encounters malformed markdown? It should fall back to displaying plain text without crashing.
- What happens when the user rapidly sends multiple messages? The input should clear after each send and messages should queue correctly.
- What happens with very long assistant responses (thousands of characters)? The markdown renderer should handle them without significant performance degradation.
- What happens when the user has no network connection? The existing offline guard takes priority — none of the redesigned UI is visible when offline.

## Requirements *(mandatory)*

### Functional Requirements

**Empty State**
- **FR-001**: System MUST display a context-specific icon when no messages exist in the current conversation.
- **FR-002**: System MUST display the context title and description text when no messages exist.
- **FR-003**: System MUST display suggested prompt chips as part of the empty state (not as a separate section above the chat).
- **FR-004**: System MUST hide the empty state when at least one message exists in the current conversation.

**Input Bar**
- **FR-005**: System MUST display a send icon button instead of a text "Envoyer" button.
- **FR-006**: System MUST visually clear the text input after a message is sent.
- **FR-007**: System MUST visually separate the input bar from the message list (border or shadow).
- **FR-008**: System MUST disable the send button and input field while the assistant is streaming.

**Context Selector**
- **FR-009**: System MUST display a distinct icon alongside each context label in the assistant context controls.
- **FR-010**: System MUST display context labels at a readable size (not truncated for any context name).

**Typing Indicator**
- **FR-011**: System MUST display an animated typing indicator while the assistant is generating a response (during streaming).
- **FR-012**: System MUST replace the typing indicator with the actual response once the first text chunk arrives.

**New Conversation**
- **FR-013**: System MUST provide a "new conversation" action when the current conversation has messages.
- **FR-014**: System MUST show a confirmation prompt before clearing a conversation.
- **FR-015**: System MUST hide the new conversation action when the conversation is empty.

**Message Bubbles**
- **FR-016**: System MUST display assistant message bubbles with a background color distinct from the input field and other gray UI elements.
- **FR-017**: System MUST display a small assistant icon/avatar alongside assistant messages.
- **FR-018**: System MUST display timestamps on messages (either per-message or grouped by time block).

**Markdown Rendering**
- **FR-019**: System MUST render assistant messages with markdown formatting (bold, lists, headings at minimum).
- **FR-020**: System MUST render user messages as plain text (no markdown interpretation).
- **FR-021**: System MUST handle malformed markdown gracefully (fallback to plain text rendering).

**Scroll-to-Bottom**
- **FR-022**: System MUST show a floating scroll-to-bottom button when the user has scrolled away from the bottom of the message list.
- **FR-023**: System MUST hide the scroll-to-bottom button when the user is at the bottom of the message list.
- **FR-024**: System MUST animate the scroll to the bottom when the button is tapped.

**Feedback Repositioning**
- **FR-025**: System MUST NOT display the feedback action as a permanent row below the input bar on the assistant screen.
- **FR-026**: System MUST make the feedback action accessible through an alternative interaction (header menu, long-press, or similar).

**Context Prompts**
- **FR-027**: System MUST style context prompt chips with a visually distinct border or outline that signals interactivity.
- **FR-028**: System MUST include a visual affordance (icon or chevron) on prompt chips to indicate they are tappable.

### Assumptions

- The existing three-context architecture (chat assistant unique) and per-conversation persistence remain unchanged.
- The assistant's streaming SSE mechanism is not modified — only the visual presentation changes.
- Existing i18n keys (`comprendreModeDescription`, `parlerModeDescription`, `debattreModeDescription`, `newConversation`, `resetConfirm`) will be used as-is.
- Icon choices (Ionicons icon names) are implementation details left to the plan phase.
- The markdown rendering library choice is an implementation detail left to the plan phase.
- The feedback action's new location (header menu vs. long-press vs. other) is an implementation detail left to the plan phase.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users understand the purpose of each context within 5 seconds of viewing the empty state (context name, description, and icon are visible without scrolling).
- **SC-002**: Users can send their first message within 10 seconds of opening the assistant tab (via tapping a suggested prompt or typing).
- **SC-003**: The input field visually clears within 200ms of sending a message, providing immediate feedback.
- **SC-004**: Users perceive the assistant is "working" during response generation thanks to a visible animated indicator.
- **SC-005**: Users can start a new conversation in any context without navigating away from the assistant tab.
- **SC-006**: Assistant responses with formatting (lists, bold, headings) are visually distinct and readable, not displayed as raw markdown syntax.
- **SC-007**: Users can return to the latest message from any scroll position with a single tap.
- **SC-008**: The feedback mechanism is accessible without consuming permanent screen space in the chat interface.
- **SC-009**: All interactive elements maintain a minimum touch target of 44px and include appropriate accessibility labels.

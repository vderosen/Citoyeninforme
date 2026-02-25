# Tasks: Assistant Chat Redesign

**Input**: Design documents from `/specs/008-assistant-chat-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in the spec. Test tasks are omitted. Validation via quickstart.md manual testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install new dependency and verify build

- [x] T001 Install react-native-markdown-display dependency via `npm install react-native-markdown-display`
- [x] T002 Verify Expo dev server starts successfully after dependency install

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational blocking tasks needed — the existing codebase is fully functional. All user stories modify existing working components. The Zustand store already has `resetConversation()`, i18n keys already exist, and `react-native-reanimated` is already installed.

**Checkpoint**: Foundation ready — proceed directly to user stories.

---

## Phase 3: User Story 1 — First Contact with the Assistant / Empty State (Priority: P1) 🎯 MVP

**Goal**: Replace the blank empty state with an engaging mode-specific display showing icon, title, description, and integrated suggested prompt chips.

**Independent Test**: Open the assistant tab in each mode with no prior messages. Verify mode icon, title, description, and 2-3 prompt chips are visible. Tap a prompt chip and verify the conversation begins.

### Implementation for User Story 1

- [x] T003 [P] [US1] Redesign ContextPrompts with outlined chips (`border-accent-coral`, `bg-warm-white`), `arrow-forward` icon, and `flex-row flex-wrap` layout in `src/components/assistant/ContextPrompts.tsx`
- [x] T004 [P] [US1] Create EmptyState component displaying mode icon (Ionicons: `book-outline`/`chatbubble-ellipses-outline`/`scale-outline`), mode title (i18n `{mode}Mode`), mode description (i18n `{mode}ModeDescription`), and integrated ContextPrompts in `src/components/assistant/EmptyState.tsx`
- [x] T005 [US1] Refactor ChatArea to accept `mode`, `context`, `onPromptSelect`, `selectedCandidateId` props and use EmptyState as `ListEmptyComponent` (replacing the plain text placeholder) in `src/components/assistant/ChatArea.tsx`
- [x] T006 [US1] Update assistant screen to pass mode/context/prompt props to ChatArea and remove standalone `<ContextPrompts>` rendering from outside ChatArea in `src/app/(tabs)/assistant.tsx`

**Checkpoint**: Empty state is fully functional with mode-specific icon, title, description, and tappable prompt chips integrated in the chat area.

---

## Phase 4: User Story 2 — Sending a Message with a Modern Input Bar (Priority: P1) 🎯 MVP

**Goal**: Modernize the input bar with an icon send button, controlled input that clears after send, and visual separator from the chat content.

**Independent Test**: Type a message, tap the send icon, verify the input clears and message appears. Verify a border/shadow separates input from chat. During streaming, verify input and send button are disabled.

### Implementation for User Story 2

- [x] T007 [US2] Switch TextInput from uncontrolled (`useRef`) to controlled (`useState`) with `value` prop and `setInputText("")` on send in `src/components/assistant/ChatArea.tsx`
- [x] T008 [US2] Replace text "Envoyer" send button with a circular `bg-accent-coral` button containing `<Ionicons name="send" />` icon in `src/components/assistant/ChatArea.tsx`
- [x] T009 [US2] Add `border-t border-warm-gray` or `shadow-sm` to the input bar container to visually separate it from the message list in `src/components/assistant/ChatArea.tsx`

**Checkpoint**: Input bar is modernized — icon send button, controlled clearing, visual separator, disabled during streaming.

---

## Phase 5: User Story 3 — Understanding and Switching Modes (Priority: P2)

**Goal**: Add distinct icons to each mode tab and increase label readability.

**Independent Test**: View the mode selector and verify each tab shows a unique icon alongside its label. Switch modes and verify active state highlighting.

### Implementation for User Story 3

- [x] T010 [US3] Add Ionicons to each mode tab (`book-outline` for comprendre, `chatbubble-ellipses-outline` for parler, `scale-outline` for debattre), increase text from `text-xs` to `text-sm`, and remove `numberOfLines={1}` in `src/components/assistant/ModeSelector.tsx`

**Checkpoint**: Mode selector shows distinct icons with readable labels. Active mode is clearly highlighted.

---

## Phase 6: User Story 4 — Waiting for Assistant Response / Typing Indicator (Priority: P2)

**Goal**: Show an animated typing indicator (bouncing dots in an assistant-style bubble) while the assistant is generating a response.

**Independent Test**: Send a message and verify animated bouncing dots appear in a bubble. When the response starts streaming, dots are replaced by the actual text.

### Implementation for User Story 4

- [x] T011 [P] [US4] Create TypingIndicator component with 3 animated dots using `react-native-reanimated` (`withRepeat`, `withSequence`, `withDelay`, `withTiming` for staggered bouncing), wrapped in an assistant-style bubble (`bg-white`, `shadow-card`, `rounded-2xl`) in `src/components/assistant/TypingIndicator.tsx`
- [x] T012 [US4] Integrate TypingIndicator into ChatArea: render as last item when `isStreaming && lastMessage.content === ""`, and remove the static "Réflexion en cours..." text indicator in `src/components/assistant/ChatArea.tsx`

**Checkpoint**: Animated typing indicator appears during streaming, disappears when first content chunk arrives.

---

## Phase 7: User Story 5 — Starting a Fresh Conversation (Priority: P2)

**Goal**: Add a "new conversation" button that clears the current conversation after confirmation.

**Independent Test**: Have a conversation, tap the new conversation icon, confirm, verify chat resets to empty state. When no messages exist, verify the button is hidden.

### Implementation for User Story 5

- [x] T013 [US5] Create ChatToolbar component with a "new conversation" icon button (`refresh-outline`) on the left side, visible only when `messages.length > 0`, that calls `Alert.alert()` using i18n keys `newConversation` / `resetConfirm` and invokes `resetConversation()` on confirm in `src/components/assistant/ChatToolbar.tsx`
- [x] T014 [US5] Add ChatToolbar to assistant screen between ModeSelector and ChatArea, passing `messages` and `onNewConversation` (wired to store's `resetConversation`) in `src/app/(tabs)/assistant.tsx`

**Checkpoint**: New conversation button visible when messages exist, hidden when empty. Confirmation dialog works. Chat resets to enriched empty state.

---

## Phase 8: User Story 6 — Reading Assistant Responses with Better Bubbles (Priority: P3)

**Goal**: Restyle assistant message bubbles with distinct white background + shadow, add sparkles avatar icon, and show per-message timestamps.

**Independent Test**: Have a conversation and verify assistant bubbles are white with shadow (not warm-gray), a small sparkles avatar icon is visible to the left, and timestamps appear below each bubble.

### Implementation for User Story 6

- [x] T015 [US6] Update assistant bubble styling from `bg-warm-gray` to `bg-white` with `shadow-card`, and add a 24x24 `bg-civic-navy` circle avatar with `<Ionicons name="sparkles-outline" size={16} color="#FAFAF8" />` to the left of assistant bubbles in `src/components/assistant/MessageBubble.tsx`
- [x] T016 [US6] Add per-message timestamp display (`text-xs text-text-caption`) below each bubble, formatted as "HH:mm" using `Intl.DateTimeFormat` on the existing `message.timestamp` ISO string in `src/components/assistant/MessageBubble.tsx`

**Checkpoint**: Assistant bubbles are visually distinct with white bg + shadow + avatar. Timestamps visible on all messages.

---

## Phase 9: User Story 7 — Reading Formatted Assistant Responses / Markdown (Priority: P3)

**Goal**: Render assistant messages with markdown formatting (bold, lists, headings) while keeping user messages as plain text.

**Independent Test**: Ask a question that triggers formatted output (e.g., "Liste les candidats et leurs propositions principales"). Verify bold, lists, and headings render visually. Verify user messages remain plain text.

**Dependency**: Should be implemented after US6 (Phase 8) since both modify MessageBubble.tsx — US6 handles styling/layout, US7 adds markdown rendering on top.

### Implementation for User Story 7

- [x] T017 [P] [US7] Create markdown style sheet configuration matching app typography (SpaceGrotesk headings in `civic-navy`, Inter body in `text-body`, accent-coral links, proper list indentation) in `src/components/assistant/markdownStyles.ts`
- [x] T018 [US7] Replace plain `<Text>` with `<Markdown style={markdownStyles}>` from `react-native-markdown-display` for assistant messages only (keep `<Text>` for user messages) in `src/components/assistant/MessageBubble.tsx`
- [x] T019 [US7] Add error boundary or try-catch around markdown rendering to fall back to plain `<Text>` if markdown parsing fails (FR-021) in `src/components/assistant/MessageBubble.tsx`

**Checkpoint**: Assistant responses render bold, lists, and headings visually. User messages remain plain text. Malformed markdown falls back gracefully.

---

## Phase 10: User Story 8 — Navigating Long Conversations / Scroll-to-Bottom (Priority: P3)

**Goal**: Show a floating scroll-to-bottom button when the user scrolls away from the bottom of the message list.

**Independent Test**: Scroll up in a conversation with 5+ messages. Verify a floating chevron-down button appears. Tap it to scroll to bottom and verify it disappears.

### Implementation for User Story 8

- [x] T020 [P] [US8] Create ScrollToBottomButton component: a 40x40 circular `bg-white shadow-elevated` button with `<Ionicons name="chevron-down" />`, positioned absolutely above the input bar, with animated opacity/translateY via `react-native-reanimated` in `src/components/assistant/ScrollToBottomButton.tsx`
- [x] T021 [US8] Add scroll position tracking to ChatArea FlatList (`onScroll` handler calculating `isAtBottom` from `contentOffset`, `contentSize`, `layoutMeasurement`) and integrate ScrollToBottomButton that calls `flatListRef.current.scrollToEnd({ animated: true })` in `src/components/assistant/ChatArea.tsx`

**Checkpoint**: Scroll-to-bottom FAB appears when scrolled up, disappears at bottom. Tap animates scroll to latest message.

---

## Phase 11: User Story 9 — Providing Feedback Unobtrusively (Priority: P3)

**Goal**: Reposition the feedback action from a permanent bottom bar to an icon in the ChatToolbar.

**Independent Test**: Verify no permanent "Signaler un problème" link at the bottom. Tap the feedback icon in the toolbar and verify the feedback form opens and works.

**Dependency**: Should be implemented after US5 (Phase 7) since US5 creates the ChatToolbar component that this story extends.

### Implementation for User Story 9

- [x] T022 [US9] Add a feedback icon button (`flag-outline`) to the right side of ChatToolbar, which toggles a state to show/hide the FeedbackAction form inline below the toolbar in `src/components/assistant/ChatToolbar.tsx`
- [x] T023 [US9] Remove `<FeedbackAction screen="assistant" />` from the bottom of the assistant screen in `src/app/(tabs)/assistant.tsx`

**Checkpoint**: Feedback action is no longer permanently visible. Accessible via toolbar icon. Form opens and works as before.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Ensure quality, accessibility, and consistency across all user stories

- [x] T024 Audit all new/modified components for accessibility: verify minimum 44px touch targets, `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` on all interactive elements across `src/components/assistant/`
- [ ] T025 Verify all new components work correctly on both iOS and Android (or Expo Go) by running through the quickstart.md test scenarios in `specs/008-assistant-chat-redesign/quickstart.md`
- [x] T026 Run `npm test && npm run lint` to verify no regressions or lint errors across the codebase

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Empty — no blocking prerequisites
- **US1 (Phase 3)**: Depends on Setup — can start immediately after npm install
- **US2 (Phase 4)**: Depends on Setup — can run in parallel with US1 (different areas of ChatArea)
- **US3 (Phase 5)**: Depends on Setup — independent (different component: ModeSelector)
- **US4 (Phase 6)**: Depends on Setup — independent (new component: TypingIndicator)
- **US5 (Phase 7)**: Depends on Setup — independent (new component: ChatToolbar)
- **US6 (Phase 8)**: Depends on Setup — independent (different area of MessageBubble)
- **US7 (Phase 9)**: Depends on Setup + **US6** (both modify MessageBubble — styling first, then markdown)
- **US8 (Phase 10)**: Depends on Setup — independent (new component: ScrollToBottomButton)
- **US9 (Phase 11)**: Depends on **US5** (extends ChatToolbar created in US5)
- **Polish (Phase 12)**: Depends on all user stories being complete

### User Story Dependencies

```
Setup ─┬─→ US1 (Empty State) ──────────────────→ ┐
       ├─→ US2 (Input Bar) ────────────────────→ │
       ├─→ US3 (Mode Selector) ────────────────→ │
       ├─→ US4 (Typing Indicator) ─────────────→ │
       ├─→ US5 (New Conversation) ──→ US9 ─────→ ├─→ Polish
       ├─→ US6 (Message Bubbles) ──→ US7 ──────→ │
       └─→ US8 (Scroll-to-Bottom) ─────────────→ ┘
```

### Within Each User Story

- Components that can be created in new files → [P] (parallel)
- Integration into existing files → sequential (after new components ready)
- assistant.tsx is touched by US1 (T006), US5 (T014), and US9 (T023) — execute in story order

### Parallel Opportunities

**Maximum parallelism after Setup:**
- US1 + US2 + US3 + US4 + US5 + US6 + US8 can all start simultaneously (7 parallel streams)
- Then: US7 after US6, US9 after US5
- Finally: Polish after all stories

**Within stories:**
- US1: T003 ∥ T004 (new files), then T005 → T006 (integration)
- US4: T011 (new file), then T012 (integration)
- US7: T017 (new file) ∥ T018, then T019
- US8: T020 (new file), then T021 (integration)

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks (different files):
Task: T003 "Redesign ContextPrompts in src/components/assistant/ContextPrompts.tsx"
Task: T004 "Create EmptyState in src/components/assistant/EmptyState.tsx"

# Then sequential integration:
Task: T005 "Integrate EmptyState into ChatArea"
Task: T006 "Update assistant.tsx to pass props and remove standalone ContextPrompts"
```

## Parallel Example: MVP (US1 + US2)

```bash
# US1 and US2 can run fully in parallel:
# Stream A: US1 tasks T003 → T004 → T005 → T006
# Stream B: US2 tasks T007 → T008 → T009
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (install dependency)
2. Complete Phase 3: US1 — Empty State (enriched first impression)
3. Complete Phase 4: US2 — Input Bar (modern send experience)
4. **STOP and VALIDATE**: Test both stories — the assistant now has a professional empty state and working input bar
5. Deploy/demo if ready

### Incremental Delivery

1. Setup → US1 + US2 → **MVP with modern empty state + input** ✅
2. Add US3 (mode icons) + US4 (typing indicator) + US5 (new conversation) → **P2 features complete** ✅
3. Add US6 (bubbles) → US7 (markdown) + US8 (scroll) + US9 (feedback) → **Full redesign** ✅
4. Polish → **Production ready** ✅

Each increment adds value without breaking previous stories.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable
- No test tasks generated (not requested in spec) — use quickstart.md for manual validation
- assistant.tsx is modified by US1, US5, and US9 — changes are additive/compatible
- ChatArea.tsx is modified by US1, US2, US4, and US8 — each change targets different sections (ListEmptyComponent, input, typing indicator, scroll tracking)
- MessageBubble.tsx is modified by US6 then US7 — execute in order (styling first, markdown second)
- Total: 26 tasks across 12 phases covering 9 user stories

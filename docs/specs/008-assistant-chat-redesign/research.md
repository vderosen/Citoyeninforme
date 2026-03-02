# Research: Assistant Chat Redesign

**Feature Branch**: `008-assistant-chat-redesign`
**Date**: 2026-02-19

## Decision 1: Markdown Rendering Library

**Decision**: Use `react-native-markdown-display`

**Rationale**:
- Most widely used React Native markdown renderer (~300k weekly npm downloads)
- Supports all required formatting: bold, italic, lists (ordered/unordered), headings (h1-h6), code blocks, links
- Accepts custom `style` prop using React Native `StyleSheet` — integrates with our existing font families (Inter, Space Grotesk) and color palette
- Re-renders on content change — works with streaming (content appended incrementally)
- Handles malformed markdown gracefully — renders partial or broken markdown as plain text segments without crashing (satisfies FR-021)
- No native module dependencies — pure JS, works in Expo managed workflow without ejecting
- Supports `rules` prop for custom rendering (e.g., override link handling to open in-app browser)

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| `@ronradtke/react-native-markdown-display` | Fork of the same lib, less community traction, no meaningful improvements for our use case |
| `react-native-markdown-renderer` | Unmaintained (last publish 2019), missing features |
| Custom regex-based renderer | Fragile, expensive to maintain, markdown edge cases are numerous |
| `react-native-render-html` | Requires converting markdown→HTML first, adds complexity with no benefit |

---

## Decision 2: Typing Indicator Animation

**Decision**: Use `react-native-reanimated` v4.1.1 (already installed) with `withRepeat` + `withSequence` + `withTiming`

**Rationale**:
- Already a project dependency at v4.1.1 — zero additional install cost
- Runs animations on the UI thread (worklets) — smooth 60fps even during heavy JS work (streaming SSE parsing)
- `withRepeat(withSequence(...))` pattern is idiomatic for bouncing dots: each dot gets a staggered `withDelay` to create the classic iMessage wave effect
- `useAnimatedStyle` + `Animated.View` is the standard pattern used elsewhere in the codebase (004-neighborhood-pulse-redesign)

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| React Native `Animated` API | Runs on JS thread, can jank during SSE streaming |
| Lottie animation file | Adds `lottie-react-native` dependency + asset management for a simple 3-dot animation |
| CSS-only (NativeWind) | NativeWind doesn't support keyframe animations in React Native |

---

## Decision 3: Input Field Control Model

**Decision**: Switch from uncontrolled (`useRef`) to controlled (`useState`) TextInput

**Rationale**:
- The current `inputRef.current = text` + `onChangeText` pattern means the TextInput never clears visually after send — the displayed text persists even though the ref is reset to `""`
- A controlled `useState` model (`value={inputText}` + `setInputText("")`) guarantees the displayed value matches the state, clearing instantly on send
- Performance concern is negligible: TextInput re-render on each keystroke is standard React Native practice and causes no measurable lag for inputs under 1000 characters (our existing `maxLength`)

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| Keep uncontrolled + imperatively clear via `textInputRef.current.clear()` | Requires adding a second ref to the TextInput DOM node, adds complexity, still less predictable than controlled |
| Keep uncontrolled + key-based remount | Forces full TextInput remount on send, loses focus and keyboard state |

---

## Decision 4: Feedback Action Repositioning

**Decision**: Move feedback into a header toolbar row (icon button) between the AssistantContextControls and chat content

**Rationale**:
- A thin toolbar row between the assistant context controls and chat area is the natural place for secondary actions (new conversation + feedback)
- Uses a small icon button (e.g., `flag-outline` or `ellipsis-horizontal`) — discoverable via standard iconography, doesn't require learning a gesture
- Keeps feedback accessible in 1 tap (vs. long-press which is undiscoverable without a tooltip)
- Pairs well with the "new conversation" button on the opposite side of the same toolbar row
- Removes the permanent `<FeedbackAction>` from below the input bar, reclaiming vertical space

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| Long-press on assistant message | Undiscoverable — no visual hint that long-press is available; accessibility concern (no equivalent for screen readers without custom actions) |
| "..." overflow menu in navigation header | Expo Router tab headers are shared across tabs; adding a per-tab menu requires custom header configuration and feels over-engineered for 2 actions |
| Bottom sheet triggered by swipe-up | Non-standard, conflicts with scroll gestures in the chat |

---

## Decision 5: Scroll-to-Bottom Implementation

**Decision**: Track scroll position via FlatList `onScroll` + show/hide a floating FAB with `react-native-reanimated` animated opacity

**Rationale**:
- FlatList `onScroll` with `onScrollEndDrag` / `onMomentumScrollEnd` and `contentOffset` vs `contentSize` gives reliable "is at bottom" detection
- A small circular FAB (`chevron-down-outline`) positioned absolutely above the input bar is the standard chat pattern (WhatsApp, Telegram, iMessage)
- Animated opacity (fade in/out) via `react-native-reanimated` provides smooth visual transition
- `scrollToEnd({ animated: true })` on FlatList is the standard scroll-to-bottom API

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| `onViewableItemsChanged` to detect bottom | Less precise than offset calculation, requires configuring viewability thresholds |
| Always visible button (no animation) | Visual clutter when already at bottom; contradicts FR-023 |

---

## Decision 6: Empty State Architecture

**Decision**: Create a new `EmptyState` component that replaces both the current `ListEmptyComponent` in ChatArea and the separate `ContextPrompts` rendering in `assistant.tsx`

**Rationale**:
- The spec requires suggested prompts to be part of the empty state (FR-003), not a separate section above the chat
- Currently `ContextPrompts` is rendered outside `ChatArea` in `assistant.tsx` (lines 129-135), creating a visual disconnect
- A unified `EmptyState` component that receives context, context, and `onPromptSelect` can render the icon, title, description, and prompt chips as a cohesive unit
- This component is rendered as the `ListEmptyComponent` of the FlatList, ensuring it fills the available space and disappears automatically when messages arrive (FR-004)

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| Keep ContextPrompts separate + add header content to ListEmptyComponent | Two components managing the empty state creates layout complexity and violates FR-003 (prompts must be "part of" the empty state) |
| Conditional rendering outside FlatList | The empty state wouldn't scroll with the chat area and would create layout jumps |

---

## Decision 7: Context Selector Icon Choices

**Decision**: Use Ionicons (already available via `@expo/vector-icons`)

| Context | Icon Name | Rationale |
|------|-----------|-----------|
| Comprendre | `book-outline` | Universal "learn/read" metaphor |
| Parler | `chatbubble-ellipses-outline` | Chat/conversation metaphor |
| assistant | `scale-outline` | Balance/weighing ideas metaphor |

These same icons are reused in the empty state for consistency.

---

## Decision 8: Assistant Bubble Styling

**Decision**: Use `bg-white` background with subtle `shadow-card` for assistant messages; `sparkles-outline` icon as avatar

**Rationale**:
- `bg-white` (#FFFFFF) on the `bg-warm-white` (#FAFAF8) page background provides a subtle but distinct contrast
- Adding `shadow-card` (already defined in tailwind.config: `0 1px 3px rgba(27,42,74,0.08)`) gives depth without heavy borders
- This clearly differentiates assistant bubbles from `bg-warm-gray` used by the input field, assistant context controls, and other UI elements
- `sparkles-outline` as avatar conveys "AI assistant" without being tied to any brand — fits the neutral civic tool identity
- Avatar displayed in a small `bg-civic-navy` circle (24x24) to the left of the bubble

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| `bg-civic-navy-light` (rgba 5% opacity) | Too subtle on warm-white background, hard to distinguish |
| Colored border instead of shadow | Borders feel heavier; shadow is more modern and chat-native |
| Custom SVG logo as avatar | Over-engineering for MVP; Ionicons sparkles works well |

---

## Decision 9: Timestamp Display

**Decision**: Per-message timestamps below each bubble, formatted as relative time ("il y a 2 min") or absolute ("14:32")

**Rationale**:
- Per-message timestamps (FR-018) give precise temporal context
- Show as `text-xs text-text-caption` below the bubble, aligned to the bubble's side
- Use absolute format "HH:mm" for messages older than 1 hour, relative for recent ones
- No new dependency — format with `Intl.DateTimeFormat` or manual date math
- Timestamps are already stored in `ChatMessage.timestamp` (ISO string) — no data model change needed

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| Time block separators (grouped) | More complex to implement; per-message is simpler and the spec allows either approach |
| No timestamps (just order) | Violates FR-018 |

---

## Decision 10: Context Prompt Chip Redesign

**Decision**: Outlined chips with `border-accent-coral` + `arrow-forward` icon, `flex-row flex-wrap` layout

**Rationale**:
- Outlined style (`border border-accent-coral bg-warm-white`) immediately signals interactivity vs. the current `bg-warm-gray` which blends with static UI
- Small `arrow-forward` icon (12px) at the right edge provides tappable affordance (FR-028)
- `flex-row flex-wrap` layout is more compact than the current vertical stack, showing more prompts in less vertical space
- Accent coral border ties the chips to the app's primary action color, creating visual consistency with the send button

**Alternatives Considered**:
| Alternative | Why Rejected |
|-------------|-------------|
| `border-civic-navy` | Less visible on the light background; coral pops more |
| `sparkles` icon instead of arrow | Doesn't convey "tap to use" as clearly |
| Keep vertical layout | Wastes vertical space; flex-wrap is more efficient |

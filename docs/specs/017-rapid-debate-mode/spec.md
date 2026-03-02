# Feature Specification: Rapid Debate Context

**Feature Branch**: `017-rapid-debate-context`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Refonte du context assistant : remplacer le chat libre par un débat rapide où l'utilisateur choisit parmi des propositions générées dynamiquement par le LLM, sans jamais taper de texte."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rapid debate via multiple-choice (Priority: P1)

A user navigates to the Assistant tab, selects "assistant" context, and engages in a fast-paced Socratic debate without typing any text. The AI generates an argument or provocative question along with 2 to 4 response options. The user taps one option to advance the debate. Each subsequent turn builds on the full history of prior choices, creating a coherent and progressively deeper argumentative thread. The debate continues until the user taps "Terminer le débat" or selects a conclusion option offered by the AI after approximately 5-7 turns.

**Why this priority**: This is the core experience — transforming a slow free-text chat into an engaging, rapid-fire debate. Without this, no other story delivers value.

**Independent Test**: Can be fully tested by selecting "assistant" context and completing a 5-turn debate using only tap interactions, verifying that each turn presents a coherent argument and contextually relevant options.

**Acceptance Scenarios**:

1. **Given** the user is on the Assistant tab and has completed the survey, **When** they select "assistant" context, **Then** the AI generates the first debate turn based on the strongest contradiction in their survey profile, displaying an argument (2-4 sentences) and 2-4 response options.
2. **Given** a debate turn is displayed with options, **When** the user taps one option, **Then** the selected option is confirmed visually, the choice is recorded in the debate history, and the AI generates the next turn that logically follows from the selected position.
3. **Given** a debate is in progress, **When** the user taps "Terminer le débat", **Then** the AI generates a conclusion turn summarizing the debate.
4. **Given** the debate has reached approximately 5-7 turns, **When** the AI generates the next turn, **Then** one of the options offered is a "conclude the debate" choice.
5. **Given** the AI is generating a new turn, **When** the user is waiting, **Then** a loading indicator is displayed until the complete turn (argument + options) is ready.

---

### User Story 2 - Theme-based debate start without survey (Priority: P2)

A user who has not completed the survey navigates to "assistant" context. Instead of an automatic first question, they see a grid of 8 election themes (Transport, Logement, Sécurité, Écologie, Budget, Culture, Éducation, Social). They tap one theme to launch the debate on that topic. The AI then generates the first debate turn focused on the selected theme.

**Why this priority**: Ensures the assistant personalization flow is accessible to all users, not just those who completed the survey. Broadens the feature's reach.

**Independent Test**: Can be tested by a new user (no survey data) entering assistant context, selecting a theme, and verifying the first AI turn is relevant to that theme.

**Acceptance Scenarios**:

1. **Given** the user has not completed the survey and selects "assistant" context, **When** the context loads, **Then** a grid of 8 theme cards is displayed (each with icon and name) instead of an automatic first question.
2. **Given** the theme grid is displayed, **When** the user taps a theme card, **Then** the AI generates the first debate turn focused on that theme.
3. **Given** the user has completed the survey and selects "assistant" context, **When** the context loads, **Then** the debate starts automatically (no theme grid) based on their survey contradictions.

---

### User Story 3 - Debate conclusion with candidate proximity (Priority: P3)

When a debate concludes (either by user request or AI suggestion), the user sees a structured summary screen. This screen shows the themes explored, a key insight about the user's argumentative tendencies during the debate, and factual proximity information with specific candidates — but only when justified by the positions defended during the debate crossed with documented candidate positions. The user can then start a new debate or return to the assistant.

**Why this priority**: Provides closure and actionable insight, connecting the debate experience back to the election context. Valuable but not essential for the core debate loop.

**Independent Test**: Can be tested by completing a full debate and verifying the conclusion screen displays coherent themes, insight, and justified candidate proximity.

**Acceptance Scenarios**:

1. **Given** the debate has concluded, **When** the conclusion turn is displayed, **Then** it shows: themes explored during the debate, a key insight summarizing the user's argumentation patterns, and optionally candidate proximity information.
2. **Given** the conclusion includes candidate proximity, **When** displayed, **Then** each candidate mention includes a specific justification linking the user's debate positions to the candidate's documented positions.
3. **Given** no candidate positions align with the user's debate stances, **When** the conclusion is generated, **Then** candidate proximity is omitted rather than fabricated.
4. **Given** the conclusion screen is displayed, **When** the user taps "Nouveau débat", **Then** the debate resets and a new debate can begin (theme grid or auto-start depending on survey status).
5. **Given** the conclusion screen is displayed, **When** the user taps "Retour", **Then** the user returns to the assistant default state.

---

### User Story 4 - Debate history within a session (Priority: P4)

During the debate, the user can scroll up through the conversation history to review previous turns. Each past turn shows the AI's argument and the option the user selected (highlighted). The history provides context and allows the user to follow the thread of their reasoning. The debate history is ephemeral — it is not saved between sessions.

**Why this priority**: Enhances comprehension during the debate but is not critical for the core loop to function.

**Independent Test**: Can be tested by completing 3+ turns and scrolling up to verify past turns display correctly with the selected option highlighted.

**Acceptance Scenarios**:

1. **Given** the user has completed multiple debate turns, **When** they scroll up in the debate area, **Then** they see all previous turns with the AI argument and their selected option clearly identified.
2. **Given** a past turn is displayed, **When** the user views it, **Then** only the selected option is shown (not the other options that were available), displayed in a distinct visual style.
3. **Given** the user leaves the assistant tab and returns, **When** they re-enter assistant context within the same session, **Then** the debate state is not preserved — a fresh start is presented.

---

### Edge Cases

- What happens when the AI returns a malformed response that cannot be parsed into a structured turn? The system retries once automatically. If the retry also fails, a user-friendly error message is shown with a "Retry" button.
- What happens when the API is slow (>5 seconds)? A loading indicator remains visible. After 15 seconds, a timeout message is shown with a "Retry" button.
- What happens when the debate context becomes very long (>10 turns without concluding)? Earlier turns are summarized in the prompt sent to the AI to avoid exceeding context limits, while the full history remains visible to the user in the UI.
- What happens when no candidate positions exist for the themes discussed? The conclusion omits candidate proximity entirely and focuses on the user's argumentation patterns.
- What happens when the user switches away from assistant context mid-debate and comes back? The debate state is cleared; a fresh debate is offered.
- What happens when the AI generates only 1 option or more than 4? The system enforces a minimum of 2 and maximum of 4 options. If the response has 1 or 0 options (and is not a conclusion), the system retries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST replace the free-text input in "assistant" context with a structured multiple-choice interface where the user selects from AI-generated options.
- **FR-002**: The AI MUST generate each debate turn as a structured response containing: an argument or question (2-4 sentences), 2 to 4 response options (variable, chosen by the AI), and optionally a theme identifier and source citations.
- **FR-003**: The system MUST send the complete debate history (all past turns and selected options) as context to the AI for each new turn generation.
- **FR-004**: When the user has completed the survey, the system MUST automatically start the debate based on the strongest contradiction detected in the user's survey profile.
- **FR-005**: When the user has not completed the survey, the system MUST display a theme selection grid (8 themes) and use the selected theme to generate the first debate turn.
- **FR-006**: The system MUST display a loading indicator while waiting for the AI to generate a new turn (no streaming — the complete structured response is awaited).
- **FR-007**: After approximately 5-7 turns, the AI MUST begin offering a "conclude" option among the response choices.
- **FR-008**: The user MUST be able to end the debate at any time via a "Terminer le débat" button.
- **FR-009**: When the debate concludes, the AI MUST generate a structured conclusion containing: themes explored, a key insight, and optionally candidate proximity information justified by the debate content and documented candidate positions.
- **FR-010**: Candidate proximity in the conclusion MUST only appear when justified by matching the user's debate positions against documented candidate positions. It MUST never constitute a recommendation.
- **FR-011**: The system MUST handle malformed AI responses gracefully with one automatic retry, then a user-facing error with manual retry option.
- **FR-012**: The debate history MUST be ephemeral — not persisted between app sessions.
- **FR-013**: The debate interface MUST display a scrollable history of past turns, showing the AI argument and the user's selected option for each completed turn.
- **FR-014**: The system MUST prevent going back to change a previous choice — the debate always moves forward.
- **FR-015**: The system MUST enforce a minimum of 2 and maximum of 4 response options per turn (excluding conclusion turns which have 0 options).

### Key Entities

- **DebateTurn**: A single exchange in the debate. Contains an AI-generated argument/question, a list of response options, an optional theme identifier, optional source citations, and whether this turn is a conclusion. Belongs to a single debate session.
- **DebateOption**: A selectable response within a turn. Contains an identifier and display text. One option per turn is marked as selected after the user chooses.
- **DebateConclusion**: A special final turn containing a summary of themes explored, a key insight about the user's argumentation, and optionally a list of candidate proximity entries (each with candidate reference and justification text).
- **DebateSession**: The full sequence of turns in one debate. Ephemeral — exists only in memory during the current session. References the starting theme (if chosen manually) or the triggering contradiction (if auto-started from survey).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a full 5-turn debate in under 2 minutes (vs. the current free-text context where a 5-exchange conversation takes 5+ minutes).
- **SC-002**: 90% of debate turns display within 5 seconds of the user selecting an option.
- **SC-003**: 95% of AI-generated turns are successfully parsed into the structured format (argument + options) without requiring a retry.
- **SC-004**: Users who have not completed the survey can start a debate within 2 taps (select context + select theme).
- **SC-005**: Every candidate mentioned in a debate conclusion includes a specific, verifiable justification linking the user's positions to documented candidate data.
- **SC-006**: The assistant personalization flow is usable without any keyboard interaction — 100% tap-based.

## Assumptions

- The existing AI proxy backend (`/api/chat`) can handle non-streaming JSON responses in addition to SSE streaming, or can be configured to do so.
- The AI model (currently GPT-4.1-nano) is capable of reliably generating structured JSON output when instructed via the system prompt.
- The existing election dataset (themes, candidates, positions) is sufficient to fuel meaningful debates across all 8 themes.
- The "Comprendre" and "assistant avec contexte candidat"s continue to use the existing free-text chat interface — this change only affects "assistant" context.
- The survey store's user profile (theme scores, contradictions, candidate ranking) is accessible from the assistant context for debate initialization.

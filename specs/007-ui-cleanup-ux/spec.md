# Feature Specification: UI Cleanup & UX Improvements

**Feature Branch**: `007-ui-cleanup-ux`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "UI Cleanup & UX Improvements — Remove non-functional language toggle, simplify home page, isolate assistant conversations, redesign candidates gallery with inline compare, streamline candidate detail page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simplified Home Page (Priority: P1)

As a user opening the app, I want to see a clean, focused home page with only the most essential entry points — the survey, practical voting information, and trust transparency — so that I am not overwhelmed and I immediately know what to do.

**Why this priority**: The home page is the first screen every user sees. A cluttered home page creates confusion and duplicates navigation already available via tabs. Simplifying it delivers the highest visibility improvement with the least risk.

**Independent Test**: Can be fully tested by opening the app and verifying the home page displays exactly three content elements (survey CTA, voting info card, trust card) with no extraneous components.

**Acceptance Scenarios**:

1. **Given** the user has never taken the survey, **When** they open the home page, **Then** they see a "Tester mes idees" CTA, a voting information card, and a trust/neutrality card — and nothing else.
2. **Given** the user has a survey in progress, **When** they open the home page, **Then** the CTA reads "Reprendre le sondage".
3. **Given** the user has completed the survey, **When** they open the home page, **Then** the CTA reads "Refaire le sondage".
4. **Given** the home page is displayed, **When** the user looks for the hero block, secondary shortcut buttons ("Explorer les candidats", "Poser une question"), resume card, or theme feed, **Then** none of these elements are visible.

---

### User Story 2 - Isolated Assistant Conversations (Priority: P2)

As a user interacting with the assistant, I want each mode (Comprendre, Parler avec un candidat, Debattre) to maintain its own independent conversation history — and within "Parler avec un candidat", each candidate to have their own conversation — so that switching modes or candidates never mixes or loses my messages.

**Why this priority**: The current shared message history is the most confusing usability issue in the app. Messages from different contexts blending together makes the assistant unreliable. This is the most complex change but also the most impactful for user trust and engagement.

**Independent Test**: Can be tested by starting a conversation in "Comprendre" mode, switching to "Parler" with Candidate A, typing messages, switching to Candidate B, typing different messages, then going back to each previous context and verifying all message histories are intact and separate.

**Acceptance Scenarios**:

1. **Given** the user is in "Comprendre" mode and has sent messages, **When** they switch to "Parler avec un candidat" mode, **Then** the Comprendre conversation messages are preserved and the Parler mode shows either an empty conversation or a previously started conversation for the selected candidate.
2. **Given** the user is in "Parler" mode with Candidate A and has sent messages, **When** they switch to Candidate B, **Then** Candidate A's conversation is preserved and Candidate B shows their own independent conversation.
3. **Given** the user switches back to Candidate A after talking to Candidate B, **When** the conversation loads, **Then** all previous messages with Candidate A are displayed exactly as they were.
4. **Given** the user is in "Debattre" mode, **When** they have a conversation, **Then** this conversation is independent from all "Comprendre" and "Parler" conversations.
5. **Given** the user closes and reopens the app, **When** they return to a previously used mode/candidate, **Then** the conversation history is still present.

---

### User Story 3 - Candidate Gallery & Compare Redesign (Priority: P3)

As a user browsing candidates, I want to see a clean, uniform grid of candidate cards (all the same size) without a theme filter toolbar, and I want to be able to select multiple candidates directly from this page to compare them — without needing to visit individual detail pages first.

**Why this priority**: The candidates page is the primary content browsing screen. Inconsistent card sizes and a rarely-used theme filter hurt scannability. Moving the compare entry point here (instead of burying it in detail pages) makes the comparison feature discoverable and convenient.

**Independent Test**: Can be tested by opening the candidates tab and verifying all cards are uniform, no theme filter toolbar is present, and the compare selection flow works end-to-end from this page.

**Acceptance Scenarios**:

1. **Given** the user navigates to the candidates tab, **When** the page loads, **Then** all candidate cards are displayed in a grid with uniform dimensions (same height).
2. **Given** the candidates page is displayed, **When** the user looks for a theme filter toolbar, **Then** no such toolbar is visible.
3. **Given** each candidate card, **When** displayed, **Then** it shows the candidate's photo, name, and political party.
4. **Given** the candidates page is displayed, **When** the user taps the "Comparer" button, **Then** the page enters comparison selection mode where cards become selectable.
5. **Given** compare mode is active, **When** the user taps on candidate cards, **Then** selected cards show a visual selection indicator (toggle on/off).
6. **Given** compare mode is active and the user has selected 2 or more candidates, **When** they confirm their selection, **Then** the app navigates to the comparison page with those candidates.
7. **Given** compare mode is active and the user has selected fewer than 2 candidates, **When** they try to confirm, **Then** the confirm action is disabled or a message indicates at least 2 candidates are required.

---

### User Story 4 - Streamlined Candidate Detail Page (Priority: P4)

As a user viewing a candidate's detail page, I want to see their full profile (photo, name, party, biography, positions by theme with sources) with a single clear call to action — "Debattre" — which opens or resumes my isolated conversation with that candidate.

**Why this priority**: Depends on P2 (conversation isolation) and P3 (compare moved to gallery). Simplifying the CTA to one action reduces decision paralysis and aligns the page's purpose with its primary use case: learning about a candidate then engaging in debate.

**Independent Test**: Can be tested by navigating to any candidate's detail page and verifying full content is displayed with exactly one "Debattre" button and no "Comparer" or "Poser une question" buttons.

**Acceptance Scenarios**:

1. **Given** the user taps a candidate card from the gallery, **When** the detail page loads, **Then** the candidate's photo, name, party, biography, and thematic positions with sources are all displayed.
2. **Given** the candidate detail page is displayed, **When** the user looks for action buttons, **Then** only a "Debattre" button is visible — no "Comparer" or "Poser une question" buttons.
3. **Given** the user taps "Debattre" on a candidate detail page, **When** the assistant opens, **Then** it navigates to the "Parler avec un candidat" mode with that candidate selected, showing their isolated conversation (new or resumed).

---

### User Story 5 - Remove Non-Functional Language Toggle (Priority: P5)

As a user, I should not see a FR/EN language toggle that does not work, so that I am not confused by a non-functional control.

**Why this priority**: Lowest effort change. The toggle currently suggests bilingual support that does not exist (only French is loaded). Removing it eliminates confusion with zero risk.

**Independent Test**: Can be tested by checking every screen of the app and confirming no language toggle control is visible anywhere.

**Acceptance Scenarios**:

1. **Given** the user is on any screen with a header, **When** they look for a language switcher, **Then** no language toggle is visible.
2. **Given** the application loads, **When** it initializes, **Then** it serves all content in French without offering a language choice.

---

### Edge Cases

- What happens when a user activates compare mode but then navigates away from the candidates page? Compare selection state should be reset.
- What happens when there are no candidates loaded yet (empty state)? The candidates page should display an appropriate empty/loading state, and compare mode should be unavailable.
- What happens when the user navigates to "Debattre" from the candidate detail page but the assistant is in a different mode? The app should switch to "Parler avec un candidat" mode and select the correct candidate automatically.
- What happens when the user has never spoken with a candidate and taps "Debattre"? A new, empty conversation should be created for that candidate.
- What happens on screen sizes where 3 home page elements still require scrolling? The layout should gracefully stack elements with appropriate spacing.
- What happens if the user selects more candidates for comparison than the comparison page can reasonably display? A maximum selection limit should be enforced (assumed: maximum 4 candidates for comparison).

## Requirements *(mandatory)*

### Functional Requirements

**Language Switcher Removal**

- **FR-001**: Application MUST NOT display a language toggle control in the header or anywhere else in the interface.
- **FR-002**: Application MUST display all content exclusively in French.

**Home Page Simplification**

- **FR-003**: Home page MUST display exactly three content elements: a survey CTA, a voting information card, and a trust/neutrality card.
- **FR-004**: Survey CTA MUST adapt its label based on the user's survey status: "Tester mes idees" (not started), "Reprendre le sondage" (in progress), "Refaire le sondage" (completed).
- **FR-005**: Home page MUST NOT display the hero block, secondary navigation shortcuts ("Explorer les candidats", "Poser une question"), the resume card, or the theme feed.

**Assistant Conversation Isolation**

- **FR-006**: Each assistant mode (Comprendre, Parler avec un candidat, Debattre) MUST maintain its own independent message history that does not mix with other modes.
- **FR-007**: "Parler avec un candidat" mode MUST maintain a separate conversation per candidate, so that each candidate has their own isolated message thread.
- **FR-008**: Switching between modes or between candidates within "Parler" mode MUST NOT erase, merge, or alter messages from any other conversation.
- **FR-009**: Users MUST be able to resume any previously started conversation by returning to the same mode and candidate.
- **FR-010**: Conversation histories MUST persist across app sessions (survive app close and reopen).
- **FR-011**: Mode selector buttons MUST be clearly labeled and visually intuitive, allowing the user to understand the three modes at a glance.

**Candidates Gallery Redesign**

- **FR-012**: Candidates page MUST NOT display a theme filter toolbar.
- **FR-013**: All candidate cards MUST have uniform dimensions with a fixed height, displaying the candidate's photo, name, and political party.
- **FR-014**: Candidates page MUST provide a "Comparer" entry point (button) accessible directly from the page without navigating elsewhere.
- **FR-015**: When compare mode is activated, candidate cards MUST become selectable with a visible toggle indicator.
- **FR-016**: Users MUST be able to select between 2 and 4 candidates for comparison.
- **FR-017**: Once a valid selection is made (2-4 candidates), users MUST be able to navigate to the comparison page with those candidates.
- **FR-018**: Compare mode MUST be cancellable, allowing the user to exit without navigating to comparison.

**Candidate Detail Page Simplification**

- **FR-019**: Candidate detail page MUST display complete candidate information: photo, name, party, biography, and positions by theme with sources.
- **FR-020**: Candidate detail page MUST display exactly one action button: "Debattre".
- **FR-021**: "Debattre" button MUST navigate to the assistant in "Parler avec un candidat" mode with the current candidate pre-selected, opening or resuming the isolated conversation.
- **FR-022**: Candidate detail page MUST NOT display "Comparer" or "Poser une question" action buttons.

### Key Entities

- **Conversation**: An independent message thread identified by a mode and optionally a candidate. Contains an ordered list of messages, each with a sender (user or assistant), content, and timestamp.
- **Candidate Card (Gallery View)**: A uniform visual representation of a candidate showing photo, name, and party. Supports a selected/unselected state for compare mode.
- **Compare Selection**: A transient state on the candidates page tracking which candidates the user has toggled for comparison (minimum 2, maximum 4).

### Assumptions

- The app currently only supports French; the language switcher component can be safely removed without affecting any functional translations.
- The survey CTA already adapts its label based on survey state in the current implementation; this behavior is preserved.
- The comparison page already exists and functions correctly; only the entry point changes (from detail page to gallery page).
- Maximum 4 candidates can be compared at once, matching common UX patterns for side-by-side comparison readability.
- Conversation persistence uses the same local storage mechanism as other app data (no server-side storage).
- The existing assistant streaming/chat functionality remains unchanged; only the conversation state management and mode switching are refactored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Home page displays exactly 3 content elements with no additional clutter; users can reach the survey in one tap from the home page.
- **SC-002**: 100% of conversations are isolated — switching modes or candidates and returning never causes message loss or cross-contamination.
- **SC-003**: All candidate cards on the gallery page are rendered at the same height, with no visual size inconsistency.
- **SC-004**: Users can select candidates and launch a comparison entirely from the candidates page in 3 taps or fewer (tap Compare, tap 2+ candidates, tap Confirm).
- **SC-005**: Candidate detail page displays exactly 1 action button; tapping it correctly opens or resumes the corresponding isolated conversation.
- **SC-006**: No non-functional controls (language toggle) are visible anywhere in the application.
- **SC-007**: Conversation history with a specific candidate persists when the user closes and reopens the app.

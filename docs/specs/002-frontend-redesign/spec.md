# Feature Specification: Frontend Redesign

**Feature Branch**: `002-frontend-redesign`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Rebuild the frontend with a card-based, action-first design centered around 3 user intents: discover (Home), ask (Assistant), compare (Candidates). Instagram-like UX with minimal friction, face-first candidate cards, trust badges, and comprehensive survey/matching experience."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover the Election at a Glance (Priority: P1)

A citizen opens the app for the first time and immediately understands what election this is about, what the app does, and how to get started. The Home screen provides a clear election context (city, year), three prominent entry points (start the survey, browse candidates, ask a question), practical voting logistics, and a transparency statement about the app's neutrality. If the user has previously started a survey or chat, a "continue where you left off" prompt appears.

**Why this priority**: The Home screen is the entry point for every user. Without a clear, confidence-building first impression, users will not engage further. It establishes the app's promise and trust foundation.

**Independent Test**: Can be fully tested by opening the app, verifying all Home screen elements render correctly, tapping each shortcut to confirm navigation, and verifying conditional "resume" card appears only when prior activity exists.

**Acceptance Scenarios**:

1. **Given** a first-time user opens the app, **When** the Home screen loads, **Then** they see the election city and year, a brief description of what the app helps with, and three primary action shortcuts.
2. **Given** a first-time user views the Home screen, **When** they scroll down, **Then** they see a practical voting information card (dates, eligibility, where to vote) and a trust/neutrality card.
3. **Given** a returning user who previously started a survey, **When** the Home screen loads, **Then** a "Continue where you left off" card appears with a link to resume.
4. **Given** a first-time user with no prior activity, **When** the Home screen loads, **Then** no "Continue where you left off" card appears.
5. **Given** a user on the Home screen, **When** they tap any of the three primary shortcuts, **Then** they are navigated to the corresponding screen (survey, candidates, assistant).

---

### User Story 2 - Explore Candidates and Their Positions (Priority: P2)

A citizen wants to learn about the candidates running in the election. They open the Candidates tab and see a visual gallery of candidate faces displayed with equal visual weight (no ranking, no favoritism). They tap a candidate to see a brief summary, positions organized by theme, sources for each claim, and clearly labeled missing positions. They can filter candidates by theme to compare stances on a single issue across all candidates.

**Why this priority**: Candidate exploration is the core value proposition. Users need to browse, discover, and understand candidates before they can compare or take a survey.

**Independent Test**: Can be fully tested by navigating to the Candidates tab, verifying equal-weight gallery, tapping a candidate profile, checking all sections (summary, positions, sources, missing markers), and applying a theme filter.

**Acceptance Scenarios**:

1. **Given** a user opens the Candidates tab, **When** candidates load, **Then** all candidates appear in a visual gallery with equal card size, equal visual weight, and no editorial ranking.
2. **Given** a user taps a candidate card, **When** the profile opens, **Then** they see an "En bref" summary, positions organized by theme, source references for each claim, and "Position non documentee" labels where data is missing.
3. **Given** a user on the Candidates tab, **When** they select a theme filter, **Then** only positions related to that theme are shown for all candidates.
4. **Given** a candidate has no documented position on a theme, **When** the user views that theme section, **Then** a clear "Position non documentee" marker is displayed instead of empty space.
5. **Given** a user views a candidate profile, **When** they look at the action options, **Then** they see "Comparer" and "Debattre" buttons.

---

### User Story 3 - Compare Candidates Side by Side (Priority: P3)

A citizen wants to compare two or more candidates on a specific policy theme. They select candidates and view a side-by-side comparison that shows each candidate's position with equal visual weight, source links, and clear indication when a candidate's position is unknown. They can switch between themes to compare on different topics.

**Why this priority**: Comparison is the natural next step after exploration and a key differentiator of the app. It directly supports informed decision-making.

**Independent Test**: Can be fully tested by selecting 2+ candidates, viewing comparison on a theme, verifying balanced layout, checking source links, switching themes, and testing the disabled state when data is insufficient.

**Acceptance Scenarios**:

1. **Given** a user selects 2 or more candidates for comparison, **When** the comparison view opens, **Then** candidates are displayed in equal-width columns with equal text density.
2. **Given** a comparison view is active, **When** the user selects a theme, **Then** each candidate's position on that theme is shown side by side with source links.
3. **Given** a candidate has no position on the selected theme, **When** the comparison renders, **Then** that candidate's column shows a clear "Information non disponible" message rather than being blank.
4. **Given** insufficient data exists for a meaningful comparison, **When** the user attempts to compare, **Then** a disabled comparison state is shown with a clear reason why comparison is unavailable.
5. **Given** a comparison is displayed, **When** the user switches to a different theme, **Then** all candidate columns update to the new theme's positions.

---

### User Story 4 - Take the Civic Survey and Discover Alignment (Priority: P4)

A citizen wants to understand which candidates align with their values. They start the survey from the Home screen, read a brief civic primer, then answer questions on major policy themes. For each question, they indicate both their opinion and how important that theme is to them. A progress bar tracks their advancement. Upon completion, they see their personal profile by theme, a candidate alignment ranking with scores, an explanation of the methodology, detection of contradictions in their answers, and handling of ties. They can retake the survey at any time.

**Why this priority**: The survey is the primary engagement mechanism and a key retention driver. It converts passive readers into active participants. However, it depends on candidate data (P2) being available to generate meaningful results.

**Independent Test**: Can be fully tested by starting the survey, completing all questions, verifying progress tracking, reviewing results (alignment scores, contradiction flags, tie handling), and retaking the survey.

**Acceptance Scenarios**:

1. **Given** a user starts the survey from Home, **When** the survey begins, **Then** a short civic primer is displayed before the first question.
2. **Given** a user is answering survey questions, **When** each question is presented, **Then** the user can indicate both their opinion and the importance they assign to that theme, and a progress indicator shows their position in the survey.
3. **Given** a user completes the survey, **When** results are calculated, **Then** they see their personal profile by theme, a candidate alignment ranking with numerical scores, and a "Why this result" explanation.
4. **Given** a user's answers contain contradictions (e.g., opposing stances on related themes), **When** results display, **Then** contradictions are flagged with an explanation.
5. **Given** two or more candidates have identical alignment scores, **When** results display, **Then** the tie is explicitly explained rather than arbitrarily broken.
6. **Given** a user has completed the survey, **When** they choose "Refaire le sondage," **Then** the survey restarts from the beginning and previous results are replaced upon completion.
7. **Given** a user closes the app mid-survey, **When** they return, **Then** their survey progress is preserved and they can resume.

---

### User Story 5 - Ask Neutral Questions About the Election (Priority: P5)

A citizen has a question about the election, a candidate's position, or a policy topic. They open the Assistant tab, which defaults to "Comprendre" mode. They type their question and receive a concise answer with visible source references. If the information is missing, they see "Information non documentee." If uncertain, they see "Information incertaine." Context-aware prompts help them start a conversation based on where they came from (e.g., a specific candidate or theme). Off-topic questions are politely redirected to the election scope.

**Why this priority**: The assistant is the second most natural interaction after browsing. "Comprendre" mode is the safest, most universally useful mode and the foundation for the other two modes.

**Independent Test**: Can be fully tested by opening the Assistant, asking election-related questions, verifying source references, testing missing/uncertain markers, trying off-topic questions, and testing contextual entry from a candidate profile.

**Acceptance Scenarios**:

1. **Given** a user opens the Assistant tab, **When** the tab loads, **Then** it defaults to "Comprendre" mode with a visible mode selector showing all three modes.
2. **Given** a user asks a factual question in Comprendre mode, **When** the answer is generated, **Then** it includes visible source references for each factual claim.
3. **Given** no information exists for the user's question, **When** the answer is generated, **Then** an explicit "Information non documentee" message is displayed.
4. **Given** information exists but with low confidence, **When** the answer is generated, **Then** an "Information incertaine" marker is shown.
5. **Given** a user navigates to the Assistant from a candidate profile via "Ask about this," **When** the chat opens, **Then** the candidate context is prefilled and the first prompt references that candidate.
6. **Given** a user asks an off-topic question (unrelated to the election), **When** the answer is generated, **Then** the system politely redirects them to election-related topics.

---

### User Story 6 - Engage with Candidate Perspectives and Debate (Priority: P6)

A citizen wants to go deeper: either hear a candidate "speak" about a topic ("Parler avec un candidat" mode) or challenge their own views through a structured debate ("Debattre" mode). In "Parler" mode, the assistant responds strictly from one candidate's documented positions. In "Debattre" mode, the assistant uses the citizen's survey results (if available) to ask thought-provoking questions, surface trade-offs, and adapt to the citizen's evolving positions - without ever recommending a candidate. If no survey exists, a non-personalized debate path is offered.

**Why this priority**: These advanced modes are the app's highest-value differentiators for critical thinking, but they depend on the assistant foundation (P5) and candidate data (P2), and "Debattre" benefits from survey results (P4).

**Independent Test**: Can be fully tested by switching to "Parler" mode, selecting a candidate, verifying responses stay within that candidate's positions; then switching to "Debattre" mode with and without survey results, verifying trade-off questions and absence of candidate recommendations.

**Acceptance Scenarios**:

1. **Given** a user switches to "Parler avec un candidat" mode, **When** they select a candidate and ask a question, **Then** the response draws exclusively from that candidate's documented positions and sources.
2. **Given** a user is in "Parler" mode, **When** the candidate has no documented position on the topic, **Then** the response explicitly states the position is not documented rather than speculating.
3. **Given** a user switches to "Debattre" mode with completed survey results, **When** the debate begins, **Then** the assistant references the user's survey profile and asks clarifying questions about their positions.
4. **Given** a user switches to "Debattre" mode without survey results, **When** the debate begins, **Then** the assistant offers a non-personalized debate path with general trade-off questions.
5. **Given** a debate is active, **When** the user shifts their position during conversation, **Then** the assistant adapts its questions to the user's updated stance.
6. **Given** any assistant mode is active, **When** the user reaches a decision point, **Then** the assistant never recommends or endorses a specific candidate.
7. **Given** a user switches between modes, **When** mode guardrails activate, **Then** the system prevents cross-mode confusion (e.g., debate-style questions do not appear in "Comprendre" mode).

---

### User Story 7 - Trust the Information and Navigate Accessibly (Priority: P7)

A citizen needs confidence that the information is neutral, sourced, and transparent. Across all screens, consistent visual badges indicate sourced, undocumented, and uncertain information. The neutrality statement is visible on key screens. The interface is in clear French, accessible via screen readers, supports text scaling and strong contrast, and provides large tap targets. All error, loading, and empty states clearly indicate what happened and what to do next.

**Why this priority**: Trust and accessibility are cross-cutting qualities that affect every other story. Without them, no feature delivers its full value. They are prioritized last because they are enhancements layered on top of functional features, not standalone flows.

**Independent Test**: Can be fully tested by auditing all screens for badge consistency, verifying screen reader compatibility, testing contrast ratios, checking text scaling, and triggering all error/empty/loading states.

**Acceptance Scenarios**:

1. **Given** any screen displays factual information, **When** the user views it, **Then** consistent badges are visible: "Source" (with link), "Non documente," or "Incertain."
2. **Given** a user enables a screen reader, **When** they navigate the app, **Then** all elements have meaningful labels and follow a logical focus order.
3. **Given** a user increases system text size, **When** the app renders, **Then** text scales proportionally without layout breakage.
4. **Given** any screen enters a loading state, **When** the user waits, **Then** a calm loading indicator is shown with a clear message.
5. **Given** a screen has no data to display (empty state), **When** the user views it, **Then** a helpful message explains why it's empty and suggests a clear next action.
6. **Given** an error occurs, **When** the user sees the error state, **Then** a human-readable message describes the issue and offers a recovery action.
7. **Given** the app loads for the first time, **When** no prior data exists, **Then** a brief onboarding state orients the user before normal navigation.

---

### Edge Cases

- What happens when a candidate is added or removed after the user has already taken the survey? Results should indicate they were generated with a previous candidate set and offer to retake.
- What happens when the election dataset is completely empty (no candidates loaded)? The app should display a clear "No election data available" state with instructions.
- What happens when the user's device has no network and the assistant requires it? The assistant should display an offline message while candidate browsing and survey (using local data) remain functional.
- What happens when a user selects only 1 candidate for comparison? The comparison view should prompt them to select at least one more candidate.
- What happens when all candidates have missing positions on a given theme? The comparison for that theme should display a "No candidates have documented positions on this theme" message.
- What happens when the assistant receives a request that could be interpreted as seeking a voting recommendation? The assistant should firmly but politely restate its neutrality commitment and redirect to factual exploration.
- What happens when the user rapidly switches between assistant modes mid-conversation? The system should confirm mode switch and clearly indicate the new mode's behavior, preserving conversation history but adjusting response style.

## Requirements *(mandatory)*

### Functional Requirements

**Navigation & App Shell**

- **FR-001**: The app MUST provide a fixed bottom navigation with exactly 3 tabs: Accueil (left), Assistant (center), Candidats (right), each preserving its scroll position and state when switching tabs.
- **FR-002**: The app MUST display a persistent top context bar showing the election city, election year, and the date of the last content update, visible on all tabs.
- **FR-003**: The app MUST support deep-linking between screens, including an "Ask about this" action from any candidate or theme context that opens the Assistant with prefilled context.

**Home (Accueil)**

- **FR-004**: The Home screen MUST display a hero block with the election city, year, and a brief plain-language description of the app's purpose.
- **FR-005**: The Home screen MUST display 3 large primary shortcuts: "Commencer le sondage" (or "Refaire le sondage" if already completed), "Voir les candidats," and "Poser une question."
- **FR-006**: The Home screen MUST include a practical voting card containing key dates, eligibility requirements, and where/how to vote.
- **FR-007**: The Home screen MUST include a trust card with the neutrality statement, source policy summary, and explanation of missing/uncertain information markers.
- **FR-008**: The Home screen MUST display a "Continue where you left off" card if the user has an incomplete survey or a previous assistant conversation, and MUST NOT display it otherwise.
- **FR-009**: The Home screen MUST provide a lightweight feed of major election themes that users can tap to explore further.

**Candidate Exploration**

- **FR-010**: The Candidates tab MUST display all candidates in a visual gallery with photos, using equal card size and weight with no editorial ranking or visual favoritism.
- **FR-011**: Each candidate profile MUST include: an "En bref" summary, positions organized by theme, source references for each documented claim, and "Position non documentee" labels for missing positions.
- **FR-012**: The Candidates tab MUST provide theme-based filters that display one topic's positions across all candidates.
- **FR-013**: Each candidate profile MUST offer "Comparer" and "Debattre" actions that navigate to the comparison view or assistant debate mode respectively, with that candidate preselected.

**Comparison**

- **FR-014**: The comparison view MUST allow selection of 2 or more candidates and display their positions side by side on one theme at a time.
- **FR-015**: The comparison view MUST use equal visual columns and equal text density for all candidates, with source links per candidate statement.
- **FR-016**: The comparison view MUST display a disabled state with a clear explanation when insufficient data exists for a meaningful comparison.

**Survey & Matching**

- **FR-017**: The survey MUST begin with a short civic primer before presenting questions.
- **FR-018**: Each survey question MUST allow the user to indicate both their opinion and the importance they assign to that theme.
- **FR-019**: The survey MUST display a progress indicator showing current position and total questions at all times.
- **FR-020**: Survey results MUST display: the user's personal profile by theme, a candidate alignment ranking with numerical scores, and a "Why this result" explanation of the methodology.
- **FR-021**: Survey results MUST detect and flag contradictions or tensions in the user's answers with an explanation.
- **FR-022**: Survey results MUST explicitly handle ties between candidates with a clear explanation rather than arbitrary ranking.
- **FR-023**: The survey MUST provide a "Refaire le sondage" action that restarts the survey and replaces previous results upon completion.
- **FR-024**: Survey responses and results MUST be persisted locally on the device and restored when the user returns.
- **FR-025**: The survey matching algorithm MUST be deterministic: identical inputs MUST always produce identical results.

**Assistant**

- **FR-026**: The Assistant tab MUST display a mode selector with three modes always visible: Comprendre, Parler avec un candidat, and Debattre, defaulting to Comprendre.
- **FR-027**: In Comprendre mode, every factual answer MUST include visible source references. Missing information MUST display "Information non documentee." Uncertain information MUST display "Information incertaine."
- **FR-028**: In Parler avec un candidat mode, responses MUST draw exclusively from the selected candidate's documented positions and MUST NOT speculate beyond documented sources.
- **FR-029**: In Debattre mode, the assistant MUST use the user's survey profile (if available) to ask clarifying questions and surface trade-offs. If no survey exists, it MUST offer a non-personalized debate path.
- **FR-030**: The assistant MUST provide context-aware starter prompts based on the user's navigation origin (candidate, theme, or survey result).
- **FR-031**: The assistant MUST politely redirect off-topic requests to the election scope.
- **FR-032**: The assistant MUST never recommend, endorse, or express preference for any candidate in any mode.
- **FR-033**: Mode guardrails MUST prevent cross-mode behavioral confusion (e.g., debate-style challenges must not appear in Comprendre mode).

**Trust, Transparency & Accessibility**

- **FR-034**: All screens MUST use consistent visual badges for sourced ("Source"), undocumented ("Non documente"), and uncertain ("Incertain") information.
- **FR-035**: The neutrality statement MUST be visible on the Home screen and accessible from key screens throughout the app.
- **FR-036**: All information displayed across Home, Candidates, Survey, and Assistant MUST draw from the same consistent data source to prevent contradictions.
- **FR-037**: All interface copy MUST be in French using clear, plain language.
- **FR-038**: All screens MUST be compatible with screen readers, with meaningful labels and logical focus order.
- **FR-039**: All text MUST scale proportionally with system text size settings without breaking layout.
- **FR-040**: All colors MUST meet WCAG 2.1 AA contrast requirements.
- **FR-041**: All interactive elements MUST have tap targets of at least 44x44 points.

**State Management**

- **FR-042**: The app MUST display a first-time onboarding state that orients new users before normal navigation.
- **FR-043**: The app MUST display appropriate empty states with explanatory messages and suggested next actions when no data is available (no candidates, no survey results, no comparison possible).
- **FR-044**: The app MUST display calm loading states with clear messages and recoverable error states with human-readable descriptions and recovery actions.

**Feedback**

- **FR-045**: The app MUST provide a "Signal unclear or missing information" action accessible from candidate profiles and assistant responses.
- **FR-046**: The app MUST offer lightweight feedback capture after completing the survey and after assistant conversations.

### Key Entities

- **Election**: Represents a specific municipal election. Attributes: city name, election year, key dates (registration deadline, voting dates), eligibility rules, voting logistics, last content update timestamp. An election contains multiple candidates and themes.
- **Candidate**: A person running in the election. Attributes: name, photo, party/list affiliation, brief summary ("En bref"), list of positions by theme. All candidates within an election receive equal visual treatment.
- **Theme**: A major policy topic relevant to the election (e.g., transport, housing, environment). Attributes: name, description. Themes organize candidate positions and survey questions.
- **Position**: A candidate's documented stance on a theme. Attributes: summary text, detailed text, source references, confidence level (documented, uncertain, or missing). Each position belongs to one candidate and one theme.
- **Source**: A reference backing a factual claim. Attributes: title, origin (publication/document name), quote or excerpt, link (if available). Sources are attached to positions and assistant answers.
- **Survey Question**: A question presented during the civic survey. Attributes: question text, associated theme, answer options. Each question maps to one theme.
- **Survey Response**: A user's answer to a survey question. Attributes: selected opinion, assigned importance level. Responses are stored locally on device.
- **Survey Result**: The computed outcome of a completed survey. Attributes: personal profile by theme, candidate alignment scores, ranking, contradiction flags, methodology explanation. Results are deterministic given the same inputs.
- **Conversation**: An assistant chat session. Attributes: list of messages, active mode (Comprendre/Parler/Debattre), selected candidate (for Parler mode), navigation context origin. Stored locally on device.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can reach any primary function (survey, candidates, assistant) within 2 taps from any screen.
- **SC-002**: 80% of first-time users view at least one full candidate profile within their first session.
- **SC-003**: Users can complete the full civic survey in under 10 minutes.
- **SC-004**: Same survey inputs always produce identical alignment results (100% deterministic).
- **SC-005**: 100% of factual claims across all screens display either a source reference, a "Non documente" marker, or an "Incertain" marker - no unattributed factual statements exist.
- **SC-006**: All candidate comparison views display equal visual column width and text density across all selected candidates.
- **SC-007**: All screens pass WCAG 2.1 AA contrast and minimum target size (44x44 pt) audits.
- **SC-008**: 90% of users who view the trust card report understanding the app's neutrality commitment (measured via optional micro-survey).
- **SC-009**: Users can switch between all 3 assistant modes without losing conversation history.
- **SC-010**: The app becomes interactive within 3 seconds on a standard mobile connection.
- **SC-011**: 70% of users who start the survey complete it in full.
- **SC-012**: Zero instances of candidate recommendation or endorsement detected in assistant responses across all modes.

## Assumptions

- This feature replaces the current frontend design from feature 001-civic-election-app. Backend data structures, storage, and assistant proxy remain unchanged; only the presentation layer and user experience are redesigned.
- The election dataset (candidates, positions, themes, sources) is pre-populated and available locally. The assistant requires network connectivity for live responses.
- There is a single user type: an anonymous citizen. No authentication, accounts, or server-side user profiles are involved.
- The "multi-election content switch" mentioned in the feature description is a future capability. This redesign focuses on a single election (city + year) at a time.
- Survey questions and their mapping to themes are part of the bundled election dataset, not user-generated.
- Feedback signals ("unclear/missing info") are stored locally for later aggregation; no real-time feedback processing is required for MVP.
- The debate mode's "adapt to user position changes" means the assistant acknowledges and incorporates shifts in the user's stated views within the same conversation, not across sessions.
- The candidate gallery ordering is alphabetical or randomized - never ranked by popularity, alignment, or editorial preference.

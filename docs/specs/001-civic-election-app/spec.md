# Feature Specification: Lucide Civic Election App MVP

**Feature Branch**: `001-civic-election-app`
**Created**: 2026-02-13
**Status**: Draft
**Input**: User description: "Lucide — city-agnostic civic app for election learning and critical thinking about political programs. MVP: Paris 2026 municipal election."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explore Election Information (Priority: P1)

A first-time visitor arrives at the app wanting to understand the upcoming Paris municipal election. They land on the Home page, see the election header ("Paris 2026"), read the app's purpose, and find a neutrality statement. From Home, they navigate to the Learn page where they browse candidates, filter by theme (e.g., housing, transport), read each candidate's structured positions with source references, and compare two candidates side-by-side on a specific theme.

**Why this priority**: Without structured, source-grounded election content, no other feature (survey matching, chatbot, debate) can function. The Learn page is the intellectual backbone of the app and the single most valuable standalone deliverable.

**Independent Test**: A user can open the app, navigate from Home to Learn, filter by theme, read candidate positions with sources, and compare candidates — all without needing the survey or chatbot.

**Acceptance Scenarios**:

1. **Given** a user lands on the Home page, **When** they view the page, **Then** they see the election header (city + year), a short purpose explanation, a "Start the survey" CTA, links to Learn and Chatbot, and a neutrality/sourcing statement.
2. **Given** a user navigates to the Learn page, **When** they view the candidates list, **Then** all candidates are displayed in alphabetical or randomized order (never editorially ranked).
3. **Given** a user is on the Learn page, **When** they select a theme filter (e.g., "Transport"), **Then** only candidate positions relevant to that theme are displayed.
4. **Given** a user views a candidate's position on a theme, **When** they expand the details, **Then** they see a structured summary, expandable details, and at least one source reference linking to the original program or public statement.
5. **Given** a user wants to compare candidates, **When** they select two or more candidates and a theme, **Then** the app displays their positions side-by-side with equal visual weight.
6. **Given** election logistics data is available, **When** a user looks for practical voting information, **Then** they find key dates, eligibility steps, and where/how to vote — all verified against official government sources.

---

### User Story 2 - Complete Survey and Get Candidate Matching (Priority: P2)

A user wants to understand where they stand politically relative to the candidates. They start the survey from the Home page CTA. First, a civic context mini-module teaches key facts about the election and local governance ("Did you know the mayor of Paris controls X but not Y?"). Then the user answers a deterministic questionnaire covering major policy themes. At the end, they receive: a preference profile across themes with importance weighting, a ranking of closest candidates with alignment scores, a justification explaining which themes/questions drove the match, and a tension/contradiction snapshot highlighting inconsistencies in their own stated preferences.

**Why this priority**: The survey is the primary onboarding flow and the main interactive hook that personalizes the experience. It also feeds the Debate context with user profile data.

**Independent Test**: A user can complete the survey from start to finish, receive candidate matching results with justification, and review their own contradiction snapshot — all without the chatbot.

**Acceptance Scenarios**:

1. **Given** a user starts the survey, **When** they begin, **Then** a civic context mini-module presents key facts about the election and local governance before the questionnaire starts.
2. **Given** a user is in the questionnaire, **When** they answer questions, **Then** questions cover major policy themes shared across all candidates (housing, transport, security, ecology, budget priorities, etc.).
3. **Given** a user completes the questionnaire, **When** results are computed, **Then** the matching algorithm is deterministic and transparent — the same answers always produce the same results.
4. **Given** results are displayed, **When** the user views their ranking, **Then** they see: (a) a preference profile across themes with importance, (b) closest candidate(s) ranked by alignment, (c) a justification explaining which themes/questions drove the match, (d) a tension/contradiction snapshot showing inconsistencies in their own preferences.
5. **Given** the matching algorithm runs, **When** it produces rankings, **Then** no hidden weighting or editorial bias is applied — all weights derive from the user's own stated priorities.
6. **Given** a user completes the survey, **When** their results are stored, **Then** data is stored locally on the user's device by default with no server-side persistence unless the user explicitly consents.

---

### User Story 3 - Use the Learn Context Chatbot (Priority: P3)

A user has a question about a specific candidate's position on housing. They open the persistent chatbot from the floating entry point (available on any page), select "Learn Context," and ask their question. The chatbot responds with information grounded in the election dataset, cites its sources, and distinguishes what is known from what is uncertain. The user then asks the chatbot to compare two candidates on housing. The chatbot presents both positions with equal weight and source references.

**Why this priority**: The chatbot in Learn context is the conversational extension of the Learn page. It makes structured content searchable and comparable through natural language, significantly lowering the barrier to understanding political programs.

**Independent Test**: A user can open the chatbot, select Learn context, ask about candidate programs, request comparisons, and receive source-grounded answers — without having completed the survey.

**Acceptance Scenarios**:

1. **Given** a user is on any page, **When** they click the floating chatbot entry point, **Then** the chatbot panel opens in the bottom-right of the screen.
2. **Given** the chatbot is open, **When** the user selects "Learn Context," **Then** the chatbot operates as a neutral assistant grounded in the election dataset.
3. **Given** the user asks about a candidate's position, **When** the chatbot responds, **Then** the response references specific sources from the dataset and clearly states what is known vs. unknown.
4. **Given** the user asks to compare candidates on a topic, **When** the chatbot responds, **Then** both candidates' positions are presented with equal space, weight, and source references.
5. **Given** the user asks a question not covered by the dataset, **When** the chatbot responds, **Then** it explicitly states that the information is unavailable rather than fabricating an answer.
6. **Given** the user is on the Learn page viewing a candidate position, **When** they click "Ask about this in chat," **Then** the chatbot opens with that context pre-loaded.

---

### User Story 4 - Interact with a Candidate Bot (Priority: P4)

A user wants to "talk to" a specific candidate to understand their platform better. They open the chatbot, select "Candidate Context," and choose a candidate. The bot responds strictly within that candidate's documented positions, explaining and defending only sourced propositions. It does not invent policies or speak for other candidates.

**Why this priority**: Candidate bots make programs more engaging and accessible than static reading. However, they require a fully populated dataset and careful prompt engineering to maintain neutrality, making them a later priority.

**Independent Test**: A user can select a candidate bot, ask questions about policies, and receive responses that are strictly sourced from that candidate's documented program — without needing the survey or assistant personalization flow.

**Acceptance Scenarios**:

1. **Given** the chatbot is open, **When** the user selects "Candidate Context," **Then** they see a list of available candidates to choose from.
2. **Given** the user selects a candidate, **When** the bot responds to questions, **Then** it speaks only within that candidate's documented positions and cites specific sources.
3. **Given** the user asks about a topic the candidate has not addressed, **When** the bot responds, **Then** it states that the candidate has no documented position on this topic rather than inventing one.
4. **Given** the user asks the candidate bot to compare with another candidate, **When** the bot responds, **Then** it declines and suggests switching to Learn context for comparisons.
5. **Given** the candidate bot is active, **When** it speaks, **Then** it maintains a consistent conversational style appropriate to the candidate's public communication tone.

---

### User Story 5 - Engage in Socratic Debate (Priority: P5)

A user who has completed the survey enters Debate Context in the chatbot. The Socratic agent uses the user's preference profile to detect contradictions ("You prioritize lower taxes but also want expanded public transit — how would you fund the expansion?"). It highlights trade-offs, asks clarifying questions, and helps the user refine their views into a more coherent set of priorities. The agent never asserts what the "right" answer is.

**Why this priority**: Debate context is the most intellectually ambitious feature and the strongest differentiator. It depends on having survey data and a solid dataset, making it the final priority.

**Independent Test**: A user who completed the survey can enter Debate context, receive challenges to their reasoning based on their stated preferences, and refine their position — without needing the Learn page or candidate-focused assistant responses.

**Acceptance Scenarios**:

1. **Given** the user selects "Debate Context," **When** they have completed the survey, **Then** the Socratic agent loads their preference profile and begins the interaction.
2. **Given** the user selects "Debate Context," **When** they have NOT completed the survey, **Then** the system prompts them to complete the survey first or offers a general debate without personalization.
3. **Given** the Socratic agent detects a contradiction in the user's preferences, **When** it responds, **Then** it asks a clarifying question rather than asserting what the user should believe.
4. **Given** the agent highlights a trade-off, **When** presenting it, **Then** it explains the constraint (e.g., budget limits, jurisdictional scope) with source references and asks the user how they would resolve it.
5. **Given** the user refines a position during debate, **When** the conversation continues, **Then** the agent acknowledges the update and adjusts subsequent challenges accordingly.
6. **Given** the debate is active, **When** the agent operates, **Then** it never steers the user toward any specific candidate or political outcome.

---

### Edge Cases

- What happens when a candidate has no documented position on a theme? The system displays "No documented position" with a note that absence of data does not imply absence of opinion.
- What happens when the election dataset is updated mid-deployment? All features reflect the updated data; users who completed the survey retain their results but can retake it. Versioned diffs are available for audit.
- What happens when a user's survey answers are perfectly balanced across candidates? The system shows a tie with equal alignment scores and explains that the user's priorities do not strongly differentiate the candidates.
- How does the system handle offensive or off-topic chatbot queries? The chatbot redirects the user to election-related topics and does not engage with content outside the election dataset scope.
- What happens when only one candidate's data is available (early dataset phase)? The app functions with partial data, clearly marking which candidates have incomplete data and disabling comparison features for missing candidates.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a Home page with election header (city + year), app purpose, "Start the survey" CTA, navigation to Learn and Chatbot, and a neutrality statement.
- **FR-002**: The system MUST display a Learn page listing all candidates and major policy themes, with each candidate's position per theme shown as a structured summary with expandable details and source references.
- **FR-003**: The system MUST allow users to filter the Learn page by theme.
- **FR-004**: The system MUST allow users to compare two or more candidates side-by-side on a selected theme.
- **FR-005**: The system MUST present candidates in alphabetical or randomized order — never editorially ranked.
- **FR-006**: The system MUST provide election logistics information (key dates, eligibility, voting method, locations) verified against official government sources.
- **FR-007**: The system MUST provide a survey flow consisting of a civic context mini-module followed by a deterministic questionnaire covering major policy themes.
- **FR-008**: The survey MUST produce: a user preference profile with theme importance, a candidate ranking by alignment, a justification for the match, and a tension/contradiction snapshot.
- **FR-009**: The survey matching algorithm MUST be deterministic — identical inputs MUST produce identical outputs.
- **FR-010**: The system MUST provide a persistent chatbot accessible via a floating entry point from any page.
- **FR-011**: The chatbot MUST support Learn Context (neutral assistant), Candidate Context (per-candidate bot), and Debate Context (Socratic agent).
- **FR-012**: In Learn Context, the chatbot MUST ground all responses in the election dataset and cite sources.
- **FR-013**: In Candidate Context, the chatbot MUST speak strictly within the selected candidate's documented positions and MUST NOT invent policies.
- **FR-014**: In Debate Context, the chatbot MUST use the user's survey results (when available) to detect contradictions, highlight trade-offs, and ask Socratic questions without prescribing outcomes.
- **FR-015**: The system MUST store survey results and preference profiles locally on the user's device by default.
- **FR-016**: The system MUST clearly signal when information is missing, uncertain, or unavailable rather than fabricating content.
- **FR-017**: All application features MUST derive their content from a single, curated election dataset per deployment.
- **FR-018**: The election dataset MUST be swappable per city/election without changes to application logic.
- **FR-019**: The system MUST support French as the primary language for the Paris 2026 MVP.
- **FR-020**: The system MUST be accessible per WCAG 2.1 AA standards.

### Key Entities

- **Election**: Represents a specific election deployment (city, election type, year, voting rules, timeline, logistics). One election per deployment.
- **Candidate**: A person running in the election. Attributes: name, party/list, bio summary, communication style, program source URL.
- **Theme**: A major policy area (e.g., housing, transport, security, ecology, budget). Themes form a consistent taxonomy shared across all candidates in an election.
- **Position**: A candidate's stance on a specific theme. Attributes: summary, detailed description, source references. Each position links one candidate to one theme.
- **Survey Question**: A question in the preference questionnaire, linked to one or more themes. Attributes: question text, answer options, theme mapping.
- **User Profile**: The user's survey results. Attributes: theme preference scores, importance weights, contradiction flags. Stored locally on device.
- **Civic Fact**: A discrete piece of educational content for the civic context mini-module. Attributes: fact text, category (governance, voting, institutions), source reference.
- **Election Logistics**: Practical voting information. Attributes: key dates, eligibility criteria, voting locations/methods, official source references.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find a specific candidate's position on a specific theme within 30 seconds of landing on the Learn page.
- **SC-002**: 80% of users who start the survey complete it in a single session.
- **SC-003**: Users rate the neutrality of the app at 4/5 or higher in post-use feedback.
- **SC-004**: The chatbot provides a source-cited answer to 90% of questions that are covered by the election dataset.
- **SC-005**: The chatbot correctly responds "information unavailable" (rather than fabricating) for 95% of questions not covered by the dataset.
- **SC-006**: Users who complete the survey report that the candidate matching justification is "understandable" at a rate of 80% or higher.
- **SC-007**: The Debate context Socratic agent successfully identifies at least one contradiction or trade-off for 70% of completed survey profiles.
- **SC-008**: Deploying the app to a new election (different city) requires zero changes to application code — only dataset and configuration changes.
- **SC-009**: The application meets WCAG 2.1 AA compliance for all user-facing interfaces.
- **SC-010**: 90% of users can complete core tasks (browse candidates, complete survey, use chatbot) on their first visit without external help.

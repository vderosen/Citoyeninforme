# Feature Specification: Onboarding Redesign

**Feature Branch**: `006-onboarding-redesign`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Redesign onboarding flow from single scroll screen to 5-step paginated carousel with branching final screen, following artistic direction reference"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Step-by-Step Onboarding Journey (Priority: P1)

A first-time user opens Lucide and is guided through a 5-step onboarding flow. Each step focuses on a single concept, presented one at a time so the user can absorb each message without being overwhelmed. The user navigates forward by tapping a primary action button on each screen. A progress indicator shows their position in the flow (e.g., "2/5").

**Why this priority**: This is the core structural change — replacing the single-scroll screen with a paginated, focused experience. Without this, no other onboarding improvements can exist.

**Independent Test**: Can be fully tested by launching the app as a new user and verifying that 5 distinct screens appear sequentially, each advancing on button tap, with correct progress indicators.

**Acceptance Scenarios**:

1. **Given** a first-time user opens the app, **When** the onboarding loads, **Then** the first screen (1/5) is displayed with a title, illustration area, explanatory text, and a primary action button.
2. **Given** the user is on screen N (where N < 5), **When** they tap the primary action button, **Then** screen N+1 is displayed with a transition.
3. **Given** the user is on any screen, **When** they look at the bottom of the screen, **Then** a progress indicator shows "N/5" reflecting the current step.
4. **Given** the user is on screen 1, **When** they attempt to go back, **Then** nothing happens (no previous screen exists).

---

### User Story 2 - Branching Entry Point Selection (Priority: P1)

On the final onboarding screen (5/5), the user chooses how they want to start using the app. Three options are presented: starting the citizen survey (primary, most prominent), exploring candidates, or asking a question to the assistant. Each option completes onboarding and navigates to the corresponding section of the app.

**Why this priority**: This is the key design insight — giving users agency over their first interaction increases engagement and reduces drop-off. It's co-equal with Story 1 because the final screen is meaningless without the flow, and the flow is incomplete without meaningful final actions.

**Independent Test**: Can be tested by navigating to screen 5/5 and verifying each of the three options routes to the correct app section while marking onboarding as complete.

**Acceptance Scenarios**:

1. **Given** the user is on screen 5/5, **When** they tap the primary action ("Démarrer le questionnaire"), **Then** onboarding is marked complete and the user is taken to the survey/home tab.
2. **Given** the user is on screen 5/5, **When** they tap "Explorer les candidats", **Then** onboarding is marked complete and the user is taken to the candidates tab.
3. **Given** the user is on screen 5/5, **When** they tap "Poser une question", **Then** onboarding is marked complete and the user is taken to the assistant tab.
4. **Given** any of the three options is chosen, **When** the user restarts the app, **Then** onboarding does not appear again — they go directly to the main app.

---

### User Story 3 - Onboarding Content Communication (Priority: P2)

Each of the 5 screens communicates a specific message aligned with the app's values. The content builds progressively: (1) what the app does, (2) how it ensures neutrality, (3) three ways to use it, (4) what it does and does not do (trust-building), (5) ready to start. Each screen uses illustrations, structured lists, or icon cards to reinforce its message visually.

**Why this priority**: The content is what makes onboarding valuable beyond mere navigation. However, the structural flow (P1) must exist first. Content can be iterated independently.

**Independent Test**: Can be tested by reading through all 5 screens and verifying each conveys its intended message with appropriate visual elements (illustration, bullet list, card layout, check/X list, or CTA options).

**Acceptance Scenarios**:

1. **Given** screen 1 is displayed, **Then** it shows a title ("Comprendre avant de choisir."), an illustration, a description of the app's purpose (helping read and compare municipal programs neutrally), and a "Commencer" button.
2. **Given** screen 2 is displayed, **Then** it shows a title ("Neutre, sourcé, vérifiable."), an illustration, and three checkmark-prefixed bullet points about: faithful summaries from public documents, visible sources on every piece of information, and questions to understand trade-offs. A "Continuer" button advances.
3. **Given** screen 3 is displayed, **Then** it shows a title ("Trois façons de commencer") with three distinct cards each containing an icon and description: citizen survey (clarify priorities), explore candidates (compare by theme), and assistant (ask a question).
4. **Given** screen 4 is displayed, **Then** it shows a title ("Ce que Lucide fait – et ne fait pas") with two groups: positive items marked with green checkmarks (sourced information; explain, source, contextualize) and negative items marked with red X marks (no voting instructions, no partisan scoring, no political targeting). A "J'ai compris" button advances.
5. **Given** screen 5 is displayed, **Then** it shows a title ("Prêt·e ?"), a chat illustration, an encouraging message, and three action options as described in Story 2.

---

### User Story 4 - Swipe Navigation Between Steps (Priority: P3)

In addition to button-based navigation, users can swipe left/right to move between onboarding screens. This provides a natural mobile interaction pattern for users who prefer gesture-based navigation.

**Why this priority**: Swipe is a nice-to-have enhancement. Button navigation (P1) is sufficient for a functional onboarding. Swipe adds polish but is not essential.

**Independent Test**: Can be tested by swiping left on any screen and verifying the next screen appears, and swiping right to return to the previous screen.

**Acceptance Scenarios**:

1. **Given** the user is on screen N (where N < 5), **When** they swipe left, **Then** screen N+1 is displayed.
2. **Given** the user is on screen N (where N > 1), **When** they swipe right, **Then** screen N-1 is displayed.
3. **Given** the user is on screen 1, **When** they swipe right, **Then** nothing happens.
4. **Given** the user is on screen 5, **When** they swipe left, **Then** nothing happens.

---

### Edge Cases

- What happens if the user force-closes the app mid-onboarding? They should restart at screen 1 on next launch (onboarding is not marked complete until a final screen action is chosen).
- What happens if the user has already completed onboarding and the app navigates to onboarding by mistake? The existing navigation guard redirects them to the main app.
- What happens on very small screens where content overflows? Each screen should be scrollable if its content exceeds the viewport height.
- What happens on tablets or landscape orientation? The layout should remain centered and readable, with appropriate max-width constraints.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a 5-step paginated onboarding flow to first-time users.
- **FR-002**: Each onboarding step MUST occupy a full screen with a single focused message.
- **FR-003**: Each step MUST display a progress indicator showing the current position (e.g., "3/5").
- **FR-004**: Steps 1 through 4 MUST each have a single primary action button that advances to the next step.
- **FR-005**: Step 5 MUST present three distinct action options: one primary (start the survey) and two secondary (explore candidates, ask a question).
- **FR-006**: Tapping any action on step 5 MUST mark onboarding as complete and navigate to the corresponding app section.
- **FR-007**: Onboarding completion MUST be persisted so returning users skip directly to the main app.
- **FR-008**: Users MUST be able to swipe horizontally between steps as an alternative to button navigation.
- **FR-009**: Each step MUST include an illustration area, a title, and structured content appropriate to its message.
- **FR-010**: Step 2 MUST display checkmark-prefixed bullet items.
- **FR-011**: Step 3 MUST display three distinct cards with icons and descriptions.
- **FR-012**: Step 4 MUST display items grouped into "does" (green checkmarks) and "does not" (red X marks).
- **FR-013**: Each step MUST be individually scrollable if content exceeds the viewport height.
- **FR-014**: All onboarding text MUST be externalized for internationalization.

### Key Entities

- **OnboardingStep**: Represents a single screen in the flow. Attributes: step number (1-5), title, illustration, content structure (text, bullet list, card list, or check/X list), primary action label.
- **OnboardingCompletion**: A persistent flag indicating the user has finished onboarding. Linked to app-level state.
- **EntryPointChoice**: The user's selected starting action on step 5 (survey, candidates, or assistant). Determines initial navigation destination.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of first-time users see the 5-step onboarding flow before accessing the main app.
- **SC-002**: Users can complete the full onboarding flow (all 5 steps) in under 90 seconds.
- **SC-003**: Each onboarding step transition (button tap or swipe) responds in under 300 milliseconds.
- **SC-004**: All three entry point options on step 5 correctly navigate to their respective app sections.
- **SC-005**: Returning users bypass onboarding and reach the main app directly on every subsequent launch.
- **SC-006**: Onboarding content is fully readable and usable on screen sizes from 320px to 428px width without horizontal overflow.

## Assumptions

- Illustrations will initially use placeholder icons or simple SVG components; custom hand-drawn illustrations matching the artistic direction may be added in a follow-up iteration.
- The existing onboarding persistence mechanism (Zustand store with persisted `hasCompletedOnboarding` flag) will be reused.
- The existing navigation guard in the root layout will continue to handle onboarding-to-main-app routing.
- All text content follows the French copy shown in the artistic direction reference; translations to other languages are out of scope for this feature.
- The "Démarrer le questionnaire" primary CTA on step 5 navigates to the home tab (where the survey lives), not to a dedicated survey screen.

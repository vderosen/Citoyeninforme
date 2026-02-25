# Feature Specification: Swipe Survey Redesign

**Feature Branch**: `019-swipe-survey-redesign`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Redesign the onboarding survey from a multiple-choice question format to a Tinder-style swipe card interface where users swipe in 4 directions on political statement cards to express their opinions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Swipe Through Statement Cards (Priority: P1)

A user opens the survey and sees a stack of cards, each displaying a political statement about a municipal topic (transport, housing, security, etc.). The user swipes each card in one of four directions to express their opinion:

- **Swipe right**: "I agree with this statement"
- **Swipe left**: "I disagree with this statement"
- **Swipe up**: "Coup de coeur — I strongly agree, this is essential to me"
- **Swipe down**: "Catastrophe — I strongly disagree, this is unacceptable to me"

The card animates off-screen in the swiped direction, and the next card appears from the stack. A progress indicator shows how many cards remain.

**Why this priority**: This is the core interaction that replaces the existing multiple-choice questionnaire. Without it, the feature has no value.

**Independent Test**: Can be fully tested by swiping through all cards and verifying each swipe direction is recognized and recorded correctly.

**Acceptance Scenarios**:

1. **Given** the user starts the survey, **When** they see the first card, **Then** it displays a political statement with its associated theme icon and name
2. **Given** the user is viewing a card, **When** they swipe right, **Then** the card animates off-screen to the right and the response is recorded as "agree"
3. **Given** the user is viewing a card, **When** they swipe left, **Then** the card animates off-screen to the left and the response is recorded as "disagree"
4. **Given** the user is viewing a card, **When** they swipe up, **Then** the card animates off-screen upward with a visual emphasis (coup de coeur) and the response is recorded as "strongly agree"
5. **Given** the user is viewing a card, **When** they swipe down, **Then** the card animates off-screen downward with a visual emphasis (catastrophe) and the response is recorded as "strongly disagree"
6. **Given** the user swipes a card, **When** the animation completes, **Then** the progress indicator updates to reflect the remaining cards

---

### User Story 2 - Visual Feedback During Swipe (Priority: P2)

As the user drags a card, the interface provides real-time visual feedback indicating which action the swipe will trigger. The card tilts and changes appearance based on the drag direction, so the user always knows what their swipe means before releasing.

**Why this priority**: Without clear feedback, users cannot confidently express their opinions. This is essential for usability but depends on the core swipe mechanism (P1).

**Independent Test**: Can be tested by slowly dragging a card in each direction and verifying the visual cues appear correctly before release.

**Acceptance Scenarios**:

1. **Given** the user is dragging a card horizontally, **When** the drag passes a threshold toward the right, **Then** a visual "agree" indicator appears on the card
2. **Given** the user is dragging a card horizontally, **When** the drag passes a threshold toward the left, **Then** a visual "disagree" indicator appears on the card
3. **Given** the user is dragging a card vertically upward, **When** the drag passes a threshold, **Then** a visual "coup de coeur" indicator appears on the card
4. **Given** the user is dragging a card vertically downward, **When** the drag passes a threshold, **Then** a visual "catastrophe" indicator appears on the card
5. **Given** the user is dragging a card, **When** they release before reaching the threshold, **Then** the card snaps back to its original position and no response is recorded
6. **Given** the user is dragging a card, **When** the card tilts in the drag direction, **Then** the tilt angle is proportional to the drag distance

---

### User Story 3 - Accessible Button Alternatives (Priority: P3)

Users who cannot perform swipe gestures (motor impairments, assistive technology users) can use clearly labeled buttons to respond to each card. Four buttons corresponding to the four swipe directions are always visible below the card stack.

**Why this priority**: Ensures the survey is accessible to all users. The feature is fully functional without this (P1+P2 cover the primary flow) but accessibility is critical for inclusivity.

**Independent Test**: Can be tested by using only the buttons (no swipe gestures) to complete the entire survey and verifying all responses are correctly recorded.

**Acceptance Scenarios**:

1. **Given** the user is viewing a card, **When** they tap the "disagree" button, **Then** the card animates off-screen to the left and the response is recorded identically to a left swipe
2. **Given** the user is viewing a card, **When** they tap the "agree" button, **Then** the card animates off-screen to the right and the response is recorded identically to a right swipe
3. **Given** the user is viewing a card, **When** they tap the "coup de coeur" button, **Then** the card animates off-screen upward and the response is recorded identically to an upward swipe
4. **Given** the user is viewing a card, **When** they tap the "catastrophe" button, **Then** the card animates off-screen downward and the response is recorded identically to a downward swipe

---

### User Story 4 - Undo Last Swipe (Priority: P4)

The user can undo their most recent swipe to correct a mistake. An undo button is visible after the first card is swiped. Tapping it brings back the last swiped card with an animation.

**Why this priority**: Prevents frustration from accidental swipes. Lower priority because the survey can be completed and retaken without this feature.

**Independent Test**: Can be tested by swiping a card, tapping undo, verifying the card returns, then swiping it in a different direction.

**Acceptance Scenarios**:

1. **Given** the user has swiped at least one card, **When** they tap the undo button, **Then** the last swiped card returns to the top of the stack with an animation
2. **Given** the user undoes a swipe, **When** the card returns, **Then** the previously recorded response for that card is cleared
3. **Given** the user is on the first card (no previous swipes), **When** they look for the undo button, **Then** the undo button is not visible or is disabled
4. **Given** the user undoes a swipe, **When** they view the progress indicator, **Then** it reflects the updated (decremented) count

---

### User Story 5 - Results Integration (Priority: P5)

After swiping all cards, the user's responses are processed through the existing matching algorithm to generate a theme profile and candidate ranking. The results screen displays the same information as the current survey results (theme scores, candidate alignment percentages, contradictions).

**Why this priority**: The results screen already exists and works. This story ensures the new swipe responses feed into the existing pipeline correctly.

**Independent Test**: Can be tested by completing the swipe survey and verifying that results show a coherent theme profile, candidate ranking, and detected contradictions.

**Acceptance Scenarios**:

1. **Given** the user has swiped all cards, **When** the last card is swiped, **Then** the system computes a theme profile from all responses
2. **Given** the theme profile is computed, **When** the results screen appears, **Then** it displays theme scores, candidate ranking by alignment, and any detected contradictions
3. **Given** the user swiped "strongly agree" on transport cards and "strongly disagree" on ecology cards, **When** results are shown, **Then** the theme scores reflect higher transport alignment and lower ecology alignment than a simple agree/disagree would produce

---

### Edge Cases

- What happens when the user accidentally swipes in an unintended direction? The undo feature (P4) allows correction, and the drag threshold (P2) minimizes accidental triggers.
- How does the system handle a user who swipes all cards in the same direction? Results are computed normally — this is a valid (if unusual) expression of opinion.
- What happens if the survey data is updated between sessions (new cards added/removed)? Existing incomplete progress is reset, and the user starts the updated survey fresh. Completed results are flagged as potentially stale (existing behavior).
- What happens if the user force-quits the app mid-survey? Progress is saved after each swipe so the user can resume where they left off.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display survey content as a stack of statement cards instead of multiple-choice questions
- **FR-002**: Each statement card MUST display a political affirmation text, its associated theme icon, and theme name
- **FR-003**: The system MUST recognize four distinct swipe directions: left (disagree), right (agree), up (strongly agree / coup de coeur), down (strongly disagree / catastrophe)
- **FR-004**: Each swipe direction MUST map to a different scoring intensity for the card's associated themes (stronger scores for up/down than for right/left)
- **FR-005**: The system MUST animate the card off-screen in the swiped direction upon a valid swipe
- **FR-006**: The system MUST provide real-time visual feedback during the drag gesture indicating which action will be triggered
- **FR-007**: The system MUST enforce a minimum drag threshold before registering a swipe — releasing below the threshold returns the card to its original position
- **FR-008**: The system MUST display a progress indicator showing the current card number and total card count
- **FR-009**: The system MUST provide four accessible buttons as alternatives to swipe gestures, producing identical results
- **FR-010**: The system MUST allow the user to undo their most recent swipe and re-answer that card
- **FR-011**: The system MUST persist survey progress after each swipe so the user can resume an incomplete survey
- **FR-012**: The system MUST feed swipe responses into the existing matching algorithm to compute theme profiles and candidate rankings
- **FR-013**: The system MUST support the existing contradiction detection logic based on swipe-derived theme scores
- **FR-014**: The survey data MUST remain in a bundled, city-agnostic format — statement cards are defined in election-specific data files, not hardcoded
- **FR-015**: The statement cards MUST cover all existing themes (currently 8) with sufficient cards to produce meaningful score differentiation
- **FR-016**: The system MUST respect the user's reduced motion preferences by simplifying or disabling swipe animations accordingly

### Key Entities

- **Statement Card**: A political affirmation associated with one or more themes; contains the statement text, theme associations, and scoring values for each swipe direction
- **Swipe Response**: A user's reaction to a statement card, capturing the card identifier and the swipe direction (agree, disagree, strongly agree, strongly disagree)
- **Theme Score**: A numerical value derived from aggregating all swipe responses for a given theme, used as input to the matching algorithm

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the entire swipe survey in under 2 minutes (improvement over the current multiple-choice format)
- **SC-002**: 90% of users complete the survey once started (reduced abandonment compared to the multiple-choice format)
- **SC-003**: All 8 themes receive at least 2 data points per user to ensure meaningful score differentiation
- **SC-004**: The survey is fully usable via button alternatives alone, without any swipe gestures
- **SC-005**: Survey results (theme profiles, candidate rankings) are consistent with the existing matching algorithm — identical opinion patterns produce comparable rankings regardless of input format
- **SC-006**: The swipe interaction feels responsive with no perceptible lag between the user's gesture and the visual feedback

## Assumptions

- The importance weight slider (currently per-theme in the multiple-choice format) is **removed**. The 4-direction swipe already captures intensity: up/down swipes carry heavier scoring weight than left/right, implicitly weighting themes the user feels strongly about. This simplifies the experience and aligns with the "swipe rapide et fluide" spirit.
- The civic context intro screen (civic facts) remains unchanged and precedes the swipe survey.
- The results screen remains unchanged — it receives theme scores and produces the same output regardless of how scores were collected.
- Statement cards will number approximately 16-20 (2+ per theme) to provide sufficient coverage while keeping the experience under 2 minutes.
- The card order may be shuffled to prevent bias from fixed ordering, but this is an implementation detail.

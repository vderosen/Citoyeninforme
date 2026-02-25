# Feature Specification: Voting Info Cards Redesign

**Feature Branch**: `011-voting-info-redesign`
**Created**: 2026-02-19
**Status**: Draft
**Input**: Redesign the 3 voting information cards on the Home screen (Key Dates, Eligibility Conditions, Voting Methods) to improve readability, visual hierarchy, and aesthetics. Current cards use flat bullet lists that cause layout overflow on long text and lack visual distinction between card types.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan Key Election Dates at a Glance (Priority: P1)

A user opens the app and scrolls to the Key Dates section on the Home screen. They see a vertical timeline showing election milestones in chronological order. Each date is displayed as a compact badge (e.g., "6 FEV 2026") with the event description below it. Dates sharing the same day are grouped into a single timeline entry with merged descriptions. The user can immediately identify which dates have already passed (grayed out), which is the next upcoming date (highlighted), and which are still in the future (outlined).

**Why this priority**: The current layout causes the date to overflow off-screen when the label is long (e.g., "Date limite d'inscription sur les listes electorales"). This is the most visible usability bug and the primary motivation for the redesign.

**Independent Test**: Can be fully tested by loading the Home screen with election data containing dates in past, present, and future. Delivers immediate value by fixing the overflow issue and providing temporal context.

**Acceptance Scenarios**:

1. **Given** the Home screen is loaded with election logistics data, **When** the user views the Key Dates section, **Then** dates are displayed as a vertical timeline with the date badge above the label text (never side-by-side), and no text overflows the card boundaries.
2. **Given** two key dates share the same calendar day (e.g., "Premier tour" and "Cloture maximale des bureaux" both on March 15), **When** the timeline renders, **Then** they appear as a single grouped entry with descriptions joined by a separator.
3. **Given** today's date is between two key dates, **When** the timeline renders, **Then** past dates show a muted visual style, the next upcoming date shows a highlighted/accent style, and future dates show an outlined style.
4. **Given** all key dates are in the past, **When** the timeline renders, **Then** all dates show the muted past style with no highlighted entry.

---

### User Story 2 - Understand Eligibility Conditions Clearly (Priority: P2)

A user scrolls to the Eligibility Conditions section on the Home screen. Instead of a flat bullet list, they see each condition presented in its own numbered sub-card within the parent card. The numbering provides a clear sequential reading order, and the card-based layout makes each condition visually distinct and easy to read independently.

**Why this priority**: The current bullet list is functional but visually flat and hard to scan. Numbered sub-cards provide better readability and visual hierarchy, making important civic information easier to digest.

**Independent Test**: Can be fully tested by loading the Home screen and verifying that eligibility conditions appear as distinct numbered sub-cards within the section, each readable without horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** the Home screen is loaded with eligibility data containing 3 conditions, **When** the user views the Eligibility section, **Then** each condition is displayed in a separate sub-card with a numbered indicator (1, 2, 3) and the condition text beside it.
2. **Given** a condition has a long text (over 100 characters), **When** it renders in a sub-card, **Then** the text wraps naturally within the card and remains fully readable without truncation or overflow.

---

### User Story 3 - Review Voting Methods with Full Details (Priority: P3)

A user scrolls to the Voting Methods section on the Home screen. Each voting method (in-person, proxy, mail) is displayed in its own sub-card with a distinctive icon, a method title, a description, and any applicable requirements shown in a secondary visual style. This allows users to compare methods and understand what each requires.

**Why this priority**: The current layout shows only the method description as a bullet point and hides the requirements data entirely. The redesign surfaces all available information with clear visual hierarchy.

**Independent Test**: Can be fully tested by loading the Home screen and verifying that each voting method shows its icon, title, description, and requirements (when available) in a structured sub-card.

**Acceptance Scenarios**:

1. **Given** the Home screen is loaded with voting methods data, **When** the user views the Voting Methods section, **Then** each method is displayed in a separate sub-card with an icon, a method title, a description, and requirements (if present).
2. **Given** a voting method has no requirements defined, **When** it renders, **Then** the requirements line is not shown (no empty space or placeholder).
3. **Given** each voting method type (in-person, proxy, mail), **When** the card renders, **Then** the icon displayed is visually distinct for each type to help the user differentiate at a glance.

---

### Edge Cases

- What happens when the key dates array is empty? The Key Dates section should not render at all (current behavior preserved).
- What happens when all key dates fall on the same day? They should be grouped into a single timeline entry with all labels merged.
- What happens when the eligibility array is empty? The Eligibility section should not render.
- What happens when a voting method has an unknown `type` value (not in-person, proxy, or mail)? A generic fallback icon should be displayed.
- What happens when the device date cannot be determined for past/next/future classification? All dates should display in the future (outlined) style as a safe default.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Key Dates section MUST display dates in a vertical timeline layout with each date badge positioned above its label text, not beside it.
- **FR-002**: Key dates sharing the same calendar day MUST be grouped into a single timeline entry with their labels merged using a visible separator.
- **FR-003**: Each timeline entry MUST display a visual indicator reflecting its temporal status: past (muted), next upcoming (highlighted with accent), or future (outlined).
- **FR-004**: The temporal classification MUST be computed from the device's current date at render time.
- **FR-005**: The Eligibility Conditions section MUST display each condition in a separate sub-card with a sequential number indicator.
- **FR-006**: The Voting Methods section MUST display each method in a separate sub-card with a type-specific icon, a readable method title, the description text, and the requirements text (when available).
- **FR-007**: The icon displayed for each voting method MUST be visually distinct per method type (in-person, proxy, mail), with a generic fallback for unknown types.
- **FR-008**: All three sections MUST preserve the current conditional rendering behavior: sections with empty data arrays do not render.
- **FR-009**: No text in any card MUST overflow or be truncated — all content MUST wrap naturally within card boundaries.
- **FR-010**: The date grouping logic MUST operate on the rendered component side, not modify the underlying election data.

### Key Entities

- **Timeline Entry**: A grouped key date entry — contains a calendar date, a temporal status (past/next/future), and one or more label descriptions merged from source data entries sharing that date.
- **Eligibility Step**: An ordered condition — contains a sequence number and descriptive text.
- **Voting Method Card**: A method of voting — contains a type identifier (in-person, proxy, mail), an icon, a display title, a description, and optional requirements.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No text in any voting info card overflows or gets clipped on a standard mobile screen width (320px minimum).
- **SC-002**: Users can identify the next upcoming election date within 2 seconds of viewing the Key Dates section (validated by the highlighted visual indicator being immediately visible).
- **SC-003**: All voting method requirements that exist in the data are visible to the user without additional interaction (no hidden data).
- **SC-004**: The number of distinct visual elements in the Key Dates timeline is reduced compared to the raw data count when dates share the same day (validated by grouping: 6 raw entries become 4 displayed entries for the Paris 2026 dataset).
- **SC-005**: Each of the 3 card sections has a visually distinct presentation style appropriate to its content type (timeline for dates, numbered cards for conditions, icon cards for methods).

## Assumptions

- The device's local date/time is reliable for determining past/next/future classification. No server-side time source is needed.
- The existing `ElectionLogistics` data schema (keyDates, eligibility, votingMethods) remains unchanged — no data migration required.
- The `date` field in key dates is in ISO format (YYYY-MM-DD) and can be parsed for comparison and display formatting.
- The voting method `type` field uses a known set of values: "in-person", "proxy", "mail". Any other value gets a fallback treatment.
- The redesign is purely visual — no new user interactions (tapping, expanding, navigating) are introduced.
- French locale date formatting is used for the date badge display (e.g., "6 FEV", "15 MARS").

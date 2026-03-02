# Feature Specification: Candidates Grid Redesign

**Feature Branch**: `010-candidates-grid-redesign`
**Created**: 2026-02-19
**Status**: Draft
**Input**: Redesign the candidates page gallery from a 2-column card grid with square images to a compact 3-column grid with circular avatars, uniform card sizes, and no scrolling required.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse All Candidates At a Glance (Priority: P1)

As a voter opening the candidates tab, I want to see all candidates displayed on a single screen without scrolling, so I can quickly scan and identify who is running in the election.

**Why this priority**: The primary purpose of the candidates page is rapid candidate discovery. If users must scroll to find candidates, some candidates get less visibility, which violates the neutrality principle (Constitution Principle I).

**Independent Test**: Can be fully tested by opening the candidates tab on a standard mobile device and verifying all candidates are visible without any scrolling action.

**Acceptance Scenarios**:

1. **Given** 7 candidates are loaded, **When** the user opens the candidates tab, **Then** all 7 candidates are visible on screen without scrolling on a standard mobile device (360px+ width, 640px+ height).
2. **Given** the candidates tab is displayed, **When** the user views the page, **Then** each candidate shows a photo, their name, and their party affiliation.
3. **Given** fewer than 7 candidates exist, **When** the user opens the candidates tab, **Then** all candidates are still displayed in a centered, balanced grid layout.

---

### User Story 2 - Uniform Visual Treatment of All Candidates (Priority: P1)

As a voter, I want all candidate cards to be the same size with consistently displayed photos, so that no candidate appears visually more prominent than another.

**Why this priority**: Equal visual treatment is a direct expression of the neutrality principle. Unequal card/photo sizes create an unconscious visual bias toward certain candidates.

**Independent Test**: Can be tested by visually inspecting the candidates grid and measuring that all cards have identical dimensions and all photos have identical display size.

**Acceptance Scenarios**:

1. **Given** 7 candidates with photos of varying source dimensions, **When** the gallery renders, **Then** all candidate photos display at the same fixed size.
2. **Given** candidates with names and party names of varying lengths, **When** the gallery renders, **Then** all candidate cards have identical height and width.
3. **Given** an odd number of candidates (e.g., 7), **When** the gallery renders, **Then** the last row's card(s) are the same size as cards in full rows (no stretching to fill the row).

---

### User Story 3 - Navigate to Candidate Detail (Priority: P2)

As a voter, I want to tap on any candidate in the grid to see their detailed profile, so I can learn more about their platform and proposals.

**Why this priority**: Candidate discovery is useless without the ability to drill into details. This preserves existing navigation functionality.

**Independent Test**: Can be tested by tapping each candidate card and verifying navigation to the correct candidate detail page.

**Acceptance Scenarios**:

1. **Given** the candidates grid is displayed (normal context), **When** the user taps a candidate card, **Then** the app navigates to that candidate's detail page.
2. **Given** the user is viewing a candidate detail page, **When** they navigate back, **Then** they return to the candidates grid in the same state.

---

### User Story 4 - Compare Candidates (Priority: P2)

As a voter, I want to select multiple candidates for comparison from the redesigned grid, so I can evaluate their programs side by side.

**Why this priority**: Comparison context is an existing feature that must continue to work with the new grid layout.

**Independent Test**: Can be tested by entering compare context, selecting 2-4 candidates, and confirming comparison navigates to the comparison view.

**Acceptance Scenarios**:

1. **Given** the candidates grid is displayed, **When** the user taps the "Compare" floating button, **Then** the grid enters compare context with selection indicators on each card.
2. **Given** compare context is active, **When** the user taps a candidate card, **Then** the candidate is toggled selected/unselected with a visible indicator.
3. **Given** compare context is active and 2+ candidates are selected, **When** the user taps "Confirm", **Then** the app navigates to the comparison view with the selected candidates.
4. **Given** compare context is active, **When** the user taps "Cancel", **Then** compare context exits and selection is cleared.

---

### Edge Cases

- What happens when a candidate has no photo? A placeholder avatar is displayed at the same fixed size as other candidate photos.
- What happens on very small screens (< 360px width)? The grid adapts with slightly smaller avatar sizes while maintaining 3 columns.
- What happens on tablets or large screens? The grid remains centered with a maximum content width, cards do not stretch excessively.
- What happens when the daily shuffle reorders candidates? Layout remains uniform regardless of candidate order.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display candidates in a 3-column grid layout.
- **FR-002**: System MUST display each candidate's photo as a circular avatar of fixed size (identical across all candidates).
- **FR-003**: System MUST crop/scale candidate photos uniformly using a cover fit strategy, so all photos fill their circular frame regardless of source image dimensions.
- **FR-004**: System MUST display each candidate's name and party affiliation below their avatar, center-aligned.
- **FR-005**: All candidate cards MUST have identical fixed height, regardless of content length.
- **FR-006**: Text content (name, party) MUST be truncated with ellipsis if it exceeds the available width, preventing card size variation.
- **FR-007**: System MUST display all candidates (up to 9) on a single screen without requiring vertical scrolling on standard mobile devices (360x640px minimum).
- **FR-008**: System MUST display a party color indicator on each candidate card (e.g., as a colored border ring around the avatar or an accent element).
- **FR-009**: When the number of candidates does not fill the last row, remaining cards MUST be centered rather than left-aligned, to maintain visual balance.
- **FR-010**: System MUST continue to support compare context with visual selection indicators adapted to the new circular avatar layout.
- **FR-011**: Tapping a candidate card in normal context MUST navigate to the candidate's detail page.
- **FR-012**: System MUST show a placeholder avatar when a candidate has no photo, at the same size as photo avatars.
- **FR-013**: System MUST continue to apply a deterministic daily shuffle to the candidate display order (neutrality).

### Key Entities

- **Candidate Card**: Visual representation of a candidate in the grid — contains circular photo avatar, name label, party label, and party color accent. Fixed dimensions.
- **Candidate Grid**: The 3-column layout container that arranges candidate cards with uniform spacing and centers incomplete rows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All candidate cards render at identical dimensions on any given device, with zero visible size variation.
- **SC-002**: All candidate photos display at the same circular size with no distortion or uneven cropping.
- **SC-003**: All candidates (up to 9) are visible on a single screen without scrolling on devices with 360px+ width and 640px+ height.
- **SC-004**: Users can navigate to any candidate's detail page in a single tap from the grid.
- **SC-005**: Compare context selection and confirmation work correctly with the new layout.
- **SC-006**: The candidates page loads and renders the complete grid within 1 second of data being available.

## Assumptions

- The current candidate count for Paris 2026 MVP is 7. The grid design supports up to 9 candidates in a 3-column layout without scrolling. If more than 9 candidates are added in the future, scrolling would become acceptable.
- "Standard mobile device" is defined as 360px minimum width and 640px minimum height, covering 95%+ of active mobile devices.
- The existing compare context FAB button and confirmation bar will remain as-is; only the grid items and their layout change.
- The daily shuffle mechanism is preserved unchanged; only the visual rendering of each item changes.
- Party color display shifts from a horizontal bar at the top of the card to a ring/border around the circular avatar, maintaining the same visual identification function.

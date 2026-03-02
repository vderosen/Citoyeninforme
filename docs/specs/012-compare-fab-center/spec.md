# Feature Specification: Compare FAB Centering & Overlay Bar

**Feature Branch**: `012-compare-fab-center`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "Center the compare FAB button and make the confirmation bar a bottom overlay on the candidates page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centered Compare Button (Priority: P1)

A user opens the candidates page and sees a "Compare" action button centered at the bottom of the screen. The centered position makes it immediately visible and easy to reach with either thumb, regardless of handedness. The button is clearly the primary call to action on this page.

**Why this priority**: The off-center FAB is the most visible layout issue. Centering it improves discoverability and accessibility for all users.

**Independent Test**: Can be tested by opening the candidates page and verifying the compare button is horizontally centered at the bottom of the screen.

**Acceptance Scenarios**:

1. **Given** the candidates page is displayed with 2 or more candidates, **When** the user views the page, **Then** the "Compare" button is horizontally centered at the bottom of the screen.
2. **Given** fewer than 2 candidates are available, **When** the user views the page, **Then** no compare button is displayed.
3. **Given** the compare context is active, **When** the user views the page, **Then** the compare button is hidden (replaced by the confirmation bar).

---

### User Story 2 - Overlay Confirmation Bar (Priority: P1)

A user taps the compare button and enters compare context. A confirmation bar appears overlaid at the bottom of the screen, in the same visual zone where the compare button was. This creates a smooth visual transition: the button disappears and the bar takes its place. There is no empty gap between the candidate grid and the confirmation bar.

**Why this priority**: The empty space between the grid and the confirmation bar is a usability issue that breaks the visual flow. Fixing it together with the FAB centering delivers a coherent experience.

**Independent Test**: Can be tested by tapping the compare button and verifying the confirmation bar appears at the bottom of the screen as an overlay, without leaving empty space below the candidate grid.

**Acceptance Scenarios**:

1. **Given** the user is on the candidates page, **When** they tap the compare button, **Then** the compare button disappears and a confirmation bar appears overlaid at the bottom of the screen.
2. **Given** the confirmation bar is visible, **When** the user selects candidates, **Then** the bar remains fixed at the bottom of the screen, showing the updated selection count.
3. **Given** the confirmation bar is visible, **When** the user taps the cancel button, **Then** the bar disappears and the centered compare button reappears in its original position.
4. **Given** the user has selected 2 or more candidates, **When** they tap the confirm button on the bar, **Then** the comparison view opens and the candidates page returns to its default state (centered compare button visible).

---

### Edge Cases

- What happens on very small screens (320px width)? The centered FAB must remain fully visible and tappable without overflowing.
- What happens if the confirmation bar content is longer than expected (e.g., localized text)? The bar must not overflow or clip text.
- What happens when the user rotates the device? The FAB must remain centered and the bar must remain at the bottom.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The compare button MUST be horizontally centered at the bottom of the candidates page.
- **FR-002**: The compare button MUST maintain a minimum touch target size of 48x48 points.
- **FR-003**: The compare confirmation bar MUST appear as an overlay at the bottom of the screen, on top of any content below.
- **FR-004**: The confirmation bar MUST NOT cause the candidate grid to reflow or shift when it appears or disappears.
- **FR-005**: The confirmation bar MUST remain at the bottom of the screen regardless of grid content height.
- **FR-006**: The visual transition between the compare button and the confirmation bar MUST feel continuous (same bottom-of-screen zone).
- **FR-007**: All existing compare context functionality MUST be preserved (selection, count display, cancel, confirm, max 4 candidates, min 2 to confirm).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The compare button is horizontally centered on the screen (equal horizontal margins on both sides).
- **SC-002**: No empty vertical gap is visible between the candidate grid and the confirmation bar when compare context is activated.
- **SC-003**: The full compare flow (tap button, select candidates, confirm) completes without any layout shift or content jump.
- **SC-004**: The compare button and confirmation bar are fully visible and tappable on screens as small as 320x568 points.

## Scope

### In Scope

- Repositioning the compare FAB button from bottom-right to bottom-center
- Changing the confirmation bar from in-flow layout to bottom overlay positioning
- Preserving all existing compare context behavior

### Out of Scope

- Changing the compare button's visual design (colors, icon, text)
- Changing the confirmation bar's internal layout (cancel, count, confirm arrangement)
- Modifying the candidate grid layout
- Adding animations to the transition between button and bar
- Changes to any screen other than the candidates page

## Assumptions

- The candidate grid already fits on screen without scrolling (established by feature 010).
- The confirmation bar height is consistent and does not vary dynamically.
- No new dependencies or libraries are required for this change.

# Feature Specification: Candidates Page UI Polish

**Feature Branch**: `020-candidates-page-polish`
**Created**: 2026-02-21
**Status**: Draft
**Input**: User description: "Polish UI/UX de la page Candidats — améliorer le rendu visuel sans changer la logique existante"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Candidate Selection with Visual Clarity (Priority: P1)

A user opens the Candidates tab and sees all 7 candidates displayed as clean circular avatars in a compact grid. Selected candidates are visually distinguished by a colored ring matching their party color and a bold name. Unselected candidates appear muted. When the maximum selection (4) is reached, remaining candidates appear clearly disabled.

**Why this priority**: The avatar bar is the entry point to the entire page. A polished, intuitive selector sets the tone for the professional feel of the whole experience.

**Independent Test**: Can be tested by opening the Candidates tab and tapping candidates to select/deselect them.

**Acceptance Scenarios**:

1. **Given** the user opens the Candidates tab, **When** no candidate is selected, **Then** all avatars appear as muted circles (reduced opacity) with candidate last names below
2. **Given** the user taps a candidate avatar, **When** the candidate is selected, **Then** the avatar shows a party-colored ring and the name appears in bold with full opacity
3. **Given** 4 candidates are already selected, **When** the user views remaining candidates, **Then** unselected avatars appear visually disabled (very low opacity)

---

### User Story 2 - Candidate Profile with Visual Hierarchy (Priority: P1)

When a single candidate is selected, the user sees a professional-looking profile with a hero header area tinted in the candidate's party color, a large avatar, the candidate name prominently displayed, and the party shown as a colored badge. Sections (bio, positions, action) are clearly separated with dividers and generous spacing.

**Why this priority**: The single-candidate profile is the most viewed state and needs the strongest visual identity to feel professional.

**Independent Test**: Can be tested by selecting one candidate and reviewing the profile card layout.

**Acceptance Scenarios**:

1. **Given** one candidate is selected, **When** the profile displays, **Then** the header area has a subtle party-colored background tint
2. **Given** one candidate is selected, **When** the profile displays, **Then** the avatar is large (112px), the name is prominent, and the party appears as a colored chip
3. **Given** one candidate is selected, **When** scrolling the profile, **Then** bio, positions, and action sections are visually separated by dividers with clear spacing

---

### User Story 3 - Position Exploration with Polished Cards (Priority: P2)

The user browses candidate positions by theme. Each position card has a subtle left-side color accent and clear visual depth. The "Details" toggle is right-aligned and discrete. Expanding details reveals content with a smooth fade animation.

**Why this priority**: Position cards are the core content of the candidate page but currently feel flat and utilitarian.

**Independent Test**: Can be tested by selecting a candidate, switching themes, and expanding/collapsing position details.

**Acceptance Scenarios**:

1. **Given** a candidate is selected and positions are displayed, **When** viewing a position card, **Then** the card has a colored left-side accent bar and a subtle border for depth
2. **Given** a position card is visible, **When** tapping the details toggle, **Then** details appear with a smooth fade animation
3. **Given** details are expanded, **When** tapping the toggle again, **Then** details disappear with a fade-out animation
4. **Given** a position card is visible, **When** viewing the layout, **Then** the "Details" toggle is right-aligned with chevron on the right

---

### User Story 4 - Readable Theme Navigation (Priority: P2)

The theme tab bar displays both emoji icons and short text labels for each theme, making it immediately clear what each tab represents without guessing. The redundant separate theme label below the bar is removed.

**Why this priority**: Emoji-only tabs require guessing; adding labels improves usability and accessibility.

**Independent Test**: Can be tested by viewing the theme bar and verifying each tab shows an emoji with a label beneath it.

**Acceptance Scenarios**:

1. **Given** themes are displayed in the tab bar, **When** viewing the tabs, **Then** each tab shows the theme emoji with a short text label underneath
2. **Given** a theme is active, **When** viewing the tab bar, **Then** the active tab label appears in the primary color and the inactive labels appear muted
3. **Given** a theme is selected, **When** viewing the profile card, **Then** no separate theme name label is displayed below the tab bar (redundancy removed)

---

### User Story 5 - Discreet Chat Shortcut (Priority: P3)

The debate shortcut button appears as a discreet outlined button with a chat icon, centered rather than spanning full width. It serves as a secondary action since a dedicated chat tab exists.

**Why this priority**: The button should exist as a convenience, not a primary call-to-action.

**Independent Test**: Can be tested by selecting a candidate and verifying the "Parler" button styling.

**Acceptance Scenarios**:

1. **Given** one candidate is selected, **When** viewing the action button, **Then** it appears as an outlined button (not filled) with a chat icon and centered layout
2. **Given** the button is visible, **When** tapping it, **Then** it navigates to the assistant chat (behavior unchanged)

---

### User Story 6 - Polished Comparison View (Priority: P3)

When 2-4 candidates are selected, the comparison view displays cards with slightly more visual depth, a more prominent party color bar, and detail text truncated to prevent overwhelming long blocks.

**Why this priority**: The comparison view works well but small visual refinements complete the professional feel.

**Independent Test**: Can be tested by selecting 2+ candidates and verifying comparison card styling.

**Acceptance Scenarios**:

1. **Given** 2+ candidates are selected, **When** viewing comparison cards, **Then** each card has a subtle shadow and the party color bar is slightly taller
2. **Given** a comparison card shows position details, **When** the detail text is long, **Then** it is truncated to a reasonable number of lines

---

### Edge Cases

- What happens when a candidate has no photo? The avatar shows initials with party-colored background (existing behavior, preserved)
- What happens on very small screens (< 360px width)? The avatar grid remains a 4+3 layout with reduced gap if needed
- What happens with reduced motion accessibility settings? All animations (fade, scale) are disabled
- What happens when a theme name is very long? Only a short label is shown under the emoji to keep it compact

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Avatar bar MUST display all candidates as circular avatars without rectangular background boxes
- **FR-002**: Selected candidate avatars MUST show a party-colored ring border and full opacity with bold name
- **FR-003**: Unselected candidate avatars MUST appear at reduced opacity without ring border
- **FR-004**: Disabled candidates (max reached) MUST appear at very low opacity, distinguishable from unselected
- **FR-005**: Candidate profile header MUST display a subtle party-colored background tint behind the avatar area
- **FR-006**: Candidate avatar in profile MUST be 112px (up from 96px)
- **FR-007**: Candidate name in profile MUST use a larger text size than current
- **FR-008**: Party name MUST be displayed as a colored chip/badge using the party color
- **FR-009**: Profile sections (header, bio, positions, action) MUST be visually separated by dividers
- **FR-010**: Section spacing MUST be increased for visual breathing room
- **FR-011**: Position cards MUST have a colored left-side accent bar
- **FR-012**: Position details toggle MUST be right-aligned (not centered)
- **FR-013**: Position detail expand/collapse MUST be animated with fade transition
- **FR-014**: Position cards MUST have a subtle border for visual depth
- **FR-015**: Theme tab bar MUST display a short text label below each theme emoji
- **FR-016**: The separate active theme name label below the tab bar MUST be removed
- **FR-017**: "Parler" button MUST use an outlined/secondary style (not filled primary)
- **FR-018**: "Parler" button MUST include a chat icon and be centered (not full-width)
- **FR-019**: Comparison view cards MUST have a subtle card shadow
- **FR-020**: Comparison view party color bar MUST be taller than current
- **FR-021**: Comparison view detail text MUST be truncated with a line limit
- **FR-022**: All animations MUST respect the user's reduced motion accessibility settings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All candidates remain simultaneously visible on the selection bar without scrolling
- **SC-002**: Users can distinguish selected, unselected, and disabled candidates at a glance through distinct visual states
- **SC-003**: Candidate profile conveys party identity within the first second of viewing (colored background, badge)
- **SC-004**: Profile sections are clearly distinguishable without reading section headers
- **SC-005**: Theme tabs are identifiable without relying solely on emoji recognition
- **SC-006**: Position card expand/collapse feels smooth with no abrupt layout jumps
- **SC-007**: No existing functionality or navigation is altered — all interactions behave identically to before
- **SC-008**: All interactive elements maintain minimum 44px touch targets and proper accessibility labels

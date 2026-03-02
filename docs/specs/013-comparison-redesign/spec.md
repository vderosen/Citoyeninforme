# Feature Specification: Comparison Tab Redesign

**Feature Branch**: `013-comparison-redesign`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "Fix comparison tab bugs (candidate pre-selection, theme icons as text) and redesign candidate cards with avatars, uniform height, and better visual hierarchy"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless comparison from candidate selection (Priority: P1)

A user browses the candidates gallery, enters compare context, selects 2-4 candidates, and taps "Voir la comparaison." The comparison screen opens with those exact candidates already selected and their positions displayed side-by-side for the first theme. The user can immediately start reading and comparing without any additional steps.

**Why this priority**: This is the core comparison flow. Currently it is broken — selected candidates are not carried over to the comparison screen, forcing users to re-select them manually. This makes the entire comparison feature feel unusable.

**Independent Test**: Can be fully tested by selecting 2 candidates from the gallery, tapping "Voir la comparaison", and verifying both candidates appear pre-selected with their positions visible immediately.

**Acceptance Scenarios**:

1. **Given** a user has selected 2 candidates in compare context, **When** they tap "Voir la comparaison," **Then** the comparison screen opens with those 2 candidates already selected and their positions displayed for the first theme.
2. **Given** a user has selected 4 candidates in compare context, **When** they tap "Voir la comparaison," **Then** the comparison screen opens with all 4 candidates pre-selected.
3. **Given** a user arrives on the comparison screen with pre-selected candidates, **When** they look at the candidate selector pills, **Then** the pre-selected candidates are visually highlighted (distinct from unselected ones).

---

### User Story 2 - Theme icons display correctly (Priority: P1)

A user browsing the comparison screen sees theme filter pills with recognizable graphical icons (e.g., a train for Transport, a house for Logement) next to each theme name, instead of raw text words like "wallet" or "palette." The active theme header also shows the icon graphically.

**Why this priority**: The current display of icon names as raw text makes the interface look broken and unprofessional. This is a visual bug that affects every user's perception of the app.

**Independent Test**: Can be tested by opening the comparison screen and verifying that each theme pill displays a graphical icon (not a text word) next to the theme name.

**Acceptance Scenarios**:

1. **Given** the comparison screen is loaded with themes, **When** the user views the theme filter pills, **Then** each pill displays a graphical icon followed by the theme name (not the icon's text identifier).
2. **Given** a theme is selected, **When** the active theme header is shown above the comparison cards, **Then** the header displays the graphical icon next to the theme name.
3. **Given** any of the 8 themes (Transport, Logement, Securite, Ecologie, Budget, Culture, Education, Social), **When** displayed in the filter or header, **Then** the corresponding graphical icon is visible and recognizable.

---

### User Story 3 - Visually polished candidate comparison cards (Priority: P2)

A user comparing candidates sees well-designed, uniform-height cards for each candidate. Each card displays a circular avatar (showing the candidate's initials on a background matching the party color), the candidate's full name prominently, the party name as a subtitle, and the position content below with clear visual hierarchy.

**Why this priority**: While the comparison works logically, the current cards are visually poor — no photo/avatar, variable heights, and flat hierarchy. Better cards make it easier to scan and compare candidates at a glance.

**Independent Test**: Can be tested by selecting 2+ candidates and verifying the cards display avatars with initials, have consistent heights, and show name/party/position in a clear hierarchy.

**Acceptance Scenarios**:

1. **Given** 2 candidates are selected for comparison, **When** their cards are displayed, **Then** each card shows a circular avatar with the candidate's initials on a party-colored background.
2. **Given** 2 candidates are selected, **When** their comparison cards are displayed side by side, **Then** the cards have the same height (aligned tops and bottoms).
3. **Given** a candidate card is displayed, **When** the user reads it, **Then** the candidate name is the most prominent text, followed by the party name in a smaller/lighter style, followed by the position content.
4. **Given** a candidate has no documented position for the selected theme, **When** their card is displayed, **Then** the card still maintains the same height as other cards, with the "non documented" state clearly indicated.

---

### User Story 4 - Enhanced candidate selector pills (Priority: P3)

In the candidate selector row at the top of the comparison screen, each pill shows a small circular avatar (initials + party color) alongside the candidate's name, making it quicker to identify and select candidates visually.

**Why this priority**: This is a visual polish improvement. The current plain text pills work but are harder to scan quickly. Adding mini avatars makes identification faster, especially when users are familiar with party colors.

**Independent Test**: Can be tested by opening the comparison screen and verifying each candidate pill in the horizontal selector shows a small avatar circle next to the name.

**Acceptance Scenarios**:

1. **Given** the comparison screen is loaded, **When** the user views the candidate selector row, **Then** each pill shows a small circular avatar (initials + party color) to the left of the candidate name.
2. **Given** a candidate pill is selected, **When** the user views it, **Then** it is visually distinct from unselected pills (highlighted border/background) while still showing the avatar.

---

### Edge Cases

- What happens when a candidate has no party color defined? The avatar falls back to a neutral default color.
- What happens when a candidate's name is very long? The name truncates with ellipsis within the card and pill, preserving layout alignment.
- What happens when the `selected` parameter in the URL is empty or contains invalid candidate IDs? The comparison screen shows no pre-selected candidates and displays the "select at least 2 candidates" prompt.
- What happens when only 1 valid candidate ID is passed? The screen shows that candidate selected but still displays the minimum-candidates prompt until a second candidate is selected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The comparison screen MUST parse the `selected` route parameter as a comma-separated list of candidate IDs and pre-select all matching candidates on load.
- **FR-002**: Theme icons MUST be rendered as graphical icons (not raw text) in the theme filter pills.
- **FR-003**: Theme icons MUST be rendered as graphical icons in the active theme header above comparison cards.
- **FR-004**: Each candidate comparison card MUST display a circular avatar showing the candidate's initials (first letter of first name + first letter of last name) on a background matching the candidate's party color.
- **FR-005**: Candidate comparison cards MUST have uniform height within the same row, regardless of position content length (overflow content scrolls or truncates).
- **FR-006**: Candidate comparison cards MUST display the candidate name prominently, followed by the party name in a smaller/lighter style, then position content.
- **FR-007**: Each candidate selector pill at the top of the comparison screen MUST display a small circular avatar (initials + party color) alongside the candidate name.
- **FR-008**: Invalid or unrecognized candidate IDs in the `selected` parameter MUST be silently ignored without causing errors.
- **FR-009**: When a candidate has no defined party color, the avatar MUST use a neutral default color.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users who select candidates from the gallery and navigate to the comparison screen see those exact candidates pre-selected 100% of the time (currently 0% due to bug).
- **SC-002**: All 8 theme filter pills display recognizable graphical icons instead of text words.
- **SC-003**: Candidate comparison cards within the same row have identical heights regardless of content length.
- **SC-004**: Every candidate card and selector pill displays a circular avatar with the candidate's initials.
- **SC-005**: The complete flow from candidate selection to comparison viewing requires zero additional taps after arriving on the comparison screen (pre-selection works seamlessly).

## Assumptions

- Candidate initials are derived from the first letter of the first name and first letter of the last name (e.g., "David Belliard" = "DB").
- The existing icon names in the theme data (e.g., "train", "home", "shield") correspond to valid icons in the app's icon library.
- No new data fields need to be added to the candidate or theme data schemas.
- The party color for each candidate is either already available in the data or can be derived from existing fields.

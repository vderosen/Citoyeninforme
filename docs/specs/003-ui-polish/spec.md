# Feature Specification: UI Polish — Navigation & Information Hierarchy

**Feature Branch**: `003-ui-polish`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Rebuild frontend to eliminate redundant election info display, add proper navigation structure with a top bar and tab icons, and improve the visual hierarchy of the home screen to look professional."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clear Screen Identity (Priority: P1)

As a user navigating between tabs, I see a clean, professional top area on each screen that tells me where I am without repeating the same election metadata everywhere. The election context (city, election type, year) appears only once on the home screen — not as a persistent banner across every tab.

**Why this priority**: The current persistent election banner creates visual redundancy (identical info shown twice on the home screen) and wastes vertical space on screens where it adds no value. Removing it is the single highest-impact change for perceived professionalism.

**Independent Test**: Can be fully tested by navigating across all tabs and pushed screens, verifying election info appears exactly once (on home) and each screen has a clear, distinct title.

**Acceptance Scenarios**:

1. **Given** the user is on the home screen, **When** the screen loads, **Then** the election context (city, election type, year) is displayed exactly once in the hero area — not duplicated in a separate banner above it.
2. **Given** the user switches to the Assistant tab, **When** the tab loads, **Then** the screen displays a title ("Assistant") at the top — not the election metadata banner.
3. **Given** the user switches to the Candidats tab, **When** the tab loads, **Then** the screen displays a title ("Candidats") at the top — not the election metadata banner.
4. **Given** the user is on any tab, **When** comparing the top area to the previous design, **Then** no persistent election info banner is visible across all screens.

---

### User Story 2 - Professional Tab Bar (Priority: P2)

As a user, I see icons alongside text labels in the bottom tab bar, matching the visual standard of mainstream mobile apps. Each tab has a recognizable icon that helps me identify tabs at a glance.

**Why this priority**: A text-only tab bar is the most visible marker of an unfinished app. Adding icons is a high-impact, low-effort change that immediately raises perceived quality.

**Independent Test**: Can be tested by visually inspecting the tab bar on every screen, confirming each tab displays both an icon and a label, with correct active/inactive color states.

**Acceptance Scenarios**:

1. **Given** the user is on any tab, **When** looking at the bottom tab bar, **Then** each tab displays an icon above its text label.
2. **Given** the user taps a tab, **When** the tab becomes active, **Then** both the icon and label change to the active color.
3. **Given** the user is on a different tab, **When** looking at inactive tabs, **Then** both icons and labels appear in the inactive/muted color.
4. **Given** a screen reader is active, **When** focusing on a tab, **Then** the accessibility label announces the tab name (icon is decorative only).

---

### User Story 3 - Navigation Headers on Pushed Screens (Priority: P2)

As a user navigating to a candidate detail page, comparison view, or survey flow, I see a header bar with a back arrow and a descriptive title, so I always know where I am and how to go back.

**Why this priority**: Currently pushed screens have no header, relying on in-page buttons or swipe gestures for navigation. This breaks standard mobile UX conventions and leaves users disoriented.

**Independent Test**: Can be tested by navigating to each pushed screen (candidate detail, comparison, survey steps) and verifying a header with back navigation and title is present.

**Acceptance Scenarios**:

1. **Given** the user taps a candidate card, **When** the candidate detail screen opens, **Then** a header appears at the top with a back arrow and the candidate's name as the title.
2. **Given** the user is on the comparison screen, **When** the screen loads, **Then** a header displays "Comparaison" with a back arrow.
3. **Given** the user is in the survey flow, **When** on any survey step, **Then** a header displays a contextual title (e.g., "Questionnaire civique") with a back arrow.
4. **Given** the user taps the back arrow on any pushed screen, **When** the arrow is pressed, **Then** the user returns to the previous screen.

---

### User Story 4 - Streamlined Home Screen Hierarchy (Priority: P3)

As a user landing on the home screen, I see a clear visual hierarchy: a concise election heading, a prominent primary action, and well-organized secondary content — rather than a wall of same-weight cards and buttons.

**Why this priority**: The home screen currently stacks 6+ blocks vertically with similar visual weight. Tightening the hero area and differentiating the primary call-to-action improves scannability and guides users to the most important action first.

**Independent Test**: Can be tested by viewing the home screen and verifying: (a) election heading is concise (single line), (b) the primary action button is visually dominant over secondary actions, (c) the theme section has a visible title.

**Acceptance Scenarios**:

1. **Given** the user lands on the home screen, **When** viewing the hero area, **Then** the election context is displayed as a concise single-line heading (e.g., "Municipales Paris 2026") without a separate large city name.
2. **Given** the user views the action buttons, **When** comparing the primary action (survey) to secondary actions (candidates, ask question), **Then** the primary action is visually larger or more prominent than the secondary actions.
3. **Given** the user scrolls to the theme section, **When** viewing the horizontal theme list, **Then** a section title (e.g., "Explorer par theme") is displayed above it.
4. **Given** the user views the home screen, **When** comparing to the previous design, **Then** the "last updated" date is no longer displayed at the top of the screen — it is either removed or moved to a subtle location at the bottom of the scroll area.

---

### Edge Cases

- What happens when the election data is still loading? The screen headers should still display (with title only), and the home hero should show a placeholder or loading state.
- What happens on screens outside the tab navigator (survey, candidate detail) — do they show the tab bar? No, pushed screens should hide the tab bar and show only the navigation header.
- What happens when the candidate name is very long in the detail header? The title should truncate with ellipsis rather than wrapping to multiple lines.
- What happens with the "last updated" date — is it removed entirely? It should be relocated to a subtle footnote at the bottom of the home screen scroll area, preserving transparency without cluttering the top.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST NOT display a persistent election-info banner across all screens. Election context (city, election type, year) MUST appear only on the home screen.
- **FR-002**: Each tab screen MUST display a screen-level header with the screen title (home screen may use the app name or election heading instead of a generic title).
- **FR-003**: Each tab in the bottom tab bar MUST display both an icon and a text label.
- **FR-004**: Tab icons and labels MUST visually reflect the active/inactive state using distinct colors.
- **FR-005**: All pushed screens (candidate detail, comparison, survey flow) MUST display a navigation header with a back arrow and a contextual title.
- **FR-006**: The back arrow on pushed screen headers MUST navigate the user to the previous screen.
- **FR-007**: The home screen hero area MUST display the election context as a concise heading (city, election type, and year on a single line or compact layout) without duplicating it in a separate banner.
- **FR-008**: The primary action on the home screen (survey) MUST be visually differentiated from secondary actions (view candidates, ask a question) through size, styling, or layout prominence.
- **FR-009**: The horizontal theme list on the home screen MUST have a visible section title above it.
- **FR-010**: The "last updated" date MUST NOT appear at the top of any screen. If retained, it MUST be displayed as a subtle footnote at the bottom of the home screen scrollable content.
- **FR-011**: Accessibility labels MUST be maintained or improved on all modified elements (headers, tab icons, back buttons).
- **FR-012**: Tab icons MUST be treated as decorative for screen readers (the text label remains the accessible name).

### Assumptions

- The current 3-tab structure (Home, Assistant, Candidats) is preserved. No new tabs are added or removed.
- The existing core logic (data loading, survey matching, chatbot, candidate data) is not modified.
- The visual design stays within the existing color palette (blue-600 primary, gray scale secondary) unless minor refinements are needed for header styling.
- The onboarding screen is out of scope — its layout is not modified in this feature.
- Icon choices for tabs should be intuitive and universally recognizable (e.g., home icon, chat bubble, people/group icon).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Election metadata (city, type, year) appears on exactly 1 screen (home) instead of being repeated on every screen.
- **SC-002**: 100% of tab bar tabs display both an icon and a text label on all platforms.
- **SC-003**: 100% of pushed screens (candidate detail, comparison, all survey steps) display a navigation header with a functional back button.
- **SC-004**: The home screen displays no more than one instance of the election heading, with the "last updated" date removed from the top area.
- **SC-005**: All existing accessibility labels are preserved; new interactive elements (back buttons, tab icons) include appropriate accessibility attributes.
- **SC-006**: No visual regression on existing screens — all current content and functionality remains accessible after the layout changes.

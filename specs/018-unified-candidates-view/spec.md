# Feature Specification: Unified Candidates View

**Feature Branch**: `018-unified-candidates-view`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Merge the candidates grid, individual candidate profile, and comparison view into a single adaptive screen. The candidate avatar bar is always visible at the top. Selecting one candidate shows their profile; selecting two or more shows a side-by-side comparison."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Select a Single Candidate (Priority: P1)

A user opens the "Candidats" tab and sees all candidates displayed as selectable avatars at the top of the screen. They tap on one candidate to learn about them. The screen instantly reveals that candidate's profile below the avatar bar: their photo, name, party affiliation, a brief biography, and their positions organized by theme. The user can browse different themes to read the candidate's stance on each topic.

**Why this priority**: This is the most fundamental interaction — viewing a single candidate's profile is the primary use case and must work flawlessly before multi-selection makes sense.

**Independent Test**: Can be fully tested by tapping any candidate avatar and verifying their complete profile appears below, with all themes navigable. Delivers immediate value as a candidate information browser.

**Acceptance Scenarios**:

1. **Given** the user is on the Candidats tab with no selection, **When** they tap a candidate avatar, **Then** the avatar is highlighted and the candidate's full profile (photo, name, party, biography, themed positions) appears below the avatar bar.
2. **Given** the user is viewing a candidate's profile, **When** they tap a different theme, **Then** the position card updates to show the selected candidate's stance on that theme.
3. **Given** the user is viewing a candidate's profile, **When** they tap the same candidate's avatar again, **Then** the selection is cleared and the empty state is shown.

---

### User Story 2 - Compare Multiple Candidates (Priority: P1)

A user wants to compare two or more candidates. They tap a first candidate, see their profile, then tap a second candidate. The view transitions from a single profile to a side-by-side comparison. The theme navigation bar remains visible, allowing the user to compare positions across all themes. The user can select up to four candidates and deselect any of them at any time.

**Why this priority**: Comparison is the second core use case and is equally essential — the whole point of the unified view is enabling seamless transition between single-profile and comparison modes.

**Independent Test**: Can be tested by selecting two candidates and verifying the side-by-side comparison appears, then toggling themes and verifying both candidates' positions update.

**Acceptance Scenarios**:

1. **Given** the user has one candidate selected, **When** they tap a second candidate's avatar, **Then** the view transitions from single profile to side-by-side comparison showing both candidates' positions for the active theme.
2. **Given** two or more candidates are selected, **When** the user taps a theme tab, **Then** the comparison updates to show all selected candidates' positions for that theme.
3. **Given** three or four candidates are selected, **When** the user views the comparison, **Then** all selected candidates' positions are visible (scrollable horizontally if needed).
4. **Given** two candidates are selected, **When** the user deselects one, **Then** the view transitions back to a single-candidate profile for the remaining candidate.

---

### User Story 3 - Empty State Guidance (Priority: P2)

A user opens the "Candidats" tab for the first time or deselects all candidates. They see the avatar bar with no selection highlighted and a clear, friendly message inviting them to tap a candidate to see their profile or select multiple candidates to compare them.

**Why this priority**: Provides essential onboarding and prevents user confusion, but the app is still usable without it (users can discover tap-to-select on their own).

**Independent Test**: Can be tested by navigating to the Candidats tab with no prior selection and verifying the empty state message is displayed and disappears upon first selection.

**Acceptance Scenarios**:

1. **Given** the user navigates to the Candidats tab, **When** no candidate is selected, **Then** a guidance message is displayed below the avatar bar explaining how to interact.
2. **Given** the user has candidates selected, **When** they deselect all candidates, **Then** the empty state with guidance message reappears.

---

### User Story 4 - Quick Access to Debate Mode (Priority: P2)

When viewing a single candidate's profile, the user sees an action button to start a debate with that candidate. Tapping it launches the assistant in debate mode with the selected candidate pre-loaded.

**Why this priority**: Debate mode is a key engagement feature that links candidate exploration to deeper interaction, but it depends on the single-candidate profile view (P1) being implemented first.

**Independent Test**: Can be tested by selecting a candidate, tapping the debate button, and verifying the assistant opens with the correct candidate context.

**Acceptance Scenarios**:

1. **Given** the user is viewing a single candidate's profile, **When** they tap the "Debate" action button, **Then** the assistant opens in debate mode with that candidate pre-selected.
2. **Given** two or more candidates are selected (comparison mode), **When** the user views the comparison, **Then** no debate button is shown (debate is single-candidate only).

---

### Edge Cases

- What happens when the user tries to select a 5th candidate? Selection is blocked and the 5th avatar appears visually disabled (dimmed).
- What happens if a candidate has no position data for a theme? A placeholder message is shown indicating the position is not yet documented.
- What happens on very small screens? The avatar bar wraps to two rows (4+3 layout) and the content below scrolls vertically.
- What happens if the user rotates the device? The layout adapts — avatar bar remains at top, content below reflows.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display all candidates as selectable avatars in a persistent bar at the top of the Candidats screen.
- **FR-002**: The system MUST allow users to select candidates by tapping their avatar, with clear visual highlighting (background color change and/or border) for selected candidates.
- **FR-003**: The system MUST allow users to deselect a candidate by tapping their highlighted avatar again.
- **FR-004**: When exactly one candidate is selected, the system MUST display that candidate's full profile below the avatar bar, including: photo, name, party affiliation, brief biography, and themed positions.
- **FR-005**: When two to four candidates are selected, the system MUST display a side-by-side comparison of the selected candidates' positions, organized by theme.
- **FR-006**: The system MUST display a theme navigation bar when one or more candidates are selected, allowing users to switch between policy themes.
- **FR-007**: The system MUST enforce a maximum of four selected candidates simultaneously.
- **FR-008**: When no candidate is selected, the system MUST display an empty state with a guidance message.
- **FR-009**: The system MUST provide a "Debate" action button when viewing a single candidate's profile that launches the assistant in debate mode.
- **FR-010**: The system MUST remove the separate comparison tab/mode and the candidate grid — all functionality is consolidated into the single unified view.
- **FR-011**: The system MUST remove the standalone candidate profile page navigation — the profile is now displayed inline within the Candidats tab.
- **FR-012**: Transitions between states (empty, single profile, comparison) MUST be visually smooth, not jarring.

### Key Entities

- **Candidate**: A person running for election. Key attributes: name, party, photo, biography, communication style.
- **Theme**: A policy domain (e.g., Housing, Transport, Ecology). Key attributes: name, icon (emoji), display order.
- **Position**: A candidate's stance on a theme. Key attributes: summary, details, source references.
- **Selection State**: The set of currently selected candidates (0 to 4). Determines which view mode is active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view any candidate's profile within one tap from the Candidats tab (no intermediate navigation).
- **SC-002**: Users can transition from viewing one candidate's profile to comparing two candidates with a single additional tap.
- **SC-003**: The number of distinct screens/pages required to browse candidates, view profiles, and compare is reduced from three to one.
- **SC-004**: All candidate information previously accessible via the grid, profile page, and comparison page remains accessible in the unified view.
- **SC-005**: The view responds to selection changes within 300ms (perceived as instant by users).

## Assumptions

- The existing candidate dataset (7 candidates for Paris 2026) remains unchanged.
- The avatar bar layout (two rows: 4+3) from the current comparison page is reusable and already handles the visual design.
- The existing CandidateProfileCard, ComparisonView, and ThemeTabBar components can be reused with minimal modifications.
- The debate action button behavior (navigating to assistant in debate mode) follows the existing pattern from the current candidate profile page.
- Selection state is ephemeral (not persisted across sessions) — users start fresh each time they open the tab.

## Scope Boundaries

**In scope**:
- Merging candidate grid, profile, and comparison into a single adaptive view
- Avatar-based selection mechanism
- Inline profile display for single selection
- Inline comparison display for multi-selection
- Empty state with guidance
- Debate mode access from single-candidate view
- Removal of redundant pages and navigation

**Out of scope**:
- Changes to the candidate data model or content
- Changes to the assistant/debate functionality itself
- Changes to other tabs (Home, Assistant)
- Persisting selection state across sessions
- Adding new candidate information fields
- Search or filter functionality for candidates

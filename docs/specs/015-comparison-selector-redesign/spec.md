# Feature Specification: Comparison Selector Redesign

**Feature Branch**: `015-comparison-selector-redesign`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Redesign comparison page from a 5-step redundant flow (candidates selected twice, double validation) into a single live page with three stacked zones: horizontal avatar bar for candidates, horizontal theme chips, and instant position results — zero validation buttons."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single-page live comparison (Priority: P1)

A user navigates to the comparison screen and sees a single unified page with three zones stacked vertically: candidate avatars at the top, theme chips below, and position cards underneath. There are no steps, no "Comparer" button, no validation flow. When the user toggles candidates or taps a different theme, the positions zone updates instantly. The user can freely explore combinations without ever going "back" or "forward."

**Why this priority**: The entire redesign exists to eliminate the 5-step redundant flow. Without the single-page live layout, the feature delivers no value.

**Independent Test**: Can be fully tested by opening the comparison screen with 2 pre-selected candidates, verifying positions appear immediately, toggling a candidate off and on, and switching themes — all without any navigation or button tap.

**Acceptance Scenarios**:

1. **Given** the user navigates to comparison with 2+ pre-selected candidates, **When** the screen loads, **Then** the first theme is auto-selected and positions for the selected candidates on that theme are displayed immediately — no intermediate step.
2. **Given** the comparison screen is showing positions, **When** the user taps a different theme chip, **Then** the positions zone updates instantly to show the selected candidates' stances on the new theme.
3. **Given** the comparison screen is showing positions, **When** the user deselects a candidate from the avatar bar, **Then** that candidate's position column disappears immediately from the results.
4. **Given** the comparison screen is showing positions, **When** the user selects an additional candidate (up to 4 max), **Then** that candidate's position column appears immediately in the results.
5. **Given** the comparison screen is open, **When** the user looks for a "Comparer" button or step indicator, **Then** none exists — the page has no validation step.

---

### User Story 2 - Compact horizontal candidate avatar bar (Priority: P1)

At the top of the comparison screen, the user sees a horizontal scrollable bar of candidate avatars. Each item shows a circular photo and the candidate's name below (~60px height total). The user scrolls horizontally to see all ~12 candidates. Tapping a candidate toggles selection: selected candidates have a coral-light background with a coral border on the entire item; unselected candidates have a warm-gray background. The color change covers the full card area for instant scannability.

**Why this priority**: The current large vertical candidate cards waste screen space and duplicate the selection already done on the candidates grid. Compact avatars free vertical space for the position content, which is the actual value of the feature.

**Independent Test**: Can be tested by opening the comparison screen, scrolling through the avatar bar to verify all candidates appear, tapping to select/deselect, and confirming the full-card color change.

**Acceptance Scenarios**:

1. **Given** the comparison screen is open, **When** the user views the top zone, **Then** candidates appear as compact circular avatars with names in a horizontal scrollable bar (~60px height).
2. **Given** the avatar bar is displayed, **When** the user scrolls horizontally, **Then** all available candidates (~12) are accessible.
3. **Given** a candidate is not selected, **When** the user taps the candidate item, **Then** the entire item background changes to coral-light with a coral border (selected state).
4. **Given** a candidate is selected (coral-light background), **When** the user taps the item again, **Then** it reverts to warm-gray background (unselected state).
5. **Given** candidates arrive pre-selected from the candidates grid, **When** the screen loads, **Then** those candidates show the selected state (coral-light + coral border) immediately.
6. **Given** 4 candidates are already selected (maximum), **When** the user taps a 5th candidate, **Then** the selection is rejected or the oldest selection is deselected (enforcing the 2-4 limit).

---

### User Story 3 - Theme chips with auto-selection (Priority: P2)

Below the candidate avatar bar, the user sees a horizontal scrollable row of theme chips. Each chip shows the theme name. One theme is active at a time. The first theme is pre-selected when the screen loads, so the user always sees content immediately. Tapping a different chip switches the active theme and the positions below update instantly.

**Why this priority**: The theme selector is essential for the live comparison to work, but it reuses the existing chip pattern and requires less redesign than the candidate bar.

**Independent Test**: Can be tested by opening the comparison screen, verifying the first theme is pre-selected, tapping other themes, and confirming only one is active at a time.

**Acceptance Scenarios**:

1. **Given** the comparison screen loads, **When** the user views the theme zone, **Then** themes appear as horizontal scrollable chips below the candidate bar.
2. **Given** the screen has just loaded, **When** the user checks the theme chips, **Then** the first theme (by display order) is already selected.
3. **Given** a theme is selected, **When** the user taps a different theme chip, **Then** the new chip becomes active and the previous one reverts to default state.
4. **Given** there are more themes than fit on screen, **When** the user scrolls the chip bar horizontally, **Then** all themes are accessible.

---

### User Story 4 - Live positions zone (Priority: P2)

Below the theme chips, the user sees position cards for all selected candidates on the active theme. With 2 candidates, cards are displayed side-by-side filling the screen width. With 3-4 candidates, cards scroll horizontally. Each card shows the candidate's name, party, position summary, details, and sources. When the user changes candidates or theme, the content updates instantly with no loading state or navigation.

**Why this priority**: This is the core value — seeing candidates' stances compared. But it depends on the candidate bar and theme chips working first.

**Independent Test**: Can be tested by selecting 2 candidates and a theme, verifying positions appear, then adding a 3rd candidate and verifying the layout switches to horizontal scroll.

**Acceptance Scenarios**:

1. **Given** 2 candidates are selected and a theme is active, **When** the user views the positions zone, **Then** 2 position cards are displayed side-by-side (full width).
2. **Given** 3 or 4 candidates are selected, **When** the user views the positions zone, **Then** position cards are scrollable horizontally.
3. **Given** positions are displayed, **When** the user toggles a candidate off, **Then** that candidate's position card disappears immediately.
4. **Given** positions are displayed, **When** the user switches the active theme, **Then** all position cards update to reflect the new theme's stances instantly.
5. **Given** a candidate has a position on the active theme, **When** displayed, **Then** the card shows: candidate name, party, position summary, details, and sources.

---

### User Story 5 - Empty state guidance (Priority: P3)

When fewer than 2 candidates are selected, the positions zone shows a gentle prompt message ("Sélectionnez au moins 2 candidats pour comparer") instead of blank space. This guides the user without blocking the interface — they can still interact with the candidate bar and theme chips.

**Why this priority**: This is polish — the main flow already works with pre-selected candidates. The empty state only appears if the user deselects everyone.

**Independent Test**: Can be tested by deselecting all candidates and verifying the prompt appears, then selecting 2 and verifying positions replace the prompt.

**Acceptance Scenarios**:

1. **Given** fewer than 2 candidates are selected, **When** the user views the positions zone, **Then** a message reads "Sélectionnez au moins 2 candidats pour comparer."
2. **Given** the empty state message is shown, **When** the user selects a 2nd candidate, **Then** the message disappears and positions appear immediately.
3. **Given** the empty state is shown, **When** the user interacts with the candidate bar or theme chips, **Then** they remain fully functional (not disabled).

---

### Edge Cases

- What happens when a candidate has no position on the active theme? The card shows a "Pas de position connue" placeholder for that candidate on that theme.
- What happens when all candidates are deselected? The positions zone shows the empty state message; the theme chips remain interactive.
- What happens when the screen is loaded without pre-selected candidates (direct URL)? All candidates appear unselected; the first theme is auto-selected; the empty state message is displayed.
- What happens on a narrow screen (320px)? The avatar bar and theme chips scroll horizontally; position cards stack or scroll as needed.
- What happens when a candidate has no photo? The avatar falls back to initials on the party-colored background.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The comparison screen MUST display a single unified page with three vertically stacked zones: candidate avatar bar, theme chips, and positions.
- **FR-002**: There MUST be no step indicator, no "Comparer" button, and no validation flow — the page is entirely live.
- **FR-003**: Candidates MUST be displayed as compact circular avatars (~60px height) with name labels in a horizontal scrollable bar.
- **FR-004**: Selected candidates MUST show a coral-light background with coral border covering the entire item area. Unselected candidates MUST show a warm-gray background.
- **FR-005**: Tapping a candidate avatar MUST toggle its selection state immediately.
- **FR-006**: The candidate selection limit (2-4) MUST be enforced.
- **FR-007**: Themes MUST be displayed as horizontal scrollable chips below the candidate bar, with single-selection behavior.
- **FR-008**: The first theme (by display order) MUST be auto-selected when the screen loads.
- **FR-009**: Positions MUST update instantly when the user toggles a candidate or switches a theme — no explicit refresh or navigation required.
- **FR-010**: With 2 selected candidates, position cards MUST display side-by-side (full width). With 3-4, they MUST scroll horizontally.
- **FR-011**: Each position card MUST show: candidate name, party, position summary, details, and sources.
- **FR-012**: When fewer than 2 candidates are selected, the positions zone MUST show a guidance message instead of blank space.
- **FR-013**: Pre-selected candidates (passed via navigation params from the candidates grid) MUST appear in selected state on load.
- **FR-014**: The ComparisonBottomBar (sticky CTA) MUST be removed.
- **FR-015**: All interactive elements (avatars, chips) MUST have a minimum tap target of 44x44 points.

### Key Entities

- **Candidate Avatar Item**: Compact selectable element in the horizontal bar. Shows circular photo (or initials fallback), candidate name, and selected/unselected visual state. Maps to existing Candidate entity.
- **Theme Chip**: Selectable pill in the horizontal chips bar. Shows theme name and active/inactive visual state. Maps to existing Theme entity.
- **Position Card**: Content card displaying a candidate's stance on the active theme. Shows name, party, summary, details, sources. Maps to existing Position entity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The number of taps to view a comparison result drops from 5 (current) to 0 (positions visible immediately on load with pre-selected candidates).
- **SC-002**: Users can switch between themes and see updated positions in under 1 second (perceived instant).
- **SC-003**: All ~12 candidates are accessible via horizontal scroll without vertical space exceeding 60px for the candidate bar.
- **SC-004**: Users can toggle any candidate on/off and see position changes without any page navigation or modal.
- **SC-005**: 95% of first-time users can compare 2 candidates on a specific theme without external guidance within 10 seconds.
- **SC-006**: The comparison screen displays meaningful content (positions) above the fold on a standard mobile screen (375px width) when 2+ candidates are pre-selected.

## Assumptions

- The existing data model (Candidate, Theme, Position) and Zustand store (useElectionStore) are unchanged.
- The existing ComparisonView component (position rendering) is reused and adapted for the live layout.
- The existing ThemeChipSelector pattern is reused for the theme chips zone.
- The CandidateAvatar component is reused for the compact avatar bar.
- The maximum selectable candidates remains 2-4 (existing constraint).
- Sources and confidence badges on position cards remain as-is.
- Navigation from the candidates grid FAB continues to pass pre-selected candidate IDs via router params.
- The 013-comparison-redesign fixes are assumed merged or present in the codebase.

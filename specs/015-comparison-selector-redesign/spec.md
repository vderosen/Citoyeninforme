# Feature Specification: Comparison Selector Page Redesign

**Feature Branch**: `015-comparison-selector-redesign`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Redesign the comparison selector page to fix UX/UI issues: duplicated title, unclear candidate selection with oversized placeholders, clipped horizontal content, no visible CTA, weak contrast. Replace with clean step-based flow, candidate cards with proper states, compact theme chips, sticky compare button, and accessibility improvements."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clear candidate selection with visual feedback (Priority: P1)

A user opens the comparison screen and sees a clean list of candidate cards — each showing an avatar (initials on party color) and the candidate's full name. They tap candidates to select them. Selected cards visually change (tinted background, check icon, primary-colored border) so the user always knows exactly who is selected. A counter label (e.g., "2 sélectionnés") updates in real time above the cards.

**Why this priority**: The current candidate selector uses empty oval placeholders with no clear selected/unselected distinction. Users cannot tell which candidates are selected, making the core feature unusable. Fixing selection clarity is the single most impactful improvement.

**Independent Test**: Can be fully tested by opening the comparison screen, tapping 2 candidate cards, and verifying each card visually transitions to a selected state with check icon, tinted background, and that the counter updates.

**Acceptance Scenarios**:

1. **Given** the comparison screen is open, **When** the user views the candidate section, **Then** each candidate is shown as a card with avatar (initials + party color) and full name — no empty placeholders.
2. **Given** no candidates are selected, **When** the user taps a candidate card, **Then** the card transitions to the selected state: primary-colored border, tinted background, and a check icon appears.
3. **Given** a candidate is selected, **When** the user taps that candidate card again, **Then** the card returns to the default state (white background, light border, no check icon).
4. **Given** 2 candidates are selected, **When** the user views the selection counter, **Then** it reads "2 sélectionnés" and updates immediately when candidates are added or removed.
5. **Given** a candidate's name is long (e.g., "Jean-Pierre Dupont-Martin"), **When** displayed on a card, **Then** the name wraps to a second line rather than being truncated.

---

### User Story 2 - Compact theme chips replace oversized circles (Priority: P1)

Instead of the current large circular theme buttons that waste screen space and push content out of view, the user sees medium-sized pill-shaped chips arranged in a wrapping layout. "Tous les thèmes" is the first chip and is selected by default. The user can tap any theme chip to filter the comparison.

**Why this priority**: The oversized circles are the second most visible UX problem — they create excessive dead space, cause horizontal clipping, and push the comparison content below the fold. Compact chips fix all three issues simultaneously.

**Independent Test**: Can be fully tested by opening the comparison screen and verifying themes appear as compact pills in a wrapping layout, "Tous les thèmes" is pre-selected, and tapping a theme chip selects it with a visual change.

**Acceptance Scenarios**:

1. **Given** the comparison screen is open, **When** the user views the theme section, **Then** themes are displayed as pill-shaped chips in a wrapping multi-row layout (not large circles).
2. **Given** the theme chips are displayed, **When** the user counts visible themes, **Then** all themes fit on screen without horizontal scrolling or clipping.
3. **Given** no theme has been explicitly selected, **When** the screen loads, **Then** "Tous les thèmes" is selected by default (primary-colored background, white text).
4. **Given** the user taps a theme chip, **When** the chip is selected, **Then** it changes to primary background with white text, and the previously selected chip reverts to default (light surface, dark text).
5. **Given** multiple themes exist, **When** displayed in the chip area, **Then** they wrap naturally across 2-3 rows without overflow or truncation.

---

### User Story 3 - Step-guided flow with sticky compare button (Priority: P2)

The comparison screen guides the user through a clear 2-step process. A step label below the title reads "Étape 1 sur 2" (select candidates and theme). A sticky bottom bar shows a "Comparer" button that is disabled (greyed out) until at least 2 candidates are selected. Once enabled, the bar also shows a summary (e.g., "2 candidats · Transport & Mobilité"). Tapping "Comparer" opens the comparison results view.

**Why this priority**: Currently there is no visible action button after selecting candidates — users don't know how to proceed. Adding an explicit CTA with step guidance completes the interaction flow and eliminates confusion.

**Independent Test**: Can be fully tested by selecting 0, 1, then 2 candidates and verifying the CTA transitions from disabled to enabled, showing the correct summary text.

**Acceptance Scenarios**:

1. **Given** the comparison screen is open, **When** the user views the area below the title, **Then** a step label reads "Étape 1 sur 2".
2. **Given** fewer than 2 candidates are selected, **When** the user views the bottom bar, **Then** the "Comparer" button is visually disabled (reduced opacity) and the bar shows "Sélectionnez 2 candidats minimum".
3. **Given** exactly 2 candidates are selected with the default theme, **When** the user views the bottom bar, **Then** the "Comparer" button is enabled and the summary reads "2 candidats · Tous les thèmes".
4. **Given** 3 candidates are selected and the theme "Transport & Mobilité" is chosen, **When** the user views the bottom bar, **Then** the summary reads "3 candidats · Transport & Mobilité".
5. **Given** the CTA is enabled, **When** the user taps "Comparer", **Then** the comparison results view opens with the selected candidates and theme.
6. **Given** the user scrolls the page content, **When** they reach any scroll position, **Then** the bottom bar remains fixed/sticky at the bottom of the screen.

---

### User Story 4 - Deduplicated title and clean visual hierarchy (Priority: P3)

The screen shows only one instance of the title "Comparaison" (in the header bar), not repeated as a section heading. Below the header, the page uses clear section labels ("Candidats", "Thème") with consistent spacing, giving the screen a clean editorial look rather than a cluttered interface.

**Why this priority**: The duplicated title is a minor but noticeable polish issue that makes the screen feel unfinished. Combined with proper section spacing, this improves the overall perception of quality.

**Independent Test**: Can be tested by opening the comparison screen and counting the number of times "Comparaison" appears — it should appear exactly once (in the header).

**Acceptance Scenarios**:

1. **Given** the comparison screen is open, **When** the user scans the screen, **Then** "Comparaison" appears exactly once — in the navigation header bar.
2. **Given** the comparison screen is open, **When** the user views the candidate section, **Then** it has a clear label (e.g., "Candidats") visually distinct from body content.
3. **Given** the comparison screen is open, **When** the user views the theme section, **Then** it has a clear label (e.g., "Thème") visually distinct from body content, with adequate spacing from the candidate section above.

---

### Edge Cases

- What happens when all candidates are selected (max 4)? The cards all show selected state and no additional selection is possible until one is deselected.
- What happens when a candidate has no party color defined? The avatar uses a neutral default background color (gray).
- What happens on a very small screen (320px width)? Candidate cards and theme chips reflow gracefully — cards remain full-width, chips wrap to additional rows.
- What happens when the screen is loaded with pre-selected candidates (from the gallery compare mode)? Pre-selected candidates appear in selected state immediately, and the CTA enables if 2+ are pre-selected.
- What happens when only 1 candidate exists in the election data? The candidate section shows that single card; the CTA remains disabled since comparison requires at least 2.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The comparison screen MUST display each candidate as a card with avatar (initials on party-colored background) and full name — not as empty oval placeholders.
- **FR-002**: Candidate cards MUST have three distinct visual states: default (white surface, light border), selected (primary border, tinted background, check icon), and disabled (reduced opacity, if applicable).
- **FR-003**: A real-time selection counter (e.g., "2 sélectionnés") MUST be visible above the candidate cards, updating immediately when candidates are added or removed.
- **FR-004**: Theme options MUST be displayed as pill-shaped chips in a wrapping multi-row layout, not as large circles.
- **FR-005**: "Tous les thèmes" MUST be the first chip and MUST be selected by default when the screen loads.
- **FR-006**: Theme chips MUST have two visual states: default (light surface, dark text) and selected (primary background, white text). Only one theme may be selected at a time.
- **FR-007**: A sticky bottom bar MUST be present at all scroll positions, containing a primary "Comparer" button and a text summary of the current selection.
- **FR-008**: The "Comparer" button MUST be disabled (reduced opacity, non-interactive) when fewer than 2 candidates are selected, showing "Sélectionnez 2 candidats minimum" as helper text.
- **FR-009**: When the "Comparer" button is enabled (2+ candidates selected), the summary text MUST show the count of selected candidates and the name of the selected theme (e.g., "2 candidats · Transport & Mobilité").
- **FR-010**: The title "Comparaison" MUST appear only once — in the navigation header bar. Any duplicated section title MUST be removed.
- **FR-011**: A step indicator (e.g., "Étape 1 sur 2") MUST appear below the header to orient the user in the comparison flow.
- **FR-012**: All interactive elements (candidate cards, theme chips, CTA button) MUST have a minimum tap target of 44x44 points.
- **FR-013**: All text MUST meet a contrast ratio of at least 4.5:1 against its background.
- **FR-014**: Candidate names MUST NOT be truncated — they wrap to multiple lines if needed.
- **FR-015**: When a candidate has no party color defined, the avatar MUST use a neutral default color.

### Key Entities

- **Candidate Card**: Represents a selectable candidate with avatar, name, and visual state. Maps to existing Candidate entity.
- **Theme Chip**: Represents a selectable theme filter option with name and visual state. Maps to existing Theme entity. Includes a virtual "Tous les thèmes" option (null theme ID).
- **Selection Summary**: Derived display showing the count of selected candidates and the active theme name, used in the sticky bottom bar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can understand the purpose of the screen and the required steps (select candidates, pick theme, compare) within 5 seconds of viewing.
- **SC-002**: Users can identify which candidates are selected versus unselected with 100% accuracy based on visual states alone (no guessing).
- **SC-003**: All theme options are visible without horizontal scrolling or content clipping on a standard mobile screen (375px width).
- **SC-004**: The "Comparer" call-to-action is visible at all times without scrolling (sticky positioning), reducing missed-action rate to 0%.
- **SC-005**: The complete flow from opening the comparison screen to viewing comparison results requires no more than 3 taps (select candidate 1, select candidate 2, tap Comparer).
- **SC-006**: No text on the screen falls below the 4.5:1 contrast ratio threshold.
- **SC-007**: 90% of first-time users complete a comparison without external guidance or help text beyond what is on screen.

## Assumptions

- The existing comparison results view (ComparisonView component) is retained as-is — this redesign only covers the **selector page** (candidate + theme selection and CTA flow).
- The existing 013-comparison-redesign fixes (candidate pre-selection parsing, theme icon rendering, card polish) are assumed to be merged or will be merged before this feature. This spec builds on top of those fixes.
- Maximum selectable candidates remains 4 (existing app constraint).
- The "Étape 2 sur 2" is the comparison results view that already exists — no new step/screen is introduced.
- The visual direction (color tokens, typography, shape language) follows the app's existing design system established in prior redesign features (004, 008, 010).

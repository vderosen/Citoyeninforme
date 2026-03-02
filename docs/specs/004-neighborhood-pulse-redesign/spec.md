# Feature Specification: Neighborhood Pulse Visual Redesign

**Feature Branch**: `004-neighborhood-pulse-redesign`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "Significantly improve application design following 7 design guidelines and the 'Neighborhood Pulse' creative direction — local, energetic, participatory — with district/block-inspired shapes, bolder color contrasts, expressive type, and subtle rhythmic motion."

## Context & Design Decisions

The app is currently functional but visually generic — system fonts, one blue color (#2563EB), uniform rounded cards, no motion, no spatial metaphor. The redesign establishes a distinctive civic identity called **"Neighborhood Pulse"** that feels local, energetic, and participatory.

### Confirmed Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Color direction | Navy #1B2A4A (civic primary) + Coral #E8553A (energy accent) | Navy = trust/authority, Coral = campaign energy and CTAs |
| Display typography | Space Grotesk | Distinctive, slightly technical/editorial, strong personality |
| Body typography | Inter | Maximum readability at small sizes, excellent language support |
| District-block shapes | Subtle | Gentle corner clips and stepped dividers, not aggressive geometry |
| Theme context | Light context only | No dark context for MVP |

### Design Guidelines (7 Principles)

1. **Trust first, then style** — clear structure, plain language, predictable navigation
2. **One strong visual signature** — district/block-inspired geometric shapes repeated consistently
3. **Controlled color architecture** — neutral base, one civic primary, one energetic accent, muted signals
4. **Typography carries personality** — strong display face for headlines, readable text face for body
5. **Multilingual reality** — consistent language switcher (text-based, no flags)
6. **Editorial data visuals** — reduced color count, obvious legends, tables/bars over maps
7. **Accessibility as beauty** — high contrast, generous targets, clear focus states = premium feel

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Distinctive First Impression (Priority: P1)

A first-time user opens the app and immediately perceives a confident, civic identity. The warm color palette, distinctive typography, and subtle district-block shapes communicate "this is a trustworthy civic tool" — not a generic mobile app. The home screen establishes editorial authority through a full-width hero statement, clear action shortcuts, and a trust-building footer.

**Why this priority**: First impressions determine whether users trust and continue using the app. The visual foundation (colors, typography, design tokens) is also a prerequisite for all other visual improvements — nothing else can be implemented without it.

**Independent Test**: Can be fully tested by opening the app fresh and evaluating whether the home screen communicates civic identity, trust, and clear next actions through visual design alone.

**Acceptance Scenarios**:

1. **Given** a user opens the app for the first time, **When** the home screen loads, **Then** they see a full-width hero block with navy background, coral accent text, and a confident tagline — not a generic card layout.
2. **Given** a user views the home screen, **When** they scan the layout, **Then** they see three distinct action shortcuts (Survey, Candidates, Assistant) with clear verb labels, subtle tint variations, and the district-block shape — visually differentiated from each other.
3. **Given** a user scrolls down the home screen, **When** they reach the bottom, **Then** they see a distinct trust footer on warm gray background explaining the app's neutrality and data sources — reinforcing trust before any engagement.
4. **Given** a user views any text on the home screen, **When** they read headlines vs body text, **Then** headlines appear in Space Grotesk (display face) and body text in Inter (reading face) with obvious size and weight hierarchy.
5. **Given** a user views the home screen, **When** they observe the overall color palette, **Then** the canvas is warm off-white (#FAFAF8), cards use warm gray (#F0EDE8), primary text and headers use deep navy (#1B2A4A), and action elements use vibrant coral (#E8553A).

---

### User Story 2 - Editorial Candidate Browsing (Priority: P2)

A user exploring candidates sees an editorial gallery that treats each candidate with visual personality — party color bars, distinctive photo treatments, display-font names, and stance teasers. The candidate profile reads like a well-designed editorial page, not a data dump.

**Why this priority**: Candidate browsing is the app's core value proposition. Users must be able to quickly scan, compare, and distinguish candidates visually. The current uniform grid treats all candidates identically.

**Independent Test**: Can be fully tested by navigating to the Candidates tab and browsing through the gallery and individual profiles, verifying visual differentiation and editorial layout.

**Acceptance Scenarios**:

1. **Given** a user opens the Candidates tab, **When** the gallery loads, **Then** each candidate card shows a color bar at top matching the candidate's party/list color, the candidate name in Space Grotesk, party name in Inter, and a one-line stance teaser.
2. **Given** a user views the candidate gallery, **When** they scan the grid, **Then** cards use the subtle district-block shape (one corner with a gentle angled clip) rather than uniform rounded rectangles.
3. **Given** a user taps a candidate card, **When** the profile loads, **Then** it displays as an editorial layout with a large photo header, the candidate name in display typography overlapping the image slightly, and positions organized as expandable theme blocks with topic color bars.
4. **Given** a user views a candidate's positions, **When** they browse by theme, **Then** each theme section has a distinct color bar and uses the controlled color architecture — navy for structure, warm grays for content, coral for interactive elements.

---

### User Story 3 - Participatory Survey Experience (Priority: P3)

A user taking the political alignment survey feels engaged and participatory, not like filling out a web form. The progress indicator, question presentation, and results all use the civic design language to make the experience feel meaningful — like casting a ballot, not answering a quiz.

**Why this priority**: The survey is the app's key engagement feature and where "participatory energy" matters most. Generic form styling undermines the civic significance of the exercise.

**Independent Test**: Can be fully tested by completing the full survey flow (intro → questions → results) and evaluating whether the visual treatment creates a sense of civic participation.

**Acceptance Scenarios**:

1. **Given** a user starts the survey, **When** they view the progress indicator, **Then** they see individual blocks filling in as they advance (one block per question), rather than a thin continuous progress line — evoking the feeling of filling in a ballot.
2. **Given** a user reads a survey question, **When** the question card displays, **Then** the question text appears in Space Grotesk with generous whitespace, and answer options are substantial pressable blocks with clear active state (coral border + subtle fill on selection).
3. **Given** a user completes the survey, **When** the results display, **Then** alignment rankings appear as editorial horizontal bar charts with candidate photos, percentages in display font, navy bars for alignment scores, and coral highlighting for the top match — not pie charts or default visualizations.
4. **Given** a user interacts with the importance slider, **When** they adjust importance level, **Then** the slider uses coral fill and district-block-style markers instead of generic dots.

---

### User Story 4 - Alive and Responsive Interactions (Priority: P4)

A user navigating through any screen experiences subtle motion that makes the app feel alive and responsive. Transitions communicate state changes, cards appear with gentle rhythm, and touch feedback confirms every interaction — all purposeful, never decorative.

**Why this priority**: Motion is the final polish layer that transforms a static UI into a living interface. It's lowest priority because it doesn't affect functionality, but it completes the "Neighborhood Pulse" identity.

**Independent Test**: Can be fully tested by navigating between screens, scrolling through lists, and tapping interactive elements, observing whether motion communicates state changes and creates a sense of rhythm.

**Acceptance Scenarios**:

1. **Given** a user navigates to a new screen, **When** the screen transition occurs, **Then** the new content slides up subtly (not instant swap) with a smooth ease-out animation.
2. **Given** a user scrolls through a list of items (candidates, themes, results), **When** items enter the viewport, **Then** they fade in with a staggered delay between items (approximately 50ms between consecutive items), creating a rhythmic entrance.
3. **Given** a user presses any interactive element (button, card, option), **When** the press occurs, **Then** the element shows a subtle scale feedback (slight shrink then return) in addition to any color change — confirming the touch was registered.
4. **Given** a user scrolls on the home screen, **When** the hero section is visible, **Then** the hero background scrolls slightly slower than the content below it, creating a subtle depth effect.

---

### User Story 5 - Premium Accessible Experience (Priority: P5)

A user who relies on accessibility features (screen readers, keyboard navigation, large text) experiences the app as equally beautiful and functional. Focus states, touch targets, and contrast ratios are designed as premium visual elements, not afterthoughts.

**Why this priority**: Accessibility is a civic app's moral obligation. The existing a11y fundamentals are solid; this story upgrades them from functional to beautiful.

**Independent Test**: Can be fully tested by navigating the app with a screen reader, using keyboard/switch navigation, and testing at 200% text scale.

**Acceptance Scenarios**:

1. **Given** a user navigates via keyboard or switch control, **When** an element receives focus, **Then** it displays a coral outline (2px) with a slight outer glow — visible and aesthetically intentional, not a browser default.
2. **Given** a user increases system text size to 200%, **When** any screen loads, **Then** all text remains readable, layout adapts without overflow, and Space Grotesk headlines still maintain hierarchy.
3. **Given** a user views coral-colored text, **When** the text appears on a light background, **Then** it meets WCAG AA contrast ratio (minimum 4.5:1). Where coral on light background falls below threshold, the text uses navy instead and coral is reserved for larger elements or dark backgrounds.
4. **Given** a user interacts with any tappable element, **When** they attempt to tap, **Then** the touch target is at least 48x48px with visually generous padding (the touchable area matches the visual size).

---

### Edge Cases

- What happens when a candidate has no party color assigned? Use a neutral warm gray as fallback color bar.
- What happens when custom fonts fail to load? Fall back to system fonts while maintaining the typographic hierarchy (sizes, weights, spacing).
- What happens when text content is extremely long (e.g., verbose translations)? Layout must accommodate up to 2x text length without breaking — especially important for multilingual support.
- What happens when the horizontal theme feed has only 1-2 items? Display them left-aligned without centering or stretching; the scroll behavior degrades gracefully.
- What happens when a user has "reduce motion" system preference enabled? All animations (staggered entrance, parallax, scale feedback) are disabled; transitions become instant.

## Requirements *(mandatory)*

### Functional Requirements

#### Design Foundation

- **FR-001**: The app MUST use a centralized design token system defining all colors, typography scales, spacing values, and shadow definitions — no scattered inline values.
- **FR-002**: The app MUST load and display Space Grotesk as the display/headline font family with Bold, SemiBold, and Medium weights available.
- **FR-003**: The app MUST load and display Inter as the body/reading font family with Regular and Medium weights available.
- **FR-004**: The app MUST use a 4-tier color architecture: warm off-white base (#FAFAF8), warm gray surfaces (#F0EDE8), deep navy primary (#1B2A4A), vibrant coral accent (#E8553A), and muted signal colors (green/amber/red).
- **FR-005**: The app MUST display in light context only; no dark context theme or toggle.

#### Visual Signature

- **FR-006**: Hero cards, candidate cards, and section headers MUST use a subtle district-block shape: a gentle angled clip on one corner (top-right or bottom-left), rather than uniform rounded rectangles.
- **FR-007**: Section dividers MUST use a stepped/block pattern (city-skyline-silhouette style at approximately 4px height) instead of flat horizontal lines.
- **FR-008**: The active tab indicator MUST use a small block/bar shape instead of a full-width color fill.

#### Typography Hierarchy

- **FR-009**: The app MUST implement a clear 6-level typographic hierarchy: hero titles (display, bold, 28-32px), section headers (display, semibold, 20px), card titles (display, medium, 16-17px), body text (body, regular, 15-16px), captions/labels (body, medium, 12-13px), and numbers/statistics (display, bold).
- **FR-010**: All typography MUST use navy (#1B2A4A) for primary headings and warm dark gray (#3D3D3D) for body text.

#### Home Screen

- **FR-011**: The home screen MUST display a full-width hero block with navy background, coral accent text, and the app's tagline.
- **FR-012**: The home screen MUST display three primary action shortcuts (Survey, Candidates, Assistant) as visually distinct blocks with icon + verb label, subtle tint variations, and district-block shape.
- **FR-013**: The home screen MUST display a theme feed as a horizontal scroll with editorial card treatment: display typography, topic color bar on top, and district-block clip shape.
- **FR-014**: The home screen MUST display a trust footer section on warm gray background explaining the app's neutrality and data sources.

#### Candidate Screens

- **FR-015**: Candidate gallery cards MUST display a color bar at top matching the candidate's party/list color, name in display font, party in body font, and a one-line stance teaser.
- **FR-016**: Candidate gallery cards MUST use the district-block shape (subtle corner clip).
- **FR-017**: The candidate profile MUST use an editorial layout: large photo header with name in display typography, positions organized as expandable theme blocks with topic color bars.

#### Survey Flow

- **FR-018**: Survey progress MUST be displayed as individual blocks (one per question) that fill in as the user advances, not as a thin continuous line.
- **FR-019**: Survey question cards MUST display question text in display font with generous whitespace, and answer options as substantial pressable blocks with coral border + subtle fill on selection.
- **FR-020**: Survey results MUST display alignment rankings as horizontal bar charts with candidate photos, percentages in display font, navy bars, and coral highlighting for the top match.

#### Motion & Interaction

- **FR-021**: Screen transitions MUST use a subtle slide-up animation with smooth ease-out timing.
- **FR-022**: List items (candidates, themes, results) MUST use staggered fade-in entrance with approximately 50ms delay between consecutive items.
- **FR-023**: All interactive elements MUST provide subtle scale feedback on press (slight shrink then return to normal).
- **FR-024**: The home hero section MUST implement a subtle parallax scroll effect (hero scrolls slightly slower than content).
- **FR-025**: All motion MUST be disabled when the user's system "reduce motion" preference is enabled.

#### Accessibility

- **FR-026**: Focus states MUST display as a coral outline (2px) with a subtle outer glow on all focusable elements.
- **FR-027**: All tappable elements MUST maintain a minimum 48x48px touch target with visually generous padding.
- **FR-028**: Coral text on light backgrounds MUST meet WCAG AA contrast ratio (4.5:1 minimum). Where this is not achievable, use navy text instead and reserve coral for larger elements or dark backgrounds.
- **FR-029**: The display font MUST render correctly at 200% system text scale without layout overflow or broken hierarchy.

#### Language & i18n

- **FR-030**: The language switcher MUST be a persistent text-based toggle (e.g., "FR / EN") visible in the header — not flags, not buried in settings.

### Key Entities

- **Design Token**: A named value (color, size, weight, shadow) that can be referenced consistently across all screens. Organized into semantic categories: colors (base, primary, accent, signal), typography (display, body), spacing, shadows.
- **District-Block Shape**: The app's visual signature — a subtle angled clip on one corner of selected card types, creating a geometric civic identity. Applied to hero cards, candidate cards, section headers.
- **Typography Scale**: A 6-level hierarchy mapping semantic roles (hero, section, card, body, caption, stat) to specific font family, weight, and size combinations.

## Assumptions

- The current codebase is modular enough that visual changes do not require structural rewrites (confirmed from current state assessment).
- Accessibility fundamentals (ARIA roles, 44-48px touch targets, screen reader support) already exist and this feature builds on them, not replaces them.
- The horizontal theme feed component already exists and supports horizontal scrolling — this feature reskins it rather than rebuilding it.
- Custom fonts (Space Grotesk, Inter) are freely available via Google Fonts and can be bundled with the app.
- "Reduce motion" system preference is detectable at the platform level and can be respected.
- Signal colors (green for success, amber for warning, red for error) remain functionally unchanged; they are only visually muted to be less alarming and more editorial.
- The language switcher (FR/EN) is the only multilingual feature in scope — additional languages may be added later but are not part of this specification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of screens use the centralized design token system — zero hardcoded color values or font sizes outside the token definitions.
- **SC-002**: Users can distinguish the app from a generic mobile app within 3 seconds of opening it (validated by visual identity review).
- **SC-003**: All text elements follow the 6-level typographic hierarchy consistently across all screens — no text appears in system default fonts.
- **SC-004**: The color palette uses exactly 4 tiers (base, primary, accent, signal) with no off-palette colors appearing anywhere in the interface.
- **SC-005**: All interactive elements provide visual feedback within 100ms of user touch.
- **SC-006**: 100% of tappable elements meet the 48x48px minimum touch target requirement.
- **SC-007**: All text passes WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text) on their respective backgrounds.
- **SC-008**: The app remains fully usable at 200% system text scale with no content overflow or broken layouts.
- **SC-009**: All motion is suppressed when the system "reduce motion" preference is active — verified by toggling the preference.
- **SC-010**: The language switcher is accessible from every screen without navigating to a settings page.

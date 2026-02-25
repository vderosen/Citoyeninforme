# Research: Voting Info Cards Redesign

**Feature**: 011-voting-info-redesign
**Date**: 2026-02-19

## R1: Vertical Timeline in React Native with NativeWind

**Decision**: Build the timeline manually using absolute-positioned Views (dot + vertical line) with NativeWind classes. No external timeline library.

**Rationale**:
- The timeline has only 4-6 entries — no virtualization or complex scrolling needed
- External timeline packages (`react-native-timeline-flatlist`, `react-native-animated-timeline`) add dependencies for minimal gain and don't integrate with NativeWind styling
- A simple `View` with `position: absolute` for the vertical line and relatively-positioned dots is straightforward and fully controllable
- The existing codebase already uses this pattern-level complexity (e.g., `HeroBlock`, `PrimaryShortcuts`)

**Alternatives considered**:
- `react-native-timeline-flatlist`: Requires FlatList, overkill for 4 items, poor NativeWind integration
- Custom Animated timeline: Animations not needed for static informational display
- CSS-only timeline (web pattern): Not portable to React Native Views

## R2: Date Grouping Strategy

**Decision**: Group dates at render time using a simple `reduce` over the `keyDates` array, keyed by the `date` ISO string. Labels within the same date are joined with ` · ` (middle dot separator).

**Rationale**:
- The grouping is a presentation concern, not a data concern — it should not modify the underlying `logistics.json`
- The `keyDates` array has at most 6-8 entries per election, so performance is irrelevant
- ISO date strings (`YYYY-MM-DD`) are naturally sortable and directly comparable
- The `·` separator is concise, language-neutral, and commonly used in French typography

**Alternatives considered**:
- Grouping in the data layer (modify `logistics.json`): Violates FR-010 and Constitution Principle V (single source of truth — the grouping is editorial, not factual)
- Grouping in the Zustand store: Adds unnecessary complexity to the data layer for a view-only transformation
- Nested array in JSON (`events: [{label, label}]`): Changes the data schema, breaks other potential consumers

## R3: Temporal Classification Logic

**Decision**: Use `new Date()` at render time to classify each timeline entry as `past`, `next`, or `future`. Parse ISO date strings with `new Date(dateString)`.

**Rationale**:
- Device date is the only available time source in a client-only mobile app
- ISO date parsing (`new Date("2026-03-15")`) is reliable in all modern JS engines
- The classification only needs date precision (not time), so timezone edge cases are minimal
- "Next" is defined as the first grouped date >= today; all subsequent dates >= today are "future"

**Alternatives considered**:
- Server-side time: Not available, app is offline-capable
- `date-fns` or `dayjs`: Adding a dependency for 3 date comparisons is overkill
- Hardcoded status in data: Would require updating data as time passes — fragile

## R4: French Date Formatting Without Dependencies

**Decision**: Use a simple lookup array of French month abbreviations (`['JAN', 'FÉV', 'MARS', ...]`) combined with `Date.getDate()` and `Date.getFullYear()` to produce the display format `"6 FÉV 2026"`.

**Rationale**:
- Only 12 month names needed — a static array is simpler and smaller than any i18n library for this
- `Intl.DateTimeFormat` with French locale is available but returns lowercase months and may vary across platforms — a manual array is more predictable
- The app is French-only for the Paris 2026 MVP (Constitution: "French as primary language")
- Format matches the compact badge design requirement

**Alternatives considered**:
- `Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })`: Platform-dependent output formatting, unpredictable case
- `date-fns/locale/fr`: New dependency for a trivial operation
- Full date string from data: Too long for the badge format, defeats the compact design

## R5: Sub-Card Pattern for Eligibility and Voting Methods

**Decision**: Use `bg-white rounded-lg p-3` Views nested inside the existing `bg-warm-gray rounded-xl p-4` container. No shadows, no borders — contrast comes from the white-on-warm-gray layering.

**Rationale**:
- Matches the design system's warm, non-corporate aesthetic
- The `warm-gray` (#F0EDE8) to `white` (#FFFFFF) contrast is subtle but clear
- No shadows avoids visual noise on a screen with multiple card sections
- The pattern is simple to implement and consistent with the app's flat design language

**Alternatives considered**:
- Bordered cards (`border border-gray-200`): Adds visual noise, feels more corporate
- Shadow cards (`shadow-card`): Would compete with the parent card container's visual weight
- Colored left border (accent stripe): Was considered but adds unnecessary complexity for 2-3 items per section

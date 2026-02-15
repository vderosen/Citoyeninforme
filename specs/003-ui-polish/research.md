# Research: UI Polish — Navigation & Information Hierarchy

**Feature**: 003-ui-polish | **Date**: 2026-02-15

## R1: Tab Bar Icon Selection

**Decision**: Use Ionicons (from `@expo/vector-icons`, already installed) with outline/filled toggle for active state.

| Tab | Active Icon | Inactive Icon |
|-----|-------------|---------------|
| Accueil | `home` | `home-outline` |
| Assistant | `chatbubble` | `chatbubble-outline` |
| Candidats | `people` | `people-outline` |

**Rationale**: Ionicons are the standard icon set bundled with Expo. The outline-to-filled pattern on focus is the de facto iOS/Android convention. Icon names verified against the Ionicons glyph map in `node_modules/@expo/vector-icons`.

**Alternatives considered**:
- MaterialIcons — equally valid but Ionicons map more naturally to the 3 tab concepts.
- Custom SVG icons — unnecessary complexity for standard navigation icons.

## R2: Header Configuration Strategy

**Decision**: Use native Stack headers (React Navigation 7) for all screens. Configure at three levels:

1. **Root Stack** (`src/app/_layout.tsx`): Enable `headerShown: true` for pushed screens (`candidate/[id]`, `comparison`, `survey`). Disable for `(tabs)` group (tabs have their own headers) and `onboarding`.

2. **Tab navigator** (`src/app/(tabs)/_layout.tsx`): Enable `headerShown: true` in `screenOptions`. Set per-tab titles: "Lucide" for Home, "Assistant" for Assistant, "Candidats" for Candidats.

3. **Survey Stack** (`src/app/survey/_layout.tsx`): Enable `headerShown: true` with contextual titles per step.

**Header styling**:
- `headerStyle: { backgroundColor: '#FFFFFF' }` — white background matching app theme
- `headerTintColor: '#2563EB'` — blue-600 for back arrows
- `headerTitleStyle: { fontWeight: '600', fontSize: 17, color: '#111827' }` — gray-900 semibold
- `headerShadowVisible: false` — clean flat look, rely on content scroll for separation

**Rationale**: Native Stack headers provide platform-native back navigation (swipe gesture on iOS, hardware back on Android) with zero custom code. Removing manual back buttons from `comparison.tsx` and `survey/intro.tsx` eliminates duplicated navigation logic.

**Alternatives considered**:
- Custom header component — rejected: more code, less native behavior, accessibility issues.
- Keep `headerShown: false` and build manual headers — rejected: this is the current broken state.

## R3: ContextBar Removal Impact

**Decision**: Delete `src/components/shell/ContextBar.tsx` entirely. Remove its import and rendering from `src/app/_layout.tsx`.

**Impact analysis**:
- The ContextBar is imported only in `src/app/_layout.tsx` (line 10, rendered at line 57).
- No other component references ContextBar.
- The election store data it consumed (`election.city`, `election.type`, `election.year`, `election.lastUpdated`) is still available to HeroBlock and any future component that needs it.
- The `lastUpdated` date will be relocated to a footnote at the bottom of the home screen ScrollView.

**Rationale**: The ContextBar was a Phase 1 placeholder that duplicated information already shown in HeroBlock. Professional apps never show a static metadata banner on every screen.

## R4: Home Screen Hero Compaction

**Decision**: Replace the current 3-line HeroBlock (big "Paris" + "Élections municipales 2026" + purpose text) with a compact layout:
- Line 1: `Élections municipales · Paris 2026` (single line, `text-xl font-bold`)
- Line 2: Purpose text (unchanged, `text-base text-gray-600`)

Remove the giant `text-3xl` city name — it adds no information that the compact heading doesn't already convey.

**Rationale**: The city name at 3xl is the largest text element on the home screen, yet it carries the least information density. Compacting it reclaims ~40px of vertical space and creates a cleaner entry point.

## R5: Primary CTA Differentiation

**Decision**: Make the survey button visually dominant over the two secondary actions by:
- Keeping the survey button full-width with `bg-blue-600` and larger padding
- Placing the two secondary actions (view candidates, ask question) side-by-side in a horizontal row with `bg-gray-100`

This creates a clear visual hierarchy: one big blue button, then two smaller gray buttons below.

**Rationale**: All three buttons currently have identical dimensions, making the primary action undiscoverable. The horizontal row for secondary actions also reduces total vertical space consumed.

## R6: ThemeFeed Section Title

**Decision**: Add a section title "Explorer par thème" above the horizontal FlatList in ThemeFeed. Use `text-base font-semibold text-gray-900` styling with `px-4 mb-2`.

**Rationale**: The theme carousel currently appears as a floating horizontal scroll with no label, breaking the card-title pattern used by every other section on the home screen.

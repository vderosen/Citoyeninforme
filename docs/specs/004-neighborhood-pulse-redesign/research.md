# Research: Neighborhood Pulse Visual Redesign

**Branch**: `004-neighborhood-pulse-redesign` | **Date**: 2026-02-15

## R1: Custom Font Loading in Expo

**Decision**: Use `@expo-google-fonts/space-grotesk` and `@expo-google-fonts/inter` via `expo-font`

**Rationale**: Official Expo packages provide pre-packaged Google Fonts with typed exports. Both packages are actively maintained and work seamlessly with Expo managed workflow. The `useFonts` hook handles async loading and returns a boolean to gate rendering (integrates with existing SplashScreen logic).

**Alternatives considered**:
- Manual `.ttf` bundling via `expo-font` loadAsync: More control but manual weight management. Rejected — @expo-google-fonts handles this automatically.
- System fonts only: Rejected — spec requires Space Grotesk display face for typographic personality (FR-002, FR-003).

**Key details**:
- Space Grotesk: 5 weights available (300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold). Project needs Medium, SemiBold, Bold.
- Inter: 9 weights × 2 variants (regular + italic). Project needs 400 Regular and 500 Medium.
- NativeWind limitation: React Native does not support font fallback arrays. Each fontFamily in tailwind.config.js must map to exactly one loaded font name.
- Font loading must happen in root `_layout.tsx` before SplashScreen.hideAsync().

## R2: NativeWind v4 Design Token System

**Decision**: Extend `tailwind.config.js` with semantic color names, custom font families, and spacing values under `theme.extend`.

**Rationale**: NativeWind v4 uses standard Tailwind CSS configuration. Custom tokens defined in `theme.extend` become available as utility classes (e.g., `bg-civic-navy`, `font-display-bold`, `text-accent-coral`). This centralizes all design decisions in one file — addressing FR-001 and SC-001.

**Alternatives considered**:
- CSS custom properties (variables): NativeWind v4 has experimental support, but not production-ready. Rejected — standard Tailwind extend is proven and stable.
- GluestackUI theme provider: Already installed but unused. Adding a parallel theme system adds complexity. Rejected — NativeWind is already the primary styling approach across all 43 TSX files.
- Separate `tokens.ts` file with StyleSheet: Would duplicate Tailwind config and break NativeWind class-based workflow. Rejected.

**Implementation**:
- Colors: `civic-navy`, `accent-coral`, `warm-white`, `warm-gray`, `body-text`, `caption-text`, plus signal colors
- Fonts: `font-display` (Space Grotesk), `font-body` (Inter) with weight variants
- Spacing: Reuse Tailwind's default 4px grid (already well-used in codebase)

## R3: District-Block Clip Shape

**Decision**: Use a wrapper component combining `overflow: hidden` with an absolutely-positioned diagonal View for the corner clip, falling back to `react-native-svg` ClipPath only if needed.

**Rationale**: The spec calls for a "subtle" angled clip — not a complex polygon. A simple View-based approach (triangle overlay matching the background color, or a rotated rectangle) is performant, requires no additional dependencies, and composes well with NativeWind classes. SVG ClipPath would be overkill for a single-corner clip.

**Alternatives considered**:
- `react-native-svg` ClipPath: Full polygon clipping capability. Available in Expo SDK 54. Good for complex shapes but heavier for a subtle single-corner effect. Reserve as fallback.
- `react-native-skia`: Most powerful option for graphics. Adds ~1MB to bundle. Rejected — far too heavy for a single corner clip.
- CSS `clip-path` polygon: Not supported in React Native.

**Implementation approach**:
- Create `<DistrictBlockCard>` wrapper component
- Accept `clipCorner` prop: `'top-right' | 'bottom-left' | 'none'`
- Use overflow hidden + rotated triangle View for clip effect
- Style with NativeWind classes for background, padding, shadow

## R4: Staggered Fade-In Animations

**Decision**: Use `react-native-reanimated` v4 entering animations with `FadeInDown.delay(index * 50)` on list item wrappers.

**Rationale**: Reanimated v4.1.1 is already installed in the project. The `entering` prop on `Animated.View` provides declarative staggered entrance with minimal code. The `.delay()` modifier chains naturally with `.duration()` for per-item timing.

**Alternatives considered**:
- React Native's built-in `Animated` API with `stagger()`: Lower-level, requires manual management. Rejected — Reanimated entering animations are simpler.
- `react-native-animatable`: Third-party library with stagger support. Rejected — unnecessary dependency when Reanimated is already available.

**Pattern**:
```
<Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
```

**Reduce motion**: Wrap with conditional — if `useReducedMotion()` returns true, skip the `entering` prop entirely.

## R5: Parallax Scroll Effect

**Decision**: Use `react-native-reanimated` `useAnimatedScrollHandler` + `useAnimatedStyle` with `interpolate` for hero parallax.

**Rationale**: Reanimated's scroll handler runs on the UI thread (native driver), providing 60fps parallax without JS bridge overhead. This is the most performant approach for Expo managed workflow.

**Alternatives considered**:
- React Native built-in `Animated.ScrollView` with `Animated.event`: Works but less performant than Reanimated's worklet-based approach. Acceptable fallback.
- Third-party `react-native-parallax-scroll-view`: Adds a dependency for a single-screen effect. Rejected.

**Implementation**: Track `scrollY` via scroll handler, interpolate hero translateY to scroll at ~0.5x speed relative to content.

## R6: Reduce Motion Preference

**Decision**: Use `useReducedMotion()` from `react-native-reanimated`.

**Rationale**: Already available in the installed Reanimated v4.1.1. Returns a synchronous boolean. Integrates directly with animation code — no additional hooks or event listeners needed.

**Alternatives considered**:
- `AccessibilityInfo.isReduceMotionEnabled()` from React Native core: Async, requires useEffect + state. More boilerplate. Acceptable fallback.
- `react-reduce-motion` package: Third-party. Rejected — unnecessary dependency.

**Implementation**: Create a thin `useMotionPreference()` hook that wraps `useReducedMotion()` and returns `{ shouldAnimate: boolean }`. All animation components check this before applying entering/transition animations.

## R7: WCAG Contrast Ratios

**Decision**: Coral #E8553A FAILS WCAG AA for normal text on #FAFAF8 — use navy for body text, coral for large text and interactive elements only.

**Findings**:
| Combination | Contrast Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|-------------|---------------|-----------------|----------------|
| Navy #1B2A4A on #FAFAF8 | ~13.1:1 | PASS | PASS |
| Coral #E8553A on #FAFAF8 | ~3.6:1 | FAIL | FAIL |
| Coral #E8553A on #FAFAF8 (large text, 3:1) | ~3.6:1 | PASS | — |
| Coral #E8553A on Navy #1B2A4A | ~3.7:1 | PASS (large) | FAIL |

**Implications for FR-028**:
- Coral text is safe for: hero headings (≥18pt bold), button labels (≥14pt bold), large accent numbers
- Coral text is NOT safe for: body text, captions, small labels
- Navy is the default text color for all sizes
- Coral is reserved for: backgrounds, borders, icons, large text accents, interactive element fills

**Darkened coral alternative**: Consider #C23D22 for rare cases where small coral text is essential (~4.5:1 on #FAFAF8). Document in design tokens as `accent-coral-dark`.

## R8: Current Codebase Assessment

**Decision**: Confirmed — codebase is fully compatible with visual-only redesign. No structural rewrites needed.

**Findings**:
- **43 TSX files** total (12 screens, 31 components)
- **100% NativeWind** class-based styling — no StyleSheet.create() anywhere
- **tailwind.config.js** has empty `theme.extend` — clean slate for design tokens
- **expo-font** installed but not used — font loading infrastructure exists
- **react-native-reanimated** v4.1.1 installed but not used — animation infrastructure exists
- **GluestackUIProvider** wraps app but no GlueStack components are used — can keep or remove
- **Accessibility utilities** exist (`src/utils/accessibility.ts`) — `minimumTouchableSize()` helper
- **i18n** fully set up with react-i18next — 7 namespaces, French-only, no language switcher UI
- **No custom colors** in Tailwind — all defaults (blue-600, gray-*, white)
- **Hardcoded hex colors** in _layout.tsx files: `#FFFFFF`, `#2563EB`, `#111827`, `#6B7280`, `#E5E7EB`

**Color audit** — current palette to replace:
- `#2563EB` (blue-600) → `#1B2A4A` (civic-navy) for primary, `#E8553A` (accent-coral) for CTAs
- `bg-white` → `bg-warm-white` (#FAFAF8)
- `bg-gray-50`, `bg-gray-100` → `bg-warm-gray` (#F0EDE8)
- `text-gray-900` → `text-civic-navy` (#1B2A4A)
- `text-gray-700`, `text-gray-600` → `text-body` (#3D3D3D)

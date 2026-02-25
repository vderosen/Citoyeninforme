# Design Tokens Contract

**Branch**: `004-neighborhood-pulse-redesign` | **Date**: 2026-02-15

## Purpose

This contract defines the exact design token values that `tailwind.config.js` must implement. All screens and components reference these tokens — never raw hex values.

## Color Tokens

```
colors:
  # Base surfaces
  warm-white:        "#FAFAF8"     # Main canvas background
  warm-gray:         "#F0EDE8"     # Card/section surfaces

  # Civic primary
  civic-navy:        "#1B2A4A"     # Headers, navigation, primary text
  civic-navy-light:  "rgba(27,42,74,0.05)"  # Tinted featured sections

  # Energy accent
  accent-coral:      "#E8553A"     # CTAs, active states, progress bars
  accent-coral-dark: "#C23D22"     # Small text (AA-compliant on light bg)
  accent-coral-light: "rgba(232,85,58,0.08)"  # Subtle coral fill on selection

  # Text
  text-primary:      "#1B2A4A"     # = civic-navy (headings)
  text-body:         "#3D3D3D"     # Body copy
  text-caption:      "#6B7280"     # Captions, metadata
  text-inverse:      "#FAFAF8"     # Text on dark backgrounds

  # Signal (muted editorial)
  signal-green:      "#16A34A"     # Verified/success
  signal-amber:      "#D97706"     # Uncertain/warning
  signal-red:        "#DC2626"     # Error

  # Fallback
  party-fallback:    "#9CA3AF"     # Candidate with no party color
```

## Typography Tokens

```
fontFamily:
  display-bold:      ["SpaceGrotesk_700Bold"]
  display-semibold:  ["SpaceGrotesk_600SemiBold"]
  display-medium:    ["SpaceGrotesk_500Medium"]
  body:              ["Inter_400Regular"]
  body-medium:       ["Inter_500Medium"]
```

## Typography Scale (Semantic Classes)

| Class | Font Family | Weight | Size | Line Height | Color | Usage |
|-------|-------------|--------|------|-------------|-------|-------|
| `.text-hero` | display-bold | 700 | 28-32px | 1.2 | civic-navy | Hero/page titles |
| `.text-section` | display-semibold | 600 | 20px | 1.3 | civic-navy | Section headers |
| `.text-card-title` | display-medium | 500 | 16-17px | 1.3 | civic-navy | Card titles |
| `.text-stat` | display-bold | 700 | varies | 1.1 | civic-navy | Numbers, stats |
| `.text-body` | body | 400 | 15-16px | 1.5 | text-body | Body text |
| `.text-body-emphasis` | body-medium | 500 | 15-16px | 1.5 | text-body | Emphasized body |
| `.text-caption` | body-medium | 500 | 12-13px | 1.4 | text-caption | Labels, captions |

## Shadow Tokens

```
boxShadow:
  card:     "0 1px 3px rgba(27,42,74,0.08)"
  elevated: "0 4px 12px rgba(27,42,74,0.12)"
```

## Accessibility Constraints

- Navy (#1B2A4A) on warm-white (#FAFAF8): ~13.1:1 — use for all text sizes
- Coral (#E8553A) on warm-white (#FAFAF8): ~3.6:1 — ONLY for large text (≥18pt bold / ≥14pt bold)
- Coral-dark (#C23D22) on warm-white (#FAFAF8): ~4.5:1 — use when small coral text is essential
- Minimum touch target: 48×48px
- Focus outline: 2px coral (#E8553A) with 2px offset outer glow
```

## District-Block Shape Contract

```
clipCorner:
  size: 16px diagonal
  variants:
    top-right:    clip applied to top-right corner
    bottom-left:  clip applied to bottom-left corner
    none:         standard rounded corners (default)

  applied-to:
    - Hero cards (top-right)
    - Candidate gallery cards (top-right)
    - Theme feed cards (top-right)
    - Section headers (bottom-left)

steppedDivider:
  height: 4px
  pattern: city-skyline stepped blocks
  color: warm-gray on warm-white background
```

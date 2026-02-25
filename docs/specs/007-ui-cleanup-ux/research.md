# Research: UI Cleanup & UX Improvements

**Feature**: 007-ui-cleanup-ux | **Date**: 2026-02-19

## R1: Assistant Conversation Isolation — Store Architecture

**Decision**: Refactor `useAssistantStore` to use a `conversations` record keyed by composite string `${mode}` or `${mode}:${candidateId}`.

**Rationale**:
- Current state has a flat `messages: ChatMessage[]` shared across all modes and candidates
- A keyed record allows O(1) lookup for any conversation and avoids message mixing
- Zustand persist can serialize the full record to AsyncStorage without special handling
- The composite key pattern (`"comprendre"`, `"parler:david-belliard"`, `"debattre"`) is simple, readable, and collision-free

**Alternatives considered**:
- **Separate stores per mode**: Rejected — introduces 3 stores with duplicated logic, harder to persist and export
- **Array with conversation metadata**: Rejected — requires filtering on every render, O(n) lookups
- **Database (SQLite) for conversations**: Rejected — over-engineered for MVP; AsyncStorage is sufficient for the expected conversation count (<30 threads)

**Key implementation details**:
- Conversation key formula: `mode === "parler" ? \`parler:${candidateId}\` : mode`
- `getCurrentMessages()` selector derives from current mode + selectedCandidateId
- `addMessage()` appends to the correct conversation key automatically
- `resetConversation()` clears only the current conversation key
- Migration: on first load after upgrade, move existing `messages[]` to `"comprendre"` key (best-guess migration)

---

## R2: Compare Mode UX on Candidates Page

**Decision**: Add a floating "Comparer" FAB button on the candidates page. Tapping it toggles compare mode, which overlays selection checkboxes on candidate cards. A bottom bar shows selection count and a "Voir la comparaison" confirm button.

**Rationale**:
- FAB is a well-established mobile pattern for secondary actions
- Bottom bar for confirmation follows standard multi-select patterns (Photos app, email clients)
- Keeps the default gallery clean — compare UI only appears when activated
- Reuses the existing `comparison.tsx` page; only the entry point changes

**Alternatives considered**:
- **Header button**: Rejected — header is already used for tab title, less discoverable on mobile
- **Long-press to select**: Rejected — not discoverable, no standard affordance
- **Dedicated compare tab/screen**: Rejected — violates Simplicity principle (VI), adds a screen

**Key implementation details**:
- `compareMode: boolean` and `selectedForCompare: string[]` as local state in `candidates.tsx` (not in Zustand — transient UI state)
- Max 4 candidates, min 2 to confirm
- Navigation: `router.push({ pathname: "/comparison", params: { selected: selectedIds.join(",") } })`
- Comparison page already parses `selected` param — reuse existing logic

---

## R3: Home Page Simplification — Survey CTA Component

**Decision**: Reuse the existing `PrimaryShortcuts` component but strip it down to render only the survey CTA button. The two other shortcut buttons ("Explorer les candidats", "Poser une question") are removed since they duplicate tab navigation.

**Rationale**:
- `PrimaryShortcuts` already contains the survey status label logic (not_started → "Tester mes idees", in_progress → "Reprendre le sondage", completed → "Refaire le sondage")
- Keeping the component (renamed conceptually to "SurveyCTA") avoids rewriting the status-dependent label logic
- Alternative: extract the survey CTA into the home page directly — viable but PrimaryShortcuts is already clean

**Alternatives considered**:
- **New SurveyCTA component**: Acceptable but unnecessary code churn when PrimaryShortcuts can simply stop rendering the other two buttons
- **Inline in index.tsx**: Rejected — keeps the home page file simpler to have a dedicated component

---

## R4: LanguageSwitcher Removal — Impact Analysis

**Decision**: Delete `src/components/shell/LanguageSwitcher.tsx` and remove all imports/usages from `src/app/(tabs)/_layout.tsx`.

**Rationale**:
- Only French translations are loaded (`src/i18n/index.ts` only imports `fr` locale)
- The toggle visually suggests bilingual support that does not exist
- Only 2 files reference it: the component definition and the tab layout

**Impact**:
- `_layout.tsx` global `headerRight` currently renders `<LanguageSwitcher />` — remove entirely
- Home tab custom `headerRight` renders Settings icon + LanguageSwitcher — keep Settings icon only
- No other files import LanguageSwitcher (confirmed via codebase search)
- i18n infrastructure (`react-i18next`, locale files) remains intact for future EN support

---

## R5: Candidate Detail Page — CTA Consolidation

**Decision**: Remove "Comparer" and "Poser une question" action buttons from `CandidateProfileCard`. Keep only "Debattre" which navigates to the assistant in "parler" mode with the candidate pre-selected.

**Rationale**:
- "Comparer" is moved to the candidates gallery page (R2)
- "Poser une question" duplicates the Assistant tab functionality
- Single CTA reduces decision paralysis and aligns with the page's primary purpose
- The existing `handleDebate` function already does the right thing: `selectMode("parler")` + `selectCandidate(id)` + `router.push("/(tabs)/assistant")`

**Implementation note**:
- After conversation isolation (R1), `handleDebate` will automatically create or resume the isolated conversation for that candidate — no additional logic needed

---

## R6: Candidate Gallery — Uniform Card Sizing

**Decision**: Remove the optional `positionSnippet` text from gallery cards and fix card height to a constant value. Cards display only: party color bar, photo (square), name (1 line), party (1 line).

**Rationale**:
- Position snippets were shown only when a theme was filtered — with ThemeFilter removed, snippets no longer appear anyway
- Without variable-length text, all cards naturally have the same height
- Fixed content (photo + name + party) ensures uniform dimensions without needing explicit height constraints

**Key implementation details**:
- Remove `positionSnippets` prop and related logic from `CandidateGallery`
- Remove `positionSnippet` rendering from individual card layout
- Card height becomes naturally uniform: color bar (6px) + square image + name text + party text + padding
- Keep `numColumns={2}` FlatList layout with existing gap/padding

# Research: 009-home-redesign

**Date**: 2026-02-19
**Feature**: [spec.md](./spec.md)

## R1: Existing HeroBlock component — reuse vs. rewrite

**Decision**: Reuse and extend the existing `HeroBlock` component (`src/components/home/HeroBlock.tsx`).

**Rationale**: HeroBlock already displays `election.city`, `election.year`, `t("subtitle")` (Elections municipales), and `t("purpose")`. It matches FR-001 and FR-002 almost entirely. The only change needed is to format the heading using the existing `heroHeading` i18n key (`"{{type}} · {{city}} {{year}}"`) instead of the current `{election.city} {election.year}` pattern. The `purpose` tagline is already rendered.

**Alternatives considered**:
- Creating a new `HomeHero` component: rejected because HeroBlock already exists and is not used on the current home page (it was created during a previous redesign but never wired in). Reusing it avoids duplication.

## R2: Survey button positioning — conditional rendering strategy

**Decision**: Replace `PrimaryShortcuts` with two distinct rendering paths in `index.tsx`:
1. When `surveyStatus !== "completed"`: render a standard CTA button below the hero (not a full-width hero card).
2. When `surveyStatus === "completed"`: render a discreet text link at the bottom of the page, after voting info cards.

**Rationale**: The spec (FR-007, FR-008) requires fundamentally different visual treatments. The current `PrimaryShortcuts` always renders the same coral hero block. Rather than adding conditional logic to PrimaryShortcuts, it's cleaner to refactor it: the component becomes a simple CTA button (no DistrictBlockCard wrapping) for not_started/in_progress, and a separate inline text link for completed.

**Alternatives considered**:
- Keeping `PrimaryShortcuts` with internal conditionals: viable but makes the component do two very different things. Rejected for clarity.
- Two separate components (`SurveyCTA` + `RetakeLink`): considered but over-engineering for what amounts to a few lines of JSX each. Better to inline both in `index.tsx` and remove PrimaryShortcuts entirely.

**Final approach**: Refactor `PrimaryShortcuts.tsx` to become a simpler `SurveyCTA` that renders the standard button style. Add a separate `RetakeLink` text element inline in index.tsx for the completed state.

## R3: VotingInfoCard — accordion removal and card-per-section layout

**Decision**: Remove the accordion (`useState(false)` + expand/collapse logic) from `VotingInfoCard`. Replace with three separate visual cards, one per sub-section (keyDates, eligibility, votingMethods), each with a thematic Ionicons icon.

**Rationale**: FR-005 requires content displayed by default without collapse. FR-006 requires separate cards with icons. The current component has all three sections inside one collapsed card. The simplest approach is to refactor VotingInfoCard to render three independent cards vertically, each conditionally shown only if data exists (FR-010).

**Icon choices**:
- keyDates → `calendar-outline` (Ionicons)
- eligibility → `checkmark-circle-outline` (Ionicons)
- votingMethods → `ballot-outline` or `document-text-outline` (Ionicons) — using `document-text-outline` as Ionicons doesn't have a ballot icon

**Alternatives considered**:
- Three separate components (KeyDatesCard, EligibilityCard, VotingMethodsCard): over-engineering. A single VotingInfoCard component rendering three card Views is simpler and keeps the logistics data prop in one place.

## R4: TrustCard — simplification to discreet banner

**Decision**: Replace the current card with a lightweight banner: a single row with a shield icon (`shield-checkmark-outline` from Ionicons) and a concise neutrality statement. No title, no badges.

**Rationale**: FR-003 requires a discreet banner without interrogative title. FR-004 requires removal of `non_documente` and `incertain` badges. The existing `common.neutralityStatement` i18n key contains the full neutrality text. We'll use it directly, or a shorter inline version: the text already says "Lucide est un outil neutre et non partisan. Toutes les informations sont sourcees et verifiables."

**Alternatives considered**:
- Keeping the `source` badge only: rejected because even one badge creates visual inconsistency with the discreet banner intent.
- Creating a completely new component: the existing TrustCard file can be refactored in place.

## R5: Section ordering in index.tsx

**Decision**: Reorder the home screen sections per FR-009:
1. `HeroBlock` (election context + purpose tagline)
2. Survey CTA button (if surveyStatus !== "completed")
3. Trust banner (discreet)
4. `VotingInfoCard` (3 expanded cards) — conditional on logistics
5. Retake survey link (if surveyStatus === "completed")
6. Last updated footer

**Rationale**: Direct implementation of FR-009. The current order is PrimaryShortcuts → VotingInfoCard → TrustCard → footer. HeroBlock exists but is not used on the home page.

## R6: i18n key availability

**Decision**: All required i18n keys already exist. No new keys needed.

**Existing keys used**:
- `home.heroHeading` → `"{{type}} · {{city}} {{year}}"` — for hero heading
- `home.purpose` → tagline (already in HeroBlock but not rendered on home)
- `home.subtitle` → "Elections municipales" (backup)
- `home.startSurvey` → "Tester mes idees"
- `home.resumeSurvey` → "Reprendre le sondage"
- `home.retakeSurvey` → "Refaire le sondage"
- `home.votingInfo`, `home.keyDates`, `home.eligibility`, `home.votingMethods` → section headers
- `common.neutralityStatement` → trust banner text
- `home.lastUpdated` → footer

**Rationale**: The spec assumption is correct — all keys are already available. No i18n file changes needed.

## R7: Unused components cleanup

**Decision**: The following components are currently unused on the home page and can remain as-is (no deletion needed since they may be used elsewhere or were part of other features):
- `ResumeCard.tsx` — not imported in index.tsx currently
- `ThemeFeed.tsx` — not imported in index.tsx currently
- `HeroBlock.tsx` — will now be imported

**Rationale**: We only modify files that need changes for this feature. Unused components don't need cleanup unless they conflict.

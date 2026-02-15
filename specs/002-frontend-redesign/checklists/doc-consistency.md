# Documentation Consistency Checklist: Frontend Redesign

**Purpose**: Validate that the 3-tab navigation design is consistently documented as the standard across all project artifacts, with no misleading references to the legacy 2-page layout as the canonical design.
**Created**: 2026-02-15
**Feature**: [spec.md](../spec.md), [plan.md](../plan.md)
**Focus**: Cross-document consistency for navigation architecture
**Depth**: Standard
**Audience**: Author / Reviewer

## Constitution Alignment

- [x] CHK001 - Is the constitution's Principle VI UI structure description updated to reference 3 tabs (Accueil, Assistant, Candidats) instead of "two pages (Home, Learn) and one persistent chatbot layer"? [Consistency, Constitution §VI]
- [x] CHK002 - Is the constitution version bumped to reflect the Principle VI amendment? [Traceability, Constitution §Governance]
- [x] CHK003 - Is the Sync Impact Report at the top of the constitution updated to document the Principle VI change? [Traceability, Constitution]
- [x] CHK004 - Does the constitution's amendment rationale in the Sync Impact Report explain why the UI structure changed? [Clarity, Constitution]

## Plan Alignment

- [x] CHK005 - Does the plan's Constitution Check show Principle VI as "PASS" (not "REVIEW" or "VIOLATION")? [Consistency, Plan §Constitution Check]
- [x] CHK006 - Does the plan's Gate Result state all 7 principles are satisfied without deviation notes? [Consistency, Plan §Constitution Check]
- [x] CHK007 - Is the Complexity Tracking section free of violation justifications for the 3-tab design? [Consistency, Plan §Complexity Tracking]
- [x] CHK008 - Does the plan's Summary correctly describe the migration direction (from old design to 3-tab) without implying the old design is still canonical? [Clarity, Plan §Summary]
- [x] CHK009 - Is the 3-tab structure consistently described in the plan's Project Structure section? [Completeness, Plan §Project Structure]

## Spec Alignment

- [x] CHK010 - Does the spec's FR-001 define the 3-tab bottom navigation as a first-class requirement without referencing a prior design? [Clarity, Spec §FR-001]
- [x] CHK011 - Are the tab names consistent across all spec references (Accueil, Assistant, Candidats)? [Consistency, Spec]
- [x] CHK012 - Does the spec avoid any language suggesting the 3-tab design is a deviation or exception? [Consistency, Spec]

## Research Alignment

- [x] CHK013 - Does research.md R-005 describe the assistant tab as the canonical design rather than a replacement that needs justification? [Clarity, Research §R-005]
- [x] CHK014 - Does research.md R-010 (Migration Strategy) accurately frame the route restructuring as an evolution from 001's design to 002's design, without implying the old structure is the constitution's standard? [Clarity, Research §R-010]

## Contract Alignment

- [x] CHK015 - Does the navigation contract define the 3-tab layout as the standard tab bar configuration? [Completeness, Contracts §navigation.md]
- [x] CHK016 - Are tab names and positions consistent between the navigation contract and the spec's FR-001? [Consistency, Contracts §navigation.md vs Spec §FR-001]

## Cross-Document Consistency

- [x] CHK017 - Are references to the old "2-page" design used only in historical/migration context (describing what changed), never as the current standard? [Consistency, Cross-doc]
- [ ] CHK018 - Is the term "chatbot" used only for the backend service layer (LLM proxy), and "assistant" used for the user-facing tab/feature across all 002 documents? [Consistency, Cross-doc]
- [x] CHK019 - Does the constitution's 3-tab description match the spec's FR-001 tab names and positions exactly? [Consistency, Constitution §VI vs Spec §FR-001]
- [x] CHK020 - Are there zero references to "violation" or "deviation" related to the 3-tab design in any current document? [Consistency, Cross-doc]

## Feature 001 Historical Context

- [x] CHK021 - Are feature 001 documents left unchanged, correctly representing the design as it was at that time? [Traceability, 001 docs]
- [x] CHK022 - Is there no backward-propagation of the 3-tab design into 001 documents (which accurately describe the 2-page design that was implemented)? [Traceability, 001 docs]

## Notes

- CHK014: Resolved. Research R-010 updated to frame migration as superseding feature 001's routes with the canonical 3-tab structure.
- CHK018: The service file `chatbot.ts` retains its name (it's the LLM API layer), while the store is renamed to `assistant.ts`. This is a deliberate naming split documented in the quickstart. The plan's Project Structure section lists both `chatbot.ts` (service, unchanged) and `assistant.ts` (store, renamed). Verify during implementation that user-facing copy never says "chatbot."
- Feature 001 documents (`specs/001-civic-election-app/plan.md`, `research.md`) correctly describe the 2-page + chatbot overlay design that was the standard at that time. These are historical artifacts and should not be modified.

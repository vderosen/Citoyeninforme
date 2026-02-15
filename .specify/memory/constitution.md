<!--
=== Sync Impact Report ===
Version change: 1.0.0 → 1.1.0
Modified principles:
  - Principle VI: Simplicity & MVP Discipline
    Changed: UI structure from "two pages (Home, Learn) and one persistent chatbot layer"
    to "three tabs (Accueil, Assistant, Candidats)" reflecting the redesigned navigation
    model from feature 002-frontend-redesign.
Added sections: N/A
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed
  - .specify/templates/spec-template.md ✅ no changes needed
  - .specify/templates/tasks-template.md ✅ no changes needed
Follow-up TODOs: none
-->

# Lucide Constitution

## Core Principles

### I. Neutrality & Non-Prescription

The application MUST NOT tell users who to vote for. Every
interface, algorithm, and conversational interaction MUST
treat all candidates and positions with equal weight and
presentation quality.

- Survey matching MUST use a transparent, deterministic
  algorithm. No hidden weighting or editorial bias.
- Candidate bots MUST defend only documented positions
  and MUST NOT editorialize or rank candidates.
- The Socratic debate coach MUST challenge reasoning
  without steering users toward any political outcome.
- UI ordering of candidates MUST be alphabetical or
  randomized per session—never ranked by editorial choice.

**Rationale**: The product's credibility depends entirely on
users trusting that it has no political agenda. Any perceived
bias destroys the core value proposition.

### II. Source-Grounded Truth

Every factual claim surfaced by the application—whether in
the Learn page, chatbot responses, or survey justifications—
MUST be traceable to a documented source in the election
dataset.

- Candidate positions MUST reference the original program
  document, public statement, or official source.
- The system MUST clearly distinguish verified facts from
  inferences, interpretations, or unavailable data.
- When information is missing or uncertain, the system
  MUST say so explicitly rather than fabricate or guess.
- Source references MUST be accessible to users (link,
  document name, or citation).

**Rationale**: Political misinformation causes real harm.
Grounding every claim in verifiable sources is a non-negotiable
trust requirement.

### III. City-Agnostic Architecture

The application MUST be designed so that any city or election
can be supported by swapping the election dataset without
code changes to core logic.

- Election-specific data (candidates, rules, propositions,
  logistics) MUST be isolated in a structured dataset layer,
  separate from application logic.
- UI components, survey engine, chatbot modes, and matching
  algorithms MUST operate on generic data schemas, not
  Paris-specific structures.
- Configuration (city name, election type, voting rules,
  dates) MUST be externalized, not hardcoded.

**Rationale**: The product vision is a reusable civic tool.
Coupling to a single city would require a rewrite for each
new deployment, defeating the purpose.

### IV. Critical Thinking Over Persuasion

Every interactive feature MUST aim to strengthen the user's
reasoning capacity rather than convince them of any position.

- The debate coach MUST use Socratic questioning: surface
  contradictions, highlight trade-offs, and ask the user to
  resolve tensions—never assert what the "right" answer is.
- Contradiction and trade-off detection MUST be based on
  logical analysis of stated preferences, not on editorial
  judgment of political positions.
- The system MUST encourage exploration ("compare",
  "show alternatives", "explain consequences") rather
  than convergence toward a predetermined view.

**Rationale**: The app exists to make users better thinkers
about politics, not to replace their judgment. Persuasion
would undermine autonomy and trust.

### V. Structured Data as Single Source of Truth

All application features—survey matching, Learn page,
candidate bots, debate mode, neutral assistant—MUST derive
their content from a single, curated election dataset.

- There MUST be exactly one authoritative dataset per
  election deployment. No feature may maintain a shadow
  copy or alternative data source for the same information.
- The dataset schema MUST include: candidates, propositions,
  thematic classification, verified sources, and local
  election rules/logistics.
- Changes to the dataset MUST propagate consistently to
  all features without manual synchronization.

**Rationale**: Data inconsistencies between features would
erode trust and create contradictory user experiences.
A single source of truth eliminates this class of bugs.

### VI. Simplicity & MVP Discipline

The application MUST remain intentionally minimal. Every
feature addition MUST justify its presence against the core
user goals: learn about an election and think critically
about programs.

- The UI consists of three tabs (Accueil, Assistant,
  Candidats) mapping to the three core user intents:
  discover, ask, and compare. Additional screens (e.g.,
  candidate profiles, comparison, survey flow) are
  presented as stack screens above the tabs. New tabs
  require explicit justification against this constraint.
- Features MUST be delivered incrementally: each increment
  MUST be independently testable and deployable.
- YAGNI applies: do not build for hypothetical future
  elections or features that are not in the current
  deployment scope.

**Rationale**: Scope creep is the primary risk for a
civic tool built under time pressure (election date is
a hard deadline). Simplicity ensures delivery.

### VII. Privacy & Trust

The application MUST handle user data—especially political
preference profiles—with maximum care.

- Survey results and user preference profiles MUST be
  stored locally on the user's device by default. Any
  server-side storage requires explicit user consent.
- The application MUST NOT share, sell, or expose user
  political preferences to third parties.
- Analytics, if implemented, MUST be aggregate and
  anonymized. No individual political profiles may be
  tracked or linked to identifiable users.

**Rationale**: Users are sharing sensitive political views.
Any privacy failure would not only violate trust but could
cause real-world harm to users.

## Content & Data Standards

- Each election dataset MUST pass schema validation before
  deployment. Missing required fields MUST block deployment.
- Thematic classification MUST use a consistent taxonomy
  across all candidates in a given election. Ad-hoc themes
  per candidate are not permitted.
- Candidate positions MUST be represented as structured
  records (theme, position summary, details, sources), not
  as free-text blobs.
- Election logistics (dates, eligibility, voting locations)
  MUST be verified against official government sources.
- Dataset updates during an active election period MUST be
  versioned and auditable.

## Development Workflow

- All features MUST be developed behind the structured
  specification workflow (spec → plan → tasks → implement).
- Code MUST be tested before merge. Unit tests for logic,
  integration tests for data flow, and contract tests for
  API boundaries.
- Chatbot responses MUST be evaluated against a curated
  test set of questions covering each mode (Learn, Candidate,
  Debate) before deployment.
- Accessibility (WCAG 2.1 AA) MUST be maintained for all
  user-facing interfaces. Civic tools must be usable by
  everyone.
- The application MUST support French as the primary
  language for the Paris 2026 MVP. Internationalization
  hooks SHOULD be present for future deployments.

## Governance

This constitution is the highest-authority document for
the Lucide project. All specifications, plans, and
implementation decisions MUST comply with these principles.

- **Amendments**: Any change to this constitution MUST be
  documented with a version bump, rationale, and impact
  assessment on existing features.
- **Versioning**: This document follows semantic versioning.
  MAJOR for principle removals/redefinitions, MINOR for
  new principles or material expansions, PATCH for
  clarifications and wording fixes.
- **Compliance review**: Each feature specification MUST
  include a constitution check confirming alignment with
  all applicable principles before implementation begins.
- **Conflict resolution**: When a feature requirement
  conflicts with a principle, the principle wins. The
  feature MUST be redesigned, or a constitution amendment
  MUST be proposed and approved first.

**Version**: 1.1.0 | **Ratified**: 2026-02-13 | **Last Amended**: 2026-02-15

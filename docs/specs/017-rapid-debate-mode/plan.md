# Implementation Plan: Rapid Debate Mode

**Branch**: `017-rapid-debate-mode` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-rapid-debate-mode/spec.md`

## Summary

Replace the free-text chat in "Débattre" mode with a structured rapid debate: the LLM generates an argument + 2-4 response options as JSON each turn, the user taps one option to advance, and the debate concludes with a summary including candidate proximity. The existing SSE streaming endpoint is reused by collecting the full response and parsing JSON client-side. No backend changes required.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: Expo Router 6.0, Zustand 5.0.3, react-i18next 15.4.1, NativeWind 4.1.23, react-native-reanimated 4.1.1, @expo/vector-icons 15.0.3 (Ionicons)
**Storage**: In-memory only (Zustand state, NOT persisted). Debate history is ephemeral.
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS, Android, Web (Expo managed workflow)
**Project Type**: Mobile app (single project)
**Performance Goals**: <5s per debate turn generation (SC-002), 95% successful JSON parsing (SC-003)
**Constraints**: No streaming for debate mode (full JSON response awaited), no keyboard interaction (100% tap-based), no backend proxy changes
**Scale/Scope**: 8 themes, 7 candidates, 15 documented positions, ~5-10 turns per debate session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Neutrality & Non-Prescription | PASS | Options represent diverse stances without bias. Conclusion provides factual proximity, never recommendations. LLM prompt explicitly forbids steering. |
| II. Source-Grounded Truth | PASS | Turn JSON includes `sources` field for citations. Candidate proximity requires justification referencing documented positions. LLM instructed to cite sources. |
| III. City-Agnostic Architecture | PASS | All debate logic operates on generic `Theme`, `Position`, `Candidate` schemas. No Paris-specific hardcoding. Theme grid populated from election dataset. |
| IV. Critical Thinking Over Persuasion | PASS | Core purpose is Socratic questioning. Options present trade-offs, not leading answers. Conclusion highlights reasoning patterns, not "correct" positions. |
| V. Structured Data as Single Source of Truth | PASS | All debate content derives from the election dataset (positions, themes, candidates). No shadow data sources. |
| VI. Simplicity & MVP Discipline | PASS | No new tabs — replaces existing debate mode within Assistant tab. Reuses existing components (PressableScale, ModeSelector). Minimal new entities. |
| VII. Privacy & Trust | PASS | Debate history is ephemeral (not persisted). No server-side storage of debate choices. Survey profile accessed locally only. |

**Post-Phase 1 re-check**: All gates still pass. The data model introduces no persistence of debate data. The JSON contract adds no new server-side state. Candidate proximity in conclusions is factual and source-justified per Principle I and II.

## Project Structure

### Documentation (this feature)

```text
specs/017-rapid-debate-mode/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Entity definitions
├── quickstart.md        # Phase 1: Setup guide
├── contracts/           # Phase 1: Service contracts
│   ├── debate-service.ts
│   └── debate-store.ts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── assistant/
│       ├── ChatArea.tsx                # EXISTING — unchanged (comprendre/parler)
│       ├── ModeSelector.tsx            # EXISTING — unchanged (already supports debattre)
│       ├── EmptyState.tsx              # EXISTING — unchanged
│       ├── DebateArea.tsx              # NEW — main debate container
│       ├── DebateTurnCard.tsx          # NEW — single turn: statement + options/selected
│       ├── DebateOptionButton.tsx      # NEW — option button (PressableScale wrapper)
│       ├── DebateConclusionCard.tsx    # NEW — conclusion summary display
│       └── DebateThemeGrid.tsx         # NEW — theme selection grid (no-survey start)
├── services/
│   ├── chatbot.ts                     # EXISTING — unchanged (SSE streaming)
│   ├── debate.ts                      # NEW — debate turn generation + JSON parsing
│   └── prompts/
│       └── debattre-mode.ts           # MODIFIED — add buildDebateTurnPrompt()
├── stores/
│   └── assistant.ts                   # MODIFIED — add debate state slice
├── i18n/
│   └── locales/
│       └── fr/
│           └── assistant.json         # MODIFIED — add debate translation keys
└── app/
    └── (tabs)/
        └── assistant.tsx              # MODIFIED — conditional DebateArea rendering
```

**Structure Decision**: Existing mobile app single-project structure. New components follow the established `src/components/assistant/` pattern. New service follows `src/services/` pattern. No new directories beyond what already exists.

## Complexity Tracking

> No constitution violations. Table intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

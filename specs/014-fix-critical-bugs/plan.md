# Implementation Plan: Fix Critical Bugs

**Branch**: `014-fix-critical-bugs` | **Date**: 2026-02-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-fix-critical-bugs/spec.md`

## Summary

Batch fix of 8 bugs across 4 subsystems: crash reporting (PII leak + initialization timing), data export (type errors + null guards + destructive deletion), test suite (4 failing tests), and LLM proxy (fail-open auth + static contract tests). All fixes are correctness/safety changes to existing code — no new features.

## Technical Context

**Language/Version**: TypeScript 5.9.2 on React Native 0.81.5 (Expo SDK 54)
**Primary Dependencies**: @sentry/react-native, expo-file-system, zustand 5.0.3, @react-native-async-storage/async-storage, expo-router 6.0, react-i18next 15.4.1
**Storage**: AsyncStorage (native) / localStorage (web) via Zustand persist middleware; keys: `app-state`, `survey-state`, `assistant-state`, `feedback_entries`
**Testing**: Jest 29.7.0 with jest-expo preset; `npm test` runs all tests (unit + contract)
**Target Platform**: iOS, Android (React Native), Web (Expo)
**Project Type**: Mobile (React Native/Expo managed workflow) + Node.js proxy script
**Performance Goals**: N/A — bug fixes only, no performance-sensitive changes
**Constraints**: Offline-capable app; crash reporting must not block app startup; proxy must remain zero-dependency Node.js
**Scale/Scope**: 8 files modified, 0 new files (except possibly contract test helpers)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Neutrality & Non-Prescription | N/A | Bug fixes do not affect content or candidate ordering |
| II. Source-Grounded Truth | N/A | No factual claims affected |
| III. City-Agnostic Architecture | N/A | No architecture changes |
| IV. Critical Thinking Over Persuasion | N/A | No interactive features affected |
| V. Structured Data as Single Source of Truth | N/A | No data source changes |
| VI. Simplicity & MVP Discipline | PASS | Bug fixes only — no new features, no scope expansion |
| VII. Privacy & Trust | **FIX REQUIRED** → PASS | Current code violates this principle (`sendDefaultPii: true`, session replays). This feature fixes the violation by disabling PII and removing replay/feedback integrations |
| Development Workflow | **FIX REQUIRED** → PASS | Current tests are broken (4 failures). This feature restores the test safety net |

**Gate result**: PASS. This feature resolves two constitution violations — it does not introduce any.

**Post-design re-check**: PASS. Design decisions below maintain alignment with all principles.

## Project Structure

### Documentation (this feature)

```text
specs/014-fix-critical-bugs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── _layout.tsx                    # Crash reporting init timing fix
├── services/
│   ├── crash-reporting.ts             # PII, replay, feedback removal
│   └── data-export.ts                 # Null guards, encoding, selective deletion
├── stores/
│   ├── app.ts                         # (read-only reference for storage keys)
│   ├── assistant.ts                   # (read-only reference for store shape)
│   └── survey.ts                      # (read-only reference for storage keys)
├── i18n/
│   └── locales/fr/
│       └── settings.json              # Crash reporting UI copy update (if needed)

scripts/
└── llm-proxy.js                       # Fail-closed auth + startup warning

tests/
├── unit/
│   ├── crash-reporting.test.ts        # Env var fix + missing mock additions
│   └── data-export.test.ts            # conversations mock shape + assertions
└── contract/
    └── proxy-api.test.ts              # Real HTTP contract tests
```

**Structure Decision**: Existing single-project structure. All changes are edits to existing files. No new directories or modules needed.

## Complexity Tracking

> No constitution violations to justify — this feature resolves existing violations.

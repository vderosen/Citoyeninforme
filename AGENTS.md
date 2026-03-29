# Citoyen Informé — Agent Guidelines

## Quick Start

- Read `docs/internal/project-context.md` for architecture, tech stack, and project conventions
- Read `.specify/memory/constitution.md` for core principles (neutrality, privacy, source-grounded truth)
- Run `npm test && npm run lint` before committing

## Sub-Agent Strategy

Multi-agent mode is active for this workspace. The assistant can use all configured sub-agents.

### Source of Truth

- Agent availability is defined in terminal config: `~/.codex/config.toml` under `[agents.<name>]`.
- Each agent behavior profile is defined in `~/.codex/agents/<name>.toml`.
- This repo file (`AGENTS.md`) defines routing policy: when to use each available agent for Citoyen Informé tasks.
- If an agent is not present in config, do not call it.
- If config and repo guidance differ: config controls availability, repo guidance controls usage strategy.

### Available Sub-Agents

- `scout` — fast, read-only codebase exploration and information retrieval
- `tester` — write, improve, and audit tests
- `refactorer` — improve structure without behavior changes
- `worker_medium` — straightforward implementation tasks
- `worker_high` — complex implementation and multi-file changes
- `worker_xhigh` — highest-effort reasoning for architecture-level or ambiguous tasks
- `mobile_debugger` — reproducible mobile UI/UX debugging through mobile-mcp (no source edits)

### Routing Rules (When to Use Which)

- Use `scout` first for discovery, impact analysis, and "where/how is this implemented?" questions.
- Use `worker_medium` for focused edits in one area with clear requirements.
- Use `worker_high` for cross-cutting changes, bug fixes with multiple root-cause candidates, or integration work.
- Use `worker_xhigh` when requirements are ambiguous, tradeoffs are significant, or the change affects architecture.
- Use `mobile_debugger` for simulator/device flow checks, visual regressions, and touch/navigation repro steps.
- Use `tester` after implementation changes and for explicit requests around quality gates, regression safety, and edge cases.
- Use `refactorer` only for no-behavior-change cleanups. Do not use it for feature work or bug-fix behavior changes.

### Recommended Sequences by Task Type

- Feature delivery: `scout` -> `worker_high` or `worker_xhigh` -> `tester`
- Bug fix: `scout` -> `worker_high` -> `tester`
- Test-only request: `scout` -> `tester`
- Refactor-only request: `scout` -> `refactorer` -> `tester`
- Small localized change: `scout` -> `worker_medium` -> `tester` (as needed)
- Mobile UI bug triage: `scout` -> `mobile_debugger` -> `worker_high` -> `tester`

## Key Rules

- **Branding:** App name is **Citoyen Informé** (not "Lucide")
- **Language:** French only — all user-facing strings via `t('key')` from react-i18next
- **Privacy:** All user data stays on-device (AsyncStorage). No server-side user profiles
- **Neutrality:** No voting recommendations. Survey uses transparent, deterministic scoring
- **Card order:** Always use `balancedShuffle` — never randomize or hardcode
- **Release strategy:** Default to OTA (`eas update`) for JS/UI/content fixes. Use store releases (`eas build` + `eas submit`) only for native/binary changes.
- **When user says "update this":** Always classify the change first as `OTA` or `Store` and state the path explicitly before release commands.

## OTA vs Store Decision Matrix

- **OTA update (`eas update --channel production`)**
  - Changes under `src/**` (screens, components, hooks, stores, services)
  - i18n/content/data updates (`src/i18n/**`, `src/data/**`)
  - Styling/theme/font usage in JS/TS (for existing bundled fonts)
- **Store update (`eas build` + `eas submit`)**
  - Any `app.json` native config change (icons/splash, bundle/package IDs, permissions, plugins, build numbers/version codes)
  - Any dependency change that adds/updates native modules
  - Any native folder change (`ios/**`, `android/**`) when those folders are used

## Release Workflow

- OTA path:
  1. `npm test && npm run lint`
  2. `eas update --channel production --message "<note>"`
- Store path:
  1. `npm test && npm run lint`
  2. `eas build --platform ios --profile production`
  3. `eas build --platform android --profile production`
  4. `eas submit --platform ios --profile production`
  5. `eas submit --platform android --profile production`

## Workflows

See `.agents/workflows/` for step-by-step procedures:
- `/launch-simulator` — Boot iOS simulator and connect MCP for visual testing

## Testing

| Tool | Purpose | Command |
|---|---|---|
| Jest | Unit tests | `npm test` |
| Detox | E2E native tests | See `e2e/` directory |
| iOS Simulator MCP | AI visual debugging | See `/launch-simulator` workflow |

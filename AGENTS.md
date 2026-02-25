# Citoyen Informé — Agent Guidelines

## Quick Start

- Read `Context.md` for architecture, tech stack, and project conventions
- Read `.specify/memory/constitution.md` for core principles (neutrality, privacy, source-grounded truth)
- Run `npm test && npm run lint` before committing

## Key Rules

- **Branding:** App name is **Citoyen Informé** (not "Lucide")
- **Language:** French only — all user-facing strings via `t('key')` from react-i18next
- **Privacy:** All user data stays on-device (AsyncStorage). No server-side user profiles
- **Neutrality:** No voting recommendations. Survey uses transparent, deterministic scoring
- **Card order:** Always use `balancedShuffle` — never randomize or hardcode

## Workflows

See `.agents/workflows/` for step-by-step procedures:
- `/launch-simulator` — Boot iOS simulator and connect MCP for visual testing

## Testing

| Tool | Purpose | Command |
|---|---|---|
| Jest | Unit tests | `npm test` |
| Detox | E2E native tests | See `e2e/` directory |
| iOS Simulator MCP | AI visual debugging | See `/launch-simulator` workflow |

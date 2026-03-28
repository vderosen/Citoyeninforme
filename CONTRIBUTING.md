# Contributing to Citoyen Informé

Thanks for contributing.

## Before you open a PR

1. Create a branch from `main`.
2. Install deps with `npm install`.
3. Run quality checks:
   - `npm test`
   - `npm run lint`
4. Update docs for behavior, security, or release-flow changes.

## Project guardrails

- Branding: use **Citoyen Informé**.
- User-facing text: French only, via i18n keys (`t('...')`).
- Neutrality: no voting recommendation logic.
- Privacy: keep user data on-device unless explicitly documented and consented.
- Card ordering: use `balancedShuffle` (no random/manual ordering hacks).

## Security and secrets

- Never commit `.env` or credentials.
- Treat `EXPO_PUBLIC_*` variables as public client-side values.
- Keep debug endpoints disabled by default in production (`LLM_PROXY_ENABLE_* = false`).
- Report vulnerabilities privately per `SECURITY.md`.

## Release policy

- JS/UI/content changes: OTA (`eas update`).
- Native or app config changes: Store release (`eas build` + `eas submit`).

## Pull request checklist

- [ ] Scope is small and reviewed for privacy/security impact.
- [ ] Tests and lint pass locally.
- [ ] Added/updated tests for behavioral changes.
- [ ] Updated docs or comments for non-obvious changes.

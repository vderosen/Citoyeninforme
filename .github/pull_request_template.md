## Summary

- What changed?
- Why?

## Validation

- [ ] `npm test`
- [ ] `npm run lint`

## Safety checklist

- [ ] No secrets or credentials added
- [ ] No privacy regression (user data remains local unless explicitly documented)
- [ ] No neutrality regression (no endorsement/recommendation logic)
- [ ] If proxy changed: auth, rate limits, and debug endpoint gating still enforced

## Release classification

- [ ] OTA (`src/**`, content, UI logic)
- [ ] Store (native config, native modules, `app.json`, `ios/**`, `android/**`)

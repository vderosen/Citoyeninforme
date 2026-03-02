# Release Strategy (OTA vs Store)

This project supports two release paths:

1. **OTA update (EAS Update)** for JS/content-only changes
2. **Store update (App Store / Play Store)** for native/binary changes

## Default Rule

When a task says "update this", assume **OTA first**.  
Switch to **Store update** only if the change touches native/binary surface.

## Decision Matrix

### OTA (`eas update`)

Use OTA for:
- `src/**` code changes (UI, logic, hooks, stores, services)
- Translation/content/data changes (`src/i18n/**`, `src/data/**`)
- Visual fixes such as card fonts/colors/layout when implemented in JS/TS styles

Command:

```bash
npm test && npm run lint
eas update --channel production --message "Describe the fix"
```

### Store (`eas build` + `eas submit`)

Use store releases for:
- `app.json` native config changes (plugins, permissions, icons/splash, bundle/package IDs, native versioning)
- Native dependency changes (adding/upgrading packages requiring native rebuild)
- Any native source/config change (`ios/**`, `android/**`) in workflows that track these folders

Commands:

```bash
npm test && npm run lint
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

## Examples

- **Fix swipe-card font size in `src/app/(tabs)/cards.tsx`** -> OTA
- **Change button colors in a component** -> OTA
- **Edit `app.json` splash/icon/plugin settings** -> Store
- **Add a new native module dependency** -> Store

## Important Notes

- OTA depends on compatible runtime. This repo uses `runtimeVersion` policy tied to app version.
- If app version/runtime changes, publish a new store build for users to move to the new runtime.
- Keep using channels consistently (`production` for production users).

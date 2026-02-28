# iOS App Store Release Guide (Citoyen Informé)

## 1) Pre-release checks

```bash
npm test
npm run lint
npx detox test -c ios.sim.debug --cleanup
```

## 2) Build for App Store Connect

```bash
eas build --platform ios --profile production
```

Notes:
- This creates an IPA and uploads build artifacts via EAS.
- `eas.json` production profile is already configured with auto-incremented iOS build number.

## 3) Submit latest iOS build to App Store Connect

```bash
eas submit --platform ios --latest
```

## 4) Verify in App Store Connect

- Open App Store Connect -> your app -> TestFlight / App Store versions
- Wait for processing
- Add release notes and submit for review

## Optional: one-liner (build + submit)

```bash
eas build --platform ios --profile production && eas submit --platform ios --latest
```

## Release notes template (copy/paste)

- Correction de la navigation au lancement: premier écran orienté Cartes Swipe après onboarding.
- Amélioration de la lisibilité des titres de cartes longues (mise en page/typographie stabilisées).
- Stabilisation des tests E2E Detox pour le flux onboarding + navigation par onglets.

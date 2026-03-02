# Checklist UI iOS (petits + grands iPhone)

## 1. Matrice appareil

- iPhone SE (2nd generation) (`ios.sim.debug.small`)
- iPhone 16 (`ios.sim.debug`)
- iPhone 16 Pro Max (`ios.sim.debug.large`)

## 2. Accessibilite texte (Dynamic Type)

- Taille par defaut
- Tres grande taille (Reglages iOS -> Accessibilite -> Texte plus grand)
- Verifier:
  - Pas de texte critique coupe
  - Boutons encore cliquables
  - Pas de chevauchement de blocs

## 3. Cibles tactiles

- Minimum 44x44 pt sur les actions interactives
- Si le visuel est petit, ajouter un `hitSlop`
- Verifier les actions suivantes:
  - Retour header
  - CTA principaux (demarrer/reprendre)
  - Liens de sources
  - Tabs themes / filtres

## 4. Mouvement et performance

- Tester avec "Reduc motion" active
- Verifier sur device SE que les animations restent fluides (pas de jank visible)
- Mesurer en build release (pas uniquement debug)

## 5. VoiceOver (appareil reel)

- Focus logique (haut -> bas)
- Labels/hints des boutons comprehensibles
- Lecture correcte des etats (tab selectionnee, checkbox cochee, etc.)

## 6. Commandes Detox rapides

```bash
npx detox test -c ios.sim.debug.small --cleanup
npx detox test -c ios.sim.debug --cleanup
npx detox test -c ios.sim.debug.large --cleanup
```

# Revue Dataset Élection - Paris 2026

_Fichier généré automatiquement par `scripts/generate-election-review-md.js`. Dataset: `paris-2026`._

## Résumé

| Élément | Valeur |
| --- | --- |
| Id élection | paris-municipales-2026 |
| Ville | Paris |
| Type | Élections municipales |
| Année | 2026 |
| Version des données | 0.1.1 |
| Dernière mise à jour | 2026-02-15 |
| Nombre de candidats | 1 |
| Nombre de thèmes | 8 |
| Nombre de positions | 3 |
| Nombre de questions | 10 |
| Nombre de faits civiques | 6 |

## Fichiers JSON sources

| Fichier | Type |
| --- | --- |
| `src/data/elections/paris-2026/election.json` | Object |
| `src/data/elections/paris-2026/candidates.json` | Array(1) |
| `src/data/elections/paris-2026/themes.json` | Array(8) |
| `src/data/elections/paris-2026/positions.json` | Array(3) |
| `src/data/elections/paris-2026/survey-questions.json` | Array(10) |
| `src/data/elections/paris-2026/civic-facts.json` | Array(6) |
| `src/data/elections/paris-2026/logistics.json` | Object |

## Élection

- Règles de vote: À Paris, le scrutin municipal 2026 se déroule à deux tours avec deux bulletins distincts (Conseil de Paris et conseils d'arrondissement). Pour le Conseil de Paris, la liste arrivée en tête reçoit une prime majoritaire d'un quart des sièges, le reste étant réparti à la proportionnelle.
- Nombre de tours: 2
- Date limite d'inscription: 2026-02-06
- Premier tour: 2026-03-15
- Second tour: 2026-03-22

## Candidats

| Id | Nom | Parti | Source programme |
| --- | --- | --- | --- |
| `david-belliard` | David Belliard | Les Écologistes | [Lien](https://www.davidbelliard.paris/) |

### David Belliard (`david-belliard`)

- Élection: paris-municipales-2026
- Bio: Conseiller de Paris depuis 2014 et adjoint à la Maire de Paris chargé de la transformation de l'espace public, des transports, des mobilités et du code de la rue. Le 23 mars 2025, Les Écologistes l'ont désigné chef de file pour les municipales 2026 à Paris.
- Style de communication: Communication de campagne via un site officiel et des prises de parole publiques relayées sur les réseaux sociaux.
- URL programme: https://www.davidbelliard.paris/
- URL photo: —

## Thèmes

| Ordre | Id | Nom | Icône | Description |
| --- | --- | --- | --- | --- |
| 1 | `transport` | Transport & Mobilité | train | Transports en commun, vélo, piétons, circulation automobile, stationnement |
| 2 | `logement` | Logement | home | Logement social, encadrement des loyers, rénovation, accès à la propriété |
| 3 | `securite` | Sécurité | shield | Police municipale, vidéosurveillance, prévention, tranquillité publique |
| 4 | `ecologie` | Écologie & Environnement | leaf | Espaces verts, qualité de l'air, gestion des déchets, transition énergétique |
| 5 | `budget` | Budget & Finances | wallet | Fiscalité locale, dette, investissements, transparence budgétaire |
| 6 | `culture` | Culture & Patrimoine | palette | Musées, événements culturels, patrimoine architectural, vie nocturne |
| 7 | `education` | Éducation & Jeunesse | book | Écoles, crèches, activités périscolaires, universités, formation |
| 8 | `social` | Social & Solidarité | heart | Aide aux personnes âgées, handicap, inclusion, lutte contre la pauvreté |

## Positions

### David Belliard - Transport & Mobilité (`david-belliard-transport`)

- candidateId: `david-belliard`
- themeId: `transport`
- Résumé: Transformation de l'espace public et priorité aux mobilités actives
- Détails: Le communiqué d'investiture des Écologistes à Paris met en avant la transformation de l'espace public, un Paris cyclable et le développement des rues aux écoles.
- Dernière vérification: 2026-02-15
- Sources:
  - [David Belliard - Paris.fr](https://www.paris.fr/pages/david-belliard-21783) | type: official | accessDate: 2026-02-15
  - [Paris 2026 : l'union ! - Les Écologistes Paris](https://paris.lesecologistes.fr/posts/23c05119-67a8-4ea3-8f20-ff7216f6de22/paris-2026-lunion) | type: statement | accessDate: 2026-02-15

### David Belliard - Écologie & Environnement (`david-belliard-ecologie`)

- candidateId: `david-belliard`
- themeId: `ecologie`
- Résumé: Projet présenté comme climatiquement résilient
- Détails: Le lancement de campagne évoque un projet de Paris "climatiquement résilient" et une ville qui se prépare aux changements climatiques.
- Dernière vérification: 2026-02-15
- Sources:
  - [David Belliard - Site de campagne](https://www.davidbelliard.paris/) | type: program | accessDate: 2026-02-15
  - [Paris 2026 : l'union ! - Les Écologistes Paris](https://paris.lesecologistes.fr/posts/23c05119-67a8-4ea3-8f20-ff7216f6de22/paris-2026-lunion) | type: statement | accessDate: 2026-02-15

### David Belliard - Social & Solidarité (`david-belliard-social`)

- candidateId: `david-belliard`
- themeId: `social`
- Résumé: Positionnement de campagne centré sur la solidarité
- Détails: La campagne est présentée comme un projet de ville solidaire qui accueille et protège les personnes les plus fragiles.
- Dernière vérification: 2026-02-15
- Sources:
  - [David Belliard - Site de campagne](https://www.davidbelliard.paris/) | type: statement | accessDate: 2026-02-15
  - [Paris 2026 : l'union ! - Les Écologistes Paris](https://paris.lesecologistes.fr/posts/23c05119-67a8-4ea3-8f20-ff7216f6de22/paris-2026-lunion) | type: statement | accessDate: 2026-02-15

## Questions du sondage

### Q1 - Quelle devrait être la priorité pour les déplacements dans Paris ? (`q01`)

- electionId: `paris-municipales-2026`
- themeIds: `Transport & Mobilité`
- Options:
  - `q01-a`: Développer massivement le vélo et les transports en commun, même en réduisant la place de la voiture | themeScores: `{ "ecologie": 1, "transport": 2 }`
  - `q01-b`: Maintenir un équilibre entre tous les modes de transport | themeScores: `{ "transport": 0 }`
  - `q01-c`: Préserver l'accès automobile et créer plus de stationnement | themeScores: `{ "transport": -2 }`

### Q2 - En matière de logement à Paris, que considérez-vous comme le plus important ? (`q02`)

- electionId: `paris-municipales-2026`
- themeIds: `Logement`
- Options:
  - `q02-a`: Construire davantage de logements sociaux, même si cela augmente les dépenses publiques | themeScores: `{ "budget": -1, "logement": 2 }`
  - `q02-b`: Encadrer strictement les loyers pour limiter les hausses | themeScores: `{ "logement": 1 }`
  - `q02-c`: Favoriser l'accession à la propriété et laisser le marché s'autoréguler | themeScores: `{ "logement": -2 }`

### Q3 - Quel rôle la municipalité devrait-elle jouer en matière de sécurité ? (`q03`)

- electionId: `paris-municipales-2026`
- themeIds: `Sécurité`
- Options:
  - `q03-a`: Renforcer la police municipale et la vidéosurveillance | themeScores: `{ "securite": 2 }`
  - `q03-b`: Privilégier la prévention et la médiation sociale | themeScores: `{ "securite": -1, "social": 1 }`
  - `q03-c`: Combiner répression et prévention de manière équilibrée | themeScores: `{ "securite": 0 }`

### Q4 - Quelle place devrait avoir l'écologie dans les politiques municipales ? (`q04`)

- electionId: `paris-municipales-2026`
- themeIds: `Écologie & Environnement`
- Options:
  - `q04-a`: L'écologie doit être la priorité absolue, même si cela implique des contraintes fortes | themeScores: `{ "ecologie": 2 }`
  - `q04-b`: L'écologie est importante mais doit être conciliée avec le développement économique | themeScores: `{ "ecologie": 0 }`
  - `q04-c`: Les enjeux économiques et sociaux doivent primer sur les contraintes environnementales | themeScores: `{ "ecologie": -2 }`

### Q5 - Comment la ville devrait-elle gérer ses finances ? (`q05`)

- electionId: `paris-municipales-2026`
- themeIds: `Budget & Finances`
- Options:
  - `q05-a`: Investir massivement dans les services publics, quitte à augmenter la dette | themeScores: `{ "budget": -2, "social": 1 }`
  - `q05-b`: Maintenir un budget équilibré avec des investissements ciblés | themeScores: `{ "budget": 0 }`
  - `q05-c`: Réduire les dépenses et baisser les impôts locaux | themeScores: `{ "budget": 2 }`

### Q6 - Quelle vision de la culture municipale vous correspond le mieux ? (`q06`)

- electionId: `paris-municipales-2026`
- themeIds: `Culture & Patrimoine`
- Options:
  - `q06-a`: Augmenter le budget culturel et rendre la culture accessible à tous gratuitement | themeScores: `{ "budget": -1, "culture": 2 }`
  - `q06-b`: Soutenir les initiatives culturelles locales et les associations | themeScores: `{ "culture": 1 }`
  - `q06-c`: Laisser le secteur privé porter l'essentiel de l'offre culturelle | themeScores: `{ "culture": -1 }`

### Q7 - Que devrait faire la municipalité pour l'éducation ? (`q07`)

- electionId: `paris-municipales-2026`
- themeIds: `Éducation & Jeunesse`
- Options:
  - `q07-a`: Investir massivement dans les écoles et crèches publiques | themeScores: `{ "budget": -1, "education": 2 }`
  - `q07-b`: Améliorer la qualité des équipements scolaires existants | themeScores: `{ "education": 1 }`
  - `q07-c`: Encourager les partenariats avec le secteur privé pour l'éducation | themeScores: `{ "education": -1 }`

### Q8 - Comment Paris devrait-elle gérer la solidarité sociale ? (`q08`)

- electionId: `paris-municipales-2026`
- themeIds: `Social & Solidarité`
- Options:
  - `q08-a`: Créer un filet de sécurité municipal fort : revenu minimum, hébergement garanti | themeScores: `{ "budget": -1, "social": 2 }`
  - `q08-b`: Cibler l'aide sur les publics les plus fragiles | themeScores: `{ "social": 1 }`
  - `q08-c`: Favoriser l'insertion par l'emploi plutôt que l'aide directe | themeScores: `{ "social": -1 }`

### Q9 - Seriez-vous favorable à l'interdiction des véhicules thermiques dans Paris ? (`q09`)

- electionId: `paris-municipales-2026`
- themeIds: `Transport & Mobilité`, `Écologie & Environnement`
- Options:
  - `q09-a`: Oui, le plus rapidement possible | themeScores: `{ "ecologie": 2, "transport": 2 }`
  - `q09-b`: Oui, mais progressivement et avec des aides pour les automobilistes | themeScores: `{ "ecologie": 1, "transport": 1 }`
  - `q09-c`: Non, il faut laisser le choix aux citoyens | themeScores: `{ "ecologie": -1, "transport": -2 }`

### Q10 - Si la ville devait choisir entre baisser les impôts locaux et augmenter les services publics, que préféreriez-vous ? (`q10`)

- electionId: `paris-municipales-2026`
- themeIds: `Budget & Finances`, `Social & Solidarité`
- Options:
  - `q10-a`: Augmenter les services publics, même si cela coûte plus cher | themeScores: `{ "budget": -2, "social": 2 }`
  - `q10-b`: Chercher un équilibre entre les deux | themeScores: `{ "budget": 0, "social": 0 }`
  - `q10-c`: Baisser les impôts, même si certains services sont réduits | themeScores: `{ "budget": 2, "social": -2 }`

## Faits civiques

### Fact 1 (`fact-01`)

- Catégorie: institutions
- Texte: Le Conseil de Paris compte 163 conseillères et conseillers de Paris.
- Source: [Ministère de l'Intérieur - Municipales 2026 à Paris](https://www.elections.interieur.gouv.fr/municipales-2026/je-suis-electeur-paris)
- Type source: official
- accessDate: 2026-02-15

### Fact 2 (`fact-02`)

- Catégorie: voting
- Texte: Le scrutin municipal à Paris est fixé au 15 mars 2026 (premier tour) et au 22 mars 2026 (second tour).
- Source: [Décret n° 2025-848 du 30 juillet 2025](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051948647)
- Type source: official
- accessDate: 2026-02-15

### Fact 3 (`fact-03`)

- Catégorie: voting
- Texte: La date limite d'inscription sur les listes électorales est le 6 février 2026 (5 mars 2026 pour les cas prévus à l'article L.30 du code électoral).
- Source: [Décret n° 2025-848 du 30 juillet 2025](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051948647)
- Type source: official
- accessDate: 2026-02-15

### Fact 4 (`fact-04`)

- Catégorie: institutions
- Texte: La loi du 11 août 2025 instaure à Paris deux scrutins distincts: un pour le Conseil de Paris et un pour les conseils d'arrondissement.
- Source: [Loi n° 2025-795 du 11 août 2025](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052075863)
- Type source: official
- accessDate: 2026-02-15

### Fact 5 (`fact-05`)

- Catégorie: institutions
- Texte: Pour l'élection du Conseil de Paris, la prime majoritaire accordée à la liste arrivée en tête est d'un quart des sièges (arrondi à l'entier supérieur).
- Source: [Loi n° 2025-795 du 11 août 2025](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052075863)
- Type source: official
- accessDate: 2026-02-15

### Fact 6 (`fact-06`)

- Catégorie: voting
- Texte: Les citoyennes et citoyens de l'Union européenne résidant en France peuvent voter aux élections municipales s'ils sont inscrits sur une liste électorale complémentaire.
- Source: [Droit de vote des citoyens européens - Service-public.fr](https://www.service-public.fr/particuliers/vosdroits/F1937)
- Type source: official
- accessDate: 2026-02-15

## Logistique

### Dates clés

| Date | Libellé | Description |
| --- | --- | --- |
| 2026-02-04 | Date limite d'inscription en ligne | Fin de l'inscription en ligne sur les listes électorales |
| 2026-02-06 | Date limite d'inscription en mairie | Date limite générale d'inscription sur les listes électorales |
| 2026-03-02 | Ouverture de la campagne officielle | Début de la campagne électorale officielle |
| 2026-03-05 | Date limite d'inscription dérogatoire (L.30) | Dernier jour pour les demandes d'inscription prévues par l'article L.30 du code électoral |
| 2026-03-15 | Premier tour | Bureaux de vote ouverts de 8h à 20h au plus tard |
| 2026-03-22 | Second tour | Second tour de scrutin |

### Conditions d'éligibilité

1. Avoir 18 ans au plus tard la veille du scrutin
2. Être inscrit sur les listes électorales de la commune
3. Pour un citoyen de l'Union européenne non français: être inscrit sur la liste électorale complémentaire municipale
4. Jouir de ses droits civils et politiques dans l'État d'origine et en France

### Modalités de vote

- Type: `in-person`
- Description: Se présenter au bureau de vote indiqué sur la carte électorale avec une pièce d'identité en cours de validité.
- Exigences: À Paris (commune de plus de 1 000 habitants), la présentation d'une pièce d'identité est obligatoire pour voter.

### Lieux de vote

Aucun lieu de vote renseigné.

### Sources officielles (logistique)

| Titre | URL | Type | accessDate |
| --- | --- | --- | --- |
| Carte électorale et pièce d'identité pour voter - Service-public.fr | https://www.service-public.fr/particuliers/vosdroits/F1361 | official | 2026-02-15 |
| Droit de vote d'un citoyen européen en France - Service-public.fr | https://www.service-public.fr/particuliers/vosdroits/F1937 | official | 2026-02-15 |
| Décret n° 2025-848 du 30 juillet 2025 | https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051948647 | official | 2026-02-15 |
| Inscription sur la liste électorale - Service-public.fr | https://www.service-public.fr/particuliers/vosdroits/F1367 | official | 2026-02-15 |
| Loi n° 2025-795 du 11 août 2025 | https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052075863 | official | 2026-02-15 |
| Ministère de l'Intérieur - Municipales 2026 à Paris | https://www.elections.interieur.gouv.fr/municipales-2026/je-suis-electeur-paris | official | 2026-02-15 |


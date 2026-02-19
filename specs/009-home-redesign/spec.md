# Feature Specification: Redesign de la page d'accueil (Home Screen)

**Feature Branch**: `009-home-redesign`
**Created**: 2026-02-19
**Status**: Draft
**Input**: Redesign de la page d'accueil pour la rendre plus accueillante, informative et mieux hierarchisee. Deprioriser le bouton sondage, afficher les infos pratiques par defaut, ajouter du contexte election/ville, simplifier le bloc confiance.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decouvrir le contexte de l'election (Priority: P1)

Un nouvel utilisateur ouvre l'application pour la premiere fois. Il voit immediatement le nom de l'election ("Elections municipales - Paris 2026"), une phrase d'accroche expliquant la mission de l'app, et un bandeau discret confirmant la neutralite de l'outil. Il comprend instantanement ou il est et ce qu'il peut faire.

**Why this priority**: C'est la premiere impression de l'utilisateur. Sans contexte clair, l'utilisateur ne comprend pas a quoi sert l'app et risque de la quitter. L'accueil contextualise toute l'experience.

**Independent Test**: Peut etre teste en ouvrant l'app et en verifiant que le hero affiche le type d'election, la ville, l'annee et la phrase d'accroche sans aucune interaction requise.

**Acceptance Scenarios**:

1. **Given** un utilisateur ouvre l'app pour la premiere fois, **When** la page d'accueil se charge, **Then** il voit le nom de l'election (type, ville, annee) en haut de page
2. **Given** un utilisateur est sur la page d'accueil, **When** il lit le contenu hero, **Then** il voit la phrase d'accroche expliquant la mission de l'app ("Comprendre, comparer, choisir...")
3. **Given** un utilisateur est sur la page d'accueil, **When** il regarde sous le hero, **Then** il voit un bandeau discret indiquant la neutralite et le caractere source de l'app

---

### User Story 2 - Consulter les informations pratiques de vote (Priority: P1)

Un citoyen visite la page d'accueil pour se renseigner sur les modalites de vote. Il voit directement les dates cles, les conditions d'eligibilite et les modalites de vote, presentees de maniere aeree et scannable dans des cartes distinctes, sans avoir a cliquer pour les deployer.

**Why this priority**: Les informations pratiques de vote sont la raison principale pour laquelle beaucoup d'utilisateurs ouvrent l'app. Les cacher derriere un accordeon ferme reduit leur accessibilite.

**Independent Test**: Peut etre teste en ouvrant la page d'accueil et en verifiant que les 3 sous-sections (dates cles, eligibilite, modalites de vote) sont visibles sans aucune interaction.

**Acceptance Scenarios**:

1. **Given** un utilisateur est sur la page d'accueil, **When** il fait defiler la page, **Then** il voit les dates cles de l'election affichees dans une carte dediee avec une icone calendrier
2. **Given** un utilisateur est sur la page d'accueil, **When** il fait defiler la page, **Then** il voit les conditions d'eligibilite dans une carte dediee avec une icone appropriee
3. **Given** un utilisateur est sur la page d'accueil, **When** il fait defiler la page, **Then** il voit les modalites de vote dans une carte dediee avec une icone appropriee
4. **Given** les donnees logistiques contiennent 0 dates cles, **When** la page s'affiche, **Then** la carte "Dates cles" n'est pas affichee (pas de carte vide)

---

### User Story 3 - Acceder au sondage selon son statut (Priority: P2)

Un utilisateur souhaite commencer, reprendre ou refaire le questionnaire civique. Le bouton d'acces au sondage est adapte a son statut : visible mais non dominant s'il n'a pas encore commence ou est en cours, et discret en bas de page s'il a deja termine.

**Why this priority**: Le sondage reste une fonctionnalite importante mais ne doit pas dominer visuellement la page, surtout apres la premiere utilisation. Le redesign reequilibre la hierarchie en faveur du contenu informatif.

**Independent Test**: Peut etre teste en simulant les 3 statuts de sondage (not_started, en cours, completed) et en verifiant la position et le style du bouton dans chaque cas.

**Acceptance Scenarios**:

1. **Given** le sondage n'a pas ete commence (statut "not_started"), **When** la page s'affiche, **Then** un bouton CTA standard "Tester mes idees" apparait sous le hero, visible mais pas en format hero dominant
2. **Given** le sondage est en cours (statut "civic_context" ou "questionnaire"), **When** la page s'affiche, **Then** un bouton "Reprendre le sondage" apparait a la meme position, avec la meme importance visuelle que le bouton de demarrage
3. **Given** le sondage est termine (statut "completed"), **When** la page s'affiche, **Then** le bouton hero disparait et un lien textuel discret "Refaire le sondage" apparait en bas de page, apres les informations pratiques
4. **Given** le sondage est termine et l'utilisateur appuie sur "Refaire le sondage", **When** l'action est declenchee, **Then** le sondage est reinitialise et l'utilisateur est redirige vers l'introduction du sondage

---

### User Story 4 - Etre rassure sur la fiabilite de l'app (Priority: P3)

Un utilisateur se demande s'il peut faire confiance aux informations de l'app. Il voit un bandeau discret et elegant qui indique clairement la neutralite, le caractere non-partisan et le sourcing des donnees, sans badges techniques deroutants ni ton defensif.

**Why this priority**: La confiance est essentielle mais doit etre communiquee avec elegance. Un bloc defensif avec des badges "Non documente" et "Incertain" sur la page d'accueil cree du doute au lieu de rassurer. La simplification renforce la credibilite percue.

**Independent Test**: Peut etre teste en verifiant la presence du bandeau de confiance, l'absence des badges "Non documente" et "Incertain", et le ton non-defensif du message.

**Acceptance Scenarios**:

1. **Given** un utilisateur est sur la page d'accueil, **When** il voit le bandeau de confiance, **Then** il lit un message sobre indiquant la neutralite et le caractere source des donnees (sans titre interrogatif "Pourquoi faire confiance")
2. **Given** un utilisateur est sur la page d'accueil, **When** il regarde le bandeau de confiance, **Then** il ne voit PAS de badges "Non documente" ou "Incertain"
3. **Given** un utilisateur est sur la page d'accueil, **When** il regarde le bandeau de confiance, **Then** le bandeau est visuellement discret (pas une carte proeminente avec titre)

---

### Edge Cases

- Que se passe-t-il si les donnees election ne sont pas encore chargees ? La page affiche un etat de chargement (comportement existant preserve).
- Que se passe-t-il si les donnees logistiques sont absentes (logistics = null) ? Les cartes d'informations pratiques ne s'affichent pas, sans erreur.
- Que se passe-t-il si une sous-section logistique est vide (ex: 0 dates cles) ? La carte correspondante n'est pas affichee.
- Que se passe-t-il si les donnees election ne contiennent pas de champ `lastUpdated` ? Le footer "Mis a jour le..." n'est pas affiche (comportement existant preserve).
- Que se passe-t-il si les donnees election ne contiennent pas de type ou de ville ? Le hero affiche uniquement les champs disponibles sans placeholder vide.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La page d'accueil DOIT afficher une section hero en haut contenant le type d'election, la ville et l'annee, extraits des donnees election existantes
- **FR-002**: La page d'accueil DOIT afficher la phrase d'accroche (cle i18n `home.purpose` existante) dans la section hero
- **FR-003**: La page d'accueil DOIT afficher un bandeau de confiance discret indiquant la neutralite, le caractere non-partisan et le sourcing des donnees, sans titre interrogatif
- **FR-004**: Le bandeau de confiance NE DOIT PAS contenir les badges "Non documente" et "Incertain" - ces indicateurs restent disponibles dans les fiches candidats uniquement
- **FR-005**: Les informations pratiques (dates cles, conditions d'eligibilite, modalites de vote) DOIVENT etre affichees par defaut, sans mecanisme de collapse
- **FR-006**: Chaque sous-section d'informations pratiques DOIT etre presentee dans une carte visuelle distincte avec une icone thematique
- **FR-007**: Si le sondage n'a pas ete commence ou est en cours, un bouton CTA standard DOIT etre affiche sous le hero (pas en format hero dominant)
- **FR-008**: Si le sondage est termine, le CTA hero DOIT etre remplace par un lien textuel discret "Refaire le sondage" positionne apres les informations pratiques
- **FR-009**: Les sections DOIVENT etre ordonnees ainsi : 1) Hero/contexte, 2) Bouton sondage (si non termine), 3) Bandeau confiance, 4) Informations pratiques, 5) Lien "Refaire le sondage" (si termine), 6) Footer "Mis a jour le..."
- **FR-010**: Les cartes d'informations pratiques NE DOIVENT PAS s'afficher si leur sous-section de donnees est vide (pas de carte vide)
- **FR-011**: La page DOIT utiliser les cles de traduction i18n existantes autant que possible et rester compatible avec le systeme d'internationalisation en place
- **FR-012**: La page DOIT respecter la charte graphique existante (palette de couleurs civic-navy / warm-gray / accent-coral, typographies SpaceGrotesk et Inter)

### Key Entities

- **Election**: Metadonnees de l'election (type, ville, annee, date de derniere mise a jour). Source des donnees du hero.
- **ElectionLogistics**: Informations pratiques de vote (dates cles, eligibilite, modalites de vote). Source des cartes d'informations pratiques.
- **SurveyStatus**: Etat du sondage de l'utilisateur (not_started, civic_context, questionnaire, completed). Determine le comportement et la position du bouton sondage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des utilisateurs voient le contexte de l'election (type, ville, annee) et la phrase d'accroche sans aucune interaction au chargement de la page
- **SC-002**: 100% des informations pratiques (dates, eligibilite, modalites) sont visibles sans interaction, contre 0% auparavant (necessitait un clic pour deployer)
- **SC-003**: Le bouton "Refaire le sondage" n'occupe pas plus de 5% de la surface visible de la page pour les utilisateurs ayant termine le sondage (contre ~25% actuellement)
- **SC-004**: La page d'accueil ne contient aucun element pouvant etre percu comme un avertissement negatif (badges "Non documente", "Incertain") - valide par revue UX
- **SC-005**: L'ordre de lecture naturel de la page (de haut en bas) correspond a la hierarchie d'importance : contexte > action > confiance > informations pratiques > actions secondaires

## Assumptions

- Les donnees election (type, ville, annee) sont toujours presentes dans le store `useElectionStore` quand `isLoaded` est true.
- La cle i18n `home.purpose` existe deja et contient la phrase d'accroche appropriee — aucune nouvelle traduction n'est necessaire pour cette partie.
- Les badges "Non documente" et "Incertain" du composant `TrustBadge` continueront a etre utilises dans les fiches candidats — seule leur presence sur la page d'accueil est retiree.
- Le bandeau de confiance reprend le texte de `common.neutralityStatement` existant, reformate de maniere plus concise et visuelle.
- Aucune nouvelle donnee n'est necessaire — toutes les informations proviennent de stores et de cles i18n deja en place.

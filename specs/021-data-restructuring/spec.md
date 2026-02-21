# Feature Specification: Restructuration des Donnees Electorales

**Feature Branch**: `021-data-restructuring`
**Created**: 2026-02-21
**Status**: Draft
**Input**: Consolidation de 8 fichiers JSON en 3 fichiers par domaine, ajout du concept de mesures concretes, normalisation des sources, nettoyage du code mort.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consolidation des donnees par domaine (Priority: P1)

En tant que mainteneur du jeu de donnees electoral, je veux que les donnees soient organisees en trois fichiers distincts par domaine (cadre institutionnel, candidats et propositions, experience interactive) afin de pouvoir mettre a jour un domaine sans toucher aux autres et de reduire le risque d'erreurs lors des modifications.

Actuellement, le jeu de donnees est reparti sur 8 fichiers JSON distincts (election, candidates, themes, positions, survey-questions, statement-cards, civic-facts, logistics). Cette fragmentation rend les mises a jour fastidieuses et augmente le risque d'incoherences inter-fichiers. La consolidation en 3 fichiers organises par frequence de mise a jour et par responsabilite simplifie considerablement la maintenance.

**Structure cible** :

1. **Fichier institutionnel** : metadonnees de l'election, regles de vote, timeline, logistique, faits civiques, sources officielles
2. **Fichier candidats** : themes, candidats avec leurs positions imbriquees (incluant les mesures), dictionnaire de sources normalise
3. **Fichier interactif** : questions du quiz, cartes d'affirmations pour le swipe

**Why this priority** : C'est le changement structurel fondamental dont dependent toutes les autres ameliorations. Sans la consolidation, les stories P2 et P3 n'ont pas de support.

**Independent Test** : Apres consolidation, l'application se lance normalement, toutes les pages affichent les memes donnees qu'avant, et aucun composant existant n'est casse. Les tests unitaires du loader passent.

**Acceptance Scenarios** :

1. **Given** le jeu de donnees est stocke dans 3 fichiers par domaine, **When** l'application demarre, **Then** toutes les donnees sont chargees et les composants affichent les memes informations qu'avec les 8 fichiers d'origine.
2. **Given** la consolidation est effectuee, **When** un mainteneur modifie le fichier candidats (ajout d'une position), **Then** seul ce fichier est impacte, le fichier institutionnel et le fichier interactif restent inchanges.
3. **Given** les positions sont imbriquees dans les candidats dans le fichier de stockage, **When** le systeme charge les donnees, **Then** les positions sont disponibles sous forme de liste plate avec identifiant de candidat reinjecte, exactement comme avant la consolidation.
4. **Given** les 8 anciens fichiers sont supprimes, **When** le systeme tente de charger les donnees, **Then** il utilise exclusivement les 3 nouveaux fichiers sans erreur.

---

### User Story 2 - Visibilite des mesures concretes (Priority: P2)

En tant qu'utilisateur de l'application, je veux voir le nombre total de mesures concretes proposees par les candidats sur la page d'accueil, afin de mieux apprecier le volume et la granularite des propositions de campagne.

Actuellement, la page d'accueil affiche le nombre de "positions" (une position = une prise de position par candidat sur un theme). Or, chaque position peut contenir plusieurs mesures concretes (propositions specifiques). Afficher le nombre de mesures donne une vision plus precise et plus parlante de la richesse des programmes.

**Why this priority** : C'est la seule amelioration visible par l'utilisateur final. Elle depend de la consolidation (P1) car le concept de mesure est introduit dans la nouvelle structure de donnees.

**Independent Test** : Sur la page d'accueil, le compteur affiche "mesures" au lieu de "positions", avec un total correspondant a la somme de toutes les mesures definies dans les positions de tous les candidats.

**Acceptance Scenarios** :

1. **Given** les positions contiennent des mesures definies, **When** l'utilisateur consulte la page d'accueil, **Then** le bandeau de statistiques affiche le nombre total de mesures (pas le nombre de positions) avec le label "mesures".
2. **Given** un candidat a 3 positions et un total de 8 mesures, **When** les statistiques sont calculees, **Then** la contribution de ce candidat au total est 8 (pas 3).
3. **Given** une position n'a aucune mesure definie (tableau vide), **When** les statistiques sont calculees, **Then** cette position contribue 0 au total des mesures.

---

### User Story 3 - Normalisation des sources (Priority: P3)

En tant que mainteneur du jeu de donnees, je veux que les references aux sources soient stockees une seule fois dans un dictionnaire centralise et referees par identifiant depuis les positions et mesures, afin d'eliminer la duplication et de garantir la coherence lorsqu'une source est mise a jour.

Actuellement, la meme source (URL, titre, date d'acces) est copiee en entier dans chaque position qui la reference. Si une URL change, il faut la modifier a N endroits differents, avec un risque d'oubli. La normalisation resout ce probleme.

**Why this priority** : Amelioration de qualite des donnees qui renforce le Principe II (Source-Grounded Truth) de la constitution. Depend de P1 pour la structure du fichier candidats.

**Independent Test** : Apres normalisation, chaque source n'apparait qu'une fois dans le dictionnaire. Les positions et mesures referent aux sources par identifiant. Le systeme resout ces identifiants en objets source complets lors du chargement.

**Acceptance Scenarios** :

1. **Given** une source est partagee par 3 positions differentes, **When** le jeu de donnees est stocke, **Then** cette source apparait une seule fois dans le dictionnaire et est referencee 3 fois par son identifiant.
2. **Given** un identifiant de source est utilise dans une position, **When** le systeme charge les donnees, **Then** la position disponible en memoire contient l'objet source complet (titre, URL, type, date d'acces), pas seulement l'identifiant.
3. **Given** un identifiant de source utilise dans une position ne correspond a aucune entree du dictionnaire, **When** le systeme valide les donnees, **Then** une erreur de validation est levee identifiant la source manquante.

---

### User Story 4 - Nettoyage du code mort (Priority: P4)

En tant que developpeur de l'application, je veux que le code inutilise (infrastructure SQLite, anciens imports) soit supprime, afin de reduire la surface de maintenance et d'eviter la confusion lors de futures modifications.

Le projet contient du code d'infrastructure pour une base de donnees SQLite qui n'est plus utilisee (la base n'est jamais initialisee). Ce code mort ajoute de la complexite inutile et peut induire en erreur les contributeurs futurs.

**Why this priority** : Tache de nettoyage technique sans impact utilisateur. Optionnelle mais recommandee dans le cadre de cette restructuration.

**Independent Test** : L'application se lance et fonctionne normalement apres suppression du code mort. Aucune erreur d'import ou de reference manquante.

**Acceptance Scenarios** :

1. **Given** le code SQLite mort est supprime, **When** l'application est buildee, **Then** aucune erreur de compilation n'apparait.
2. **Given** les imports associes au code mort sont retires, **When** l'application demarre, **Then** aucun avertissement ou erreur lie a des modules manquants n'est signale.

### Edge Cases

- Que se passe-t-il si une position ne contient aucune mesure ? Le systeme doit traiter un tableau vide comme valide (0 mesures) et ne pas generer d'erreur.
- Que se passe-t-il si un identifiant de source reference dans une position n'existe pas dans le dictionnaire ? Le systeme doit lever une erreur de validation explicite au chargement.
- Que se passe-t-il si un identifiant de theme dans une position ne correspond a aucun theme defini ? Le systeme doit lever une erreur de validation explicite au chargement.
- Comment gerer la retro-compatibilite pendant la transition ? Les anciens fichiers sont supprimes et remplaces ; il n'y a pas de periode de cohabitation. La migration est atomique dans un seul commit.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** : Le systeme DOIT stocker les donnees electorales dans exactement 3 fichiers par election : un fichier institutionnel, un fichier candidats, un fichier interactif.
- **FR-002** : Le fichier institutionnel DOIT contenir les metadonnees de l'election, les regles de vote, la timeline, la logistique, les faits civiques et les sources officielles.
- **FR-003** : Le fichier candidats DOIT contenir les themes, les candidats avec leurs positions imbriquees, et un dictionnaire de sources normalise.
- **FR-004** : Le fichier interactif DOIT contenir les questions du quiz et les cartes d'affirmations pour le swipe.
- **FR-005** : Chaque position DOIT pouvoir contenir un tableau de mesures concretes. Ce tableau peut etre vide.
- **FR-006** : Chaque mesure DOIT avoir un texte descriptif et des references vers des sources via identifiants.
- **FR-007** : Les sources DOIVENT etre stockees dans un dictionnaire centralise a cle unique, sans duplication.
- **FR-008** : Les references aux sources dans les positions et mesures DOIVENT utiliser des identifiants pointant vers le dictionnaire.
- **FR-009** : Le systeme DOIT reconstruire les structures de donnees plates (listes de positions, sources resolues) au chargement, pour que les composants existants fonctionnent sans modification.
- **FR-010** : Le systeme DOIT valider l'integrite referentielle au chargement : chaque identifiant de theme et de source utilise doit correspondre a une entree existante.
- **FR-011** : La page d'accueil DOIT afficher le nombre total de mesures concretes (somme de toutes les mesures de toutes les positions de tous les candidats) au lieu du nombre de positions.
- **FR-012** : Le label affiche pour ce compteur DOIT etre "mesures" (en francais).
- **FR-013** : Le systeme DOIT supprimer les 8 anciens fichiers JSON et tout code mort associe (infrastructure SQLite non utilisee, imports obsoletes).
- **FR-014** : Les identifiants de candidat et de theme DOIVENT etre implicites par imbrication dans le fichier de stockage et reinjectes par le systeme au chargement.
- **FR-015** : La mise a jour de la documentation existante (modele de donnees, contrats) DOIT refleter la nouvelle structure.

### Key Entities

- **Election** : Cadre institutionnel d'une election (ville, annee, type, regles, timeline, logistique). Stocke dans le fichier institutionnel.
- **Candidate** : Personne qui se presente a l'election. Contient des positions imbriquees dans le fichier de stockage.
- **Theme** : Classification thematique transversale a tous les candidats (transport, securite, logement...). Stocke dans le fichier candidats.
- **Position** : Prise de position d'un candidat sur un theme. Contient un resume, des details, des mesures et des references aux sources.
- **Measure** (nouveau) : Proposition concrete dans une position. Contient un texte descriptif et des references vers des sources.
- **Source** : Reference documentaire (titre, URL, type, date d'acces). Stockee une seule fois dans un dictionnaire normalise, referencee par identifiant.
- **SurveyQuestion** : Question du quiz interactif avec options et scoring par theme. Stockee dans le fichier interactif.
- **StatementCard** : Carte d'affirmation pour le mode swipe. Stockee dans le fichier interactif.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : Le nombre de fichiers de donnees par election passe de 8 a 3, sans perte d'information.
- **SC-002** : 100% des composants de l'application fonctionnent sans modification apres la restructuration (zero breaking change).
- **SC-003** : La page d'accueil affiche correctement le nombre total de mesures concretes.
- **SC-004** : Aucune source n'est dupliquee dans le jeu de donnees — chaque source est stockee exactement une fois dans le dictionnaire.
- **SC-005** : La validation au chargement detecte 100% des erreurs d'integrite referentielle (identifiants de themes ou sources inexistants).
- **SC-006** : Tout le code mort (infrastructure SQLite, imports obsoletes) est supprime, et aucune erreur de build n'est introduite.
- **SC-007** : Le temps de chargement des donnees reste stable (pas de regression perceptible par l'utilisateur).

## Assumptions

- La migration des donnees est atomique : les 8 anciens fichiers sont supprimes et remplaces par 3 nouveaux fichiers dans la meme operation. Il n'y a pas de periode de cohabitation entre les deux formats.
- Les mesures concretes seront ajoutees manuellement par le mainteneur des donnees apres la restructuration. Le tableau de mesures peut etre vide initialement pour les positions existantes.
- L'identifiant d'une position est derive implicitement de la paire candidat + theme. Il n'y a qu'une seule position par candidat et par theme.
- Le code SQLite mort (fichiers database.native.ts et database.web.ts) n'est appele nulle part dans l'application et peut etre supprime sans impact.

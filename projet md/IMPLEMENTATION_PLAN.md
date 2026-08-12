# Plan d'implémentation

## Phase 0 — audit

Statut : **terminée le 10 août 2026**.

- [x] inspecter le repo;
- [x] confirmer la stack;
- [x] ajouter variables d'environnement;
- [x] choisir le fournisseur LLM initial;
- [x] définir les schémas Pydantic/JSON Schema adaptés au backend FastAPI existant.

Voir `PHASE_0_DECISIONS.md` pour les décisions adaptées au dépôt.

## Phase 1 — Blueprint en code

Encoder le Blueprint Marketing v1 en TypeScript statique. Ne pas construire l'éditeur Blueprint avant validation du moteur.

## Phase 2 — état de consultation

Créer consultations, objectifs, tours et transitions d'état. Tester sans LLM.

## Phase 3 — moteur LLM

Créer extraction, décision, validation, retry et garde-fous. Tests unitaires obligatoires.

## Phase 4 — UX prospect

Construire accueil, question, choix, texte libre, progression et fin.

## Phase 5 — brief final

Créer le JSON structuré final et une vue interne lisible.

## Phase 5.5 — CRM et automatisations de base

Créer l’interface de connecteur, un premier connecteur pilote, la correspondance des champs autorisés, les webhooks et la journalisation des exécutions. Garder les orchestrations complexes hors MVP.

## Phase 6 — scénarios de test

Statut : **terminée le 11 août 2026**.

Tester au minimum :
- prospect cherche plus de leads et fait peu de marketing;
- prospect fait beaucoup de Meta Ads mais le ROAS baisse;
- prospect veut un rebranding après une acquisition;
- budget trop faible;
- prospect travaille déjà avec une agence;
- réponses vagues;
- abandon avant la fin.

Voir `PHASE_6_SCENARIOS.md` pour les résultats attendus et les invariants vérifiés.

## Phase 7 — tests terrain

Statut : **dispositif prêt le 11 août 2026; campagne réelle à mener**.

Ne pas ajouter PDF, avatar, voix ou automatisations complexes avant d'avoir observé de vraies consultations.

Le carnet de preuves, la fiche d’évaluation et le protocole sont disponibles. Voir `PHASE_7_FIELD_TESTS.md`.

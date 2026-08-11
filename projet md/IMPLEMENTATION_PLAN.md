# Plan d'implémentation

## Phase 0 — audit
- inspecter le repo;
- confirmer la stack;
- ajouter variables d'environnement;
- choisir le fournisseur LLM initial;
- définir les schémas Zod/JSON.

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

## Phase 6 — scénarios de test

Tester au minimum :
- prospect cherche plus de leads et fait peu de marketing;
- prospect fait beaucoup de Meta Ads mais le ROAS baisse;
- prospect veut un rebranding après une acquisition;
- budget trop faible;
- prospect travaille déjà avec une agence;
- réponses vagues;
- abandon avant la fin.

## Phase 7 — tests terrain

Ne pas ajouter PDF, CRM, avatar ou voix avant d'avoir observé de vraies consultations.

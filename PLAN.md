# Plan d’implémentation — Astrapio Discovery MVP

## Objectif

Valider qu’un prospect d’agence marketing accepte une consultation IA interactive avant la rencontre humaine et que l’agence juge le brief généré suffisamment utile pour son processus commercial.

## Principes non négociables

1. Le backend est l’autorité sur l’état et les transitions.
2. Toute sortie LLM est structurée et validée.
3. Le LLM ne fournit aucun conseil marketing au prospect.
4. Le LLM ne promet ni prix, ni délai, ni livrable.
5. La consultation peut être interrompue proprement.
6. Le brief peut être reconstruit depuis les données structurées.
7. Le MVP reste limité à la verticale des agences marketing.

## Phase 0 — Fondations techniques

Statut : **terminée**.

- audit du dépôt et de la stack;
- architecture Next.js + FastAPI confirmée;
- configuration serveur et LLM ajoutée;
- OpenAI choisi comme fournisseur initial de production;
- fournisseur `mock` choisi pour les tests;
- contrats Pydantic et JSON Schema définis;
- documentation racine alignée avec le nouveau produit.

## Phase 1 — Blueprint Marketing v1

- encoder les 14 objectifs du Blueprint en Python statique;
- distinguer objectifs obligatoires et optionnels;
- encoder les six questions imposées;
- valider les clés uniques et le plafond de questions;
- tester intégralement la configuration.

## Phase 2 — État de consultation

- créer les modèles SQLAlchemy Organization, Blueprint et Consultation;
- créer Objective, Turn et DiscoveryBrief;
- ajouter les dépôts et migrations initiales;
- implémenter les transitions d’état en fonctions pures;
- implémenter les règles d’arrêt sans LLM;
- tester contradictions, abandon et plafond de questions.

## Phase 3 — Moteur LLM

- implémenter le fournisseur `mock` déterministe;
- implémenter le fournisseur OpenAI côté serveur;
- séparer extraction et décision;
- ajouter validation, reprises limitées et journalisation;
- appliquer les garde-fous après chaque décision;
- tester les sorties invalides et les violations de règles.

## Phase 4 — Expérience prospect

- créer `/consultation/[token]`;
- ajouter accueil, progression, question et fin;
- prendre en charge texte, choix, multi-choix, nombre, budget et échéancier;
- sauvegarder chaque réponse avant de poursuivre;
- gérer reprise, interruption, chargement et erreurs accessibles;
- adapter l’identité visuelle au produit SaaS.

## Phase 5 — Brief et vue agence

- générer le Marketing Discovery Brief structuré;
- créer `/app/consultations`;
- créer `/app/consultations/[id]`;
- afficher qualification, objectifs, informations manquantes et contradictions;
- afficher les réponses brutes sans exposer les traces internes du modèle.

## Phase 5.5 — CRM et automatisations de base

- définir une interface de connecteur CRM remplaçable;
- commencer par un connecteur pilote, puis couvrir Zoho CRM, HubSpot ou l’environnement choisi pour les tests terrain;
- synchroniser uniquement les champs explicitement autorisés;
- déclencher des actions simples : création ou mise à jour du dossier, assignation, notification et webhook;
- journaliser chaque tentative, résultat et reprise sur erreur;
- conserver les automatisations complexes hors du MVP.

## Phase 6 — Scénarios obligatoires

- plus de leads avec peu de marketing actuel;
- Meta Ads avec ROAS en baisse;
- rebranding après acquisition;
- budget incompatible;
- agence actuelle ou précédente;
- réponses vagues;
- contradiction sur un objectif obligatoire;
- abandon avant la fin.

## Phase 7 — Tests terrain

- observer de vraies consultations;
- mesurer démarrage, complétion, durée et abandons;
- recueillir l’évaluation des briefs par les agences;
- ne pas ajouter CRM, documents, voix ou paiement avant validation du moteur.

## Critères de réussite MVP

- le prospect comprend l’expérience sans assistance;
- la consultation ne ressemble pas à un formulaire statique;
- aucune répétition évidente;
- suivis pertinents et courts;
- garde-fous respectés;
- objectifs obligatoires correctement suivis;
- brief utile pour préparer une rencontre humaine.

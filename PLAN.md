# Plan d’implémentation — Koto Discovery MVP

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

Statut : **terminée le 11 août 2026**.

- encoder les 14 objectifs du Blueprint en Python statique;
- distinguer objectifs obligatoires et optionnels;
- encoder les six questions imposées;
- valider les clés uniques et le plafond de questions;
- tester intégralement la configuration.

## Phase 2 — État de consultation

Statut : **terminée le 11 août 2026**.

- créer les modèles SQLAlchemy Organization, Blueprint et Consultation;
- créer Objective, Turn et DiscoveryBrief;
- ajouter les dépôts et migrations initiales;
- implémenter les transitions d’état en fonctions pures;
- implémenter les règles d’arrêt sans LLM;
- tester contradictions, abandon et plafond de questions.

## Phase 3 — Moteur LLM

Statut : **terminée le 11 août 2026**.

- implémenter le fournisseur `mock` déterministe;
- implémenter le fournisseur OpenAI côté serveur;
- séparer extraction et décision;
- ajouter validation, reprises limitées et journalisation;
- appliquer les garde-fous après chaque décision;
- tester les sorties invalides et les violations de règles.

## Phase 4 — Expérience prospect

Statut : **terminée le 11 août 2026**.

- créer `/c/[consultationId]` avec un jeton signé ou opaque résolu côté backend;
- ajouter accueil, progression, question et fin;
- prendre en charge texte, choix, multi-choix, nombre, budget et échéancier;
- sauvegarder chaque réponse avant de poursuivre;
- gérer reprise, interruption, chargement et erreurs accessibles;
- adapter l’identité visuelle au produit SaaS.

## Phase 5 — Brief et vue agence

Statut : **terminée le 11 août 2026**.

- générer le Marketing Discovery Brief structuré;
- créer `/app/consultations`;
- créer `/app/consultations/[id]`;
- afficher qualification, objectifs, informations manquantes et contradictions;
- afficher les réponses brutes sans exposer les traces internes du modèle.
- conserver l’espace entreprise sous `/app/*`, séparé du site promotionnel public;

## Phase 5.5 — CRM et automatisations de base

Statut : **terminée le 11 août 2026**.

- interface de connecteur remplaçable et connecteur webhook pilote signé;
- liste blanche stricte des champs CRM, sans réponse brute ni trace interne du modèle;
- actions simples de création ou mise à jour, assignation, notification et webhook;
- journal durable de chaque livraison, tentative, résultat et reprise limitée;
- idempotence par événement et isolation des échecs pour préserver le brief;
- automatisations complexes conservées hors du MVP.

## Phase 6 — Scénarios obligatoires

Statut : **terminée le 11 août 2026**.

- plus de leads avec peu de marketing actuel, sans inventer de canal actif;
- Meta Ads avec ROAS en baisse, conservé factuellement dans le brief;
- rebranding après acquisition, relié au besoin de branding;
- budget incompatible, classé `unqualified` par une règle backend déterministe;
- agence actuelle ou précédente, décrite sans jugement ni critique;
- réponse vague, suivie d’une demande de précision sur le même objectif;
- contradiction obligatoire, clarifiée avant tout objectif inconnu;
- abandon avant la fin, avec réponses conservées et données manquantes explicites.

## Phase 7 — Tests terrain

Statut : **dispositif prêt le 11 août 2026; observations réelles à exécuter**.

- carnet de preuves disponible dans `/app/field-tests`;
- démarrage, complétion, durée, réponses et abandons calculés automatiquement;
- fiche structurée d’observation prospect et d’évaluation du brief par consultation;
- protocole pilote, seuils de décision et règles de confidentialité documentés;
- campagne avec de vrais prospects et de vraies agences encore requise;
- documents, voix et paiement gelés jusqu’à validation empirique du moteur.

## Critères de réussite MVP

- le prospect comprend l’expérience sans assistance;
- la consultation ne ressemble pas à un formulaire statique;
- aucune répétition évidente;
- suivis pertinents et courts;
- garde-fous respectés;
- objectifs obligatoires correctement suivis;
- brief utile pour préparer une rencontre humaine.

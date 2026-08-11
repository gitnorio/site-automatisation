# Phase 0 — Décisions techniques

Statut : terminée le 10 août 2026.

## Architecture retenue

- **Frontend** : Next.js 16, React 19 et TypeScript pour l’expérience prospect et la vue interne minimale.
- **Backend** : FastAPI demeure l’autorité sur les consultations, les objectifs, les tours, les règles d’arrêt et la validation des sorties LLM.
- **Validation** : Pydantic est la source de vérité des contrats backend et produit les JSON Schema nécessaires. Le frontend recevra des types dérivés ou maintenus à sa frontière API lorsque les routes seront ajoutées.
- **Persistance MVP** : PostgreSQL est utilisé en développement, dans les tests d’intégration et au déploiement. SQLAlchemy reste la couche d’accès aux données.
- **LLM initial** : OpenAI derrière l’interface `DiscoveryLLM`. Le modèle est configuré par environnement et n’est jamais codé en dur.
- **Tests** : le fournisseur `mock` est utilisé sans réseau pour les tests du moteur et les scénarios déterministes.

## Frontières de responsabilité

Le LLM peut :

- extraire des informations structurées d’une réponse;
- proposer une prochaine question;
- produire le contenu structuré d’un brief.

Le LLM ne peut pas :

- écrire directement en base de données;
- choisir seul une transition irréversible;
- terminer une consultation sans validation backend;
- dépasser le plafond de questions;
- produire des conseils marketing, budgets, prix, délais ou promesses.

## Routage cible

- `/c/[consultationId]` : expérience publique du prospect;
- `/app/consultations` : liste interne minimale;
- `/app/consultations/[id]` : brief, réponses et objectifs;
- `/api/consultations` : création et lecture contrôlée;
- `/api/consultations/{id}/answers` : soumission d’une réponse;
- `/api/consultations/{id}/brief` : lecture du brief final.

Les routes ne sont pas implémentées en phase 0.

## Variables d’environnement

- `DATABASE_URL` : base principale;
- `DISCOVERY_LLM_PROVIDER` : `openai` ou `mock`;
- `DISCOVERY_LLM_MODEL` : modèle choisi au déploiement;
- `OPENAI_API_KEY` : secret serveur uniquement;
- `LLM_TIMEOUT_SECONDS` : délai maximal d’un appel;
- `LLM_MAX_RETRIES` : reprises après sortie invalide ou erreur transitoire;
- `DISCOVERY_MAX_QUESTIONS` : plafond absolu de questions;
- `CONSULTATION_TOKEN_SECRET` : signature future des liens publics.

## Décisions reportées

- fournisseur d’authentification de la vue agence;
- choix éventuel d’un hébergement PostgreSQL géré, dont Supabase;
- politique définitive de conservation et suppression;
- seuils commerciaux de qualification;
- premier connecteur CRM pilote;
- documents, paiement, automatisations complexes et analytics avancés.

Ces décisions ne bloquent pas le moteur local des phases 1 à 3.

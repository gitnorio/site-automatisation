# Koto Discovery

SaaS B2B de consultation client interactive par IA, initialement conçu pour les agences marketing boutique et PME.

Koto intervient avant la consultation humaine. L’agence définit les informations qu’elle doit obtenir dans un **Discovery Blueprint**; le moteur choisit comment les découvrir au moyen de questions adaptatives et produit un brief structuré pour l’équipe de l’agence.

## Principes produit

- une question principale à la fois;
- expérience prospect premium, courte et guidée;
- état de chaque objectif maintenu par le backend;
- sorties LLM strictement structurées et validées;
- aucune recommandation marketing donnée au prospect;
- aucune promesse de prix, délai ou livrable;
- transition finale vers une consultation humaine.

## État du projet

Les **phases 0 à 6**, le refactoring structurel et le dispositif de la phase 7 sont terminés :

- dépôt et stack audités;
- architecture Next.js + FastAPI confirmée;
- PostgreSQL retenu comme base unique pour le développement et le déploiement;
- OpenAI retenu comme premier fournisseur de production derrière une abstraction remplaçable;
- fournisseur `mock` retenu pour les tests locaux;
- contrats Pydantic stricts et JSON Schema définis pour extraction, décision et brief;
- Blueprint Marketing v1 encodé et validé intégralement;
- état de consultation, transitions et règles d'arrêt implémentés sans dépendance au LLM;
- persistance SQLAlchemy et migration Alembic initiale ajoutées;
- fournisseurs LLM `mock` et OpenAI ajoutés derrière une interface commune;
- extraction, décision et brief séparés, validés et repris de manière limitée;
- garde-fous déterministes appliqués après chaque sortie LLM;
- liens publics protégés par jetons HMAC signés et expirants;
- API prospect avec démarrage, réponse, reprise idempotente et interruption;
- expérience `/c/[consultationId]` adaptative, accessible et responsive;
- six formats de réponse pris en charge : texte, choix, multi-choix, nombre, budget et échéancier;
- brief structuré généré pour les consultations terminées ou interrompues;
- API interne protégée qui n’expose ni confiance, ni source, ni traces du modèle;
- liste agence avec progression, statut et qualification;
- dossier agence avec synthèse, objectifs complets ou incomplets et réponses brutes;
- connecteur d’automatisation remplaçable avec webhook pilote signé par HMAC;
- liste blanche stricte des données CRM, sans réponse brute ni trace interne du modèle;
- actions simples de dossier CRM, assignation, notification et webhook;
- journal durable des livraisons, tentatives et reprises limitées;
- échec d’automatisation isolé : un brief valide demeure toujours disponible;
- huit scénarios métier obligatoires exécutés sans réseau avec le fournisseur `mock`;
- réponses vagues et contradictions obligatoires suivies selon leur priorité;
- budget inférieur au seuil MVP provisoire classé `unqualified` par le backend;
- carnet de preuves terrain avec funnel, durée médiane, abandons et questions répondues;
- revue humaine structurée de l’expérience prospect et de l’utilité de chaque brief;
- critères qualitatifs agrégés uniquement depuis les consultations observées en direct;
- `/app/*` protégé temporairement par HTTP Basic avant l’authentification multi-utilisateur;
- variables d’environnement documentées;
- frontières explicites entre marketing, espace entreprise et expérience prospect;
- backend organisé par modules métier et API versionnée.

Le parcours prospect, la vue agence, le pilote d’automatisation, les scénarios métier et le carnet de preuves sont reliés au moteur Discovery et à PostgreSQL. Le logiciel est prêt pour la campagne terrain; ses résultats ne peuvent pas être remplacés par des données simulées.

## Portée MVP

### Inclus

- Blueprint fixe `Agence marketing v1`;
- lien public de consultation;
- réponses texte, choix, nombres, budget et échéancier;
- questions adaptatives;
- persistance des consultations, objectifs et tours;
- moteur d’état contrôlé par le backend;
- intégration LLM avec validation et reprises limitées;
- logique d’arrêt;
- Marketing Discovery Brief structuré;
- synchronisation CRM de base après qualification;
- automatisations simples déclenchées par le résultat de la consultation;
- vue interne minimale.

### Hors MVP

- PDF et analyse documentaire;
- automatisations complexes à plusieurs systèmes;
- voix et avatar 3D;
- paiement;
- multi-verticales;
- dashboard et analytics avancés;
- recommandations marketing au prospect.

## Architecture

- `/`, `/clients`, `/tarifs`, `/contact` — landing page et site promotionnel public;
- `/app/consultations`, `/app/blueprints`, `/app/settings` — application entreprise protégée par une barrière Basic MVP;
- `/app/field-tests` — funnel pilote, critères MVP et journal des évaluations terrain;
- `/c/[consultationId]` — expérience prospect isolée, accessible par lien sécurisé;
- `frontend/` — Next.js 16, React 19 et TypeScript;
- `frontend/app/(marketing)/` — routes promotionnelles et layout public;
- `frontend/app/(workspace)/` — espace entreprise et shell dédié;
- `frontend/app/(prospect)/` — expérience prospect sans chrome marketing;
- `frontend/features/` — domaines marketing, contact, workspace et consultation;
- `backend/` — FastAPI, Pydantic et SQLAlchemy;
- `backend/app/api/v1/` — assemblage des routes HTTP versionnées;
- `backend/app/modules/contact/` — route, service, dépôt, modèle et schémas contact;
- `backend/app/modules/discovery/` — contrats, règles, persistance et flux public du moteur;
- `backend/app/modules/automation/` — événement autorisé, service d’orchestration et journal durable;
- `backend/app/modules/field_testing/` — revues humaines et agrégation des preuves terrain;
- `backend/app/integrations/llm/` — abstraction des fournisseurs LLM;
- `backend/app/integrations/automation/` — connecteur webhook pilote et fabrique remplaçable;
- `projet md/` — contexte produit et spécifications de référence;
- `PLAN.md` — phases d’implémentation du MVP;
- `ASSUMPTIONS.md` — décisions temporaires et points à confirmer.

Le backend reste l’autorité. Le LLM propose des extractions et décisions structurées, mais n’écrit jamais directement en base et ne contrôle jamais seul une transition irréversible.

La route contact officielle est `POST /api/v1/contact`. `POST /api/contact` reste disponible temporairement comme alias compatible.

Les trois zones partagent le même projet Web, mais utilisent des layouts distincts. La landing page conserve sa navigation marketing. L’application entreprise possède son propre shell. La consultation prospect n’expose ni navigation interne, ni dashboard, ni données de l’agence.

## Configuration

```bash
cp .env.example .env
```

Variables principales :

- `DATABASE_URL` — connexion PostgreSQL principale;
- `TEST_DATABASE_URL` — base PostgreSQL isolée utilisée par Pytest;
- `POSTGRES_DB`, `POSTGRES_USER` et `POSTGRES_PASSWORD` — configuration du conteneur local;
- `DISCOVERY_LLM_PROVIDER` — `mock` en local ou `openai`;
- `DISCOVERY_LLM_MODEL` — modèle configuré au déploiement, par exemple `gpt-5.6-sol`;
- `DISCOVERY_LLM_REASONING_EFFORT` — effort de raisonnement, `low` par défaut pour la latence;
- `OPENAI_API_KEY` — secret serveur, requis avec `openai`;
- `DISCOVERY_MAX_QUESTIONS` — plafond absolu de questions;
- `CONSULTATION_TOKEN_SECRET` — secret de signature des liens publics;
- `CONSULTATION_TOKEN_TTL_SECONDS` — durée de validité d’un lien public, 30 jours par défaut;
- `WORKSPACE_API_KEY` — secret serveur partagé entre Next.js et l’API interne;
- `WORKSPACE_BASIC_USERNAME` et `WORKSPACE_BASIC_PASSWORD` — accès temporaire à `/app/*`;
- `INTERNAL_API_URL` — adresse backend utilisée uniquement par les Server Components;
- `AUTOMATION_PROVIDER` — `disabled` par défaut ou `webhook` pour activer le pilote;
- `AUTOMATION_WEBHOOK_URL` — destination serveur HTTPS du webhook;
- `AUTOMATION_WEBHOOK_SECRET` — secret serveur utilisé pour la signature HMAC SHA-256;
- `AUTOMATION_TIMEOUT_SECONDS` — délai maximal d’un appel au connecteur;
- `AUTOMATION_MAX_RETRIES` — nombre de reprises après la première tentative;
- `NEXT_PUBLIC_SITE_URL` et `NEXT_PUBLIC_API_URL` — adresses publiques;
- `CORS_ORIGINS` — origines frontend autorisées.

## Démarrage local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend : `http://localhost:3000`

### Backend

```bash
docker compose up -d database
cd backend
python3 -m venv .venv
.venv/bin/pip install -e '.[dev]'
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

API : `http://localhost:8000`

Documentation locale : `http://localhost:8000/docs`

L'API applique également les migrations Alembic automatiquement au démarrage.

## Vérifications

```bash
cd frontend
npm run lint
npm run typecheck
npm test
npm run build

cd ../backend
.venv/bin/pytest
```

Pytest utilise par défaut la base `koto_test` créée par le conteneur PostgreSQL. Démarrez `docker compose up -d database` avant les tests backend.

PostgreSQL est exposé localement sur le port `5433` afin d’éviter les conflits avec une installation existante sur `5432`.

Le fournisseur `mock` ne réalise aucun appel réseau. Le fournisseur OpenAI utilise la Responses API, des sorties Pydantic structurées, `store=false` et un identifiant de sécurité pseudonymisé. Le modèle demeure configurable par environnement.

Le connecteur d’automatisation reste désactivé par défaut. Lorsqu’il est activé, chaque événement possède une clé d’idempotence et une signature HMAC; seules les données du contrat CRM autorisé quittent Koto. Les résultats et reprises sont visibles dans le dossier agence, mais l’URL et le secret demeurent exclusivement côté serveur.

La qualification MVP est recalculée et validée par le backend. Le seuil budgétaire pilote est fixé provisoirement à **2 500 $ CA** pour rendre le scénario « budget incompatible » vérifiable; il devra être confirmé ou rendu configurable avec les agences pendant la campagne terrain.

Le carnet terrain n’enregistre pas l’identité du prospect. Les notes d’observation doivent rester anonymes. Les taux qualitatifs n’utilisent que les revues marquées « observée en direct » afin de distinguer une observation réelle d’une simple lecture du brief.

## Références internes

Lire d’abord `projet md/README.md`, puis suivre son ordre de lecture. Les décisions adaptées au dépôt sont consignées dans `projet md/PHASE_0_DECISIONS.md`, les scénarios dans `projet md/PHASE_6_SCENARIOS.md` et le protocole pilote dans `projet md/PHASE_7_FIELD_TESTS.md`.

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

La **phase 0** et le refactoring structurel sont terminés :

- dépôt et stack audités;
- architecture Next.js + FastAPI confirmée;
- PostgreSQL retenu comme base unique pour le développement et le déploiement;
- OpenAI retenu comme premier fournisseur de production derrière une abstraction remplaçable;
- fournisseur `mock` retenu pour les tests locaux;
- contrats Pydantic stricts et JSON Schema définis pour extraction, décision et brief;
- variables d’environnement documentées.
- frontières explicites entre marketing, espace entreprise et expérience prospect;
- backend organisé par modules métier et API versionnée.

Le moteur de consultation et la logique métier du MVP ne sont pas encore implémentés. Les routes entreprise et prospect actuelles sont des interfaces structurelles sans moteur actif.

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
- `/app/consultations`, `/app/blueprints`, `/app/settings` — application entreprise authentifiée;
- `/c/[consultationId]` — expérience prospect isolée, accessible par lien sécurisé;
- `frontend/` — Next.js 16, React 19 et TypeScript;
- `frontend/app/(marketing)/` — routes promotionnelles et layout public;
- `frontend/app/(workspace)/` — espace entreprise et shell dédié;
- `frontend/app/(prospect)/` — expérience prospect sans chrome marketing;
- `frontend/features/` — domaines marketing, contact, workspace et consultation;
- `backend/` — FastAPI, Pydantic et SQLAlchemy;
- `backend/app/api/v1/` — assemblage des routes HTTP versionnées;
- `backend/app/modules/contact/` — route, service, dépôt, modèle et schémas contact;
- `backend/app/modules/discovery/` — contrats et futures règles du moteur;
- `backend/app/integrations/llm/` — abstraction des fournisseurs LLM;
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
- `DISCOVERY_LLM_MODEL` — modèle configuré au déploiement;
- `OPENAI_API_KEY` — secret serveur, requis avec `openai`;
- `DISCOVERY_MAX_QUESTIONS` — plafond absolu de questions;
- `CONSULTATION_TOKEN_SECRET` — secret de signature des futurs liens publics;
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
.venv/bin/uvicorn app.main:app --reload
```

API : `http://localhost:8000`

Documentation locale : `http://localhost:8000/docs`

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

## Références internes

Lire d’abord `projet md/README.md`, puis suivre son ordre de lecture. Les décisions adaptées au dépôt sont consignées dans `projet md/PHASE_0_DECISIONS.md`.

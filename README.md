# Astrapio

Site vitrine techniquement prêt, rédigé en français québécois, pour présenter les services d’intégration et d’automatisation IA d’Astrapio aux PME.

## Fonctionnalités

- identité visuelle Windows 95 originale;
- 17 illustrations pixel art générées pour le projet;
- accueil complet, galerie de 11 services, méthodologie, à propos, blogue et contact;
- recherche, filtres, vues cartes/liste et fiches de services partageables;
- formulaire validé côté client et FastAPI;
- champ piège, limitation des soumissions et stockage SQLite;
- métadonnées, sitemap, robots.txt et données structurées;
- responsive, navigation clavier et animations réduites.

## Structure

- `frontend/` — Next.js, React, TypeScript et CSS/Tailwind;
- `backend/` — FastAPI, Pydantic, SQLAlchemy et SQLite;
- `PLAN.md` — spécification et critères d’acceptation;
- `ASSUMPTIONS.md` — décisions à confirmer avant publication.

## Configuration

```bash
cp .env.example .env
```

Variables principales :

- `NEXT_PUBLIC_SITE_URL` — adresse publique du frontend;
- `NEXT_PUBLIC_API_URL` — adresse publique de FastAPI;
- `CONTACT_DATABASE_URL` — connexion SQLite ou PostgreSQL future;
- `CORS_ORIGINS` — origines autorisées, séparées par des virgules;
- `TRUST_PROXY_HEADERS` — active la lecture de `X-Forwarded-For` derrière un proxy maîtrisé;
- `RATE_LIMIT_MAX_REQUESTS` et `RATE_LIMIT_WINDOW_SECONDS` — paramètres de limitation.

## Démarrage local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le site est disponible sur `http://localhost:3000`.

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e '.[dev]'
.venv/bin/uvicorn app.main:app --reload
```

L’API est disponible sur `http://localhost:8000`. Les demandes sont enregistrées dans `backend/data/astrapio.db` par défaut.

## Docker Compose

```bash
docker compose up --build
```

- Frontend : `http://localhost:3000`
- Backend : `http://localhost:8000`
- Santé : `http://localhost:8000/health`

Le volume `contact_data` conserve la base SQLite.

## Vérifications

```bash
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e

cd ../backend
.venv/bin/pytest
```

## Formulaire de contact

`POST /api/contact` accepte les champs décrits dans `PLAN.md`. Une réponse valide est enregistrée avec un UUID, un horodatage UTC et le statut `new`.

La limitation actuelle est conservée en mémoire. Pour plusieurs instances backend, remplacer ce mécanisme par un stockage partagé comme Redis.

## Avant publication

- compléter les coordonnées officielles;
- ajouter le portrait et le parcours réel du fondateur;
- confirmer les dates des articles;
- choisir l’acheminement des demandes au-delà de SQLite;
- faire réviser les conditions d’utilisation par un professionnel connaissant les exigences applicables au Québec;
- ajouter une politique appropriée si les pratiques de collecte ou les outils utilisés l’exigent;
- ne déployer aucun outil analytique non essentiel sans mécanisme de consentement approprié.

## Limites connues

- aucune intégration client n’est présentée comme déjà déployée;
- aucun portail client, assistant RAG ou environnement multi-entreprise n’est inclus;
- le système de contact ne transmet pas encore de notification par courriel;
- les illustrations sont des actifs éditoriaux et ne constituent pas des captures de solutions déjà livrées.

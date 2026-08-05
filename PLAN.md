# Plan d’implémentation — Site Astrapio

## 1. Objectif du projet

Construire un site vitrine professionnel, entièrement en français québécois, pour **Astrapio**, une entreprise québécoise qui conçoit, développe et intègre des solutions d’intelligence artificielle adaptées aux opérations des PME.

Le site doit :

- expliquer clairement les services d’Astrapio à un public non technique;
- présenter des cas d’utilisation concrets sans inventer de clients, résultats ou intégrations existantes;
- permettre de recevoir des demandes de consultation au moyen d’un formulaire relié à une API FastAPI;
- adopter une identité visuelle rétro inspirée des interfaces Windows 95 et de la galerie de `https://someclaudeskills.com/skills/`;
- utiliser uniquement des textes, composants et illustrations originaux;
- être responsive, rapide, accessible et prêt à être personnalisé avant publication.

## 2. Décisions fonctionnelles définitives

### 2.1 Arborescence publique

| Page | Route | Rôle |
| --- | --- | --- |
| Accueil | `/` | Présenter Astrapio, les problèmes traités, les services, la méthode et l’appel à l’action principal. |
| Services | `/services` | Regrouper les services et les cas d’utilisation dans une galerie filtrable. |
| À propos de nous | `/a-propos` | Présenter la mission, les principes et l’identité québécoise de l’entreprise. |
| Notre méthodologie | `/methodologie` | Expliquer les sept étapes d’un mandat Astrapio. |
| Notre blogue | `/blogue` | Afficher les articles, catégories et résumés. |
| Article | `/blogue/[slug]` | Afficher un article complet et ses métadonnées. |
| Contact | `/contact` | Recevoir une demande de consultation. |
| Conditions d’utilisation | `/conditions-utilisation` | Présenter un modèle de conditions à faire réviser. |
| Page introuvable | route Next.js `not-found` | Orienter le visiteur vers l’accueil ou les services. |

Les pages **Solutions**, **Notre approche** et **Confidentialité** ne doivent pas être créées. Aucun lien, bouton, élément du sitemap ou métadonnée ne doit les référencer.

### 2.2 Navigation

La navigation principale contient :

1. Accueil;
2. Services;
3. À propos;
4. Contact;
5. bouton principal « Planifier une consultation ».

« À propos » est un déclencheur de menu et non un lien. Son sous-menu contient :

- À propos de nous;
- Notre méthodologie;
- Notre blogue.

Comportement du sous-menu :

- ouverture au clic ou avec `Entrée`/`Espace`;
- attribut `aria-expanded` synchronisé;
- navigation au clavier dans les liens;
- fermeture avec `Échap`, après sélection ou clic extérieur;
- retour du focus sur le déclencheur après `Échap`;
- présentation en section dépliable dans le menu mobile.

## 3. Architecture technique

### 3.1 Technologies

#### Frontend

- Next.js avec App Router;
- React;
- TypeScript en mode strict;
- Tailwind CSS;
- Lucide React pour les icônes d’interface;
- Vitest et Testing Library pour les tests unitaires et de composants;
- Playwright pour les parcours critiques et la vérification responsive.

#### Backend

- Python 3.13 compatible;
- FastAPI;
- Pydantic;
- SQLAlchemy avec SQLite;
- Pytest;
- Uvicorn.

#### Exécution

- Dockerfile distinct pour le frontend et le backend;
- Docker Compose à la racine;
- variables documentées dans `.env.example`;
- volume Docker pour conserver le fichier SQLite en développement.

### 3.2 Arborescence cible

```text
site-automatisation/
├── frontend/
│   ├── app/
│   │   ├── a-propos/page.tsx
│   │   ├── blogue/
│   │   │   ├── [slug]/page.tsx
│   │   │   └── page.tsx
│   │   ├── conditions-utilisation/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── methodologie/page.tsx
│   │   ├── services/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── layout/
│   │   ├── retro/
│   │   └── services/
│   ├── content/
│   │   ├── articles.ts
│   │   ├── navigation.ts
│   │   └── services.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── metadata.ts
│   │   └── utils.ts
│   ├── public/
│   │   ├── images/pixel-art/
│   │   └── favicon.ico
│   ├── tests/
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/
│   ├── app/
│   │   ├── api/contact.py
│   │   ├── core/config.py
│   │   ├── core/database.py
│   │   ├── core/rate_limit.py
│   │   ├── models/contact.py
│   │   ├── repositories/contact.py
│   │   ├── schemas/contact.py
│   │   └── main.py
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── .env.example
├── .gitignore
├── ASSUMPTIONS.md
├── docker-compose.yml
├── PLAN.md
└── README.md
```

## 4. Système visuel rétro

### 4.1 Principe

Le site doit reprendre le langage visuel général de la référence, sans en reproduire le code ou les actifs :

- fond de bureau turquoise texturé;
- grandes fenêtres grises;
- barres de titre bleu système;
- bordures claires et foncées produisant un relief 3D;
- ombres noires sans flou;
- contrôles carrés;
- titres et libellés monospace;
- illustrations pixel art colorées dans les cartes.

Le design doit demeurer crédible pour une entreprise B2B. Les effets rétro ne doivent jamais empêcher la lecture, la navigation ou la compréhension d’un appel à l’action.

### 4.2 Jetons CSS

Définir les variables suivantes dans `globals.css` :

```css
--desktop: #008080;
--system-surface: #c0c0c0;
--system-surface-light: #dfdfdf;
--system-highlight: #ffffff;
--system-shadow: #808080;
--system-dark-shadow: #000000;
--selection: #000080;
--selection-text: #ffffff;
--astrapio-violet: #6d5dfb;
--success: #16834a;
--danger: #a32121;
--text: #111111;
```

Règles communes :

- rayon maximal de `2px` sur les contrôles système;
- ombres dures, jamais de `box-shadow` diffus;
- bordure relevée : blanc en haut/gauche, gris foncé en bas/droite;
- bordure enfoncée : ordre inversé;
- largeur de contenu maximale de `1280px`;
- zone tactile minimale de `44px` sur mobile;
- focus clavier de deux couleurs visible sur tous les contrôles.

### 4.3 Typographie

- titres de fenêtre et libellés : pile monospace robuste;
- grands titres : police pixel libre et chargée localement ou package de police documenté;
- paragraphes : police monospace lisible avec taille minimale de `16px` et hauteur de ligne d’au moins `1.6`;
- aucun texte important directement intégré dans une image.

### 4.4 Composants visuels réutilisables

Créer au minimum :

- `RetroWindow` : conteneur avec barre de titre, niveau de titre configurable et zone de contenu;
- `RetroButton` : variantes principale, secondaire, danger et enfoncée;
- `RetroPanel` : panneau relevé ou enfoncé;
- `RetroTag` : catégorie ou état sélectionnable;
- `RetroDialog` : dialogue accessible avec gestion du focus;
- `RetroToolbar` : groupe de contrôles de galerie;
- `PixelImageFrame` : cadre d’image avec dimensions stables;
- `SiteHeader`, `AboutMenu`, `MobileNavigation` et `SiteFooter`.

## 5. Production des images pixel art

### 5.1 Méthode

Utiliser ImageGen en mode intégré. Générer chaque actif séparément afin que son sujet corresponde exactement à son emplacement.

Procédure :

1. générer une première image maîtresse;
2. inspecter la palette, le niveau de détail, les contours et la perspective;
3. utiliser cette image comme référence de style pour les autres générations;
4. inspecter chaque résultat;
5. régénérer les images comportant du texte, un style incohérent, un objet déformé ou une composition inutilisable;
6. convertir les actifs retenus en WebP;
7. enregistrer les fichiers dans `frontend/public/images/pixel-art/`;
8. fournir une largeur et une hauteur explicites à chaque composant Next Image.

### 5.2 Spécification visuelle commune

Chaque prompt doit imposer :

- pixel art 16-bit détaillé;
- contours nets de un à trois pixels;
- perspective isométrique ou vue frontale légèrement élevée;
- palette limitée : bleu nuit, turquoise, violet, rose saumon et beige;
- tramage manuel;
- ombres par aplats;
- ambiance informatique des années 1990;
- composition lisible à petite taille;
- absence de texte, logo, filigrane, photoréalisme, 3D lisse, flou et dégradés modernes.

### 5.3 Inventaire des 16 actifs

| Fichier final | Format | Sujet |
| --- | --- | --- |
| `hero-ecosystem.webp` | panoramique | Écosystème reliant courriel, documents, CRM, base de données, employés et assistant IA. |
| `service-automation.webp` | 4:3 | Tâches administratives circulant automatiquement entre plusieurs postes. |
| `service-ai-assistant.webp` | 4:3 | Employé consultant un assistant IA dans une interface rétro. |
| `service-knowledge.webp` | 4:3 | Bibliothèque de documents reliée à un moteur de recherche intelligent. |
| `service-integration.webp` | 4:3 | Plusieurs logiciels reliés par des câbles et flux de données. |
| `service-custom.webp` | 4:3 | Atelier numérique construisant une application adaptée. |
| `service-quotes.webp` | 4:3 | Courriel de soumission transformé en dossier structuré. |
| `service-email.webp` | 4:3 | Boîte de réception classée automatiquement. |
| `service-documents.webp` | 4:3 | Données extraites de factures et formulaires. |
| `service-reports.webp` | 4:3 | Données transformées en rapport vérifiable. |
| `service-sync.webp` | 4:3 | Deux logiciels synchronisant leurs dossiers. |
| `service-support.webp` | 4:3 | Employé recevant une réponse sourcée d’un assistant interne. |
| `about-quebec.webp` | panoramique | Petit studio technologique québécois et réseau d’entreprises locales. |
| `methodology-workflow.webp` | panoramique | Sept postes reliés représentant les étapes d’un projet. |
| `blog-start-automation.webp` | 3:2 | Gestionnaire cartographiant les premières tâches à automatiser. |
| `blog-knowledge-base.webp` | 3:2 | Documents indexés et interrogés avec sources visibles. |
| `blog-existing-software.webp` | 3:2 | Logiciels existants reliés par une couche intelligente. |

L’inventaire contient 17 fichiers, dont une image maîtresse potentiellement réutilisée comme héro. Si l’image maîtresse est distincte, elle sert uniquement de référence de génération et n’est pas publiée. Le minimum publié reste de 16 actifs, avec une image différente pour chacune des onze cartes Services.

### 5.4 Accessibilité des images

- rédiger un texte alternatif lorsque l’image explique un service ou un processus;
- utiliser `alt=""` lorsque l’image est redondante avec le texte immédiatement adjacent;
- ne jamais utiliser le nom de fichier comme texte alternatif;
- conserver l’information essentielle dans le HTML, pas seulement dans l’illustration.

## 6. Contenu de l’accueil

Ordre des sections :

1. **Héro** — slogan principal, texte d’introduction, bouton « Planifier une consultation », bouton « Explorer nos services » et scène pixel art de l’écosystème.
2. **Problème** — « Vos outils sont déjà là. Faisons-les travailler ensemble. » et liste des tâches manuelles fréquentes.
3. **Services principaux** — quatre cartes menant vers la galerie filtrée : automatisation, assistants et connaissances, intégrations, développement sur mesure.
4. **Flux concret** — diagramme `Courriel → Analyse IA → Base de données → CRM → Notification → Validation humaine`.
5. **Intégrations possibles** — catégories d’outils avec formulation prudente indiquant qu’elles sont choisies selon l’environnement du client.
6. **Méthode résumée** — aperçu des étapes avec lien vers `/methodologie`.
7. **Différenciation** — accompagnement en français, intégration aux outils existants, validation humaine et architecture évolutive.
8. **Sécurité** — approche responsable sans promesse absolue.
9. **FAQ** — dix questions du brief, sous forme de contrôles dépliables accessibles.
10. **Appel à l’action final** — invitation à présenter un processus ou une difficulté d’intégration.

## 7. Galerie Services

### 7.1 Modèle de données

Créer un type `Service` :

```ts
type ServiceCategory =
  | "automatisation"
  | "assistants-ia"
  | "connaissances"
  | "integrations"
  | "documents"
  | "sur-mesure";

type Service = {
  slug: string;
  title: string;
  shortDescription: string;
  image: string;
  imageAlt: string;
  categories: ServiceCategory[];
  problem: string;
  workflow: string[];
  connectableSystems: string[];
  humanRole: string;
  benefits: string[];
  security: string[];
};
```

### 7.2 Services à publier

La collection doit contenir exactement les onze fiches suivantes :

1. Automatisation intelligente;
2. Assistants IA;
3. Bases de connaissances;
4. Intégration de systèmes;
5. Développement sur mesure;
6. Traitement des demandes de soumission;
7. Analyse et classement des courriels;
8. Extraction de données de documents;
9. Génération de rapports;
10. Synchronisation entre logiciels;
11. Assistant de soutien interne.

### 7.3 Recherche et filtres

- recherche insensible à la casse et aux accents;
- recherche dans le titre, la description et les catégories;
- filtres multisélectionnables;
- combinaison logique : une fiche est visible si elle correspond au texte et à au moins une catégorie sélectionnée;
- compteur mis à jour immédiatement;
- bouton « Réinitialiser » visible lorsque des critères sont actifs;
- état vide avec action de réinitialisation et lien Contact;
- vues Cartes et Liste conservées dans l’URL.

Paramètres publics :

- `q` : texte recherché;
- `categorie` : catégories séparées par une virgule;
- `vue` : `cartes` ou `liste`;
- `service` : slug de la fiche ouverte.

Tout paramètre invalide est ignoré sans provoquer d’erreur.

### 7.4 Dialogue de service

Au clic sur une carte :

- ajouter `service=<slug>` à l’URL sans rechargement;
- ouvrir un dialogue portant `role="dialog"` et `aria-modal="true"`;
- déplacer le focus vers son titre ou son bouton de fermeture;
- empêcher le focus de sortir du dialogue;
- fermer avec `Échap`, le bouton système ou le fond;
- restaurer le focus sur la carte d’origine;
- retirer uniquement le paramètre `service` à la fermeture;
- ouvrir automatiquement le dialogue au chargement si le slug est valide.

Le bouton du dialogue mène vers `/contact?service=<slug>`.

## 8. Pages À propos et méthodologie

### 8.1 À propos de nous

Présenter :

- la conviction fondatrice d’Astrapio;
- son positionnement comme jeune entreprise technologique québécoise;
- les principes d’utilité, simplicité, transparence, sécurité, validation humaine et résultats mesurables;
- un encadré « Portrait du fondateur à venir » sans nom, photo, diplôme ou expérience inventés.

### 8.2 Notre méthodologie

Présenter sept étapes :

1. consultation initiale;
2. cartographie du processus;
3. évaluation;
4. projet pilote;
5. intégration;
6. déploiement;
7. suivi.

Chaque étape précise : objectif, livrable, participation du client et condition de passage à l’étape suivante. Ne promettre aucun délai fixe.

## 9. Blogue

### 9.1 Modèle de contenu

```ts
type BlogCategory = "automatisation" | "ia-pratique" | "integration";

type Article = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  readingTime: string;
  category: BlogCategory;
  author: "Équipe Astrapio";
  image: string;
  imageAlt: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
};
```

### 9.2 Articles initiaux

1. **Par où commencer l’automatisation IA dans une PME** — méthode pour choisir un premier processus mesurable et peu risqué.
2. **Une base de connaissances IA, expliquée simplement** — explication accessible de la recherche documentaire, des droits d’accès et des sources.
3. **Automatiser sans remplacer vos logiciels actuels** — rôle des API, connecteurs, validations humaines et déploiements progressifs.

Les articles doivent :

- être originaux;
- éviter les statistiques non sourcées;
- ne pas annoncer de capacité déjà déployée chez un client;
- être signés « Équipe Astrapio »;
- se terminer par un lien vers un service pertinent et un appel à la consultation.

## 10. Formulaire de contact

### 10.1 Champs frontend et API

```ts
type ContactRequest = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  companySize: "1-10" | "11-50" | "51-200" | "201-plus" | "non-precise";
  needType:
    | "automatisation"
    | "assistant-ia"
    | "base-connaissances"
    | "integration"
    | "sur-mesure"
    | "consultation"
    | "autre";
  tools?: string;
  description: string;
  contactPreference: "courriel" | "telephone" | "aucune-preference";
  consent: boolean;
  website?: string;
};
```

Contraintes :

- nom : 2 à 100 caractères;
- entreprise : 2 à 150 caractères;
- courriel valide et maximum 254 caractères;
- téléphone facultatif, maximum 30 caractères;
- outils facultatifs, maximum 500 caractères;
- description : 20 à 5 000 caractères;
- consentement obligatoire;
- champ `website` invisible visuellement, mais présent dans le DOM et exclu de l’ordre de tabulation;
- avertissement interdisant l’envoi d’informations confidentielles, de données sensibles ou de clés d’accès.

### 10.2 API publique

#### `GET /health`

Réponse `200` :

```json
{"status":"ok"}
```

#### `POST /api/contact`

Succès `201` :

```json
{
  "success": true,
  "message": "Votre demande a bien été reçue."
}
```

Validation `422` : erreurs Pydantic structurées, transformées côté frontend en messages par champ.

Limitation `429` :

```json
{
  "success": false,
  "message": "Trop de demandes ont été envoyées. Veuillez réessayer plus tard."
}
```

Erreur interne `500` : message générique sans trace ni détail de base de données.

### 10.3 Champ piège et limitation

- si `website` contient une valeur, ne rien enregistrer;
- retourner une réponse générique afin de ne pas expliquer le mécanisme au robot;
- limiter à cinq soumissions par adresse IP sur une période glissante de 60 minutes;
- faire confiance aux en-têtes de proxy uniquement si une variable d’environnement l’autorise;
- conserver la limitation en mémoire pour la première version et documenter sa limite en environnement multi-instance.

### 10.4 Stockage

Table `contact_requests` :

- `id` UUID;
- tous les champs normalisés du formulaire sauf `website`;
- `created_at` UTC;
- `status` initialisé à `new`;
- adresse IP non stockée dans la demande persistante.

Créer une interface de dépôt afin que SQLite puisse être remplacé par PostgreSQL sans modifier la route API.

## 11. Référencement

Pour chaque page :

- titre unique;
- description unique;
- canonical absolu construit avec `NEXT_PUBLIC_SITE_URL`;
- métadonnées Open Graph;
- image sociale appropriée;
- langue `fr-CA`.

Créer :

- `sitemap.xml` incluant les pages publiques et les trois articles;
- `robots.txt` autorisant les pages publiques et excluant les chemins techniques;
- données structurées `Organization` ou `ProfessionalService` sur l’accueil;
- données structurées `Blog` sur l’index;
- données structurées `BlogPosting` sur chaque article;
- favicon pixel temporaire original.

Ne pas surcharger les pages de mots-clés. Employer naturellement les expressions du brief.

## 12. Accessibilité et responsive

Critères obligatoires :

- lien d’évitement « Aller au contenu »;
- structure de titres sans saut incohérent;
- libellé visible ou accessible pour chaque champ;
- erreurs associées par `aria-describedby`;
- état de soumission annoncé par région `aria-live`;
- FAQ construite avec boutons et `aria-expanded`;
- contraste WCAG AA malgré la palette rétro;
- aucun contenu accessible uniquement au survol;
- navigation complète au clavier;
- `prefers-reduced-motion` désactivant les animations non essentielles;
- absence de défilement horizontal à 320 px;
- grille Services : une colonne mobile, deux tablette, trois bureau;
- images recadrées avec `object-fit: cover` sans déformation.

## 13. Variables d’environnement

Documenter au minimum :

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
CONTACT_DATABASE_URL=sqlite:///./data/astrapio.db
CORS_ORIGINS=http://localhost:3000
TRUST_PROXY_HEADERS=false
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_SECONDS=3600
```

Aucune valeur secrète ne doit être commise.

## 14. Tests

### 14.1 Frontend

Tests unitaires et de composants :

- filtrage par texte avec et sans accents;
- combinaison de catégories;
- réinitialisation;
- état vide;
- ouverture et fermeture du dialogue;
- ouverture directe par paramètre `service`;
- restauration du focus;
- menu À propos au clavier;
- préremplissage du formulaire;
- validations client;
- gestion d’une réponse `201`, `422`, `429` et `500`.

Tests Playwright :

- navigation complète depuis l’accueil;
- galerie Services en vues Cartes et Liste;
- ouverture d’une fiche puis passage au formulaire;
- envoi réussi contre l’API locale;
- menu mobile;
- vérification à 320 px, 768 px et 1440 px;
- absence de lien vers les pages supprimées.

### 14.2 Backend

Tests Pytest :

- santé de l’API;
- soumission valide;
- chaque contrainte de validation;
- consentement absent;
- champ piège rempli;
- limitation après cinq demandes;
- absence de persistance pour une demande rejetée;
- persistance SQLite d’une demande valide;
- réponse générique lors d’une erreur interne.

## 15. Docker et démarrage

Le fichier `docker-compose.yml` doit :

- démarrer `frontend` sur le port `3000`;
- démarrer `backend` sur le port `8000`;
- attendre que le backend soit sain avant de considérer l’ensemble prêt;
- monter un volume pour `backend/data`;
- transmettre les variables d’environnement sans valeur secrète codée en dur.

Le README doit documenter :

- démarrage natif du frontend;
- démarrage natif du backend;
- démarrage avec Docker Compose;
- commandes de tests;
- commandes ESLint et TypeScript;
- emplacement des demandes SQLite;
- éléments à personnaliser;
- nécessité de faire réviser les conditions d’utilisation par un professionnel du Québec.

## 16. Ordre d’exécution

### Phase 1 — Fondation

1. créer l’arborescence frontend/backend;
2. configurer TypeScript strict, Tailwind, ESLint, Vitest et Pytest;
3. créer `.gitignore`, `.env.example`, `ASSUMPTIONS.md` et la structure du README;
4. mettre en place Dockerfiles et Docker Compose.

**Validation :** les deux applications démarrent avec une page et un endpoint de santé minimaux.

### Phase 2 — Design system

1. créer les jetons CSS;
2. implémenter les composants rétro;
3. créer l’en-tête, le menu À propos, la navigation mobile et le pied de page;
4. vérifier clavier, focus et responsive.

**Validation :** une page de démonstration expose tous les états sans problème de contraste ou de débordement.

### Phase 3 — Contenu et pages

1. centraliser navigation, services et articles;
2. créer Accueil, À propos, Méthodologie, Blogue, articles, Conditions et 404;
3. ajouter les métadonnées et données structurées;
4. relier tous les appels à l’action.

**Validation :** chaque route répond, chaque bouton mène à une destination valide et aucun contenu fictif interdit n’est présent.

### Phase 4 — Galerie Services

1. implémenter recherche, filtres et vues;
2. synchroniser l’état avec l’URL;
3. créer le dialogue accessible;
4. relier les fiches au formulaire Contact.

**Validation :** tous les paramètres peuvent être partagés, les paramètres invalides sont ignorés et le clavier permet le parcours complet.

### Phase 5 — Images

1. générer et valider l’image maîtresse;
2. générer les images Services;
3. générer les images des pages et du blogue;
4. convertir, optimiser, nommer et intégrer les actifs;
5. vérifier recadrage et textes alternatifs.

**Validation :** chaque carte possède une image différente, cohérente et nette; aucun actif du site de référence n’est utilisé.

### Phase 6 — Contact et API

1. créer les schémas Pydantic et le modèle SQLAlchemy;
2. créer le dépôt SQLite;
3. ajouter champ piège et limitation;
4. exposer les endpoints;
5. connecter le formulaire frontend;
6. gérer tous les états d’erreur.

**Validation :** une demande valide est persistée et toutes les demandes invalides sont rejetées correctement.

### Phase 7 — Tests et finition

1. compléter les tests unitaires, intégration et parcours;
2. exécuter lint, types et builds;
3. démarrer Docker Compose;
4. inspecter visuellement toutes les routes aux trois largeurs cibles;
5. corriger les erreurs de console, liens et problèmes d’accessibilité;
6. finaliser README, ASSUMPTIONS et l’état de ce plan.

## 17. Commandes de validation finales

Les commandes exactes seront adaptées aux scripts créés, mais la livraison doit au minimum exécuter :

```bash
cd frontend && npm run lint
cd frontend && npm run typecheck
cd frontend && npm test
cd frontend && npm run build
cd backend && pytest
docker compose build
docker compose up -d
docker compose ps
```

Après le démarrage Docker :

- vérifier `GET http://localhost:8000/health`;
- charger `http://localhost:3000`;
- effectuer une soumission réelle de test;
- confirmer la présence de la ligne dans SQLite;
- arrêter proprement les services.

## 18. Critères d’acceptation finaux

Le projet est terminé uniquement lorsque :

- toutes les routes prévues existent;
- les routes supprimées ne sont référencées nulle part;
- la navigation et le sous-menu À propos sont accessibles;
- la galerie contient onze services et fonctionne avec recherche, filtres, vues et URL partageables;
- chaque service ouvre une fiche complète;
- les seize actifs publiés minimum sont originaux et cohérents en pixel art;
- les trois articles sont complets et originaux;
- le formulaire communique réellement avec FastAPI;
- les demandes valides sont stockées dans SQLite;
- la validation, le champ piège et la limitation fonctionnent;
- les erreurs utilisateur sont compréhensibles et aucune donnée technique sensible n’est exposée;
- les métadonnées, le sitemap, robots.txt et les données structurées sont présents;
- aucun faux témoignage, client, chiffre ou partenariat n’est affiché;
- le site est utilisable à 320 px, 768 px et 1440 px;
- le clavier, les lecteurs d’écran et les animations réduites sont pris en compte;
- ESLint, TypeScript, tests frontend, Pytest et build Next.js passent;
- Docker Compose construit et démarre les deux services;
- le README et `.env.example` permettent à une autre personne de lancer le projet;
- les informations à compléter par le propriétaire sont clairement documentées.

## 19. Éléments à personnaliser avant publication

- nom et portrait du fondateur;
- coordonnées officielles de l’entreprise;
- adresse de contact finale;
- domaine de production;
- méthode d’acheminement des demandes au-delà de SQLite;
- contenu juridique révisé;
- dates définitives de publication des articles;
- éventuels outils analytiques, seulement après décision et mécanisme de consentement approprié.

## 20. État final de l’implémentation

Implémentation complétée le 5 août 2026 :

- 11 services, 3 articles et 17 illustrations pixel art originales livrés;
- navigation, recherche, filtres, vues, dialogues et préremplissage du contact validés sur desktop et mobile;
- 7 tests frontend, 5 tests backend et 4 parcours Playwright réussis;
- ESLint, TypeScript, build Next.js et audit npm réussis sans vulnérabilité connue;
- images Docker frontend et backend construites avec succès;
- Docker Compose démarré avec `GET /health` réussi et réponse frontend HTTP 200;
- audit visuel réalisé à 390 px et 1440 px, avec vérification des recadrages et de la lisibilité;
- aucune route Solutions, Notre approche ou Confidentialité n’est exposée.

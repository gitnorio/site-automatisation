# Architecture technique recommandée

À adapter au repo existant.

## Frontend suggéré
- Next.js;
- TypeScript;
- React;
- Tailwind CSS.

Trois zones dans le même projet Web :

- site promotionnel : `/`, `/clients`, `/tarifs` et `/contact`;
- application entreprise : `/app/consultations`, `/app/blueprints` et `/app/settings`;
- expérience prospect : `/c/[consultationId]`.

Chaque zone possède son propre shell visuel. Le site promotionnel conserve la navigation marketing. L’application entreprise utilise une navigation de travail dédiée. L’expérience prospect ne montre que la consultation, l’identité de l’agence et les interactions nécessaires.

Les routes `/app/*` et `/c/*` ne doivent pas être indexées. À terme, `/app/*` exige une session entreprise et `/c/*` résout un identifiant opaque ou un jeton signé côté backend.

## Backend

Le backend est un monolithe modulaire :

- `app/core` contient la configuration, la base de données, la sécurité et les erreurs transversales;
- `app/api/v1` assemble les routes publiques versionnées;
- `app/modules/contact` contient la route, le service, le dépôt, le modèle et les schémas contact;
- `app/modules/discovery` contient les contrats et le futur domaine de découverte;
- `app/integrations/llm` contient les adaptateurs externes remplaçables.

Les routes HTTP délèguent la logique métier aux services. Les services utilisent les dépôts et ne dépendent pas de FastAPI.

Responsabilités :
- créer la consultation;
- sauvegarder les réponses;
- maintenir l'état;
- appeler le LLM;
- valider la sortie;
- générer le brief final.
- synchroniser les données autorisées vers un CRM;
- déclencher et journaliser les automatisations simples.

## Base de données

PostgreSQL est la base unique du projet. Le développement local utilise le service `database` de Docker Compose et Pytest utilise une base isolée `koto_test`. Un hébergement PostgreSQL géré pourra remplacer le conteneur sans modifier les dépôts SQLAlchemy.

## Abstraction LLM

```ts
interface DiscoveryLLM {
  extractAnswer(input: ExtractionInput): Promise<ExtractionResult>
  decideNextStep(input: DecisionInput): Promise<DecisionResult>
  generateBrief(input: BriefInput): Promise<MarketingDiscoveryBrief>
}
```

Ne pas coupler l'application à un fournisseur précis.

## Abstraction CRM et automatisations

Définir une interface de connecteur remplaçable. Le moteur de consultation produit un événement structuré; un service séparé décide des champs autorisés et exécute la synchronisation, la notification ou le webhook. Une erreur d’intégration ne doit jamais invalider le brief final.

## Sorties structurées

Préférer JSON Schema + validation Zod + retry contrôlé. Ne jamais parser du texte libre fragile pour piloter la logique.

## Sécurité

- clé API seulement côté serveur;
- validation de toutes les entrées;
- rate limiting minimal;
- logs sans exposer inutilement des données sensibles;
- capacité future de suppression des données.

## Observabilité

Logger :
- consultation;
- tour;
- objectif ciblé;
- durée LLM;
- tokens/coût si disponible;
- erreurs de validation;
- raison d'arrêt.

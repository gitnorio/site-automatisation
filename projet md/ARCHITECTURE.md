# Architecture technique recommandée

À adapter au repo existant.

## Frontend suggéré
- Next.js;
- TypeScript;
- React;
- Tailwind CSS.

Deux espaces :
- prospect : consultation publique;
- entreprise : vue interne minimale.

## Backend

Responsabilités :
- créer la consultation;
- sauvegarder les réponses;
- maintenir l'état;
- appeler le LLM;
- valider la sortie;
- générer le brief final.

## Base de données

Suggestion : PostgreSQL / Supabase.

## Abstraction LLM

```ts
interface DiscoveryLLM {
  extractAnswer(input: ExtractionInput): Promise<ExtractionResult>
  decideNextStep(input: DecisionInput): Promise<DecisionResult>
  generateBrief(input: BriefInput): Promise<MarketingDiscoveryBrief>
}
```

Ne pas coupler l'application à un fournisseur précis.

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

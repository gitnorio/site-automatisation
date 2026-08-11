# Moteur adaptatif — spécification conceptuelle

## États d'un objectif

- `unknown`
- `partial`
- `confirmed`
- `derived_high_confidence` — futur, documents
- `derived_low_confidence` — futur, documents
- `contradiction`
- `incomplete`

Pour le MVP sans documents, utiliser surtout : `unknown`, `partial`, `confirmed`, `contradiction`, `incomplete`.

## Boucle principale

1. Le prospect répond.
2. Le backend sauvegarde la réponse brute.
3. Le moteur demande au LLM d'extraire les informations structurées.
4. Le backend met à jour les objectifs.
5. Le backend vérifie les règles d'arrêt.
6. Si la consultation continue, il sélectionne l'objectif suivant.
7. Le LLM formule la prochaine question et le type d'interaction.
8. Le backend valide la sortie.
9. L'interface affiche la question.
10. Répéter.

## Priorité de sélection

1. résoudre une contradiction obligatoire;
2. compléter un objectif obligatoire `partial`;
3. couvrir un objectif obligatoire `unknown`;
4. approfondir un sujet optionnel uniquement si pertinent;
5. terminer.

Le LLM peut proposer, mais le backend reste l'autorité.

## Types de réponse MVP

- `text`
- `single_choice`
- `multi_choice`
- `number`
- `budget_range`
- `date_or_timeline`

## Contrat de sortie du LLM

```json
{
  "action": "ask",
  "target_objective": "trigger_problem",
  "question": "Qu'est-ce qui vous a poussé à revoir votre marketing maintenant?",
  "response_type": "text",
  "choices": [],
  "extracted_updates": [],
  "reason_code": "required_objective_unknown"
}
```

Pour terminer :

```json
{
  "action": "complete",
  "target_objective": null,
  "question": null,
  "response_type": null,
  "choices": [],
  "extracted_updates": [],
  "reason_code": "all_required_objectives_complete"
}
```

## Validation backend obligatoire

Vérifier :
- l'objectif existe;
- le type de réponse est autorisé;
- aucun garde-fou n'est violé;
- le plafond de questions n'est pas dépassé;
- `complete` n'est accepté que si les règles d'arrêt sont satisfaites.

## Séparation extraction / décision

### Étape A — extraction
À partir de la réponse : quelles informations ont été données? Quels objectifs changent d'état? Y a-t-il contradiction?

### Étape B — décision
À partir de l'état mis à jour : faut-il terminer? Sinon quel objectif traiter? Quelle question poser?

Au MVP, le même modèle peut servir aux deux étapes, mais le code doit garder ces responsabilités distinctes.

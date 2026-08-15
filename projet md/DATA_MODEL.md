# Modèle de données MVP

## `organizations`
```ts
{
  id: string
  name: string
  minimum_qualifying_budget_cad: number
  created_at: datetime
}
```

`minimum_qualifying_budget_cad` vaut 2 500 par défaut. Une valeur de 0 désactive la disqualification automatique fondée sur le budget. Le montant est lu au moment de générer le rapport afin de préserver les rapports historiques.

## `blueprints`
```ts
{
  id: string
  organization_id: string
  name: string
  vertical: "marketing_agency"
  version: number
  config: BlueprintConfig
  created_at: datetime
  updated_at: datetime
}
```

## `consultations`
```ts
{
  id: string
  organization_id: string
  blueprint_id: string
  status: "not_started" | "in_progress" | "completed" | "abandoned"
  stop_reason: "all_required_objectives_complete" | "question_limit_reached" | "prospect_abandoned" | null
  question_count: number
  started_at: datetime | null
  completed_at: datetime | null
  created_at: datetime
}
```

## `consultation_objectives`
```ts
{
  id: string
  consultation_id: string
  objective_key: string
  required: boolean
  state: "unknown" | "partial" | "confirmed" | "contradiction" | "incomplete"
  value_json: object | null
  confidence: number | null
  source: "answer" | "system" | null
  updated_at: datetime
}
```

## `consultation_turns`
```ts
{
  id: string
  consultation_id: string
  turn_index: number
  target_objective: string | null
  question: string
  response_type: string
  choices_json: array | null
  raw_answer: string | object | null
  created_at: datetime
  answered_at: datetime | null
}
```

## `discovery_briefs`
```ts
{
  id: string
  consultation_id: string
  brief_json: MarketingDiscoveryBrief
  created_at: datetime
}
```

## `MarketingDiscoveryBrief`
```ts
{
  company: {
    sector?: string
    offer?: string
    size?: string
    target_customer?: string
  }
  primary_goal?: string
  trigger_problem?: string
  service_sought?: string
  current_marketing?: {
    channels?: string[]
    tools?: string[]
    internal_team?: string
  }
  previous_agency_experience?: string
  budget?: string
  timeline?: string
  decision?: {
    respondent_role?: string
    decision_maker?: boolean
    stakeholders?: string[]
  }
  qualification: {
    level: "priority" | "follow_up" | "unqualified"
    reasons: string[]
  }
  missing_information: string[]
  contradictions: string[]
  important_notes: string[]
  recommended_questions: Array<{
    topic: string
    question: string
    reason: string
    priority: "high" | "medium" | "low"
    source: "missing" | "partial" | "contradiction" | "deepening"
  }>
}
```

Le brief doit rester structuré. Les anciens briefs sans `recommended_questions` restent valides; l'API de l'espace agence reconstitue leurs questions à la lecture sans modifier les réponses historiques. Les nouveaux briefs contiennent au plus huit questions.

## `automation_deliveries`
```ts
{
  id: string
  consultation_id: string
  event_type: "consultation.ready"
  connector_name: string
  status: "pending" | "delivering" | "succeeded" | "failed" | "skipped"
  payload_json: ConsultationReadyEvent
  result_json: object | null
  attempt_count: number
  last_error: string | null
  created_at: datetime
  updated_at: datetime
  completed_at: datetime | null
}
```

La combinaison consultation, type d’événement et connecteur est unique. Elle empêche une seconde livraison lors d’une reprise HTTP ou d’un rafraîchissement.

## `automation_attempts`
```ts
{
  id: string
  delivery_id: string
  attempt_number: number
  status: "started" | "succeeded" | "failed"
  http_status: number | null
  external_id: string | null
  error_type: string | null
  error_message: string | null
  started_at: datetime
  completed_at: datetime | null
}
```

Chaque tentative est conservée séparément. Les erreurs sont nettoyées avant stockage et les réponses externes complètes ne sont jamais enregistrées.

## `ConsultationReadyEvent`
```ts
{
  schema_version: 2
  event_id: string
  event_type: "consultation.ready"
  occurred_at: datetime
  consultation_id: string
  organization_id: string
  organization_name: string
  consultation_status: string
  completed_at: datetime | null
  crm_fields: CRMAllowedFields
  actions: Array<{
    type: "crm.upsert" | "owner.assign" | "team.notify" | "webhook.deliver"
    target: string
  }>
}
```

`CRMAllowedFields` est une liste blanche explicite dérivée du brief. Elle exclut les réponses brutes, la confiance, les preuves internes et les secrets de configuration.

Dans le schéma `2`, `crm_fields` ajoute `report_version` et `recommended_questions`. Ces ajouts sont compatibles avec les consommateurs qui ignorent les champs inconnus; l'identifiant d'événement, la signature et la clé d'idempotence ne changent pas.

## `field_test_reviews`
```ts
{
  id: string
  consultation_id: string
  reviewer_role: "owner" | "strategist" | "account_manager" | "sales" | "other"
  observed_live: boolean
  prospect_understood_without_help: boolean | null
  felt_like_static_form: boolean | null
  obvious_repetition: boolean | null
  follow_ups_relevant: boolean | null
  guardrail_issue: boolean | null
  brief_usefulness: 1 | 2 | 3 | 4 | 5
  brief_preparedness: 1 | 2 | 3 | 4 | 5
  agency_would_use: boolean
  notes: string | null
  created_at: datetime
  updated_at: datetime
}
```

Une consultation possède au maximum une revue, modifiable lorsque l’équipe relit son observation. Le modèle ne contient ni nom, ni courriel, ni identité du prospect. Les agrégats terrain sont calculés à la lecture depuis les timestamps de consultation et ces critères structurés.

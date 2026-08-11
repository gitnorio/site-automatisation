# Modèle de données MVP

## `organizations`
```ts
{ id: string; name: string; created_at: datetime }
```

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
}
```

Le brief doit rester structuré. Un rendu humain peut ensuite être généré à partir du JSON.

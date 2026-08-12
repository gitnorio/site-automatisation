import "server-only";

export type ConsultationStatus = "not_started" | "in_progress" | "completed" | "abandoned";
export type QualificationLevel = "priority" | "follow_up" | "unqualified";
export type ObjectiveState = "unknown" | "partial" | "confirmed" | "contradiction" | "incomplete";
export type AutomationDeliveryStatus = "pending" | "delivering" | "succeeded" | "failed" | "skipped";
export type AutomationAttemptStatus = "started" | "succeeded" | "failed";
export type WorkspaceAnswer = string | number | string[] | null;

export type WorkspaceMetrics = {
  in_progress: number;
  completed: number;
  to_review: number;
};

export type WorkspaceConsultationSummary = {
  id: string;
  organization_name: string;
  status: ConsultationStatus;
  question_count: number;
  max_questions: number;
  created_at: string;
  completed_at: string | null;
  primary_goal: string | null;
  qualification: QualificationLevel | null;
  automation_status: AutomationDeliveryStatus | null;
};

export type WorkspaceConsultationList = {
  metrics: WorkspaceMetrics;
  consultations: WorkspaceConsultationSummary[];
};

export type WorkspaceBrief = {
  company: {
    sector: string | null;
    offer: string | null;
    size: string | null;
    target_customer: string | null;
  };
  primary_goal: string | null;
  trigger_problem: string | null;
  service_sought: string | null;
  current_marketing: {
    channels: string[];
    tools: string[];
    internal_team: string | null;
  } | null;
  previous_agency_experience: string | null;
  budget: string | null;
  timeline: string | null;
  decision: {
    respondent_role: string | null;
    decision_maker: boolean | null;
    stakeholders: string[];
  } | null;
  qualification: {
    level: QualificationLevel;
    reasons: string[];
  };
  missing_information: string[];
  contradictions: string[];
  important_notes: string[];
};

export type WorkspaceObjective = {
  key: string;
  required: boolean;
  state: ObjectiveState;
  answer: WorkspaceAnswer;
};

export type WorkspaceTurn = {
  id: string;
  number: number;
  target_objective: string | null;
  question: string;
  response_type: string;
  answer: WorkspaceAnswer;
  answered_at: string | null;
};

export type WorkspaceConsultationDetail = {
  id: string;
  organization_name: string;
  blueprint_name: string;
  status: ConsultationStatus;
  stop_reason: string | null;
  question_count: number;
  max_questions: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  brief: WorkspaceBrief | null;
  objectives: WorkspaceObjective[];
  turns: WorkspaceTurn[];
  automations: WorkspaceAutomationDelivery[];
  field_test_review: FieldTestReview | null;
};

export type FieldTestReviewerRole = "owner" | "strategist" | "account_manager" | "sales" | "other";

export type FieldTestReviewInput = {
  reviewer_role: FieldTestReviewerRole;
  observed_live: boolean;
  prospect_understood_without_help: boolean | null;
  felt_like_static_form: boolean | null;
  obvious_repetition: boolean | null;
  follow_ups_relevant: boolean | null;
  guardrail_issue: boolean | null;
  brief_usefulness: number;
  brief_preparedness: number;
  agency_would_use: boolean;
  notes: string | null;
};

export type FieldTestReview = FieldTestReviewInput & {
  id: string;
  consultation_id: string;
  created_at: string;
  updated_at: string;
};

export type FieldTestMetrics = {
  invitations: number;
  started: number;
  completed: number;
  abandoned: number;
  active: number;
  start_rate: number;
  completion_rate: number;
  abandonment_rate: number;
  median_duration_seconds: number | null;
  average_answered_questions: number;
  reviewed_briefs: number;
  observed_live: number;
  average_brief_usefulness: number | null;
  useful_brief_rate: number | null;
  agency_adoption_rate: number | null;
  understood_without_help_rate: number | null;
  conversational_experience_rate: number | null;
  no_repetition_rate: number | null;
  relevant_follow_ups_rate: number | null;
  guardrail_compliance_rate: number | null;
};

export type FieldTestConsultationSummary = {
  id: string;
  organization_name: string;
  status: ConsultationStatus;
  qualification: QualificationLevel | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  answered_questions: number;
  review: FieldTestReview | null;
};

export type FieldTestDashboard = {
  metrics: FieldTestMetrics;
  consultations: FieldTestConsultationSummary[];
};

export type WorkspaceAutomationAttempt = {
  number: number;
  status: AutomationAttemptStatus;
  http_status: number | null;
  error_type: string | null;
  started_at: string;
  completed_at: string | null;
};

export type WorkspaceAutomationDelivery = {
  id: string;
  connector_name: string;
  status: AutomationDeliveryStatus;
  attempt_count: number;
  actions: string[];
  last_error: string | null;
  completed_at: string | null;
  attempts: WorkspaceAutomationAttempt[];
};

export type WorkspaceIntegrationSettings = {
  provider: string;
  enabled: boolean;
  max_attempts: number;
  actions: string[];
};

export class WorkspaceApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const internalApiUrl = process.env.INTERNAL_API_URL
  ?? process.env.NEXT_PUBLIC_API_URL
  ?? "http://localhost:8000";

export function getWorkspaceConsultations(): Promise<WorkspaceConsultationList> {
  return workspaceRequest("/api/v1/workspace/consultations");
}

export function getWorkspaceConsultation(consultationId: string): Promise<WorkspaceConsultationDetail> {
  return workspaceRequest(`/api/v1/workspace/consultations/${encodeURIComponent(consultationId)}`);
}

export function getWorkspaceIntegrationSettings(): Promise<WorkspaceIntegrationSettings> {
  return workspaceRequest("/api/v1/workspace/integrations");
}

export function getWorkspaceFieldTests(): Promise<FieldTestDashboard> {
  return workspaceRequest("/api/v1/workspace/field-tests");
}

export function saveWorkspaceFieldTestReview(
  consultationId: string,
  review: FieldTestReviewInput,
): Promise<FieldTestReview> {
  return workspaceRequest(
    `/api/v1/workspace/consultations/${encodeURIComponent(consultationId)}/field-test-review`,
    { method: "PUT", body: JSON.stringify(review) },
  );
}

async function workspaceRequest<ResponseData>(
  path: string,
  options: { method?: "GET" | "PUT"; body?: string } = {},
): Promise<ResponseData> {
  const workspaceKey = process.env.WORKSPACE_API_KEY
    ?? (process.env.NODE_ENV === "development" ? "development-workspace-key-change-me" : undefined);
  if (!workspaceKey) {
    throw new WorkspaceApiError("La clé serveur de l’espace agence n’est pas configurée.", 500);
  }
  const response = await fetch(`${internalApiUrl}${path}`, {
    cache: "no-store",
    method: options.method ?? "GET",
    body: options.body,
    headers: {
      "X-Workspace-Key": workspaceKey,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const payload = await response.json().catch(() => ({})) as { detail?: string };
  if (!response.ok) {
    throw new WorkspaceApiError(
      typeof payload.detail === "string" ? payload.detail : "Impossible de charger l’espace agence.",
      response.status,
    );
  }
  return payload as ResponseData;
}

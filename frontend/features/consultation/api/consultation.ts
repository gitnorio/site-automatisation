export type ConsultationStatus = "not_started" | "in_progress" | "completed" | "abandoned";
export type ResponseType = "text" | "single_choice" | "multi_choice" | "number" | "budget_range" | "date_or_timeline";
export type AnswerValue = string | number | string[];

export type ConsultationChoice = {
  value: string;
  label: string;
};

export type ConsultationQuestion = {
  turn_id: string;
  number: number;
  maximum: number;
  prompt: string;
  response_type: ResponseType;
  choices: ConsultationChoice[];
};

export type PublicConsultation = {
  consultation_id: string;
  organization_name: string;
  status: ConsultationStatus;
  estimated_minutes: number;
  question: ConsultationQuestion | null;
  message: string | null;
};

type ApiErrorPayload = { detail?: string };

export class ConsultationApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function getConsultation(consultationId: string, token: string): Promise<PublicConsultation> {
  return request(consultationId, token, "");
}

export function startConsultation(consultationId: string, token: string): Promise<PublicConsultation> {
  return request(consultationId, token, "/start", { method: "POST" });
}

export function answerConsultation(
  consultationId: string,
  token: string,
  turnId: string,
  answer: AnswerValue,
): Promise<PublicConsultation> {
  return request(consultationId, token, "/answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turn_id: turnId, answer }),
  });
}

export function abandonConsultation(consultationId: string, token: string): Promise<PublicConsultation> {
  return request(consultationId, token, "/abandon", { method: "POST" });
}

async function request(
  consultationId: string,
  token: string,
  suffix: string,
  init?: RequestInit,
): Promise<PublicConsultation> {
  const query = new URLSearchParams({ token });
  const response = await fetch(
    `${apiUrl}/api/v1/consultations/${encodeURIComponent(consultationId)}${suffix}?${query}`,
    init,
  );
  const payload = await response.json().catch(() => ({})) as ApiErrorPayload;
  if (!response.ok) {
    const fallback = response.status === 401
      ? "Ce lien de consultation est invalide ou a expiré."
      : "La consultation ne peut pas poursuivre pour le moment. Réessayez dans un instant.";
    throw new ConsultationApiError(
      typeof payload.detail === "string" ? payload.detail : fallback,
      response.status,
    );
  }
  return payload as PublicConsultation;
}

export type ContactPayload = {
  name: string;
  company: string;
  email: string;
  phone: string | null;
  companySize: string;
  needType: string;
  tools: string | null;
  description: string;
  contactPreference: string;
  consent: boolean;
  website: string;
};

export type ContactResponse = { success: boolean; message: string };
export type ValidationIssue = { loc?: Array<string | number>; msg: string };

export class ContactApiError extends Error {
  constructor(message: string, readonly status: number, readonly issues: ReadonlyArray<ValidationIssue> = []) {
    super(message);
  }
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function stringValue(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === "string" ? value : "";
}

export function serializeContactForm(form: FormData): ContactPayload {
  const phone = stringValue(form, "phone");
  const tools = stringValue(form, "tools");

  return {
    name: stringValue(form, "name"),
    company: stringValue(form, "company"),
    email: stringValue(form, "email"),
    phone: phone || null,
    companySize: stringValue(form, "companySize"),
    needType: stringValue(form, "needType"),
    tools: tools || null,
    description: stringValue(form, "description"),
    contactPreference: stringValue(form, "contactPreference"),
    consent: form.get("consent") === "on",
    website: stringValue(form, "website"),
  };
}

export async function sendContactRequest(payload: ContactPayload): Promise<ContactResponse> {
  const response = await fetch(`${apiUrl}/api/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const issues = response.status === 422 && Array.isArray(data.detail) ? data.detail as ValidationIssue[] : [];
    const message = response.status === 429
      ? "Trop de demandes ont été envoyées. Veuillez réessayer plus tard."
      : "La demande n’a pas pu être envoyée. Vérifiez les champs ou réessayez plus tard.";
    throw new ContactApiError(message, response.status, issues);
  }
  return data as ContactResponse;
}

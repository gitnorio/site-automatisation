"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { isWorkspaceAuthorized } from "@/proxy";
import {
  saveWorkspaceFieldTestReview,
  WorkspaceApiError,
} from "@/features/workspace/api/workspace";
import type {
  FieldTestReviewInput,
  FieldTestReviewerRole,
} from "@/features/workspace/api/workspace";


type ReviewActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const reviewerRoles = new Set<FieldTestReviewerRole>([
  "owner",
  "strategist",
  "account_manager",
  "sales",
  "other",
]);

export async function saveFieldTestReview(
  consultationId: string,
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  if (!(await workspaceAuthorized())) {
    return { status: "error", message: "Votre session workspace n’est plus autorisée." };
  }
  try {
    const review = parseReview(formData);
    await saveWorkspaceFieldTestReview(consultationId, review);
    revalidatePath(`/app/consultations/${consultationId}`);
    revalidatePath("/app/field-tests");
    return { status: "success", message: "Évaluation terrain enregistrée." };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof WorkspaceApiError || error instanceof Error
        ? error.message
        : "L’évaluation ne peut pas être enregistrée.",
    };
  }
}

async function workspaceAuthorized(): Promise<boolean> {
  const requestHeaders = await headers();
  const development = process.env.NODE_ENV === "development";
  const username = process.env.WORKSPACE_BASIC_USERNAME ?? (development ? "koto" : undefined);
  const password = process.env.WORKSPACE_BASIC_PASSWORD
    ?? (development ? "development-workspace-password-change-me" : undefined);
  return Boolean(
    username
    && password
    && isWorkspaceAuthorized(requestHeaders.get("authorization"), username, password),
  );
}

function parseReview(formData: FormData): FieldTestReviewInput {
  const reviewerRole = requiredString(formData, "reviewer_role") as FieldTestReviewerRole;
  if (!reviewerRoles.has(reviewerRole)) throw new Error("Choisissez un rôle valide.");
  return {
    reviewer_role: reviewerRole,
    observed_live: requiredBoolean(formData, "observed_live"),
    prospect_understood_without_help: optionalBoolean(formData, "prospect_understood_without_help"),
    felt_like_static_form: optionalBoolean(formData, "felt_like_static_form"),
    obvious_repetition: optionalBoolean(formData, "obvious_repetition"),
    follow_ups_relevant: optionalBoolean(formData, "follow_ups_relevant"),
    guardrail_issue: optionalBoolean(formData, "guardrail_issue"),
    brief_usefulness: rating(formData, "brief_usefulness"),
    brief_preparedness: rating(formData, "brief_preparedness"),
    agency_would_use: requiredBoolean(formData, "agency_would_use"),
    notes: optionalString(formData, "notes", 2_000),
  };
}

function requiredString(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || !value.trim()) throw new Error("Tous les champs requis doivent être remplis.");
  return value.trim();
}

function optionalString(formData: FormData, name: string, maximum: number): string | null {
  const value = formData.get(name);
  if (typeof value !== "string" || !value.trim()) return null;
  const cleaned = value.trim();
  if (cleaned.length > maximum) throw new Error(`La note ne peut pas dépasser ${maximum} caractères.`);
  return cleaned;
}

function requiredBoolean(formData: FormData, name: string): boolean {
  const value = optionalBoolean(formData, name);
  if (value === null) throw new Error("Tous les choix requis doivent être remplis.");
  return value;
}

function optionalBoolean(formData: FormData, name: string): boolean | null {
  const value = formData.get(name);
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "unknown" || value === null) return null;
  throw new Error("Une réponse d’observation est invalide.");
}

function rating(formData: FormData, name: string): number {
  const value = Number(requiredString(formData, name));
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Les notes doivent être comprises entre 1 et 5.");
  }
  return value;
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  saveWorkspaceQualificationSettings,
  WorkspaceApiError,
} from "@/features/workspace/api/workspace";
import { isWorkspaceAuthorized } from "@/proxy";


export type QualificationSettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function saveQualificationSettings(
  organizationId: string,
  _previousState: QualificationSettingsActionState,
  formData: FormData,
): Promise<QualificationSettingsActionState> {
  if (!(await workspaceAuthorized())) {
    return { status: "error", message: "Votre session workspace n’est plus autorisée." };
  }
  try {
    const minimumBudget = parseMinimumBudget(formData);
    await saveWorkspaceQualificationSettings(organizationId, minimumBudget);
    revalidatePath("/app/settings");
    return {
      status: "success",
      message: minimumBudget === 0
        ? "Filtre budgétaire désactivé pour les prochains rapports."
        : `Seuil enregistré à ${formatCad(minimumBudget)} pour les prochains rapports.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof WorkspaceApiError || error instanceof Error
        ? error.message
        : "Le seuil ne peut pas être enregistré.",
    };
  }
}

function parseMinimumBudget(formData: FormData): number {
  const value = formData.get("minimum_qualifying_budget_cad");
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Entrez un seuil budgétaire.");
  }
  const amount = Number(value);
  if (!Number.isInteger(amount) || amount < 0 || amount > 10_000_000) {
    throw new Error("Le seuil doit être un montant entier entre 0 $ et 10 000 000 $ CA.");
  }
  return amount;
}

function formatCad(amount: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
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

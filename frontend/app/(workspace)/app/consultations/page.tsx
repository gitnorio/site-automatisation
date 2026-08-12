import type { Metadata } from "next";

import { getWorkspaceConsultations } from "@/features/workspace/api/workspace";
import type { WorkspaceConsultationList } from "@/features/workspace/api/workspace";
import { WorkspaceConsultations, WorkspaceLoadError } from "@/features/workspace/components/WorkspaceConsultations";


export const metadata: Metadata = { title: "Consultations — Espace entreprise", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const result = await loadConsultations();
  if (!result.ok) return <WorkspaceLoadError message={result.error} />;
  return <WorkspaceConsultations data={result.data} />;
}

async function loadConsultations(): Promise<
  { ok: true; data: WorkspaceConsultationList } | { ok: false; error: string }
> {
  try {
    const data = await getWorkspaceConsultations();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Une erreur inattendue est survenue." };
  }
}

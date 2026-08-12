import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getWorkspaceConsultation, WorkspaceApiError } from "@/features/workspace/api/workspace";
import type { WorkspaceConsultationDetail } from "@/features/workspace/api/workspace";
import { WorkspaceConsultationDetailView } from "@/features/workspace/components/WorkspaceConsultationDetail";
import { WorkspaceLoadError } from "@/features/workspace/components/WorkspaceConsultations";


export const metadata: Metadata = { title: "Dossier de consultation — Espace entreprise", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ consultationId: string }>;
}) {
  const { consultationId } = await params;
  const result = await loadConsultation(consultationId);
  if (!result.ok && result.status === 404) notFound();
  if (!result.ok) return <WorkspaceLoadError message={result.error} />;
  return <WorkspaceConsultationDetailView data={result.data} />;
}

async function loadConsultation(consultationId: string): Promise<
  { ok: true; data: WorkspaceConsultationDetail }
  | { ok: false; error: string; status: number }
> {
  try {
    const data = await getWorkspaceConsultation(consultationId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
      status: error instanceof WorkspaceApiError ? error.status : 500,
    };
  }
}

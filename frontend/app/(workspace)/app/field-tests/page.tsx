import type { Metadata } from "next";

import { getWorkspaceFieldTests } from "@/features/workspace/api/workspace";
import type { FieldTestDashboard as FieldTestDashboardData } from "@/features/workspace/api/workspace";
import { FieldTestDashboard } from "@/features/workspace/components/FieldTestDashboard";
import { WorkspaceLoadError } from "@/features/workspace/components/WorkspaceConsultations";


export const metadata: Metadata = { title: "Tests terrain — Espace entreprise", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function FieldTestsPage() {
  const result = await loadFieldTests();
  if (!result.ok) return <WorkspaceLoadError message={result.error} />;
  return <FieldTestDashboard data={result.data} />;
}

async function loadFieldTests(): Promise<
  { ok: true; data: FieldTestDashboardData } | { ok: false; error: string }
> {
  try {
    return { ok: true, data: await getWorkspaceFieldTests() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Une erreur inattendue est survenue." };
  }
}

import type { Metadata } from "next";

import { ProspectConsultation } from "@/features/consultation/components/ProspectConsultation";

export const metadata: Metadata = { title: "Consultation", robots: { index: false, follow: false } };

export default async function ProspectConsultationPage({
  params,
  searchParams,
}: {
  params: Promise<{ consultationId: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { consultationId } = await params;
  const { token } = await searchParams;

  return <ProspectConsultation consultationId={consultationId} token={typeof token === "string" ? token : undefined} />;
}

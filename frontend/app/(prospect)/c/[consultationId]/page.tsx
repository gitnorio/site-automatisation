import type { Metadata } from "next";

import { ProspectConsultation } from "@/features/consultation/components/ProspectConsultation";

export const metadata: Metadata = { title: "Consultation", robots: { index: false, follow: false } };

export default async function ProspectConsultationPage({ params }: { params: Promise<{ consultationId: string }> }) {
  const { consultationId } = await params;

  return <ProspectConsultation consultationId={consultationId} />;
}

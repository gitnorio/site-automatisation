import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/(workspace)/app/field-tests/actions", () => ({
  saveFieldTestReview: vi.fn(),
}));

import type {
  FieldTestDashboard as FieldTestDashboardData,
  WorkspaceConsultationDetail,
  WorkspaceConsultationList,
} from "@/features/workspace/api/workspace";
import { FieldTestDashboard } from "@/features/workspace/components/FieldTestDashboard";
import { WorkspaceConsultationDetailView } from "@/features/workspace/components/WorkspaceConsultationDetail";
import { WorkspaceConsultations } from "@/features/workspace/components/WorkspaceConsultations";


const createdAt = "2026-08-11T16:00:00Z";

const listData: WorkspaceConsultationList = {
  metrics: { in_progress: 0, completed: 1, to_review: 1 },
  consultations: [{
    id: "abcdef12-3456-7890-abcd-ef1234567890",
    organization_name: "Agence Boréale",
    status: "completed",
    question_count: 10,
    max_questions: 14,
    created_at: createdAt,
    completed_at: createdAt,
    primary_goal: "Doubler les demandes qualifiées",
    qualification: "priority",
    automation_status: "succeeded",
  }],
};

const detailData: WorkspaceConsultationDetail = {
  id: listData.consultations[0].id,
  organization_name: "Agence Boréale",
  blueprint_name: "Marketing Discovery Blueprint",
  status: "completed",
  stop_reason: "all_required_objectives_complete",
  question_count: 10,
  max_questions: 14,
  created_at: createdAt,
  started_at: createdAt,
  completed_at: createdAt,
  brief: {
    company: { sector: "Services professionnels", offer: null, size: null, target_customer: "PME québécoises" },
    primary_goal: "Doubler les demandes qualifiées",
    trigger_problem: "Le coût d’acquisition augmente",
    service_sought: "Stratégie",
    current_marketing: { channels: ["SEO", "Email"], tools: [], internal_team: null },
    previous_agency_experience: null,
    budget: "3 000 $ à 5 000 $",
    timeline: "Dans six semaines",
    decision: { respondent_role: "Décideur final", decision_maker: true, stakeholders: [] },
    qualification: { level: "priority", reasons: ["Tous les objectifs obligatoires sont confirmés."] },
    missing_information: ["tools_platforms"],
    contradictions: [],
    important_notes: [],
    recommended_questions: [{
      topic: "tools_platforms",
      question: "Quels outils et plateformes devront être pris en compte dans le futur mandat?",
      reason: "Cette information n’a pas été recueillie pendant la première consultation.",
      priority: "medium",
      source: "missing",
    }],
  },
  objectives: [
    { key: "primary_goal", required: true, state: "confirmed", answer: "Doubler les demandes qualifiées" },
    { key: "tools_platforms", required: false, state: "incomplete", answer: null },
  ],
  turns: [{
    id: "turn-1",
    number: 1,
    target_objective: "primary_goal",
    question: "Quel résultat concret espérez-vous atteindre?",
    response_type: "text",
    answer: "Doubler les demandes qualifiées",
    answered_at: createdAt,
  }],
  automations: [{
    id: "delivery-1",
    connector_name: "webhook",
    status: "succeeded",
    attempt_count: 2,
    actions: ["crm.upsert", "owner.assign", "team.notify", "webhook.deliver"],
    last_error: null,
    completed_at: createdAt,
    attempts: [
      { number: 1, status: "failed", http_status: 503, error_type: "WebhookDeliveryError", started_at: createdAt, completed_at: createdAt },
      { number: 2, status: "succeeded", http_status: 202, error_type: null, started_at: createdAt, completed_at: createdAt },
    ],
  }],
  field_test_review: null,
};

const fieldTestData: FieldTestDashboardData = {
  metrics: {
    invitations: 4,
    started: 3,
    completed: 2,
    abandoned: 1,
    active: 0,
    start_rate: 75,
    completion_rate: 66.7,
    abandonment_rate: 33.3,
    median_duration_seconds: 420,
    average_answered_questions: 8.5,
    reviewed_briefs: 2,
    observed_live: 1,
    average_brief_usefulness: 4.5,
    useful_brief_rate: 100,
    agency_adoption_rate: 100,
    understood_without_help_rate: 100,
    conversational_experience_rate: 100,
    no_repetition_rate: 100,
    relevant_follow_ups_rate: 100,
    guardrail_compliance_rate: 100,
  },
  consultations: [{
    id: detailData.id,
    organization_name: "Agence Boréale",
    status: "completed",
    qualification: "priority",
    created_at: createdAt,
    started_at: createdAt,
    completed_at: createdAt,
    duration_seconds: 420,
    answered_questions: 10,
    review: null,
  }],
};

describe("workspace consultations", () => {
  it("shows the operational list and qualification", () => {
    render(<WorkspaceConsultations data={listData} />);

    expect(screen.getByText("Doubler les demandes qualifiées")).toBeVisible();
    expect(screen.getByText("Prioritaire")).toBeVisible();
    expect(screen.getByText("Activation réussie")).toBeVisible();
    expect(screen.getByRole("link", { name: /Doubler les demandes qualifiées/i })).toHaveAttribute(
      "href",
      `/app/consultations/${listData.consultations[0].id}`,
    );
  });

  it("shows the brief, missing objectives and raw answers", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<WorkspaceConsultationDetailView data={detailData} />);

    expect(screen.getAllByRole("heading", { name: "Services professionnels" })[0]).toBeVisible();
    expect(screen.getAllByText("Outils et plateformes").length).toBeGreaterThan(1);
    expect(screen.getByText("Quel résultat concret espérez-vous atteindre?")).toBeVisible();
    expect(screen.getAllByText("Doubler les demandes qualifiées").length).toBeGreaterThan(1);
    expect(screen.queryByText(/confidence|source/i)).not.toBeInTheDocument();
    expect(screen.getByText("Créer ou mettre à jour le dossier CRM")).toBeVisible();
    expect(screen.getByText(/Tentative 2/)).toBeVisible();
    expect(screen.getAllByRole("heading", { name: "Questions recommandées" })[0]).toBeVisible();
    expect(screen.getAllByText(detailData.brief?.recommended_questions[0].question ?? "")[0]).toBeVisible();
    expect(screen.getByTestId("brief-print-sheet")).toBeInTheDocument();
    expect(screen.getByText("Document de travail confidentiel · usage interne à l’agence")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Exporter le PDF — 1 page" }));
    expect(printSpy).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: /Ce brief prépare-t-il vraiment la rencontre/i })).toBeVisible();
    printSpy.mockRestore();
  });

  it("shows the field-test funnel and evidence criteria", () => {
    render(<FieldTestDashboard data={fieldTestData} />);

    expect(screen.getByRole("heading", { name: "Carnet de preuves" })).toBeVisible();
    expect(screen.getByText("75 %")).toBeVisible();
    expect(screen.getByText("7 min 00")).toBeVisible();
    expect(screen.getByText("Compréhension sans aide")).toBeVisible();
    expect(screen.getByText("À évaluer")).toBeVisible();
  });
});

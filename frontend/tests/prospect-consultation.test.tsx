import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProspectConsultation } from "@/features/consultation/components/ProspectConsultation";


const consultationId = "consultation-1";
const token = "signed-consultation-token-for-tests";

const welcome = {
  consultation_id: consultationId,
  organization_name: "Agence Boréale",
  status: "not_started",
  estimated_minutes: 7,
  question: null,
  message: null,
};

const textQuestion = {
  ...welcome,
  status: "in_progress",
  question: {
    turn_id: "turn-1",
    number: 1,
    maximum: 14,
    prompt: "Pouvez-vous présenter brièvement votre entreprise?",
    response_type: "text",
    choices: [],
  },
};

describe("ProspectConsultation", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("starts the welcome experience and saves an answer", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(apiResponse(welcome))
      .mockResolvedValueOnce(apiResponse(textQuestion))
      .mockResolvedValueOnce(apiResponse({
        ...textQuestion,
        question: { ...textQuestion.question, turn_id: "turn-2", number: 2, prompt: "Qui est votre clientèle cible?" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    render(<ProspectConsultation consultationId={consultationId} token={token} />);

    expect(await screen.findByRole("heading", { name: "Parlons de votre projet." })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /commencer/i }));
    expect(await screen.findByRole("heading", { name: /présenter brièvement/i })).toBeVisible();
    await user.type(screen.getByLabelText("Votre réponse"), "Nous sommes une agence de 25 personnes.");
    await user.click(screen.getByRole("button", { name: /continuer/i }));

    expect(await screen.findByRole("heading", { name: /clientèle cible/i })).toBeVisible();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining(`/api/v1/consultations/${consultationId}/answers?`),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ turn_id: "turn-1", answer: "Nous sommes une agence de 25 personnes." }),
      }),
    );
  });

  it("supports multiple selections", async () => {
    const user = userEvent.setup();
    const multiChoiceQuestion = {
      ...textQuestion,
      question: {
        ...textQuestion.question,
        response_type: "multi_choice",
        prompt: "Quels canaux utilisez-vous?",
        choices: [
          { value: "seo", label: "SEO" },
          { value: "email", label: "Email" },
        ],
      },
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(apiResponse(multiChoiceQuestion))
      .mockResolvedValueOnce(apiResponse({ ...multiChoiceQuestion, question: { ...multiChoiceQuestion.question, turn_id: "turn-2", number: 2 } }));
    vi.stubGlobal("fetch", fetchMock);

    render(<ProspectConsultation consultationId={consultationId} token={token} />);

    await user.click(await screen.findByRole("checkbox", { name: "SEO" }));
    await user.click(screen.getByRole("checkbox", { name: "Email" }));
    await user.click(screen.getByRole("button", { name: /continuer/i }));

    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/answers?"),
      expect.objectContaining({ body: JSON.stringify({ turn_id: "turn-1", answer: ["seo", "email"] }) }),
    );
  });

  it("explains when the secure token is missing", async () => {
    render(<ProspectConsultation consultationId={consultationId} />);

    expect(await screen.findByText(/lien de consultation est incomplet/i)).toBeVisible();
    expect(screen.getByRole("heading", { name: /ne pouvons pas ouvrir/i })).toBeVisible();
  });
});

function apiResponse(payload: object): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response;
}

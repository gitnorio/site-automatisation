import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/features/contact/components/ContactForm";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
}));

describe("ContactForm", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("shows accessible validation errors", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: /envoyer la demande/i }));
    expect(screen.getByText("Indiquez votre nom.")).toBeVisible();
    expect(screen.getByText("Le consentement est requis pour envoyer la demande.")).toBeVisible();
  });

  it("announces a successful submission", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, message: "Votre demande a bien été reçue." }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/nom \*/i), "Marie Tremblay");
    await user.type(screen.getByLabelText(/entreprise \*/i), "Atelier du Nord");
    await user.type(screen.getByLabelText(/adresse courriel/i), "marie@example.com");
    await user.type(screen.getByLabelText(/processus ou problème/i), "Nous souhaitons automatiser le classement de nos demandes clients.");
    await user.click(screen.getByLabelText(/j’accepte/i));
    await user.click(screen.getByRole("button", { name: /envoyer la demande/i }));
    expect(await screen.findByText("Votre demande a bien été reçue.")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/contact",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

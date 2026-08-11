"use client";

import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type FieldErrors = Record<string, string>;
type Status = { type: "idle" | "success" | "error"; message: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function validate(form: FormData) {
    const nextErrors: FieldErrors = {};
    if (String(form.get("name") ?? "").trim().length < 2) nextErrors.name = "Indiquez votre nom.";
    if (String(form.get("company") ?? "").trim().length < 2) nextErrors.company = "Indiquez le nom de l’entreprise.";
    if (!/^\S+@\S+\.\S+$/.test(String(form.get("email") ?? ""))) nextErrors.email = "Indiquez une adresse courriel valide.";
    if (String(form.get("description") ?? "").trim().length < 20) nextErrors.description = "Décrivez le besoin en au moins 20 caractères.";
    if (form.get("consent") !== "on") nextErrors.consent = "Le consentement est requis pour envoyer la demande.";
    return nextErrors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus({ type: "idle", message: "" });
    const element = event.currentTarget;
    const form = new FormData(element);
    const nextErrors = validate(form); setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setStatus({ type: "error", message: "Corrigez les champs indiqués avant d’envoyer la demande." }); return; }
    const payload = { name: form.get("name"), company: form.get("company"), email: form.get("email"), phone: form.get("phone") || null, companySize: form.get("companySize"), needType: form.get("needType"), tools: form.get("tools") || null, description: form.get("description"), contactPreference: form.get("contactPreference"), consent: form.get("consent") === "on", website: form.get("website") };
    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 422 && Array.isArray(data.detail)) {
          const serverErrors: FieldErrors = {};
          for (const issue of data.detail) serverErrors[String(issue.loc?.at(-1) ?? "form")] = issue.msg;
          setErrors(serverErrors);
        }
        throw new Error(response.status === 429 ? "Trop de demandes ont été envoyées. Veuillez réessayer plus tard." : "La demande n’a pas pu être envoyée. Vérifiez les champs ou réessayez plus tard.");
      }
      element.reset(); setErrors({}); setStatus({ type: "success", message: data.message ?? "Votre demande a bien été reçue." });
    } catch (error) { setStatus({ type: "error", message: error instanceof Error ? error.message : "Une erreur est survenue." }); }
    finally { setSubmitting(false); }
  }

  return <form className="contact-form" onSubmit={submit} noValidate>
    <div className="form-grid">
      <label>Nom <span aria-hidden="true">*</span><input name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />{errors.name ? <span className="field-error" id="name-error">{errors.name}</span> : null}</label>
      <label>Entreprise <span aria-hidden="true">*</span><input name="company" autoComplete="organization" aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? "company-error" : undefined} />{errors.company ? <span className="field-error" id="company-error">{errors.company}</span> : null}</label>
      <label>Adresse courriel <span aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />{errors.email ? <span className="field-error" id="email-error">{errors.email}</span> : null}</label>
      <label>Téléphone <span className="optional">(facultatif)</span><input name="phone" type="tel" autoComplete="tel" /></label>
      <label>Taille de l’entreprise<select name="companySize" defaultValue="non-precise"><option value="1-10">1 à 10 personnes</option><option value="11-50">11 à 50 personnes</option><option value="51-200">51 à 200 personnes</option><option value="201-plus">201 personnes et plus</option><option value="non-precise">Je préfère ne pas préciser</option></select></label>
      <label>Type de besoin<select name="needType" defaultValue="consultation"><option value="consultation">Projet pilote Koto</option><option value="integration">Intégration CRM</option><option value="automatisation">Automatisation après consultation</option><option value="sur-mesure">Parcours personnalisé</option><option value="autre">Autre</option></select></label>
    </div>
    <label>Outils utilisés <span className="optional">(facultatif)</span><input name="tools" placeholder="Ex. Microsoft 365, CRM, logiciel comptable" maxLength={500} /></label>
    <label>Processus ou problème à améliorer <span aria-hidden="true">*</span><textarea name="description" rows={7} maxLength={5000} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error" : "description-help"} /><span className="form-help" id="description-help">Décrivez les étapes actuelles, les outils concernés et ce qui ralentit votre équipe.</span>{errors.description ? <span className="field-error" id="description-error">{errors.description}</span> : null}</label>
    <fieldset><legend>Préférence de contact</legend><label className="checkbox-label"><input type="radio" name="contactPreference" value="courriel" defaultChecked /> Courriel</label><label className="checkbox-label"><input type="radio" name="contactPreference" value="telephone" /> Téléphone</label><label className="checkbox-label"><input type="radio" name="contactPreference" value="aucune-preference" /> Aucune préférence</label></fieldset>
    <div className="form-warning"><AlertTriangle aria-hidden="true" /><strong>Ne transmettez aucune information confidentielle, donnée personnelle sensible ou clé d’accès dans ce formulaire.</strong></div>
    <label className="checkbox-label consent"><input type="checkbox" name="consent" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "consent-error" : undefined} /> J’accepte que Koto utilise les renseignements fournis afin de communiquer avec moi au sujet de cette demande.</label>{errors.consent ? <span className="field-error" id="consent-error">{errors.consent}</span> : null}
    <label className="honeypot" aria-hidden="true">Site web<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button className="koto-button koto-button--dark submit-button" type="submit" disabled={submitting}><Send aria-hidden="true" /> {submitting ? "Envoi en cours…" : "Envoyer la demande"}</button>
    <div className={`form-status form-status--${status.type}`} aria-live="polite">{status.type === "success" ? <CheckCircle2 aria-hidden="true" /> : status.type === "error" ? <AlertTriangle aria-hidden="true" /> : null}{status.message}</div>
  </form>;
}

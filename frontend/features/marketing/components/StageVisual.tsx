import { Check, CircleCheck, Mail, MessageSquareText, Network, Sparkles, Workflow } from "lucide-react";
import Image from "next/image";

import type { StageVisualType } from "@/features/marketing/content/home";

export function StageVisual({ type }: { type: StageVisualType }) {
  if (type === "invitation") return <div className="koto-stage-visual koto-invite-visual"><div className="koto-mail-window"><div className="koto-mail-window__top"><Mail aria-hidden="true" /><span>Nouveau message</span></div><div className="koto-mail-window__field"><small>À</small><span>marie@acme.ca</span></div><div className="koto-mail-window__field"><small>Objet</small><span>Préparons notre échange</span></div><div className="koto-mail-window__body"><Image src="/images/brand/koto-mark.png" alt="" width={34} height={34} /><strong>Votre consultation est prête.</strong><p>Répondez à quelques questions avant notre rencontre.</p><b>Commencer la consultation</b></div></div></div>;

  if (type === "consultation") return <div className="koto-stage-visual koto-stage-visual--screenshot"><Image src="/images/product/consultation-marque-blanche-wall-logo-v6.webp" alt="Consultation en marque blanche présentant une question et des choix de réponse" fill sizes="383px" /></div>;

  if (type === "brief") return <div className="koto-stage-visual koto-brief-visual"><div className="koto-brief-card"><div className="koto-brief-card__head"><span>Brief / Acme Inc.</span><b>Prêt pour l’appel</b></div><div className="koto-brief-card__score"><strong>9/11</strong><span>objectifs confirmés</span></div>{["Problème déclencheur", "Clientèle cible", "Budget indicatif", "Processus de décision"].map((item, index) => <div className="koto-brief-card__row" key={item}><CircleCheck aria-hidden="true" /><span>{item}</span><small>{index === 2 ? "À clarifier" : "Confirmé"}</small></div>)}</div></div>;

  if (type === "flow") return <div className="koto-stage-visual koto-flow-visual"><div className="koto-flow-card"><div className="koto-flow-card__source"><Sparkles aria-hidden="true" /><strong>Brief qualifié</strong><span>Acme Inc.</span></div><div className="koto-flow-card__actions"><span><Network aria-hidden="true" /> CRM mis à jour</span><span><MessageSquareText aria-hidden="true" /> Équipe notifiée</span><span><Workflow aria-hidden="true" /> Suivi créé</span></div></div></div>;

  return <div className="koto-stage-visual koto-blueprint-visual"><div className="koto-blueprint-card"><div className="koto-blueprint-card__top"><span>Blueprint agence</span><b>Actif</b></div>{["Comprendre le déclencheur", "Qualifier le besoin", "Confirmer le budget", "Identifier la décision"].map((item, index) => <div className="koto-blueprint-card__item" key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong><Check aria-hidden="true" /></div>)}</div></div>;
}

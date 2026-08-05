import { RetroButton } from "@/components/retro/RetroButton";
import { RetroWindow } from "@/components/retro/RetroWindow";

export default function NotFound() { return <div className="page-shell"><RetroWindow title="Erreur 404 — Fichier introuvable" headingLevel="h1" controls><h2 className="section-heading">Cette page n’existe pas.</h2><p className="section-lede">Le lien est peut-être incomplet ou la destination a été déplacée.</p><div className="button-row"><RetroButton href="/" variant="primary">Retour à l’accueil</RetroButton><RetroButton href="/services">Explorer les services</RetroButton></div></RetroWindow></div>; }


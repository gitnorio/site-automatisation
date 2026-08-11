import Link from "next/link";

export default function NotFound() {
  return <section className="koto-not-found"><p className="koto-pill-label">Erreur 404</p><h1>Cette page n’existe plus.</h1><p>Le projet Koto a été simplifié et cette ancienne destination a été retirée.</p><div className="koto-action-row"><Link className="koto-button koto-button--dark" href="/">Retour à l’accueil</Link><Link className="koto-outline-link" href="/contact">Nous contacter</Link></div></section>;
}

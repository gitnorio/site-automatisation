import Image from "next/image";
import Link from "next/link";

import { BrandIcon } from "@/features/marketing/components/BrandIcon";
import { integrations } from "@/features/marketing/content/home";

export function HomeHero() {
  return <section className="koto-hero" aria-labelledby="koto-hero-title"><Image className="koto-hero__image" src="/images/editorial/hero-architecture.webp" alt="Architecture contemporaine évoquant un parcours fluide et structuré" fill priority sizes="100vw" /><video className="koto-hero__video" autoPlay loop muted playsInline poster="/images/editorial/hero-architecture.webp" aria-hidden="true"><source src="/videos/koto-hero-loop.webm" type="video/webm" /></video><div className="koto-hero__shade" aria-hidden="true" /><div className="koto-hero__content"><p className="koto-overline koto-overline--light">Consultation client adaptative</p><h1 id="koto-hero-title">Le contexte qui fait avancer chaque relation client.</h1><p>Koto mène la consultation avant votre appel, structure le brief et transmet les données utiles à vos outils — sans remplacer votre expertise.</p><div className="koto-action-row"><Link className="koto-button koto-button--mint" href="/contact">Demander une démo</Link><Link className="koto-button koto-button--outline" href="#fonctionnement">Explorer le produit</Link></div></div><div className="koto-hero__logos" aria-label="Exemples d’environnements compatibles">{integrations.slice(0, 6).map(({ name, icon }) => <span key={name}><BrandIcon icon={icon} />{name}</span>)}</div></section>;
}

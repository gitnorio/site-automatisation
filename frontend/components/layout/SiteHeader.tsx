"use client";

import { ChevronDown, Menu, Network, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { services } from "@/content/services";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    function updateHeader() {
      const current = window.scrollY;
      setHidden(current > 180 && current > lastScroll.current);
      lastScroll.current = current;
    }
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return <header className={`n8-header ${hidden && !mobileOpen ? "is-hidden" : ""}`}>
    <div className="n8-header__bar">
      <Link className="n8-brand" href="/" aria-label="Astrapio — Accueil"><Network aria-hidden="true" /><strong>Astrapio</strong></Link>
      <nav className="n8-header__nav" aria-label="Navigation principale">
        <div className="n8-nav-menu"><Link href="/services">Services <ChevronDown aria-hidden="true" /></Link><div className="n8-nav-menu__panel"><div><span>Nos services</span><h2>Automatiser sans perdre le contrôle.</h2><p>Des systèmes reliés, observables et adaptés aux opérations de votre équipe.</p></div><div>{services.slice(0, 6).map((service) => <Link href={`/services/${service.slug}`} key={service.slug}><strong>{service.title}</strong><span>{service.shortDescription}</span></Link>)}</div><Link className="n8-nav-menu__all" href="/services">Voir tous les services →</Link></div></div>
        <Link href="/methodologie">Méthodologie</Link>
        <Link href="/blogue">Ressources</Link>
        <Link href="/a-propos">À propos</Link>
      </nav>
      <div className="n8-header__actions"><Link href="/contact">Nous joindre</Link><Link className="n8-gradient-button n8-gradient-button--small" href="/contact">Démarrer</Link></div>
      <button className="n8-header__toggle" type="button" aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    </div>
    <div className={`n8-mobile-menu ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}><nav>{services.slice(0, 5).map((service) => <Link href={`/services/${service.slug}`} onClick={() => setMobileOpen(false)} key={service.slug}>{service.title}<span>→</span></Link>)}<Link href="/services" onClick={() => setMobileOpen(false)}>Tous les services <span>→</span></Link><Link href="/methodologie" onClick={() => setMobileOpen(false)}>Méthodologie <span>→</span></Link><Link href="/blogue" onClick={() => setMobileOpen(false)}>Ressources <span>→</span></Link><Link href="/contact" onClick={() => setMobileOpen(false)}>Nous joindre <span>→</span></Link></nav></div>
  </header>;
}

"use client";

import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 80);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-header__bar">
        <Link className="brand" href="/" aria-label="Koto — Accueil"><Image src="/images/brand/koto-logo.png" alt="Koto" width={752} height={180} priority /></Link>
        <nav className="desktop-navigation" aria-label="Navigation principale">
          <div className="koto-nav-menu">
            <button type="button">Produit <ChevronDown aria-hidden="true" /></button>
            <div><Link href="/#fonctionnement">Fonctionnement</Link><Link href="/#integrations">Intégrations</Link><Link href="/#securite">Sécurité</Link></div>
          </div>
          <div className="koto-nav-menu">
            <button type="button">Cas d’usage <ChevronDown aria-hidden="true" /></button>
            <div><Link href="/#cas-usage">Agences marketing</Link><Link href="/#cas-usage">Cabinets-conseils</Link><Link href="/#cas-usage">Services B2B</Link></div>
          </div>
          <Link className="nav-link" href="/clients">Clients</Link>
          <Link className="nav-link" href="/tarifs">Tarifs</Link>
        </nav>
        <Link className="header-cta" href="/contact">Demander une démo <ArrowUpRight aria-hidden="true" /></Link>
        <button className="koto-menu-button" type="button" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
      {menuOpen ? <nav className="koto-mobile-nav" aria-label="Navigation mobile"><Link href="/#fonctionnement" onClick={() => setMenuOpen(false)}>Produit</Link><Link href="/#cas-usage" onClick={() => setMenuOpen(false)}>Cas d’usage</Link><Link href="/clients" onClick={() => setMenuOpen(false)}>Clients</Link><Link href="/tarifs" onClick={() => setMenuOpen(false)}>Tarifs</Link><Link href="/contact" onClick={() => setMenuOpen(false)}>Demander une démo</Link></nav> : null}
    </header>
  );
}

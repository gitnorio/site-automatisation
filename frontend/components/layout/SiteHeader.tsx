"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 80);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-header__bar">
        <Link className="brand" href="/" aria-label="Astrapio — Accueil"><span className="brand__mark" aria-hidden="true">A</span><span>Astrapio</span></Link>
        <nav className="desktop-navigation" aria-label="Navigation principale">
          <Link className="nav-link" href="/services">Services</Link>
          <Link className="nav-link" href="/methodologie">Méthodologie</Link>
          <Link className="nav-link" href="/a-propos">À propos</Link>
        </nav>
        <Link className="header-cta" href="/contact">Parler de votre projet <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </header>
  );
}

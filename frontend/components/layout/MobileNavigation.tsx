"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { aboutNavigation, navigation } from "@/content/navigation";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="mobile-navigation">
      <button className="system-icon-button" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
      </button>
      {open ? (
        <div className="mobile-navigation__panel retro-panel" id="mobile-menu">
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
          <button type="button" aria-expanded={aboutOpen} onClick={() => setAboutOpen((value) => !value)}>À propos <span aria-hidden="true">{aboutOpen ? "−" : "+"}</span></button>
          {aboutOpen ? <div className="mobile-navigation__submenu">{aboutNavigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}</div> : null}
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
          <Link className="retro-button retro-button--primary" href="/contact" onClick={() => setOpen(false)}>Planifier une consultation</Link>
        </div>
      ) : null}
    </div>
  );
}


import { CalendarDays } from "lucide-react";
import Link from "next/link";

import { navigation } from "@/content/navigation";
import { AboutMenu } from "@/components/layout/AboutMenu";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="announcement"><span aria-hidden="true">⚜</span> Astrapio est fière d’être une entreprise québécoise. <span className="announcement__secondary">Au service des PME d’ici.</span></div>
      <div className="site-header__bar">
        <Link className="brand" href="/" aria-label="Astrapio — Accueil"><span className="brand__mark" aria-hidden="true">A</span><span>Astrapio</span></Link>
        <nav className="desktop-navigation" aria-label="Navigation principale">
          {navigation.map((item) => <Link className="nav-link" key={item.href} href={item.href}>{item.label}</Link>)}
          <AboutMenu />
          <Link className="nav-link" href="/contact">Contact</Link>
        </nav>
        <Link className="retro-button retro-button--primary header-cta" href="/contact"><CalendarDays size={18} aria-hidden="true" /> Planifier une consultation</Link>
        <MobileNavigation />
      </div>
    </header>
  );
}


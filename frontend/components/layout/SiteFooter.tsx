import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand"><strong>Astrapio</strong><span>Automatisation claire pour les PME québécoises.</span></div>
      <nav aria-label="Navigation secondaire"><Link href="/services">Services</Link><Link href="/methodologie">Méthodologie</Link><Link href="/blogue">Blogue</Link><Link href="/conditions-utilisation">Conditions d’utilisation</Link><Link href="/contact">Contact</Link></nav>
      <div className="site-footer__legal">© {new Date().getFullYear()} Astrapio</div>
    </footer>
  );
}

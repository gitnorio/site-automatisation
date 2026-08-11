import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand"><Image className="site-footer__logo" src="/images/brand/koto-logo.png" alt="Koto" width={752} height={180} /><span>La découverte client adaptative pour les équipes de services.</span></div>
      <nav aria-label="Navigation secondaire"><Link href="/#fonctionnement">Produit</Link><Link href="/#cas-usage">Cas d’usage</Link><Link href="/#integrations">Intégrations</Link><Link href="/clients">Clients</Link><Link href="/tarifs">Tarifs</Link><Link href="/contact">Demander une démo</Link></nav>
      <div className="site-footer__legal">© {new Date().getFullYear()} Koto</div>
    </footer>
  );
}

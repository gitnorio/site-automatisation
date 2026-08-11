import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand"><strong>Astrapio</strong><span>La consultation IA adaptative pour agences marketing.</span></div>
      <nav aria-label="Navigation secondaire"><Link href="/#experience">Produit</Link><Link href="/#fonctionnement">Fonctionnement</Link><Link href="/#garde-fous">Garde-fous</Link><Link href="/conditions-utilisation">Conditions d’utilisation</Link><Link href="/contact">Demander une démo</Link></nav>
      <div className="site-footer__legal">© {new Date().getFullYear()} Astrapio</div>
    </footer>
  );
}

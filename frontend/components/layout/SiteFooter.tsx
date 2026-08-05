import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><span aria-hidden="true">⚜</span> Fièrement québécoise</div>
      <div>© {new Date().getFullYear()} Astrapio</div>
      <nav aria-label="Navigation secondaire"><Link href="/conditions-utilisation">Conditions d’utilisation</Link><Link href="/contact">Contact</Link></nav>
    </footer>
  );
}


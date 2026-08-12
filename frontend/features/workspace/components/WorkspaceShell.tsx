import { BookOpenText, FlaskConical, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function WorkspaceShell({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="enterprise-shell"><aside className="enterprise-sidebar"><Link className="enterprise-brand" href="/" aria-label="Koto — Retour au site"><Image src="/images/brand/koto-logo.png" alt="Koto" width={752} height={180} priority /></Link><div className="enterprise-workspace"><span>Espace entreprise</span><strong>Votre agence</strong></div><nav aria-label="Navigation de l’application"><Link href="/app/consultations"><LayoutDashboard aria-hidden="true" /> Consultations</Link><Link href="/app/field-tests"><FlaskConical aria-hidden="true" /> Tests terrain</Link><Link href="/app/blueprints"><BookOpenText aria-hidden="true" /> Blueprints</Link><Link href="/app/settings"><Settings aria-hidden="true" /> Paramètres</Link></nav><Link className="enterprise-exit" href="/"><LogOut aria-hidden="true" /> Retour au site</Link></aside><div className="enterprise-main"><header className="enterprise-topbar"><div><span>Koto Workspace</span><strong>Votre agence</strong></div><span className="enterprise-environment">MVP</span></header><main id="main-content">{children}</main></div></div>;
}

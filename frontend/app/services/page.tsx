import { Suspense } from "react";

import { ServiceExplorer } from "@/components/services/ServiceExplorer";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Services d’intégration et d’automatisation IA", "Explorez les services et cas d’utilisation d’Astrapio pour automatiser, connecter et améliorer les opérations des PME.", "/services");

export default function ServicesPage() { return <div className="page-shell page-stack"><Suspense fallback={<div className="retro-window"><div className="retro-window__body">Chargement des services…</div></div>}><ServiceExplorer /></Suspense></div>; }


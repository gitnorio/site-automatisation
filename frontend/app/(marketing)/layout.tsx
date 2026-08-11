import type { ReactNode } from "react";

import { SiteFooter } from "@/features/marketing/components/SiteFooter";
import { SiteHeader } from "@/features/marketing/components/SiteHeader";

export default function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>
    <SiteHeader />
    <main id="main-content">{children}</main>
    <SiteFooter />
  </>;
}

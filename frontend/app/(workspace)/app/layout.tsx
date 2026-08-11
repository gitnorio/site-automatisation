import type { ReactNode } from "react";

import { WorkspaceShell } from "@/features/workspace/components/WorkspaceShell";

export default function EnterpriseLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}

import Link from "next/link";
import type { ReactNode } from "react";

type RetroButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function RetroButton({ href, children, variant = "secondary", className = "" }: RetroButtonProps) {
  return <Link className={`retro-button retro-button--${variant} ${className}`} href={href}>{children}</Link>;
}


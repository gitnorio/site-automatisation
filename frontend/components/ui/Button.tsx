import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "text";
  className?: string;
};

export function Button({ children, href, variant = "primary", className = "" }: ButtonProps) {
  return <Link className={`button button--${variant} ${className}`.trim()} href={href}>{children}</Link>;
}

"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { aboutNavigation } from "@/content/navigation";

export function AboutMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="about-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        className="nav-link nav-link--button"
        type="button"
        aria-expanded={open}
        aria-controls="about-submenu"
        onClick={() => setOpen((value) => !value)}
      >
        À propos <ChevronDown size={17} aria-hidden="true" />
      </button>
      {open ? (
        <div className="about-menu__panel" id="about-submenu">
          {aboutNavigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

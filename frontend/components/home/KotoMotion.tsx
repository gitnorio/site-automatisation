"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function KotoMotionController() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-koto-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: .08, rootMargin: "-8% 0px -8%" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}

export function KotoDemoVideo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return <>
    <button className="koto-demo-trigger" type="button" onClick={() => setOpen(true)} aria-label="Ouvrir la démonstration vidéo Koto">
      <span className="koto-demo-trigger__media"><Image src="/images/product/consultation-marque-blanche-wall-logo-v6.webp" alt="" fill sizes="96px" /><i><Play aria-hidden="true" /></i></span>
      <span><strong>Voir Koto en action</strong><small>Découvrez comment Koto orchestre chaque étape de la consultation.</small></span>
    </button>

    {open ? <div className="koto-video-dialog" role="dialog" aria-modal="true" aria-label="Démonstration vidéo Koto" onClick={() => setOpen(false)}>
      <div className="koto-video-dialog__panel" onClick={(event) => event.stopPropagation()}>
        <button className="koto-video-dialog__close" type="button" onClick={() => setOpen(false)} aria-label="Fermer la démo"><X aria-hidden="true" /></button>
        <video autoPlay loop controls playsInline poster="/images/product/consultation-marque-blanche-wall-logo-v6.webp">
          <source src="/videos/koto-product-demo.webm" type="video/webm" />
        </video>
      </div>
    </div> : null}
  </>;
}

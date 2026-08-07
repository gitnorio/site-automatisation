"use client";

import { ArrowRight, Grid3X3, List, RotateCcw, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { categoryLabels, getService, services, type Service, type ServiceCategory } from "@/content/services";
import { filterServices } from "@/lib/service-filter";

const validCategories = Object.keys(categoryLabels) as ServiceCategory[];

function parseCategories(value: string | null): ServiceCategory[] {
  if (!value) return [];
  return value.split(",").filter((item): item is ServiceCategory => validCategories.includes(item as ServiceCategory));
}

function ServiceDialog({ service, onClose }: { service: Service; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previouslyFocused?.focus(); };
  }, [onClose]);

  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <div className="retro-window service-dialog" role="dialog" aria-modal="true" aria-labelledby="service-dialog-title" ref={dialogRef}>
      <div className="retro-titlebar"><h2 className="retro-titlebar__title" id="service-dialog-title">{service.title}</h2><button className="system-icon-button service-dialog__close" type="button" onClick={onClose} ref={closeRef}><X aria-hidden="true" /><span className="sr-only">Fermer la fiche</span></button></div>
      <div className="service-dialog__scroll">
        <div className="service-dialog__hero"><p className="section-lede">{service.shortDescription}</p><div className="tag-cloud">{service.categories.map((category) => <span className="retro-tag" key={category}>{categoryLabels[category]}</span>)}</div></div>
        <div className="service-dialog__sections">
          <section><h3>Le problème</h3><p>{service.problem}</p></section>
          <section><h3>Fonctionnement</h3><ol>{service.workflow.map((step) => <li key={step}>{step}</li>)}</ol></section>
          <section><h3>Systèmes connectables</h3><ul>{service.connectableSystems.map((system) => <li key={system}>{system}</li>)}</ul></section>
          <section><h3>Intervention humaine</h3><p>{service.humanRole}</p></section>
          <section><h3>Bénéfices</h3><ul>{service.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></section>
          <section><h3>Sécurité</h3><ul>{service.security.map((item) => <li key={item}>{item}</li>)}</ul></section>
        </div>
        <div className="button-row"><Link className="retro-button retro-button--primary" href={`/contact?service=${service.slug}`}>Discuter de ce service →</Link></div>
      </div>
    </div>
  </div>;
}

export function ServiceExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [categories, setCategories] = useState<ServiceCategory[]>(parseCategories(searchParams.get("categorie")));
  const [view, setView] = useState<"cartes" | "liste">(searchParams.get("vue") === "liste" ? "liste" : "cartes");
  const selectedService = getService(searchParams.get("service") ?? "");
  const results = useMemo(() => filterServices(services, query, categories), [query, categories]);

  function updateUrl(next: { query?: string; categories?: ServiceCategory[]; view?: "cartes" | "liste"; service?: string | null }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextQuery = next.query ?? query;
    const nextCategories = next.categories ?? categories;
    const nextView = next.view ?? view;
    if (nextQuery) params.set("q", nextQuery); else params.delete("q");
    if (nextCategories.length) params.set("categorie", nextCategories.join(",")); else params.delete("categorie");
    if (nextView === "liste") params.set("vue", "liste"); else params.delete("vue");
    if (next.service === null) params.delete("service"); else if (next.service) params.set("service", next.service);
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  function toggleCategory(category: ServiceCategory) {
    const next = categories.includes(category) ? categories.filter((item) => item !== category) : [...categories, category];
    setCategories(next); updateUrl({ categories: next });
  }

  function reset() { setQuery(""); setCategories([]); setView("cartes"); router.replace(pathname, { scroll: false }); }

  return <>
    <section className="retro-window services-intro"><div className="retro-titlebar"><h1 className="retro-titlebar__title">Services</h1><span className="section-index" aria-hidden="true">11 expertises</span></div><div className="retro-window__body"><h2 className="section-heading">Simplifier le travail réel.</h2><p className="section-lede">Explorez les façons dont Astrapio peut relier vos outils, vos données et vos équipes.</p><label className="service-search"><Search aria-hidden="true" /><span className="sr-only">Rechercher un service</span><input value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => updateUrl({ query })} onKeyDown={(event) => { if (event.key === "Enter") updateUrl({ query }); }} placeholder="Rechercher un service" /></label></div></section>
    <section className="services-toolbar retro-panel" aria-label="Filtres de services"><strong>Filtres rapides :</strong><div className="tag-cloud">{validCategories.map((category) => <button className={`retro-tag retro-tag--button ${categories.includes(category) ? "is-selected" : ""}`} type="button" aria-pressed={categories.includes(category)} key={category} onClick={() => toggleCategory(category)}>{categoryLabels[category]}</button>)}</div><div className="services-toolbar__views"><button className={`retro-button ${view === "cartes" ? "is-active" : ""}`} type="button" aria-pressed={view === "cartes"} onClick={() => { setView("cartes"); updateUrl({ view: "cartes" }); }}><Grid3X3 aria-hidden="true" /> Cartes</button><button className={`retro-button ${view === "liste" ? "is-active" : ""}`} type="button" aria-pressed={view === "liste"} onClick={() => { setView("liste"); updateUrl({ view: "liste" }); }}><List aria-hidden="true" /> Liste</button></div></section>
    <div className="results-bar"><strong>{results.length} service{results.length > 1 ? "s" : ""}</strong>{query || categories.length ? <button className="retro-button" type="button" onClick={reset}><RotateCcw aria-hidden="true" /> Réinitialiser</button> : null}</div>
    {results.length ? <div className={`service-grid service-grid--${view}`}>{results.map((service, index) => <article className="service-card retro-window" key={service.slug}><button className="service-card__button" type="button" onClick={() => updateUrl({ service: service.slug })} aria-label={`Ouvrir la fiche ${service.title}`}><div className="service-card__content"><span className="service-card__number">{String(index + 1).padStart(2, "0")}</span><h2>{service.title}</h2><p>{service.shortDescription}</p><div className="tag-cloud">{service.categories.map((category) => <span className="retro-tag" key={category}>{categoryLabels[category]}</span>)}</div><span className="service-card__cta">Consulter la fiche <ArrowRight aria-hidden="true" /></span></div></button></article>)}</div> : <div className="retro-window"><div className="retro-titlebar"><h2 className="retro-titlebar__title">Aucun résultat</h2></div><div className="retro-window__body"><p className="section-lede">Aucun service ne correspond à ces critères. Retirez un filtre ou présentez-nous directement votre besoin.</p><div className="button-row"><button className="retro-button" type="button" onClick={reset}>Réinitialiser</button><Link className="retro-button retro-button--primary" href="/contact">Contacter Astrapio</Link></div></div></div>}
    {selectedService ? <ServiceDialog service={selectedService} onClose={() => updateUrl({ service: null })} /> : null}
  </>;
}

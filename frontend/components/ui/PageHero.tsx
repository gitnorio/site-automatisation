import Image from "next/image";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  copy: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, copy, image, imageAlt = "", children }: PageHeroProps) {
  return <section className={`page-hero ${image ? "page-hero--image" : ""}`}>
    <div className="page-hero__copy animate-fade-in-up">
      <span className="eyebrow-pill">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{copy}</p>
      {children}
    </div>
    {image ? <div className="page-hero__media animate-fade-in-up" style={{ animationDelay: ".1s" }}><Image src={image} alt={imageAlt} width={1200} height={900} priority /></div> : null}
  </section>;
}

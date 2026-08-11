import { KotoDemoVideo } from "@/features/marketing/components/KotoMotion";
import { StageVisual } from "@/features/marketing/components/StageVisual";
import { marketingStages } from "@/features/marketing/content/home";

export function ProductJourney() {
  return <section className="koto-system" id="fonctionnement" aria-labelledby="system-title"><div className="koto-section-heading koto-section-heading--center" data-koto-reveal><p className="koto-pill-label">Ce que Koto fait</p><h2 id="system-title">Un seul système, de l’invitation au prochain geste.</h2></div><div className="koto-stage-scroll"><div className="koto-stage-list">{marketingStages.map((stage) => <article className="koto-stage" key={stage.label}><div className="koto-stage__bar">{stage.label}</div><div className="koto-stage__body"><div className="koto-stage__copy"><h3>{stage.title}</h3><p>{stage.description}</p></div><StageVisual type={stage.visual} /></div></article>)}<div className="koto-stage-runway" aria-hidden="true" /></div><div className="koto-demo-row" data-koto-reveal><KotoDemoVideo /></div></div></section>;
}

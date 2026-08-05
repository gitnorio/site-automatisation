import { RetroWindow } from "@/components/retro/RetroWindow";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Conditions d’utilisation", "Conditions générales d’utilisation du site Astrapio — modèle initial à faire réviser.", "/conditions-utilisation");

export default function TermsPage() {
  return <div className="page-shell page-stack"><RetroWindow title="Conditions d’utilisation — Modèle initial" headingLevel="h1" controls><div className="inset-panel"><strong>À faire réviser avant publication</strong><p>Ce texte constitue un modèle de travail et ne remplace pas un avis juridique adapté à l’entreprise et aux lois applicables au Québec.</p></div></RetroWindow>{[["Utilisation du site", "Le contenu est fourni à titre informatif. Il ne constitue pas une garantie de résultat ni un engagement contractuel."], ["Exactitude de l’information", "Astrapio cherche à maintenir une information claire et actuelle, mais le contenu peut évoluer sans préavis."], ["Propriété du contenu", "Les textes, composants et illustrations originaux du site ne peuvent pas être reproduits sans autorisation, sous réserve des droits applicables."], ["Liens et services externes", "Des liens externes peuvent être fournis pour faciliter la navigation. Leurs contenus et pratiques demeurent sous la responsabilité de leurs exploitants."], ["Limitation", "Les modalités précises de responsabilité, de juridiction et de contact doivent être complétées et révisées avant publication."]].map(([title, copy]) => <RetroWindow title={title} key={title}><p className="section-lede">{copy}</p></RetroWindow>)}</div>;
}


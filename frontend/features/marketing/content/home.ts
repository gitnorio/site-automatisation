import {
  siAirtable,
  siGmail,
  siGoogle,
  siHubspot,
  siMake,
  siSalesforce,
  siSlack,
  siZapier,
  siZoho,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export type StageVisualType = "blueprint" | "invitation" | "consultation" | "brief" | "flow";

export type MarketingStage = {
  label: string;
  title: string;
  description: string;
  visual: StageVisualType;
};

export const marketingStages: ReadonlyArray<MarketingStage> = [
  { label: "Cadrage", title: "Définissez le résultat attendu avant le premier échange.", description: "Objectifs, critères de qualification et règles de relance deviennent un parcours clair, prêt à être envoyé.", visual: "blueprint" },
  { label: "Invitation", title: "Envoyez une expérience qui porte réellement votre marque.", description: "Le prospect reçoit par courriel un lien personnel vers une consultation autonome, accessible au moment qui lui convient.", visual: "invitation" },
  { label: "Consultation", title: "Ne laissez plus une question importante sans réponse.", description: "Koto pose une question principale à la fois, adapte la suite et accepte les réponses, documents et précisions utiles.", visual: "consultation" },
  { label: "Brief", title: "Retrouvez les signaux qui comptent, déjà structurés.", description: "Chaque réponse confirmée, zone floue et élément à reprendre arrive dans un brief lisible avant votre rencontre.", visual: "brief" },
  { label: "Activation", title: "Transformez le contexte recueilli en prochain geste.", description: "Les champs autorisés alimentent le CRM, le bon responsable est prévenu et les suivis prévus sont déclenchés.", visual: "flow" },
];

export const integrations: ReadonlyArray<{ name: string; icon: SimpleIcon }> = [
  { name: "Zoho CRM", icon: siZoho },
  { name: "HubSpot", icon: siHubspot },
  { name: "Salesforce", icon: siSalesforce },
  { name: "Google", icon: siGoogle },
  { name: "Gmail", icon: siGmail },
  { name: "Slack", icon: siSlack },
  { name: "Zapier", icon: siZapier },
  { name: "Make", icon: siMake },
  { name: "Airtable", icon: siAirtable },
];

export const frequentlyAskedQuestions = [
  ["Koto est-il un simple formulaire?", "Non. Les prochaines questions dépendent des réponses données et des objectifs qu’il reste réellement à clarifier."],
  ["Le prospect voit-il son score de qualification?", "Non. Il voit uniquement sa consultation. Les analyses et signaux internes restent réservés à votre équipe."],
  ["Peut-on utiliser notre propre marque?", "Oui. Le lien, la consultation et les communications peuvent reprendre votre identité visuelle."],
  ["Koto remplace-t-il la rencontre humaine?", "Non. Koto prépare un meilleur premier échange. Votre équipe garde le jugement, la recommandation et la relation."],
  ["Quels outils peut-on connecter?", "Koto se connecte aux CRM, outils de courriel, plateformes collaboratives et systèmes internes accessibles par API."],
] as const;

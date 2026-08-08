export type BlogCategory = "automatisation" | "ia-pratique" | "integration";

export type Article = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  readingTime: string;
  category: BlogCategory;
  categoryLabel: string;
  author: "Équipe Astrapio";
  image: string;
  imageAlt: string;
  relatedService: string;
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
};

export const articles: Article[] = [
  {
    slug: "commencer-automatisation-ia-pme",
    title: "Par où commencer l’automatisation IA dans une PME",
    summary: "Une méthode concrète pour choisir un premier processus utile, mesurable et suffisamment encadré.",
    publishedAt: "2026-08-05",
    readingTime: "6 min",
    category: "automatisation",
    categoryLabel: "Automatisation",
    author: "Équipe Astrapio",
    image: "/images/accenture-inspired/team-collaboration.webp",
    imageAlt: "Gestionnaire cartographiant les tâches d’un processus administratif",
    relatedService: "automatisation-intelligente",
    sections: [
      {
        heading: "Commencer par le processus, pas par l’outil",
        paragraphs: ["Un bon premier projet part d’une tâche concrète qui prend du temps, se répète souvent et suit des règles déjà comprises par l’équipe. L’objectif n’est pas d’ajouter de l’IA partout, mais de simplifier une friction réelle."],
      },
      {
        heading: "Repérer un candidat raisonnable",
        paragraphs: ["Le processus choisi doit être assez fréquent pour produire un apprentissage utile, mais assez limité pour être testé sans bouleverser les opérations."],
        bullets: ["Le point de départ et le résultat attendu sont clairs.", "Les exceptions peuvent être confiées à un employé.", "Les données nécessaires sont accessibles et autorisées.", "Un indicateur permet de comparer avant et après."],
      },
      {
        heading: "Mesurer un projet pilote",
        paragraphs: ["Un pilote doit confirmer la qualité du flux, le temps réellement économisé et les situations où l’intervention humaine demeure nécessaire. Les résultats guident ensuite la décision d’élargir, d’ajuster ou d’arrêter."],
      },
    ],
  },
  {
    slug: "base-connaissances-ia-expliquee",
    title: "Une base de connaissances IA, expliquée simplement",
    summary: "Comment un assistant peut rechercher les bons passages dans vos documents et présenter ses sources.",
    publishedAt: "2026-08-05",
    readingTime: "7 min",
    category: "ia-pratique",
    categoryLabel: "IA pratique",
    author: "Équipe Astrapio",
    image: "/images/accenture-inspired/document-flow.webp",
    imageAlt: "Documents indexés reliés à une réponse accompagnée de sources",
    relatedService: "bases-de-connaissances",
    sections: [
      {
        heading: "Rechercher avant de répondre",
        paragraphs: ["Une base de connaissances intelligente ne demande pas au modèle de tout savoir. Elle recherche d’abord les passages pertinents dans les documents autorisés, puis utilise ce contexte pour préparer une réponse."],
      },
      {
        heading: "Ce qui influence la qualité",
        paragraphs: ["La technologie ne corrige pas automatiquement une documentation incomplète ou contradictoire. La préparation du contenu demeure une étape centrale."],
        bullets: ["La qualité et l’actualité des documents.", "Les droits d’accès associés à chaque utilisateur.", "La manière de découper et d’indexer le contenu.", "La présence de sources vérifiables.", "Les règles d’escalade vers un humain."],
      },
      {
        heading: "Une réponse n’est pas une décision",
        paragraphs: ["Pour les sujets sensibles, l’assistant doit orienter l’utilisateur vers la bonne source ou la bonne personne. La validation humaine reste nécessaire lorsque la conséquence d’une erreur est importante."],
      },
    ],
  },
  {
    slug: "automatiser-sans-remplacer-logiciels",
    title: "Automatiser sans remplacer vos logiciels actuels",
    summary: "Relier progressivement les outils en place grâce aux API, connecteurs et validations humaines.",
    publishedAt: "2026-08-05",
    readingTime: "6 min",
    category: "integration",
    categoryLabel: "Intégration",
    author: "Équipe Astrapio",
    image: "/images/accenture-inspired/connected-systems.webp",
    imageAlt: "Plusieurs logiciels existants reliés par une couche intelligente",
    relatedService: "integration-de-systemes",
    sections: [
      {
        heading: "Ajouter une couche de connexion",
        paragraphs: ["Une intégration réussie conserve souvent les outils que l’équipe connaît déjà. Une couche contrôlée déplace l’information, applique les règles et appelle l’IA seulement là où elle apporte une valeur claire."],
      },
      {
        heading: "Choisir le bon mode d’accès",
        paragraphs: ["Selon les systèmes, l’échange peut passer par une API, OAuth, un webhook, une synchronisation planifiée ou un service installé dans l’environnement du client."],
        bullets: ["Commencer en lecture seule lorsque possible.", "Limiter les permissions au strict nécessaire.", "Journaliser les actions et les erreurs.", "Prévoir une validation humaine pour les changements sensibles."],
      },
      {
        heading: "Déployer progressivement",
        paragraphs: ["Un projet pilote sur un flux limité permet de vérifier les données, les exceptions et les coûts d’utilisation avant d’étendre l’intégration à d’autres équipes."],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

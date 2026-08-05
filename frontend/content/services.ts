export type ServiceCategory =
  | "automatisation"
  | "assistants-ia"
  | "connaissances"
  | "integrations"
  | "documents"
  | "sur-mesure";

export type Service = {
  slug: string;
  title: string;
  shortDescription: string;
  image: string;
  imageAlt: string;
  categories: ServiceCategory[];
  problem: string;
  workflow: string[];
  connectableSystems: string[];
  humanRole: string;
  benefits: string[];
  security: string[];
  needType: string;
};

export const categoryLabels: Record<ServiceCategory, string> = {
  automatisation: "Automatisation",
  "assistants-ia": "Assistants IA",
  connaissances: "Connaissances",
  integrations: "Intégrations",
  documents: "Documents",
  "sur-mesure": "Sur mesure",
};

export const services: Service[] = [
  {
    slug: "automatisation-intelligente",
    title: "Automatisation intelligente",
    shortDescription: "Automatisez les tâches répétitives et les processus administratifs qui ralentissent vos équipes.",
    image: "/images/pixel-art/service-automation.webp",
    imageAlt: "Chaîne de travail automatisée entre des postes administratifs",
    categories: ["automatisation", "integrations"],
    problem: "Les équipes recopient encore des données, relancent manuellement des demandes et déplacent l’information entre plusieurs outils.",
    workflow: ["Repérer le déclencheur", "Valider les données", "Exécuter les actions", "Signaler les exceptions"],
    connectableSystems: ["Courriel", "CRM", "Bases de données", "Logiciels internes", "API"],
    humanRole: "Les employés définissent les règles, valident les exceptions et conservent le contrôle des décisions sensibles.",
    benefits: ["Réduire la ressaisie", "Accélérer les suivis", "Uniformiser les étapes", "Tracer les actions"],
    security: ["Accès limités", "Secrets externalisés", "Journalisation", "Validation des données"],
    needType: "automatisation",
  },
  {
    slug: "assistants-ia",
    title: "Assistants IA",
    shortDescription: "Aidez vos équipes à préparer des réponses, résumer l’information et accomplir des tâches guidées.",
    image: "/images/pixel-art/service-ai-assistant.webp",
    imageAlt: "Employée utilisant un assistant IA dans une interface rétro",
    categories: ["assistants-ia", "sur-mesure"],
    problem: "Les employés consacrent du temps à reformuler les mêmes réponses et à rassembler de l’information dispersée.",
    workflow: ["Recevoir la demande", "Recueillir le contexte autorisé", "Préparer une réponse", "Faire valider au besoin"],
    connectableSystems: ["Portail interne", "Outils de soutien", "Courriel", "CRM", "Documentation"],
    humanRole: "L’assistant prépare et propose; l’employé demeure responsable de la validation et de l’action finale.",
    benefits: ["Réponses plus rapides", "Contexte mieux structuré", "Soutien disponible dans les outils existants"],
    security: ["Permissions par utilisateur", "Filtrage du contexte", "Historique contrôlé", "Choix du fournisseur"],
    needType: "assistant-ia",
  },
  {
    slug: "bases-de-connaissances",
    title: "Bases de connaissances",
    shortDescription: "Retrouvez rapidement l’information contenue dans vos documents, procédures et politiques autorisés.",
    image: "/images/pixel-art/service-knowledge.webp",
    imageAlt: "Bibliothèque de documents reliée à un moteur de recherche intelligent",
    categories: ["connaissances", "documents", "assistants-ia"],
    problem: "Les connaissances utiles sont réparties entre des dossiers, espaces documentaires et procédures difficiles à consulter.",
    workflow: ["Préparer les documents", "Indexer les passages", "Rechercher les sources", "Composer une réponse sourcée"],
    connectableSystems: ["SharePoint", "Google Drive", "Espaces documentaires", "Bases internes"],
    humanRole: "Les responsables choisissent les sources autorisées, révisent la qualité documentaire et valident les usages sensibles.",
    benefits: ["Recherche accélérée", "Sources visibles", "Réponses fondées sur les documents autorisés"],
    security: ["Respect des droits d’accès", "Séparation logique", "Minimisation des données", "Suivi des sources"],
    needType: "base-connaissances",
  },
  {
    slug: "integration-de-systemes",
    title: "Intégration de systèmes",
    shortDescription: "Connectez l’IA à vos courriels, CRM, bases de données, espaces documentaires et logiciels internes.",
    image: "/images/pixel-art/service-integration.webp",
    imageAlt: "Plusieurs logiciels reliés par des flux de données lumineux",
    categories: ["integrations", "sur-mesure"],
    problem: "Les logiciels ne communiquent pas toujours entre eux et obligent les équipes à transférer l’information manuellement.",
    workflow: ["Cartographier les systèmes", "Choisir le mode d’accès", "Transformer les données", "Surveiller les échanges"],
    connectableSystems: ["Microsoft 365", "Google Workspace", "CRM", "ERP", "API internes"],
    humanRole: "Les responsables TI autorisent les accès et approuvent les données pouvant circuler entre les systèmes.",
    benefits: ["Moins de doubles saisies", "Données mieux synchronisées", "Outils existants conservés"],
    security: ["OAuth lorsque disponible", "Accès minimaux", "Chiffrement en transit", "Gestion sécurisée des secrets"],
    needType: "integration",
  },
  {
    slug: "developpement-sur-mesure",
    title: "Développement sur mesure",
    shortDescription: "Développez une solution adaptée lorsque les produits existants ne répondent pas à votre réalité.",
    image: "/images/pixel-art/service-custom.webp",
    imageAlt: "Atelier numérique assemblant une application personnalisée",
    categories: ["sur-mesure", "integrations"],
    problem: "Un processus important ne correspond pas aux limites des produits standards ou exige une interface propre à l’entreprise.",
    workflow: ["Définir le besoin", "Prototyper", "Développer", "Tester et déployer"],
    connectableSystems: ["Applications web", "API", "Portails internes", "Logiciels propriétaires"],
    humanRole: "Les utilisateurs participent aux essais et valident chaque étape avant le déploiement.",
    benefits: ["Solution adaptée", "Interface ciblée", "Évolution progressive", "Propriété claire des flux"],
    security: ["Architecture revue", "Tests", "Contrôle des permissions", "Maintenance planifiée"],
    needType: "sur-mesure",
  },
  {
    slug: "demandes-de-soumission",
    title: "Traitement des demandes de soumission",
    shortDescription: "Transformez une demande reçue en dossier structuré et en brouillon prêt à valider.",
    image: "/images/pixel-art/service-quotes.webp",
    imageAlt: "Courriel de soumission converti en dossier structuré",
    categories: ["automatisation", "documents", "integrations"],
    problem: "Les demandes arrivent dans différents formats et doivent être lues, vérifiées puis recopiées dans plusieurs systèmes.",
    workflow: ["Analyser la demande", "Extraire les renseignements", "Détecter les manques", "Préparer le dossier et la réponse"],
    connectableSystems: ["Courriel", "Formulaires", "CRM", "Base de données", "Gestion documentaire"],
    humanRole: "Un employé vérifie les renseignements et approuve la réponse avant son envoi.",
    benefits: ["Dossiers préparés plus vite", "Informations manquantes visibles", "Suivi uniforme"],
    security: ["Validation humaine", "Accès aux dossiers autorisés", "Journalisation", "Conservation définie"],
    needType: "automatisation",
  },
  {
    slug: "classement-des-courriels",
    title: "Analyse et classement des courriels",
    shortDescription: "Classez les messages, repérez les priorités et acheminez les demandes vers la bonne équipe.",
    image: "/images/pixel-art/service-email.webp",
    imageAlt: "Boîte de réception classée automatiquement par catégories",
    categories: ["automatisation", "documents"],
    problem: "Les boîtes partagées reçoivent un volume de messages difficile à trier et à distribuer de façon constante.",
    workflow: ["Lire le message", "Identifier le sujet", "Extraire les données utiles", "Acheminer avec une priorité"],
    connectableSystems: ["Outlook", "Gmail", "Teams", "CRM", "Outils de billets"],
    humanRole: "Les cas ambigus et les messages sensibles sont dirigés vers un employé.",
    benefits: ["Tri plus constant", "Délais réduits", "Responsabilité claire", "Moins de demandes oubliées"],
    security: ["Boîtes autorisées seulement", "Règles de conservation", "Accès minimaux", "Cas sensibles exclus"],
    needType: "automatisation",
  },
  {
    slug: "extraction-de-documents",
    title: "Extraction de données de documents",
    shortDescription: "Transformez factures, formulaires et rapports en données structurées à faire vérifier.",
    image: "/images/pixel-art/service-documents.webp",
    imageAlt: "Données extraites de factures vers un tableau structuré",
    categories: ["documents", "automatisation"],
    problem: "Des renseignements utiles restent enfermés dans des PDF, images ou documents hétérogènes.",
    workflow: ["Recevoir le document", "Reconnaître sa structure", "Extraire les champs", "Valider et exporter"],
    connectableSystems: ["Dossiers partagés", "Courriel", "ERP", "Base de données", "API"],
    humanRole: "Les champs incertains sont signalés pour vérification plutôt que traités comme exacts.",
    benefits: ["Saisie accélérée", "Données structurées", "Exceptions visibles", "Traçabilité"],
    security: ["Documents minimisés", "Accès contrôlés", "Validation", "Suppression planifiée"],
    needType: "automatisation",
  },
  {
    slug: "generation-de-rapports",
    title: "Génération de rapports",
    shortDescription: "Rassemblez les données disponibles et préparez des rapports répétitifs à réviser.",
    image: "/images/pixel-art/service-reports.webp",
    imageAlt: "Données de plusieurs systèmes assemblées dans un rapport",
    categories: ["automatisation", "documents", "integrations"],
    problem: "Les rapports périodiques demandent de recueillir manuellement les mêmes données et de répéter les mêmes mises en forme.",
    workflow: ["Collecter les données", "Vérifier les valeurs", "Composer le rapport", "Soumettre pour approbation"],
    connectableSystems: ["Bases de données", "CRM", "ERP", "Feuilles de calcul", "API internes"],
    humanRole: "Le responsable confirme les données, interprète les résultats et approuve la diffusion.",
    benefits: ["Préparation accélérée", "Format uniforme", "Sources identifiables", "Temps consacré à l’analyse"],
    security: ["Données nécessaires seulement", "Contrôle de diffusion", "Historique", "Validation avant publication"],
    needType: "automatisation",
  },
  {
    slug: "synchronisation-logiciels",
    title: "Synchronisation entre logiciels",
    shortDescription: "Gardez les renseignements cohérents entre vos systèmes sans effectuer chaque transfert à la main.",
    image: "/images/pixel-art/service-sync.webp",
    imageAlt: "Deux logiciels synchronisant leurs dossiers clients",
    categories: ["integrations", "automatisation"],
    problem: "Un même client ou dossier possède des données différentes selon le logiciel consulté.",
    workflow: ["Détecter le changement", "Valider le format", "Mettre à jour la cible", "Signaler les conflits"],
    connectableSystems: ["CRM", "ERP", "Comptabilité", "Portails", "Bases de données"],
    humanRole: "Les conflits, suppressions et changements sensibles suivent des règles d’approbation.",
    benefits: ["Données plus cohérentes", "Moins de ressaisie", "Conflits détectés", "Flux documentés"],
    security: ["Permissions d’écriture limitées", "Journal des changements", "Reprise sur erreur", "Sauvegardes"],
    needType: "integration",
  },
  {
    slug: "assistant-soutien-interne",
    title: "Assistant de soutien interne",
    shortDescription: "Aidez les employés à retrouver une procédure et à préparer la prochaine action.",
    image: "/images/pixel-art/service-support.webp",
    imageAlt: "Employé consultant une réponse avec ses sources dans un assistant interne",
    categories: ["assistants-ia", "connaissances"],
    problem: "Les équipes sollicitent toujours les mêmes spécialistes pour retrouver des procédures ou résoudre des questions courantes.",
    workflow: ["Recevoir la question", "Rechercher les sources autorisées", "Répondre avec références", "Escalader si nécessaire"],
    connectableSystems: ["Documentation interne", "Portail", "Teams", "Outil de soutien"],
    humanRole: "L’employé confirme l’information et transmet les cas complexes au spécialiste responsable.",
    benefits: ["Accès rapide aux procédures", "Sources visibles", "Escalade structurée", "Soutien plus uniforme"],
    security: ["Droits d’accès respectés", "Sources autorisées", "Questions journalisées selon la politique", "Réponses prudentes"],
    needType: "assistant-ia",
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}


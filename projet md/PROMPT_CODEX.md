# Prompt principal pour Codex

Tu travailles sur un SaaS B2B de **consultation client interactive par IA**, d'abord verticalisé pour les **agences marketing**.

Lis tous les fichiers Markdown présents dans ce dossier avant de proposer ou modifier du code.

## Objectif du produit

Le produit permet à une agence marketing d'intégrer sur son site Web ou d'envoyer par courriel un lien vers une **consultation interactive** destinée à ses prospects.

Le prospect ne remplit pas un formulaire statique. Il vit une expérience guidée et premium, inspirée de plateformes interactives comme Maki People : questions visuelles, choix multiples, texte libre et interactions adaptées au contexte.

L'IA reçoit un **Discovery Blueprint** configuré par l'agence. L'agence définit **ce qu'elle doit apprendre**; l'IA décide **comment le découvrir**.

Le système doit :
1. connaître les objectifs d'information du Blueprint;
2. suivre l'état de chaque objectif;
3. choisir la meilleure prochaine question;
4. éviter de reposer une information déjà connue;
5. respecter strictement les garde-fous;
6. arrêter la consultation quand les objectifs obligatoires sont complétés;
7. produire un dossier final structuré;
8. plus tard, pousser ces données vers le CRM et d'autres automatisations.

## MVP à construire maintenant

### Inclus
- Blueprint fixe `Agence marketing v1`;
- session prospect;
- questions adaptatives;
- réponses texte, choix multiples/cartes et nombres/budget;
- stockage des réponses;
- état structuré des objectifs;
- appel LLM via API;
- validation stricte de la sortie JSON;
- logique d'arrêt;
- génération d'un Marketing Discovery Brief;
- interface propre et moderne.

### Exclus pour le moment
- PDF / analyse documentaire;
- CRM;
- voix;
- avatar 3D;
- scoring avancé;
- dashboard complexe;
- multi-verticales;
- automatisations externes;
- paiement.

## Principe d'architecture essentiel

**Le LLM ne contrôle jamais directement l'application.**

Le backend garde l'état et les règles. Le LLM reçoit un contexte structuré et retourne une décision structurée. Le backend valide cette décision avant de l'appliquer.

Ne jamais construire le moteur comme un simple échange où toute la conversation est envoyée au modèle puis sa réponse affichée telle quelle.

## Garde-fous produit

L'IA :
- qualifie et documente;
- peut approfondir;
- ne recommande jamais de stratégie marketing;
- ne recommande aucun canal;
- ne recommande aucun budget;
- ne critique jamais une agence précédente;
- ne s'engage sur aucun prix, délai ou livrable;
- termine toujours par une transition vers un échange humain.

## Première tâche

Avant de coder, inspecte :
- `PRODUCT.md`
- `MARKETING_BLUEPRINT_V1.md`
- `ADAPTIVE_ENGINE.md`
- `DATA_MODEL.md`
- `MVP_SCOPE.md`
- `UX_FLOW.md`
- `ARCHITECTURE.md`
- `IMPLEMENTATION_PLAN.md`
- `CODEX_RULES.md`

Ensuite :
1. résume l'architecture proposée;
2. liste les décisions techniques encore ouvertes;
3. propose la structure de projet;
4. si un repo existe déjà, audite-le avant toute modification.

Ne surcharge pas le MVP.

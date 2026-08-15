# Discovery Blueprint — Agences marketing v1

## 1. Délégation contrôlée

L'IA qualifie et documente. Elle ne prend pas la place du jugement stratégique de l'agence.

### Interdictions strictes

L'IA ne doit jamais :
- recommander une stratégie marketing;
- recommander un canal marketing;
- recommander un budget;
- recommander un fournisseur;
- critiquer ou comparer une agence précédente;
- s'engager sur un prix;
- s'engager sur un délai de réalisation;
- promettre un livrable;
- générer un plan d'action marketing final.

La consultation se termine toujours par une transition vers un humain.

## 2. Objectifs d'information

### `company_profile`
Obligatoire : oui  
Attendu : secteur, produit/service, taille, stade de croissance si pertinent.

### `target_customer`
Obligatoire : oui  
Attendu : client idéal, segments visés.

### `positioning_competitors`
Obligatoire : non  
Attendu : différenciation, concurrents perçus.

### `current_channels`
Obligatoire : oui  
Attendu : SEO, publicité payante, réseaux sociaux, contenu, email et autres canaux actifs.

### `tools_platforms`
Obligatoire : non  
Attendu : analytics, CRM, plateformes publicitaires, outils marketing.

### `previous_agency_experience`
Obligatoire : oui  
Attendu : agence actuelle/précédente, ce qui a fonctionné, ce qui a moins bien fonctionné, motif du changement.

### `internal_marketing_team`
Obligatoire : non  
Attendu : ressources internes, ce qui est géré à l'interne vs délégué.

### `primary_goal`
Obligatoire : oui  
Attendu : résultat principal recherché.

### `trigger_problem`
Obligatoire : oui  
Attendu : frustration, événement déclencheur, raison d'agir maintenant.

### `desired_measurable_results`
Obligatoire : non  
Attendu : KPI ou résultats mesurables envisagés.

### `service_sought`
Obligatoire : oui  
Attendu : service explicitement recherché ou catégorie de besoin à confirmer. Exemples : SEO, paid media, branding, stratégie, contenu, social media, CRO, email, autre.

### `budget`
Obligatoire : oui  
Attendu : fourchette mensuelle ou par projet.

### `timeline`
Obligatoire : oui  
Attendu : démarrage souhaité et niveau d'urgence.

### `decision_process`
Obligatoire : oui  
Attendu : décideur, influenceur, autres parties prenantes.

## 3. Questions imposées

À poser si l'information n'est pas déjà connue avec suffisamment de confiance :

1. « Qu'est-ce qui vous amène à chercher une nouvelle agence ou à revoir votre approche marketing en ce moment? »
2. « Travaillez-vous déjà, ou avez-vous déjà travaillé, avec une autre agence? Qu'est-ce qui a bien fonctionné, et qu'est-ce qui vous a moins convenu? »
3. « Quel résultat concret espérez-vous atteindre? »
4. « Avez-vous une fourchette budgétaire mensuelle ou par projet en tête? »
5. « Quel est votre échéancier souhaité pour démarrer? »
6. « Êtes-vous la personne qui prendra la décision finale, ou d'autres personnes seront-elles impliquées? »

### Règle de confirmation

Ne pas reposer mot pour mot une information déjà connue. Pour le budget et l'échéancier, si l'information vient d'une source externe dans une future version, faire une confirmation brève.

## 4. Sujets optionnels à explorer

Uniquement si la réponse précédente le justifie :
- raison plus profonde derrière l'objectif;
- campagne ou canal ayant échoué;
- concurrence;
- plans de croissance;
- lancement;
- expansion;
- financement;
- maturité de marque;
- cohérence des messages;
- saisonnalité;
- contraintes temporelles.

## 5. Qualification MVP

Pas de score numérique complexe.

Classement :
- `priority`;
- `follow_up`;
- `unqualified`.

Signaux :
- clarté du besoin;
- urgence;
- budget compatible;
- autorité décisionnelle;
- adéquation avec les services de l'agence.

Décision MVP : un seuil budgétaire configurable est une simplification temporaire de qualification, pas le remplacement permanent des cinq signaux ci-dessus. Sa valeur initiale est **2 500 $ CA** et l’agence peut la modifier elle-même dans les paramètres.

Règle pilote vérifiable : une fourchette dont le maximum est inférieur au seuil de l’organisation est `unqualified` lorsque tous les objectifs obligatoires sont confirmés. Une valeur de **0 $** désactive ce filtre. Une contradiction ou une information obligatoire manquante demeure `follow_up`.

Les autres signaux du Blueprint sont capturés dans le brief pour préparer l'entrevue, mais ils ne sont pas encore convertis en score pondéré dans le MVP. Avant une version commercialisée comme qualification avancée, la qualification devra réintroduire une pondération explicite des cinq signaux.

## 6. Fin de consultation

La consultation se termine lorsque tous les objectifs obligatoires sont `confirmed`.

Plafond initial recommandé : 10 à 14 questions.

Le prospect peut quitter à tout moment. Les éléments manquants sont alors marqués incomplets dans le dossier final.

## 7. Préparation de la deuxième entrevue

Le rapport final est destiné à l'agence, pas au prospect. Il doit lui permettre de préparer rapidement la prochaine conversation sans relire toutes les réponses brutes.

Le backend sélectionne de 3 à 8 sujets selon cet ordre :

1. contradictions;
2. informations obligatoires partielles ou manquantes;
3. informations optionnelles utiles mais incomplètes;
4. approfondissements de faits confirmés si moins de trois questions ont été retenues.

Chaque question conserve un sujet, une priorité et une origine déterminés par le backend. Le LLM peut reformuler la question et sa raison, mais ne peut ni changer le besoin détecté, ni ajouter une recommandation marketing. Si le LLM échoue, la formulation déterministe est utilisée.

La fiche agence affiche la raison de chaque question et peut être imprimée ou enregistrée en PDF depuis le navigateur. Les réponses brutes, traces internes et journaux d'automatisation sont exclus du document imprimé.

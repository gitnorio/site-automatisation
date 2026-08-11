# Hypothèses — Astrapio Discovery MVP

## Décisions retenues pour avancer

- La première verticale est exclusivement celle des agences marketing boutique et PME.
- Le Blueprint `Agence marketing v1` reste statique jusqu’à validation du moteur.
- FastAPI demeure l’autorité sur l’état des consultations.
- SQLite est utilisé en développement; les modèles SQLAlchemy doivent rester portables vers PostgreSQL.
- OpenAI est le premier fournisseur LLM de production, derrière une interface remplaçable.
- Le nom du modèle est fourni par variable d’environnement et n’est pas codé en dur.
- Les tests utilisent un fournisseur `mock` et ne dépendent pas du réseau.
- Le plafond par défaut est de 14 questions.
- Une intégration CRM de base et des automatisations simples font partie du produit MVP, mais le premier connecteur pilote reste à choisir.
- Le site vitrine existant peut rester accessible pendant la construction du moteur, mais son positionnement doit être remplacé avant publication du MVP.

## Décisions à confirmer

- mécanisme d’authentification de la vue agence;
- stratégie de création initiale des organisations;
- format final et durée de validité des liens publics;
- possibilité pour un prospect de reprendre une consultation sur un autre appareil;
- durée de conservation des réponses et procédure de suppression;
- critères commerciaux exacts pour `priority`, `follow_up` et `unqualified`;
- modèle LLM de production et limites de coût;
- moment de la migration vers PostgreSQL/Supabase;
- coordonnées, identité et branding des premières agences pilotes.

## Interdictions maintenues

- aucune recommandation de stratégie, canal ou budget au prospect;
- aucun jugement sur une agence actuelle ou précédente;
- aucun prix, délai ou livrable promis par l’IA;
- aucun secret LLM dans le frontend;
- aucune décision irréversible contrôlée uniquement par le modèle;
- aucun PDF, paiement, voix, avatar, multi-verticales ou orchestration complexe dans le MVP initial.

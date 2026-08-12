"""Blueprint Marketing v1 et invariants métier associés."""

from collections.abc import Mapping
from types import MappingProxyType

from app.modules.discovery.contracts import BlueprintConfig, BlueprintObjective, ObjectiveKey


MARKETING_BLUEPRINT_NAME = "Marketing Discovery Blueprint"
MARKETING_BLUEPRINT_VERSION = 1
MARKETING_BLUEPRINT_MAX_QUESTIONS = 14

EXPECTED_REQUIRED_OBJECTIVE_KEYS = frozenset(
    {
        ObjectiveKey.COMPANY_PROFILE,
        ObjectiveKey.TARGET_CUSTOMER,
        ObjectiveKey.CURRENT_CHANNELS,
        ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE,
        ObjectiveKey.PRIMARY_GOAL,
        ObjectiveKey.TRIGGER_PROBLEM,
        ObjectiveKey.SERVICE_SOUGHT,
        ObjectiveKey.BUDGET,
        ObjectiveKey.TIMELINE,
        ObjectiveKey.DECISION_PROCESS,
    }
)

EXPECTED_IMPOSED_QUESTIONS: Mapping[ObjectiveKey, str] = MappingProxyType(
    {
        ObjectiveKey.TRIGGER_PROBLEM: (
            "Qu'est-ce qui vous amène à chercher une nouvelle agence ou à revoir votre "
            "approche marketing en ce moment?"
        ),
        ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE: (
            "Travaillez-vous déjà, ou avez-vous déjà travaillé, avec une autre agence? "
            "Qu'est-ce qui a bien fonctionné, et qu'est-ce qui vous a moins convenu?"
        ),
        ObjectiveKey.PRIMARY_GOAL: "Quel résultat concret espérez-vous atteindre?",
        ObjectiveKey.BUDGET: (
            "Avez-vous une fourchette budgétaire mensuelle ou par projet en tête?"
        ),
        ObjectiveKey.TIMELINE: "Quel est votre échéancier souhaité pour démarrer?",
        ObjectiveKey.DECISION_PROCESS: (
            "Êtes-vous la personne qui prendra la décision finale, ou d'autres personnes "
            "seront-elles impliquées?"
        ),
    }
)


_MARKETING_DISCOVERY_BLUEPRINT_V1 = BlueprintConfig(
    name=MARKETING_BLUEPRINT_NAME,
    version=MARKETING_BLUEPRINT_VERSION,
    max_questions=MARKETING_BLUEPRINT_MAX_QUESTIONS,
    objectives=[
        BlueprintObjective(
            key=ObjectiveKey.COMPANY_PROFILE,
            required=True,
            expected_information="Secteur, produit ou service, taille et stade de croissance si pertinent.",
        ),
        BlueprintObjective(
            key=ObjectiveKey.TARGET_CUSTOMER,
            required=True,
            expected_information="Client idéal et segments visés.",
        ),
        BlueprintObjective(
            key=ObjectiveKey.POSITIONING_COMPETITORS,
            required=False,
            expected_information="Différenciation et concurrents perçus.",
        ),
        BlueprintObjective(
            key=ObjectiveKey.CURRENT_CHANNELS,
            required=True,
            expected_information=(
                "SEO, publicité payante, réseaux sociaux, contenu, email et autres canaux actifs."
            ),
        ),
        BlueprintObjective(
            key=ObjectiveKey.TOOLS_PLATFORMS,
            required=False,
            expected_information="Analytics, CRM, plateformes publicitaires et outils marketing.",
        ),
        BlueprintObjective(
            key=ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE,
            required=True,
            expected_information=(
                "Agence actuelle ou précédente, ce qui a fonctionné, ce qui a moins bien "
                "fonctionné et motif du changement."
            ),
            imposed_question=EXPECTED_IMPOSED_QUESTIONS[
                ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE
            ],
        ),
        BlueprintObjective(
            key=ObjectiveKey.INTERNAL_MARKETING_TEAM,
            required=False,
            expected_information="Ressources internes et partage entre ce qui est géré à l'interne et délégué.",
        ),
        BlueprintObjective(
            key=ObjectiveKey.PRIMARY_GOAL,
            required=True,
            expected_information="Résultat principal recherché.",
            imposed_question=EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.PRIMARY_GOAL],
        ),
        BlueprintObjective(
            key=ObjectiveKey.TRIGGER_PROBLEM,
            required=True,
            expected_information="Frustration, événement déclencheur et raison d'agir maintenant.",
            imposed_question=EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.TRIGGER_PROBLEM],
        ),
        BlueprintObjective(
            key=ObjectiveKey.DESIRED_MEASURABLE_RESULTS,
            required=False,
            expected_information="KPI ou résultats mesurables envisagés.",
        ),
        BlueprintObjective(
            key=ObjectiveKey.SERVICE_SOUGHT,
            required=True,
            expected_information=(
                "Service explicitement recherché ou catégorie de besoin à confirmer, comme "
                "SEO, paid media, branding, stratégie, contenu, social media, CRO, email ou autre."
            ),
        ),
        BlueprintObjective(
            key=ObjectiveKey.BUDGET,
            required=True,
            expected_information="Fourchette mensuelle ou par projet.",
            imposed_question=EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.BUDGET],
        ),
        BlueprintObjective(
            key=ObjectiveKey.TIMELINE,
            required=True,
            expected_information="Démarrage souhaité et niveau d'urgence.",
            imposed_question=EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.TIMELINE],
        ),
        BlueprintObjective(
            key=ObjectiveKey.DECISION_PROCESS,
            required=True,
            expected_information="Décideur, influenceur et autres parties prenantes.",
            imposed_question=EXPECTED_IMPOSED_QUESTIONS[ObjectiveKey.DECISION_PROCESS],
        ),
    ],
)


def get_marketing_discovery_blueprint() -> BlueprintConfig:
    """Retourne une copie afin de préserver la configuration canonique."""

    return _MARKETING_DISCOVERY_BLUEPRINT_V1.model_copy(deep=True)


def required_objective_keys(blueprint: BlueprintConfig) -> frozenset[ObjectiveKey]:
    return frozenset(objective.key for objective in blueprint.objectives if objective.required)


def imposed_question_objectives(blueprint: BlueprintConfig) -> tuple[BlueprintObjective, ...]:
    return tuple(
        objective for objective in blueprint.objectives if objective.imposed_question is not None
    )


def validate_marketing_blueprint_v1(blueprint: BlueprintConfig) -> None:
    """Valide les invariants non négociables du Blueprint Marketing v1."""

    objective_keys = [objective.key for objective in blueprint.objectives]
    unique_objective_keys = set(objective_keys)

    if blueprint.name != MARKETING_BLUEPRINT_NAME:
        raise ValueError("Le Blueprint Marketing v1 doit conserver son nom canonique.")
    if blueprint.version != MARKETING_BLUEPRINT_VERSION:
        raise ValueError("Le Blueprint Marketing v1 doit conserver la version 1.")
    if blueprint.max_questions != MARKETING_BLUEPRINT_MAX_QUESTIONS:
        raise ValueError("Le Blueprint Marketing v1 doit plafonner la consultation à 14 questions.")
    if len(unique_objective_keys) != len(objective_keys):
        raise ValueError("Chaque objectif du Blueprint doit avoir une clé unique.")
    if len(objective_keys) != len(ObjectiveKey):
        raise ValueError("Le Blueprint doit couvrir exactement les 14 objectifs Discovery.")
    if unique_objective_keys != set(ObjectiveKey):
        raise ValueError("Le Blueprint ne correspond pas aux clés d'objectifs Discovery.")

    if required_objective_keys(blueprint) != EXPECTED_REQUIRED_OBJECTIVE_KEYS:
        raise ValueError("Les objectifs obligatoires du Blueprint Marketing v1 sont incorrects.")

    imposed_questions = {
        objective.key: objective.imposed_question
        for objective in imposed_question_objectives(blueprint)
    }
    if imposed_questions != dict(EXPECTED_IMPOSED_QUESTIONS):
        raise ValueError(
            "Les six questions imposées doivent correspondre exactement à leur objectif."
        )


validate_marketing_blueprint_v1(_MARKETING_DISCOVERY_BLUEPRINT_V1)

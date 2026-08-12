import pytest

from app.modules.discovery.blueprint import (
    EXPECTED_IMPOSED_QUESTIONS,
    EXPECTED_REQUIRED_OBJECTIVE_KEYS,
    MARKETING_BLUEPRINT_MAX_QUESTIONS,
    MARKETING_BLUEPRINT_NAME,
    MARKETING_BLUEPRINT_VERSION,
    get_marketing_discovery_blueprint,
    imposed_question_objectives,
    required_objective_keys,
    validate_marketing_blueprint_v1,
)
from app.modules.discovery.contracts import BlueprintConfig, ObjectiveKey


EXPECTED_OBJECTIVES = (
    (
        ObjectiveKey.COMPANY_PROFILE,
        True,
        "Secteur, produit ou service, taille et stade de croissance si pertinent.",
    ),
    (ObjectiveKey.TARGET_CUSTOMER, True, "Client idéal et segments visés."),
    (
        ObjectiveKey.POSITIONING_COMPETITORS,
        False,
        "Différenciation et concurrents perçus.",
    ),
    (
        ObjectiveKey.CURRENT_CHANNELS,
        True,
        "SEO, publicité payante, réseaux sociaux, contenu, email et autres canaux actifs.",
    ),
    (
        ObjectiveKey.TOOLS_PLATFORMS,
        False,
        "Analytics, CRM, plateformes publicitaires et outils marketing.",
    ),
    (
        ObjectiveKey.PREVIOUS_AGENCY_EXPERIENCE,
        True,
        "Agence actuelle ou précédente, ce qui a fonctionné, ce qui a moins bien "
        "fonctionné et motif du changement.",
    ),
    (
        ObjectiveKey.INTERNAL_MARKETING_TEAM,
        False,
        "Ressources internes et partage entre ce qui est géré à l'interne et délégué.",
    ),
    (ObjectiveKey.PRIMARY_GOAL, True, "Résultat principal recherché."),
    (
        ObjectiveKey.TRIGGER_PROBLEM,
        True,
        "Frustration, événement déclencheur et raison d'agir maintenant.",
    ),
    (
        ObjectiveKey.DESIRED_MEASURABLE_RESULTS,
        False,
        "KPI ou résultats mesurables envisagés.",
    ),
    (
        ObjectiveKey.SERVICE_SOUGHT,
        True,
        "Service explicitement recherché ou catégorie de besoin à confirmer, comme "
        "SEO, paid media, branding, stratégie, contenu, social media, CRO, email ou autre.",
    ),
    (ObjectiveKey.BUDGET, True, "Fourchette mensuelle ou par projet."),
    (ObjectiveKey.TIMELINE, True, "Démarrage souhaité et niveau d'urgence."),
    (
        ObjectiveKey.DECISION_PROCESS,
        True,
        "Décideur, influenceur et autres parties prenantes.",
    ),
)


def test_marketing_blueprint_matches_the_complete_business_specification() -> None:
    blueprint = get_marketing_discovery_blueprint()

    assert blueprint.name == MARKETING_BLUEPRINT_NAME
    assert blueprint.vertical == "marketing_agency"
    assert blueprint.version == MARKETING_BLUEPRINT_VERSION
    assert blueprint.max_questions == MARKETING_BLUEPRINT_MAX_QUESTIONS
    assert tuple(
        (objective.key, objective.required, objective.expected_information)
        for objective in blueprint.objectives
    ) == EXPECTED_OBJECTIVES


def test_marketing_blueprint_identifies_the_exact_required_objectives() -> None:
    blueprint = get_marketing_discovery_blueprint()

    assert required_objective_keys(blueprint) == EXPECTED_REQUIRED_OBJECTIVE_KEYS


def test_marketing_blueprint_maps_each_imposed_question_to_its_objective() -> None:
    blueprint = get_marketing_discovery_blueprint()

    assert {
        objective.key: objective.imposed_question
        for objective in imposed_question_objectives(blueprint)
    } == dict(EXPECTED_IMPOSED_QUESTIONS)


def test_blueprint_getter_protects_the_canonical_configuration() -> None:
    modified_blueprint = get_marketing_discovery_blueprint()
    modified_blueprint.objectives[0].required = False
    untouched_blueprint = get_marketing_discovery_blueprint()

    assert untouched_blueprint.objectives[0].required is True


def test_marketing_blueprint_is_valid() -> None:
    validate_marketing_blueprint_v1(get_marketing_discovery_blueprint())


def test_validation_rejects_a_missing_objective() -> None:
    blueprint = get_marketing_discovery_blueprint()
    incomplete_blueprint = BlueprintConfig(
        name=blueprint.name,
        version=blueprint.version,
        max_questions=blueprint.max_questions,
        objectives=blueprint.objectives[:-1],
    )

    with pytest.raises(ValueError, match="14 objectifs"):
        validate_marketing_blueprint_v1(incomplete_blueprint)


def test_validation_rejects_a_duplicate_objective() -> None:
    blueprint = get_marketing_discovery_blueprint()
    duplicated_blueprint = BlueprintConfig(
        name=blueprint.name,
        version=blueprint.version,
        max_questions=blueprint.max_questions,
        objectives=[*blueprint.objectives[:-1], blueprint.objectives[0]],
    )

    with pytest.raises(ValueError, match="clé unique"):
        validate_marketing_blueprint_v1(duplicated_blueprint)


def test_validation_rejects_an_incorrect_required_objective() -> None:
    blueprint = get_marketing_discovery_blueprint()
    company_profile = next(
        objective
        for objective in blueprint.objectives
        if objective.key == ObjectiveKey.COMPANY_PROFILE
    )
    company_profile.required = False

    with pytest.raises(ValueError, match="objectifs obligatoires"):
        validate_marketing_blueprint_v1(blueprint)


def test_validation_rejects_an_imposed_question_on_the_wrong_objective() -> None:
    blueprint = get_marketing_discovery_blueprint()
    objectives_by_key = {objective.key: objective for objective in blueprint.objectives}
    trigger_problem = objectives_by_key[ObjectiveKey.TRIGGER_PROBLEM]
    company_profile = objectives_by_key[ObjectiveKey.COMPANY_PROFILE]

    company_profile.imposed_question = trigger_problem.imposed_question
    trigger_problem.imposed_question = None

    with pytest.raises(ValueError, match="correspondre exactement"):
        validate_marketing_blueprint_v1(blueprint)


@pytest.mark.parametrize(
    ("field", "value", "message"),
    [
        ("name", "Blueprint modifié", "nom canonique"),
        ("version", 2, "version 1"),
        ("max_questions", 13, "14 questions"),
    ],
)
def test_validation_rejects_incorrect_blueprint_metadata(
    field: str,
    value: str | int,
    message: str,
) -> None:
    blueprint = get_marketing_discovery_blueprint().model_copy(update={field: value})

    with pytest.raises(ValueError, match=message):
        validate_marketing_blueprint_v1(blueprint)

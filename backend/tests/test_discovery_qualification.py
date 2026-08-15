import pytest

from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.contracts import (
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
    QualificationLevel,
)
from app.modules.discovery.qualification import qualify_consultation


def completed_required_objectives(
    budget_value: dict[str, object],
) -> list[ObjectiveSnapshot]:
    return [
        ObjectiveSnapshot(
            key=objective.key,
            required=objective.required,
            state=(
                ObjectiveState.CONFIRMED
                if objective.required
                else ObjectiveState.UNKNOWN
            ),
            value=(
                budget_value
                if objective.key == ObjectiveKey.BUDGET
                else {"answer": "Information confirmée"}
                if objective.required
                else None
            ),
            confidence=0.95 if objective.required else None,
        )
        for objective in get_marketing_discovery_blueprint().objectives
    ]


@pytest.mark.parametrize(
    "budget_value",
    [
        {"answer": "500 $ à 1 000 $ CA par mois"},
        {"range": "1,000-2,000 CAD"},
        {"minimum": 750, "maximum": 2_000},
    ],
)
def test_budget_below_mvp_threshold_is_unqualified(
    budget_value: dict[str, object],
) -> None:
    qualification = qualify_consultation(completed_required_objectives(budget_value))

    assert qualification.level == QualificationLevel.UNQUALIFIED


def test_budget_at_mvp_threshold_is_compatible() -> None:
    qualification = qualify_consultation(
        completed_required_objectives({"answer": "2.5k $ CA par mois"})
    )

    assert qualification.level == QualificationLevel.PRIORITY


def test_organization_can_raise_its_budget_threshold() -> None:
    qualification = qualify_consultation(
        completed_required_objectives({"answer": "4 000 $ à 6 000 $ CA par mois"}),
        minimum_budget_cad=7_500,
    )

    assert qualification.level == QualificationLevel.UNQUALIFIED
    assert "7 500 $ CA" in qualification.reasons[0]


def test_zero_disables_budget_disqualification() -> None:
    qualification = qualify_consultation(
        completed_required_objectives({"answer": "500 $ à 1 000 $ CA par mois"}),
        minimum_budget_cad=0,
    )

    assert qualification.level == QualificationLevel.PRIORITY


def test_missing_required_information_takes_priority_over_low_budget() -> None:
    objectives = completed_required_objectives({"answer": "1 000 $ CA par mois"})
    company = next(
        objective for objective in objectives if objective.key == ObjectiveKey.COMPANY_PROFILE
    )
    company.state = ObjectiveState.INCOMPLETE
    company.value = None

    qualification = qualify_consultation(objectives)

    assert qualification.level == QualificationLevel.FOLLOW_UP

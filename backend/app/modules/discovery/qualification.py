"""Qualification déterministe des consultations Discovery."""

import re
from collections.abc import Iterator

from app.modules.discovery.contracts import (
    ObjectiveKey,
    ObjectiveSnapshot,
    ObjectiveState,
    QualificationBrief,
    QualificationLevel,
)


MARKETING_MVP_MINIMUM_BUDGET_CAD = 2_500


def qualify_consultation(
    objectives: list[ObjectiveSnapshot],
) -> QualificationBrief:
    required = [objective for objective in objectives if objective.required]
    contradictions = [
        objective for objective in required if objective.state == ObjectiveState.CONTRADICTION
    ]
    missing = [
        objective
        for objective in required
        if objective.state
        in {ObjectiveState.UNKNOWN, ObjectiveState.PARTIAL, ObjectiveState.INCOMPLETE}
    ]
    if contradictions:
        return QualificationBrief(
            level=QualificationLevel.FOLLOW_UP,
            reasons=["Une information obligatoire contradictoire doit être clarifiée."],
        )
    if missing:
        return QualificationBrief(
            level=QualificationLevel.FOLLOW_UP,
            reasons=["La qualification contient encore des informations obligatoires manquantes."],
        )
    if _has_incompatible_budget(required):
        return QualificationBrief(
            level=QualificationLevel.UNQUALIFIED,
            reasons=[
                "Le budget maximal indiqué est inférieur au seuil MVP de 2 500 $ CA."
            ],
        )
    return QualificationBrief(
        level=QualificationLevel.PRIORITY,
        reasons=["Tous les objectifs obligatoires du Blueprint sont confirmés."],
    )


def _has_incompatible_budget(objectives: list[ObjectiveSnapshot]) -> bool:
    budget = next(
        (objective for objective in objectives if objective.key == ObjectiveKey.BUDGET),
        None,
    )
    if (
        budget is None
        or budget.state != ObjectiveState.CONFIRMED
        or budget.value is None
    ):
        return False
    amounts = [
        amount
        for value in _iter_budget_values(budget.value)
        for amount in _extract_budget_amounts(value)
    ]
    return bool(amounts) and max(amounts) < MARKETING_MVP_MINIMUM_BUDGET_CAD


def _iter_budget_values(value: object) -> Iterator[object]:
    if isinstance(value, dict):
        for child in value.values():
            yield from _iter_budget_values(child)
    elif isinstance(value, list):
        for child in value:
            yield from _iter_budget_values(child)
    else:
        yield value


def _extract_budget_amounts(answer: object) -> list[float]:
    if isinstance(answer, (int, float)) and not isinstance(answer, bool):
        return [float(answer)]
    if not isinstance(answer, str):
        return []

    amounts: list[float] = []
    pattern = re.compile(
        r"(?<!\w)(\d{1,3}(?:[\s\u00a0.,]\d{3})+|\d+(?:[.,]\d+)?)\s*([kK])?"
    )
    for raw_amount, thousands_suffix in pattern.findall(answer):
        compact = raw_amount.replace(" ", "").replace("\u00a0", "")
        if thousands_suffix:
            amounts.append(float(compact.replace(",", ".")) * 1_000)
            continue
        if re.search(r"[.,]\d{3}$", compact):
            compact = compact.replace(",", "").replace(".", "")
        else:
            compact = compact.replace(",", ".")
        amounts.append(float(compact))
    return amounts

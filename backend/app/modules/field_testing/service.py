"""Calcul des indicateurs terrain et enregistrement des revues humaines."""

from collections.abc import Callable, Iterable
from statistics import mean, median
from typing import TypeVar

from app.modules.discovery.contracts import (
    ConsultationStatus,
    MarketingDiscoveryBrief,
)
from app.modules.discovery.models import ConsultationModel
from app.modules.field_testing.contracts import (
    FieldTestConsultationSummary,
    FieldTestDashboard,
    FieldTestMetrics,
    FieldTestReview,
    FieldTestReviewInput,
)
from app.modules.field_testing.models import FieldTestReviewModel
from app.modules.field_testing.repository import FieldTestRepository


ResultT = TypeVar("ResultT")


class FieldTestService:
    def __init__(self, repository: FieldTestRepository) -> None:
        self.repository = repository

    def dashboard(self) -> FieldTestDashboard:
        records = self.repository.list_consultations()
        summaries = [self._summary(record) for record in records]
        reviews = [record.field_test_review for record in records if record.field_test_review]
        live_reviews = [review for review in reviews if review.observed_live]
        started = [record for record in records if record.started_at is not None]
        completed = [
            record for record in records if record.status == ConsultationStatus.COMPLETED
        ]
        abandoned = [
            record for record in records if record.status == ConsultationStatus.ABANDONED
        ]
        durations = [
            duration
            for record in records
            if (duration := _duration_seconds(record)) is not None
        ]
        answered_counts = [
            sum(turn.answered_at is not None for turn in record.turns)
            for record in started
        ]
        return FieldTestDashboard(
            metrics=FieldTestMetrics(
                invitations=len(records),
                started=len(started),
                completed=len(completed),
                abandoned=len(abandoned),
                active=sum(
                    record.status == ConsultationStatus.IN_PROGRESS for record in records
                ),
                start_rate=_percentage(len(started), len(records)),
                completion_rate=_percentage(len(completed), len(started)),
                abandonment_rate=_percentage(len(abandoned), len(started)),
                median_duration_seconds=(
                    round(median(durations)) if durations else None
                ),
                average_answered_questions=(
                    round(mean(answered_counts), 1) if answered_counts else 0
                ),
                reviewed_briefs=len(reviews),
                observed_live=len(live_reviews),
                average_brief_usefulness=_average(
                    review.brief_usefulness for review in reviews
                ),
                useful_brief_rate=_boolean_rate(
                    review.brief_usefulness >= 4 for review in reviews
                ),
                agency_adoption_rate=_boolean_rate(
                    review.agency_would_use for review in reviews
                ),
                understood_without_help_rate=_optional_boolean_rate(
                    review.prospect_understood_without_help for review in live_reviews
                ),
                conversational_experience_rate=_optional_boolean_rate(
                    _invert(review.felt_like_static_form) for review in live_reviews
                ),
                no_repetition_rate=_optional_boolean_rate(
                    _invert(review.obvious_repetition) for review in live_reviews
                ),
                relevant_follow_ups_rate=_optional_boolean_rate(
                    review.follow_ups_relevant for review in live_reviews
                ),
                guardrail_compliance_rate=_optional_boolean_rate(
                    _invert(review.guardrail_issue) for review in live_reviews
                ),
            ),
            consultations=summaries,
        )

    def save_review(
        self,
        consultation_id: str,
        review: FieldTestReviewInput,
    ) -> FieldTestReview:
        record = self._commit(
            lambda: self.repository.upsert_review(consultation_id, review)
        )
        return field_test_review_from_model(record)

    def _summary(self, record: ConsultationModel) -> FieldTestConsultationSummary:
        brief = (
            MarketingDiscoveryBrief.model_validate(record.brief.brief_json)
            if record.brief
            else None
        )
        return FieldTestConsultationSummary(
            id=record.id,
            organization_name=record.organization.name,
            status=ConsultationStatus(record.status),
            qualification=brief.qualification.level if brief else None,
            created_at=record.created_at,
            started_at=record.started_at,
            completed_at=record.completed_at,
            duration_seconds=_duration_seconds(record),
            answered_questions=sum(
                turn.answered_at is not None for turn in record.turns
            ),
            review=(
                field_test_review_from_model(record.field_test_review)
                if record.field_test_review
                else None
            ),
        )

    def _commit(self, operation: Callable[[], ResultT]) -> ResultT:
        try:
            result = operation()
            self.repository.commit()
            return result
        except Exception:
            self.repository.rollback()
            raise


def field_test_review_from_model(record: FieldTestReviewModel) -> FieldTestReview:
    return FieldTestReview(
        id=record.id,
        consultation_id=record.consultation_id,
        reviewer_role=record.reviewer_role,
        observed_live=record.observed_live,
        prospect_understood_without_help=record.prospect_understood_without_help,
        felt_like_static_form=record.felt_like_static_form,
        obvious_repetition=record.obvious_repetition,
        follow_ups_relevant=record.follow_ups_relevant,
        guardrail_issue=record.guardrail_issue,
        brief_usefulness=record.brief_usefulness,
        brief_preparedness=record.brief_preparedness,
        agency_would_use=record.agency_would_use,
        notes=record.notes,
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


def _duration_seconds(record: ConsultationModel) -> int | None:
    if record.started_at is None or record.completed_at is None:
        return None
    return max(0, round((record.completed_at - record.started_at).total_seconds()))


def _percentage(numerator: int, denominator: int) -> float:
    return round((numerator / denominator) * 100, 1) if denominator else 0


def _average(values: Iterable[int]) -> float | None:
    collected = list(values)
    return round(mean(collected), 1) if collected else None


def _boolean_rate(values: Iterable[bool]) -> float | None:
    collected = list(values)
    return _percentage(sum(collected), len(collected)) if collected else None


def _optional_boolean_rate(values: Iterable[bool | None]) -> float | None:
    collected = [value for value in values if value is not None]
    return _boolean_rate(collected)


def _invert(value: bool | None) -> bool | None:
    return not value if value is not None else None

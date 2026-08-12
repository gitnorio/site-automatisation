"""Persistance des revues terrain et lecture des consultations mesurées."""

from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.discovery.models import ConsultationModel
from app.modules.discovery.repository import DiscoveryRecordNotFoundError
from app.modules.field_testing.contracts import FieldTestReviewInput
from app.modules.field_testing.models import FieldTestReviewModel


class FieldTestRepository(Protocol):
    def list_consultations(self) -> list[ConsultationModel]: ...

    def upsert_review(
        self,
        consultation_id: str,
        review: FieldTestReviewInput,
    ) -> FieldTestReviewModel: ...

    def commit(self) -> None: ...

    def rollback(self) -> None: ...


class SqlAlchemyFieldTestRepository:
    def __init__(self, database: Session) -> None:
        self.database = database

    def list_consultations(self) -> list[ConsultationModel]:
        statement = (
            select(ConsultationModel)
            .options(
                selectinload(ConsultationModel.organization),
                selectinload(ConsultationModel.brief),
                selectinload(ConsultationModel.turns),
                selectinload(ConsultationModel.field_test_review),
            )
            .order_by(ConsultationModel.created_at.desc())
        )
        return list(self.database.scalars(statement).all())

    def upsert_review(
        self,
        consultation_id: str,
        review: FieldTestReviewInput,
    ) -> FieldTestReviewModel:
        consultation = self.database.get(ConsultationModel, consultation_id)
        if consultation is None:
            raise DiscoveryRecordNotFoundError("Consultation introuvable.")
        if consultation.brief is None:
            raise ValueError("Une revue terrain exige un brief final.")

        statement = select(FieldTestReviewModel).where(
            FieldTestReviewModel.consultation_id == consultation_id
        )
        record = self.database.scalar(statement)
        values = review.model_dump()
        if record is None:
            record = FieldTestReviewModel(
                consultation_id=consultation_id,
                **values,
            )
            self.database.add(record)
        else:
            for field, value in values.items():
                setattr(record, field, value)
        self.database.flush()
        return record

    def commit(self) -> None:
        self.database.commit()

    def rollback(self) -> None:
        self.database.rollback()

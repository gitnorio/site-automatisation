from typing import Protocol

from sqlalchemy.orm import Session

from app.models.contact import ContactRequestModel
from app.schemas.contact import ContactRequest


class ContactRepository(Protocol):
    def create(self, request: ContactRequest) -> ContactRequestModel: ...


class SqlAlchemyContactRepository:
    def __init__(self, database: Session) -> None:
        self.database = database

    def create(self, request: ContactRequest) -> ContactRequestModel:
        record = ContactRequestModel(
            **request.model_dump(
                exclude={"website"}, by_alias=False, mode="json"
            )
        )
        self.database.add(record)
        self.database.commit()
        self.database.refresh(record)
        return record


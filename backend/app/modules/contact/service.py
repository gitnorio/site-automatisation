from app.modules.contact.model import ContactRequestModel
from app.modules.contact.repository import ContactRepository
from app.modules.contact.schemas import ContactRequest


class ContactService:
    def __init__(self, repository: ContactRepository) -> None:
        self.repository = repository

    def submit(self, request: ContactRequest) -> ContactRequestModel:
        return self.repository.create(request)

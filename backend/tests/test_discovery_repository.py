import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.modules.discovery.blueprint import get_marketing_discovery_blueprint
from app.modules.discovery.contracts import (
    CompanyBrief,
    ConsultationStatus,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ObjectiveSource,
    ObjectiveState,
    QualificationBrief,
    QualificationLevel,
    ResponseType,
)
from app.modules.discovery.models import (
    ConsultationModel,
    ConsultationObjectiveModel,
    ConsultationTurnModel,
    DiscoveryBriefModel,
)
from app.modules.discovery.repository import SqlAlchemyDiscoveryRepository
from app.modules.discovery.service import DiscoveryService
from app.modules.discovery.state import ConsultationStopReason, ObjectiveUpdate


@pytest.fixture
def database(clean_database: None) -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def discovery_service(database: Session) -> DiscoveryService:
    repository = SqlAlchemyDiscoveryRepository(database)
    return DiscoveryService(repository)


def create_consultation(service: DiscoveryService) -> ConsultationModel:
    organization = service.create_organization("Agence Boréale")
    blueprint = service.create_blueprint(
        organization.id,
        get_marketing_discovery_blueprint(),
    )
    return service.create_consultation(organization.id, blueprint.id)


def test_consultation_creation_persists_the_blueprint_objectives(
    discovery_service: DiscoveryService,
    database: Session,
) -> None:
    consultation = create_consultation(discovery_service)

    objectives = database.scalars(
        select(ConsultationObjectiveModel).where(
            ConsultationObjectiveModel.consultation_id == consultation.id
        )
    ).all()

    assert consultation.status == ConsultationStatus.NOT_STARTED.value
    assert consultation.question_count == 0
    assert len(objectives) == 14
    assert sum(objective.required for objective in objectives) == 10
    assert all(objective.state == ObjectiveState.UNKNOWN.value for objective in objectives)


def test_answering_a_turn_persists_raw_answer_and_structured_update(
    discovery_service: DiscoveryService,
    database: Session,
) -> None:
    consultation = create_consultation(discovery_service)
    discovery_service.start(consultation.id)
    turn = discovery_service.ask_question(
        consultation.id,
        target_objective=ObjectiveKey.TRIGGER_PROBLEM,
        question="Pourquoi cherchez-vous une agence maintenant?",
        response_type=ResponseType.TEXT,
    )

    state = discovery_service.answer_question(
        consultation.id,
        turn.id,
        raw_answer="Notre coût d'acquisition augmente depuis trois mois.",
        updates=(
            ObjectiveUpdate(
                key=ObjectiveKey.TRIGGER_PROBLEM,
                state=ObjectiveState.CONFIRMED,
                value={"problem": "Coût d'acquisition en hausse"},
                confidence=0.95,
            ),
        ),
    )

    persisted_turn = database.get(ConsultationTurnModel, turn.id)
    objective = database.scalar(
        select(ConsultationObjectiveModel).where(
            ConsultationObjectiveModel.consultation_id == consultation.id,
            ConsultationObjectiveModel.objective_key == ObjectiveKey.TRIGGER_PROBLEM.value,
        )
    )
    assert state.status == ConsultationStatus.IN_PROGRESS
    assert persisted_turn is not None
    assert persisted_turn.raw_answer == "Notre coût d'acquisition augmente depuis trois mois."
    assert persisted_turn.answered_at is not None
    assert objective is not None
    assert objective.state == ObjectiveState.CONFIRMED.value
    assert objective.source == ObjectiveSource.ANSWER.value


def test_abandon_is_persisted_with_system_incomplete_states(
    discovery_service: DiscoveryService,
    database: Session,
) -> None:
    consultation = create_consultation(discovery_service)
    discovery_service.start(consultation.id)

    state = discovery_service.abandon(consultation.id)

    persisted = database.get(ConsultationModel, consultation.id)
    objectives = database.scalars(
        select(ConsultationObjectiveModel).where(
            ConsultationObjectiveModel.consultation_id == consultation.id
        )
    ).all()
    assert state.stop_reason == ConsultationStopReason.PROSPECT_ABANDONED
    assert persisted is not None
    assert persisted.status == ConsultationStatus.ABANDONED.value
    assert persisted.stop_reason == ConsultationStopReason.PROSPECT_ABANDONED.value
    assert persisted.completed_at is not None
    assert all(objective.state == ObjectiveState.INCOMPLETE.value for objective in objectives)
    assert all(objective.source == ObjectiveSource.SYSTEM.value for objective in objectives)


def test_brief_can_only_be_persisted_after_consultation_ends(
    discovery_service: DiscoveryService,
    database: Session,
) -> None:
    consultation = create_consultation(discovery_service)
    brief = MarketingDiscoveryBrief(
        company=CompanyBrief(sector="Services professionnels"),
        qualification=QualificationBrief(
            level=QualificationLevel.FOLLOW_UP,
            reasons=["Consultation interrompue avant la qualification complète."],
        ),
    )

    with pytest.raises(ValueError, match="après la fin"):
        discovery_service.create_brief(consultation.id, brief)

    discovery_service.abandon(consultation.id)
    record = discovery_service.create_brief(consultation.id, brief)

    persisted = database.get(DiscoveryBriefModel, record.id)
    assert persisted is not None
    assert persisted.brief_json["company"]["sector"] == "Services professionnels"

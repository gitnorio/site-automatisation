"""Boucle applicative de la consultation publique."""

import logging

from app.modules.discovery.contracts import (
    BriefInput,
    ConsultationStatus,
    DecisionInput,
    EngineAction,
    ExtractionInput,
    MarketingDiscoveryBrief,
    ObjectiveKey,
    ResponseType,
)
from app.modules.automation.contracts import AutomationDispatchInput
from app.modules.automation.service import AutomationService
from app.modules.discovery.models import ConsultationTurnModel
from app.modules.discovery.orchestrator import (
    DiscoveryLLMExhaustedError,
    DiscoveryOrchestrator,
)
from app.modules.discovery.repository import DiscoveryRepository
from app.modules.discovery.schemas import (
    AnswerValue,
    PublicChoice,
    PublicConsultation,
    PublicQuestion,
)
from app.modules.discovery.service import DiscoveryService
from app.modules.discovery.state import ConsultationState, ObjectiveUpdate


logger = logging.getLogger(__name__)


class PublicConsultationConflictError(ValueError):
    pass


class PublicConsultationFlow:
    def __init__(
        self,
        repository: DiscoveryRepository,
        orchestrator: DiscoveryOrchestrator,
        automation_service: AutomationService | None = None,
    ) -> None:
        self.repository = repository
        self.orchestrator = orchestrator
        self.automation_service = automation_service
        self.service = DiscoveryService(repository)

    async def get(self, consultation_id: str) -> PublicConsultation:
        state = self.repository.load_state(consultation_id)
        if state.status == ConsultationStatus.IN_PROGRESS:
            return await self._advance(consultation_id, state)
        return self._build_response(consultation_id, state)

    async def start(self, consultation_id: str) -> PublicConsultation:
        state = self.repository.load_state(consultation_id)
        if state.status == ConsultationStatus.NOT_STARTED:
            state = self.service.start(consultation_id)
        if state.status == ConsultationStatus.IN_PROGRESS:
            return await self._advance(consultation_id, state)
        return self._build_response(consultation_id, state)

    async def answer(
        self,
        consultation_id: str,
        *,
        turn_id: str,
        answer: AnswerValue,
    ) -> PublicConsultation:
        state = self.repository.load_state(consultation_id)
        if state.status != ConsultationStatus.IN_PROGRESS:
            raise PublicConsultationConflictError(
                "Cette consultation n'accepte plus de réponse."
            )

        turn = self.repository.get_turn(consultation_id, turn_id)
        if turn.answered_at is not None:
            if turn.raw_answer != answer:
                raise PublicConsultationConflictError(
                    "Cette question possède déjà une réponse différente."
                )
            return await self._advance(consultation_id, state)

        pending_turn = self.repository.get_pending_turn(consultation_id)
        if pending_turn is None or pending_turn.id != turn.id:
            raise PublicConsultationConflictError(
                "Cette question n'est plus la question active."
            )

        extraction = await self.orchestrator.extract_answer(
            ExtractionInput(
                consultation_id=consultation_id,
                target_objective=ObjectiveKey(turn.target_objective),
                question=turn.question,
                answer=answer,
                objectives=list(state.objectives),
            )
        )
        state = self.service.answer_question(
            consultation_id,
            turn.id,
            raw_answer=answer,
            updates=tuple(
                ObjectiveUpdate(
                    key=update.objective,
                    state=update.state,
                    value=update.value,
                    confidence=update.confidence,
                )
                for update in extraction.updates
            ),
        )
        return await self._advance(consultation_id, state)

    async def abandon(self, consultation_id: str) -> PublicConsultation:
        state = self.repository.load_state(consultation_id)
        if state.status in {
            ConsultationStatus.NOT_STARTED,
            ConsultationStatus.IN_PROGRESS,
        }:
            state = self.service.abandon(consultation_id)
        await self._try_create_brief(consultation_id, state)
        return self._build_response(consultation_id, state)

    async def _advance(
        self,
        consultation_id: str,
        state: ConsultationState,
    ) -> PublicConsultation:
        if state.status != ConsultationStatus.IN_PROGRESS:
            await self._try_create_brief(consultation_id, state)
            return self._build_response(consultation_id, state)

        pending_turn = self.repository.get_pending_turn(consultation_id)
        if pending_turn is None:
            decision = await self.orchestrator.decide_next_step(
                DecisionInput(
                    consultation_id=consultation_id,
                    question_count=state.question_count,
                    max_questions=state.max_questions,
                    objectives=list(state.objectives),
                )
            )
            if decision.action != EngineAction.ASK:
                raise RuntimeError(
                    "Le moteur a terminé une consultation encore active."
                )
            pending_turn = self.service.ask_question(
                consultation_id,
                target_objective=ObjectiveKey(decision.target_objective),
                question=str(decision.question),
                response_type=ResponseType(decision.response_type),
                choices=tuple(decision.choices),
            )
            state = self.repository.load_state(consultation_id)
        return self._build_response(consultation_id, state, pending_turn)

    async def _try_create_brief(
        self,
        consultation_id: str,
        state: ConsultationState,
    ) -> None:
        existing = self.repository.get_brief(consultation_id)
        consultation = self.repository.get_consultation(consultation_id)
        brief: MarketingDiscoveryBrief | None = None
        if existing is not None:
            brief = MarketingDiscoveryBrief.model_validate(existing.brief_json)
        else:
            try:
                brief = await self.orchestrator.generate_brief(
                    BriefInput(
                        consultation_id=consultation_id,
                        completed_at=consultation.completed_at,
                        minimum_qualifying_budget_cad=(
                            consultation.organization.minimum_qualifying_budget_cad
                        ),
                        objectives=list(state.objectives),
                    )
                )
                self.service.create_brief(consultation_id, brief)
            except DiscoveryLLMExhaustedError:
                logger.exception(
                    "discovery_brief_deferred consultation_id=%s",
                    consultation_id,
                )
        if brief is not None:
            await self._try_dispatch_automation(consultation_id, brief)

    async def _try_dispatch_automation(
        self,
        consultation_id: str,
        brief: MarketingDiscoveryBrief,
    ) -> None:
        if self.automation_service is None:
            return
        consultation = self.repository.get_consultation(consultation_id)
        try:
            await self.automation_service.dispatch(
                AutomationDispatchInput(
                    consultation_id=consultation_id,
                    organization_id=consultation.organization_id,
                    organization_name=consultation.organization.name,
                    consultation_status=consultation.status,
                    completed_at=consultation.completed_at,
                    brief=brief,
                )
            )
        except Exception:
            logger.exception(
                "automation_dispatch_isolated consultation_id=%s",
                consultation_id,
            )

    def _build_response(
        self,
        consultation_id: str,
        state: ConsultationState,
        turn: ConsultationTurnModel | None = None,
    ) -> PublicConsultation:
        consultation = self.repository.get_consultation(consultation_id)
        question = self._question(turn, state.max_questions) if turn else None
        return PublicConsultation(
            consultation_id=consultation_id,
            organization_name=consultation.organization.name,
            status=state.status,
            question=question,
            message=_status_message(state.status),
        )

    def _question(
        self,
        turn: ConsultationTurnModel,
        maximum: int,
    ) -> PublicQuestion:
        return PublicQuestion(
            turn_id=turn.id,
            number=turn.turn_index,
            maximum=maximum,
            prompt=turn.question,
            response_type=ResponseType(turn.response_type),
            choices=[
                PublicChoice.model_validate(choice)
                for choice in turn.choices_json or []
            ],
        )


def _status_message(status: ConsultationStatus) -> str | None:
    if status == ConsultationStatus.COMPLETED:
        return (
            "Merci. Nous avons maintenant une meilleure compréhension de votre situation. "
            "Un membre de l'équipe pourra utiliser ces informations pour préparer votre échange."
        )
    if status == ConsultationStatus.ABANDONED:
        return "Votre progression a été enregistrée. Merci pour le temps accordé."
    return None

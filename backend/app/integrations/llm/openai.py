"""Fournisseur OpenAI utilisant Responses API et les sorties Pydantic."""

import hashlib
import hmac
import json
from typing import TypeVar

from openai import AsyncOpenAI
from pydantic import BaseModel

from app.modules.discovery.blueprint import EXPECTED_IMPOSED_QUESTIONS
from app.modules.discovery.brief import build_recommended_questions
from app.modules.discovery.contracts import (
    BriefInput,
    DecisionInput,
    DecisionResult,
    ExtractionInput,
    ExtractionResult,
    MarketingDiscoveryBrief,
)
from app.modules.discovery.prompts import (
    BRIEF_INSTRUCTIONS,
    DECISION_INSTRUCTIONS,
    EXTRACTION_INSTRUCTIONS,
)


ResponseModelT = TypeVar("ResponseModelT", bound=BaseModel)


class OpenAIDiscoveryError(RuntimeError):
    pass


class OpenAIDiscoveryLLM:
    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        timeout_seconds: float,
        reasoning_effort: str = "low",
        safety_secret: str,
        client: AsyncOpenAI | None = None,
    ) -> None:
        self.model = model
        self.reasoning_effort = reasoning_effort
        self.safety_secret = safety_secret.encode()
        self.client = client or AsyncOpenAI(
            api_key=api_key,
            timeout=timeout_seconds,
            max_retries=0,
        )

    async def extract_answer(self, input_data: ExtractionInput) -> ExtractionResult:
        return await self._parse(
            instructions=EXTRACTION_INSTRUCTIONS,
            payload=input_data.model_dump_json(),
            consultation_id=input_data.consultation_id,
            output_model=ExtractionResult,
            operation="extract",
        )

    async def decide_next_step(self, input_data: DecisionInput) -> DecisionResult:
        payload = {
            "decision_input": input_data.model_dump(mode="json"),
            "imposed_questions": {
                key.value: question
                for key, question in EXPECTED_IMPOSED_QUESTIONS.items()
            },
        }
        return await self._parse(
            instructions=DECISION_INSTRUCTIONS,
            payload=json.dumps(payload, ensure_ascii=False),
            consultation_id=input_data.consultation_id,
            output_model=DecisionResult,
            operation="decide",
        )

    async def generate_brief(
        self,
        input_data: BriefInput,
    ) -> MarketingDiscoveryBrief:
        payload = {
            "brief_input": input_data.model_dump(mode="json"),
            "question_requirements": [
                question.model_dump(mode="json")
                for question in build_recommended_questions(input_data.objectives)
            ],
        }
        return await self._parse(
            instructions=BRIEF_INSTRUCTIONS,
            payload=json.dumps(payload, ensure_ascii=False),
            consultation_id=input_data.consultation_id,
            output_model=MarketingDiscoveryBrief,
            operation="brief",
        )

    async def _parse(
        self,
        *,
        instructions: str,
        payload: str,
        consultation_id: str,
        output_model: type[ResponseModelT],
        operation: str,
    ) -> ResponseModelT:
        response = await self.client.responses.parse(
            model=self.model,
            instructions=instructions,
            input=payload,
            text_format=output_model,
            reasoning={"effort": self.reasoning_effort},
            verbosity="low",
            store=False,
            safety_identifier=self._safety_identifier(consultation_id),
            metadata={"discovery_operation": operation},
        )
        if response.output_parsed is None:
            raise OpenAIDiscoveryError(
                f"OpenAI n'a retourné aucune sortie structurée pour {operation}."
            )
        return response.output_parsed

    def _safety_identifier(self, consultation_id: str) -> str:
        return hmac.new(
            self.safety_secret,
            consultation_id.encode(),
            hashlib.sha256,
        ).hexdigest()

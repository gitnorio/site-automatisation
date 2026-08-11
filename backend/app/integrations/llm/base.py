from typing import Protocol

from app.modules.discovery.contracts import (
    BriefInput,
    DecisionInput,
    DecisionResult,
    ExtractionInput,
    ExtractionResult,
    MarketingDiscoveryBrief,
)


class DiscoveryLLM(Protocol):
    async def extract_answer(self, input_data: ExtractionInput) -> ExtractionResult: ...

    async def decide_next_step(self, input_data: DecisionInput) -> DecisionResult: ...

    async def generate_brief(
        self, input_data: BriefInput
    ) -> MarketingDiscoveryBrief: ...

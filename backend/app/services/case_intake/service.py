from dataclasses import dataclass

from app.ai.intake_generator import Form10Draft, MockCaseIntakeGenerator


@dataclass(frozen=True)
class CaseIntakeGenerationResult:
    case_id: str
    draft: Form10Draft


class CaseIntakeService:
    def __init__(self, *, generator: MockCaseIntakeGenerator | None = None) -> None:
        self._generator = generator or MockCaseIntakeGenerator()

    def generate(self, *, case_id: str, statement: str, tone: str) -> CaseIntakeGenerationResult:
        draft = self._generator.generate(statement=statement, tone=tone)
        return CaseIntakeGenerationResult(case_id=case_id, draft=draft)

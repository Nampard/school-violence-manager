class DraftGenerationError(Exception):
    def __init__(self, *, code: str, message: str, status_code: int) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class FormSourceRequiredError(DraftGenerationError):
    def __init__(self) -> None:
        super().__init__(
            code="FORM_SOURCE_REQUIRED",
            message="서식12 사안조사 보고서 원문이 필요합니다.",
            status_code=422,
        )


class IntakeSourceRequiredError(DraftGenerationError):
    def __init__(self) -> None:
        super().__init__(
            code="INTAKE_SOURCE_REQUIRED",
            message="사안 사실 확인 내용이 필요합니다.",
            status_code=422,
        )


class DraftDisabledByFlowError(DraftGenerationError):
    def __init__(self) -> None:
        super().__init__(
            code="DRAFT_DISABLED_BY_FLOW",
            message="선택된 사안처리 흐름에서는 해당 Draft를 생성할 수 없습니다.",
            status_code=422,
        )


class AIServiceUnavailableError(DraftGenerationError):
    def __init__(self) -> None:
        super().__init__(
            code="AI_SERVICE_UNAVAILABLE",
            message="AI 생성 서비스를 사용할 수 없습니다. Gemini API 키와 백엔드 실행 상태를 확인해 주세요.",
            status_code=503,
        )


class AIGenerationFailedError(DraftGenerationError):
    def __init__(self) -> None:
        super().__init__(
            code="AI_GENERATION_FAILED",
            message="AI 문구 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
            status_code=500,
        )

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

from uuid import uuid4

from fastapi import APIRouter, Request

from app.schemas.intake import GenerateIntakeRequest, GenerateIntakeResponse
from app.services.case_intake.service import CaseIntakeService

router = APIRouter(prefix="/cases/{case_id}/intake", tags=["case-intake"])

_service = CaseIntakeService()


@router.post("/generate", response_model=GenerateIntakeResponse)
def generate_case_intake(case_id: str, payload: GenerateIntakeRequest, request: Request) -> dict[str, object]:
    request_id = getattr(request.state, "request_id", str(uuid4()))
    result = _service.generate(case_id=case_id, statement=payload.statement, tone=payload.tone)

    return {
        "status": "success",
        "data": {
            "case_id": result.case_id,
            "document_type": "FORM_10_CASE_INTAKE",
            "draft": result.draft.to_dict(),
        },
        "meta": {"request_id": request_id},
    }

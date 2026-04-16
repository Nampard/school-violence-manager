from uuid import uuid4

from fastapi import APIRouter, Request

from app.ai.generator import GenerationOptions, SourceBlocks
from app.schemas.documents import GenerateDocumentRequest, GenerateDocumentResponse
from app.services.generated_text_blocks.service import GeneratedTextBlockService

router = APIRouter(prefix="/cases/{case_id}/documents", tags=["documents"])

_service = GeneratedTextBlockService()


@router.post("/generate", response_model=GenerateDocumentResponse)
def generate_document(case_id: str, payload: GenerateDocumentRequest, request: Request) -> dict[str, object]:
    request_id = getattr(request.state, "request_id", str(uuid4()))
    result = _service.generate(
        case_id=case_id,
        document_type=payload.document_type,
        flow_selection=payload.flow_selection,
        source_text=payload.source_text,
        source_blocks=SourceBlocks(
            form_18_text=payload.source_blocks.form_18_text,
            form_19_text=payload.source_blocks.form_19_text,
        ),
        generation_options=GenerationOptions(
            strictness=payload.generation_options.strictness,
            char_limit_mode=payload.generation_options.char_limit_mode,
        ),
    )

    return {
        "status": "success",
        "data": {
            "case_id": result.case_id,
            "document_type": result.document_type.value,
            "flow_selection": result.flow_selection.value,
            "generated_text_block_id": result.generated_text_block_id,
            "copy_block": result.copy_block.to_dict(),
        },
        "meta": {"request_id": request_id},
    }

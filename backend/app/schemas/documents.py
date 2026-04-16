from pydantic import BaseModel, Field

from app.domain.drafts import CharLimitMode, DocumentType, FlowSelection, GenerationStrictness, OutputMode


class SourceBlocksRequest(BaseModel):
    form_18_text: str | None = None
    form_19_text: str | None = None


class GenerationOptionsRequest(BaseModel):
    strictness: GenerationStrictness = GenerationStrictness.STRICT
    char_limit_mode: CharLimitMode = CharLimitMode.ENFORCE


class GenerateDocumentRequest(BaseModel):
    document_type: DocumentType
    flow_selection: FlowSelection
    source_text: str
    source_blocks: SourceBlocksRequest = Field(default_factory=SourceBlocksRequest)
    generation_options: GenerationOptionsRequest = Field(default_factory=GenerationOptionsRequest)
    output_mode: OutputMode = OutputMode.COPY_BLOCKS


class CopyBlockResponse(BaseModel):
    label: str
    source_form: str
    target_form: str
    target_field: str
    text: str
    char_limit: int
    style_profile: str
    review_required: bool


class GenerateDocumentData(BaseModel):
    case_id: str
    document_type: DocumentType
    flow_selection: FlowSelection
    generated_text_block_id: str
    copy_block: CopyBlockResponse


class ResponseMeta(BaseModel):
    request_id: str


class GenerateDocumentResponse(BaseModel):
    status: str = "success"
    data: GenerateDocumentData
    meta: ResponseMeta

from pydantic import BaseModel

from app.schemas.documents import ResponseMeta


class GenerateIntakeRequest(BaseModel):
    statement: str
    tone: str = "공식 문서체"


class Form10TimelineResponse(BaseModel):
    date: str
    place: str
    summary: str


class Form10DraftResponse(BaseModel):
    title: str
    subtitle: str
    overview: str
    timeline: Form10TimelineResponse
    actions: list[str]
    char_count: int
    char_limit: int


class GenerateIntakeData(BaseModel):
    case_id: str
    document_type: str
    draft: Form10DraftResponse


class GenerateIntakeResponse(BaseModel):
    status: str = "success"
    data: GenerateIntakeData
    meta: ResponseMeta

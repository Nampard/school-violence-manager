from enum import Enum


class DocumentType(str, Enum):
    FORM_18_COMMITTEE_REVIEW_RESULT = "FORM_18_COMMITTEE_REVIEW_RESULT"
    FORM_19_COMMITTEE_CLOSURE_RESULT = "FORM_19_COMMITTEE_CLOSURE_RESULT"
    FORM_20_SELF_RESOLUTION_CONSENT = "FORM_20_SELF_RESOLUTION_CONSENT"
    FORM_21_SELF_RESOLUTION_RESULT = "FORM_21_SELF_RESOLUTION_RESULT"
    FORM_22_FINAL_CASE_SUMMARY = "FORM_22_FINAL_CASE_SUMMARY"


class FlowSelection(str, Enum):
    SELF_RESOLUTION = "SELF_RESOLUTION"
    COMMITTEE_REQUEST = "COMMITTEE_REQUEST"
    CLOSURE_FALSE_REPORT = "CLOSURE_FALSE_REPORT"
    CLOSURE_SUSPECTED_CASE = "CLOSURE_SUSPECTED_CASE"
    CLOSURE_ADULT_OR_UNIDENTIFIABLE = "CLOSURE_ADULT_OR_UNIDENTIFIABLE"


class OutputMode(str, Enum):
    COPY_BLOCKS = "COPY_BLOCKS"


class GenerationStrictness(str, Enum):
    STRICT = "STRICT"
    BALANCED = "BALANCED"


class CharLimitMode(str, Enum):
    ENFORCE = "ENFORCE"
    WARN = "WARN"


class StyleProfile(str, Enum):
    BULLET_ADMIN = "BULLET_ADMIN"
    GUARDIAN_NEUTRAL = "GUARDIAN_NEUTRAL"
    ADMINISTRATIVE_PROSE = "ADMINISTRATIVE_PROSE"


ENABLED_DOCUMENTS_BY_FLOW: dict[FlowSelection, set[DocumentType]] = {
    FlowSelection.SELF_RESOLUTION: {
        DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
        DocumentType.FORM_20_SELF_RESOLUTION_CONSENT,
        DocumentType.FORM_22_FINAL_CASE_SUMMARY,
    },
    FlowSelection.COMMITTEE_REQUEST: {
        DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
    },
    FlowSelection.CLOSURE_FALSE_REPORT: {
        DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT,
        DocumentType.FORM_21_SELF_RESOLUTION_RESULT,
        DocumentType.FORM_22_FINAL_CASE_SUMMARY,
    },
    FlowSelection.CLOSURE_SUSPECTED_CASE: {
        DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT,
        DocumentType.FORM_21_SELF_RESOLUTION_RESULT,
        DocumentType.FORM_22_FINAL_CASE_SUMMARY,
    },
    FlowSelection.CLOSURE_ADULT_OR_UNIDENTIFIABLE: {
        DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT,
        DocumentType.FORM_21_SELF_RESOLUTION_RESULT,
        DocumentType.FORM_22_FINAL_CASE_SUMMARY,
    },
}


DRAFT_LABELS: dict[DocumentType, str] = {
    DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT: "DRAFT 18 사안내용",
    DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT: "DRAFT 19 사안내용",
    DocumentType.FORM_20_SELF_RESOLUTION_CONSENT: "DRAFT 20 사안내용",
    DocumentType.FORM_21_SELF_RESOLUTION_RESULT: "DRAFT 21 사안내용",
    DocumentType.FORM_22_FINAL_CASE_SUMMARY: "DRAFT 22 사안내용",
}


TARGET_FIELDS: dict[DocumentType, str] = {
    DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT: "자체해결 또는 심의위원회 요청",
    DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT: "종결 시(오인신고 등)",
    DocumentType.FORM_20_SELF_RESOLUTION_CONSENT: "보호자 전달 통지서 내용",
    DocumentType.FORM_21_SELF_RESOLUTION_RESULT: "보호자 전달 통지서 내용",
    DocumentType.FORM_22_FINAL_CASE_SUMMARY: "자체해결 또는 종결 결과 보고서",
}


CHAR_LIMITS: dict[DocumentType, int] = {
    DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT: 500,
    DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT: 500,
    DocumentType.FORM_20_SELF_RESOLUTION_CONSENT: 400,
    DocumentType.FORM_21_SELF_RESOLUTION_RESULT: 400,
    DocumentType.FORM_22_FINAL_CASE_SUMMARY: 400,
}


STYLE_PROFILES: dict[DocumentType, StyleProfile] = {
    DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT: StyleProfile.BULLET_ADMIN,
    DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT: StyleProfile.BULLET_ADMIN,
    DocumentType.FORM_20_SELF_RESOLUTION_CONSENT: StyleProfile.GUARDIAN_NEUTRAL,
    DocumentType.FORM_21_SELF_RESOLUTION_RESULT: StyleProfile.GUARDIAN_NEUTRAL,
    DocumentType.FORM_22_FINAL_CASE_SUMMARY: StyleProfile.ADMINISTRATIVE_PROSE,
}


CLOSURE_REASON_LABELS: dict[FlowSelection, str] = {
    FlowSelection.CLOSURE_FALSE_REPORT: "오인신고",
    FlowSelection.CLOSURE_SUSPECTED_CASE: "의심사안",
    FlowSelection.CLOSURE_ADULT_OR_UNIDENTIFIABLE: "관련자 성인 등 특정 불가",
}


def is_enabled(document_type: DocumentType, flow_selection: FlowSelection) -> bool:
    return document_type in ENABLED_DOCUMENTS_BY_FLOW[flow_selection]


def is_closure_flow(flow_selection: FlowSelection) -> bool:
    return flow_selection in CLOSURE_REASON_LABELS

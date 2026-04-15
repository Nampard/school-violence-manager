from dataclasses import asdict, dataclass

from app.core.errors import DraftDisabledByFlowError, FormSourceRequiredError
from app.domain.drafts import (
    CHAR_LIMITS,
    CLOSURE_REASON_LABELS,
    DRAFT_LABELS,
    STYLE_PROFILES,
    TARGET_FIELDS,
    DocumentType,
    FlowSelection,
    is_closure_flow,
    is_enabled,
)


@dataclass(frozen=True)
class SourceBlocks:
    form_18_text: str | None = None
    form_19_text: str | None = None


@dataclass(frozen=True)
class CopyBlock:
    label: str
    source_form: str
    target_form: str
    target_field: str
    text: str
    char_limit: int
    style_profile: str
    review_required: bool = True

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


class MockGenerator:
    def generate(
        self,
        *,
        document_type: DocumentType,
        flow_selection: FlowSelection,
        source_text: str,
        source_blocks: SourceBlocks | None = None,
    ) -> CopyBlock:
        if not source_text.strip():
            raise FormSourceRequiredError()

        if not is_enabled(document_type, flow_selection):
            raise DraftDisabledByFlowError()

        source_blocks = source_blocks or SourceBlocks()
        text = self._generate_text(document_type, flow_selection, source_text, source_blocks)

        return CopyBlock(
            label=DRAFT_LABELS[document_type],
            source_form="FORM_12_INVESTIGATION_REPORT",
            target_form=document_type.value,
            target_field=TARGET_FIELDS[document_type],
            text=text,
            char_limit=CHAR_LIMITS[document_type],
            style_profile=STYLE_PROFILES[document_type].value,
        )

    def _generate_text(
        self,
        document_type: DocumentType,
        flow_selection: FlowSelection,
        source_text: str,
        source_blocks: SourceBlocks,
    ) -> str:
        if document_type == DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT:
            return self._generate_draft_18(flow_selection)

        if document_type == DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT:
            return self._generate_draft_19(flow_selection)

        if document_type == DocumentType.FORM_20_SELF_RESOLUTION_CONSENT:
            return self._generate_draft_20(source_text, source_blocks)

        if document_type == DocumentType.FORM_21_SELF_RESOLUTION_RESULT:
            return self._generate_draft_21(source_text, source_blocks, flow_selection)

        return self._generate_draft_22(source_text, source_blocks, flow_selection)

    def _generate_draft_18(self, flow_selection: FlowSelection) -> str:
        if flow_selection == FlowSelection.SELF_RESOLUTION:
            return (
                "사안조사 보고서 검토 결과, 양측 간 사과가 이루어졌고 신체적/정신적 피해 경미, "
                "지속적이거나 반복적으로 보기 어려운 점, 보복행위가 없었던 점을 종합할 때 "
                "학교폭력 예방 및 대책에 관한 법률 상 학교장 자체해결 요건에 해당하는 것으로 판단됨."
            )

        return (
            "사안조사 보고서 검토 결과, 학교폭력이 지속적인 경우에 해당할 가능성이 있고 "
            "피해관련 학생의 학교폭력 대책 심의위원회 요청 의사가 확인되어 "
            "학교폭력대책심의위원회 심의 요청이 필요한 사안으로 정리됨."
        )

    def _generate_draft_19(self, flow_selection: FlowSelection) -> str:
        reason = CLOSURE_REASON_LABELS[flow_selection]
        return (
            f"사안조사 보고서 검토 결과, 본 사안은 {reason}에 해당하는 사유가 확인됨. "
            "관련 정황과 진술 내용을 종합할 때 학교폭력 예방 및 대책에 관한 법률 상 "
            "학교장 종결 처리에 해당하는 것으로 판단됨."
        )

    def _generate_draft_20(self, source_text: str, source_blocks: SourceBlocks) -> str:
        draft_18 = source_blocks.form_18_text or "전담기구 검토 내용을"
        return (
            "사안조사 보고서와 "
            f"{draft_18[:60]} 등을 바탕으로, 학교는 관련 학생들의 회복과 관계 개선을 우선하여 "
            "보호자에게 필요한 내용을 중립적이고 완곡한 문체로 안내함."
        )

    def _generate_draft_21(
        self,
        source_text: str,
        source_blocks: SourceBlocks,
        flow_selection: FlowSelection,
    ) -> str:
        reason = CLOSURE_REASON_LABELS[flow_selection]
        draft_19 = source_blocks.form_19_text or "종결 검토 내용을"
        return (
            f"사안조사 보고서와 {draft_19[:60]} 등을 바탕으로, 본 사안은 {reason} 사유에 따라 "
            "종결 처리 절차를 안내하며 보호자가 이해할 수 있도록 완곡하게 정리함."
        )

    def _generate_draft_22(
        self,
        source_text: str,
        source_blocks: SourceBlocks,
        flow_selection: FlowSelection,
    ) -> str:
        if flow_selection == FlowSelection.SELF_RESOLUTION:
            basis = source_blocks.form_18_text or "학교장 자체해결 검토 내용"
            return (
                f"사안조사 보고서와 {basis[:70]}을 종합한 결과, 본 사안은 관계 회복과 피해 정도, "
                "지속성 및 보복행위 여부 등을 고려하여 학교장 자체해결 결과 보고서에 반영할 "
                "사안조사 내용으로 정리함."
            )

        if is_closure_flow(flow_selection):
            reason = CLOSURE_REASON_LABELS[flow_selection]
            basis = source_blocks.form_19_text or "종결 검토 내용"
            return (
                f"사안조사 보고서와 {basis[:70]}을 종합한 결과, 본 사안은 {reason} 사유를 중심으로 "
                "학교장 종결 처리 결과 보고서에 기재할 수 있도록 행정문체로 정리함."
            )

        raise DraftDisabledByFlowError()

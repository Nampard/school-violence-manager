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
            return self._generate_draft_18(flow_selection, source_text)

        if document_type == DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT:
            return self._generate_draft_19(flow_selection, source_text)

        if document_type == DocumentType.FORM_20_SELF_RESOLUTION_CONSENT:
            return self._generate_draft_20(source_text, source_blocks)

        if document_type == DocumentType.FORM_21_SELF_RESOLUTION_RESULT:
            return self._generate_draft_21(source_text, source_blocks, flow_selection)

        return self._generate_draft_22(source_text, source_blocks, flow_selection)

    def _summarize_source(self, source_text: str, *, limit: int = 90) -> str:
        summary = " ".join(source_text.split())
        if len(summary) <= limit:
            return summary.rstrip(".")

        snippet = summary[:limit].rstrip(" .,")
        last_space = snippet.rfind(" ")
        if last_space > int(limit * 0.6):
            snippet = snippet[:last_space].rstrip(" .,")

        return f"{snippet} 등 주요 내용이 확인됨"

    def _generate_draft_18(self, flow_selection: FlowSelection, source_text: str) -> str:
        summary = self._summarize_source(source_text, limit=130)

        if flow_selection == FlowSelection.SELF_RESOLUTION:
            return (
                f"사안조사 결과, {summary}. 양측 간 사과가 이루어졌고 신체적/정신적 피해 경미, "
                "지속적이거나 반복적으로 보기 어려운 점, 보복행위가 없었던 점을 종합할 때 "
                "학교폭력 예방 및 대책에 관한 법률 상 학교장 자체해결 요건에 해당하는 것으로 판단됨."
            )

        return (
            f"사안조사 결과, {summary}. 학교폭력이 지속적인 경우에 해당할 가능성이 있고 "
            "피해관련 학생의 학교폭력 대책 심의위원회 요청 의사가 확인되어 "
            "학교폭력대책심의위원회 심의 요청이 필요한 사안으로 판단됨."
        )

    def _generate_draft_19(self, flow_selection: FlowSelection, source_text: str) -> str:
        reason = CLOSURE_REASON_LABELS[flow_selection]
        summary = self._summarize_source(source_text, limit=130)
        return (
            f"사안조사 결과, {summary}. 현재 확인된 자료와 진술을 종합할 때 본 사안은 "
            f"{reason}에 해당하는 사유가 확인되며, 학교폭력 예방 및 대책에 관한 법률 상 "
            "학교장 종결 처리에 해당하는 것으로 판단됨."
        )

    def _generate_draft_20(self, source_text: str, source_blocks: SourceBlocks) -> str:
        summary = self._summarize_source(source_text, limit=120)
        return (
            f"사안조사 결과, {summary}. 관련 학생 간 사과와 관계 회복의 여지가 확인되고 "
            "피해 정도가 비교적 경미한 것으로 보임. 또한 사안이 지속적이거나 반복된 양상으로 "
            "보기 어렵고 보복행위 정황도 확인되지 않아 학교장 자체해결 절차를 진행하고자 함."
        )

    def _generate_draft_21(
        self,
        source_text: str,
        source_blocks: SourceBlocks,
        flow_selection: FlowSelection,
    ) -> str:
        reason = CLOSURE_REASON_LABELS[flow_selection]
        summary = self._summarize_source(source_text, limit=120)
        return (
            f"사안조사 결과, {summary}. 현재 확인된 자료와 진술만으로는 학교폭력 사안으로 "
            f"계속 처리하기 어려워 {reason} 사유에 따른 학교장 종결 절차를 진행하고자 하며, "
            "추후 추가 사실이 확인될 경우 필요한 절차를 다시 안내할 예정임."
        )

    def _generate_draft_22(
        self,
        source_text: str,
        source_blocks: SourceBlocks,
        flow_selection: FlowSelection,
    ) -> str:
        summary = self._summarize_source(source_text, limit=120)

        if flow_selection == FlowSelection.SELF_RESOLUTION:
            return (
                f"사안조사 결과, {summary}. 관련 학생 간 사과와 관계 회복 가능성이 확인되었고 "
                "신체적·정신적 피해 정도가 비교적 경미한 것으로 판단됨. 또한 지속적이거나 반복된 "
                "양상으로 보기 어렵고 보복행위 정황도 확인되지 않아 전담기구 검토를 거쳐 학교장 "
                "자체해결 절차로 처리함."
            )

        if is_closure_flow(flow_selection):
            reason = CLOSURE_REASON_LABELS[flow_selection]
            return (
                f"사안조사 결과, {summary}. 본 사안은 {reason} 사유가 확인되어 학교폭력 "
                "사안으로 계속 처리하기 어려운 것으로 검토됨. 전담기구는 관련 진술과 확인 자료를 "
                "종합하여 학교장 종결 처리 대상에 해당한다고 판단하였으며, 이에 따라 종결 절차를 진행함."
            )

        raise DraftDisabledByFlowError()

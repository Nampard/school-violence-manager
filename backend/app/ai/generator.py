from dataclasses import asdict, dataclass
import re

from app.core.errors import AIGenerationFailedError, AIServiceUnavailableError, DraftDisabledByFlowError, FormSourceRequiredError
from app.ai.style import enforce_administrative_prose
from app.domain.drafts import (
    CHAR_LIMITS,
    CLOSURE_LEGAL_BASIS_LABELS,
    CLOSURE_REASON_LABELS,
    DRAFT_LABELS,
    SELF_RESOLUTION_LEGAL_BASIS,
    STYLE_PROFILES,
    TARGET_FIELDS,
    CharLimitMode,
    DocumentType,
    FlowSelection,
    GenerationStrictness,
    is_closure_flow,
    is_enabled,
)


@dataclass(frozen=True)
class SourceBlocks:
    form_18_text: str | None = None
    form_19_text: str | None = None


@dataclass(frozen=True)
class GenerationOptions:
    strictness: GenerationStrictness = GenerationStrictness.STRICT
    char_limit_mode: CharLimitMode = CharLimitMode.ENFORCE


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
        generation_options: GenerationOptions | None = None,
    ) -> CopyBlock:
        if not source_text.strip():
            raise FormSourceRequiredError()

        if not is_enabled(document_type, flow_selection):
            raise DraftDisabledByFlowError()

        source_blocks = source_blocks or SourceBlocks()
        generation_options = generation_options or GenerationOptions()
        text = self._generate_text(document_type, flow_selection, source_text, source_blocks, generation_options)
        if is_closure_flow(flow_selection):
            text = self._enforce_closure_basis(text, flow_selection)

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
        generation_options: GenerationOptions,
    ) -> str:
        if document_type == DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT:
            return self._generate_draft_18(flow_selection, source_text, generation_options)

        if document_type == DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT:
            return self._generate_draft_19(flow_selection, source_text, generation_options)

        if document_type == DocumentType.FORM_20_SELF_RESOLUTION_CONSENT:
            return self._generate_draft_20(source_text, source_blocks, generation_options)

        if document_type == DocumentType.FORM_21_SELF_RESOLUTION_RESULT:
            return self._generate_draft_21(source_text, source_blocks, flow_selection, generation_options)

        return self._generate_draft_22(source_text, source_blocks, flow_selection, generation_options)

    def _summarize_source(self, source_text: str, *, limit: int = 90) -> str:
        summary = " ".join(source_text.split())
        if len(summary) <= limit:
            return summary.rstrip(".")

        snippet = summary[:limit].rstrip(" .,")
        last_space = snippet.rfind(" ")
        if last_space > int(limit * 0.6):
            snippet = snippet[:last_space].rstrip(" .,")

        return f"{snippet} 등 주요 내용이 확인됨"

    def _is_balanced(self, generation_options: GenerationOptions) -> bool:
        return generation_options.strictness == GenerationStrictness.BALANCED

    def _generate_draft_18(
        self,
        flow_selection: FlowSelection,
        source_text: str,
        generation_options: GenerationOptions,
    ) -> str:
        summary = self._summarize_source(source_text, limit=155 if self._is_balanced(generation_options) else 130)

        if flow_selection == FlowSelection.SELF_RESOLUTION:
            if self._is_balanced(generation_options):
                return (
                    f"사안조사 결과, {summary}. 양측 간 사과와 관계 회복 의사가 확인되었고, "
                    "신체적/정신적 피해 경미, 지속적이거나 반복적으로 보기 어려운 점, 보복행위가 없었던 점이 "
                    f"함께 확인됨. 위 사정을 종합하면 {SELF_RESOLUTION_LEGAL_BASIS}에 따른 학교장 자체해결 "
                    "요건에 해당하는 것으로 판단됨."
                )

            return (
                f"사안조사 결과, {summary}. 양측 간 사과가 이루어졌고 신체적/정신적 피해 경미, "
                "지속적이거나 반복적으로 보기 어려운 점, 보복행위가 없었던 점을 종합할 때 "
                f"{SELF_RESOLUTION_LEGAL_BASIS}에 따른 학교장 자체해결 요건에 해당하는 것으로 판단됨."
            )

        if self._is_balanced(generation_options):
            return (
                f"사안조사 결과, {summary}. 확인 자료와 진술을 종합할 때 사안의 지속성, "
                "피해관련 학생의 학교폭력 대책 심의위원회 요청 의사 등 추가 심의가 필요한 요소가 확인됨. "
                "이에 학교폭력대책심의위원회 심의 요청이 필요한 사안으로 판단됨."
            )

        return (
            f"사안조사 결과, {summary}. 학교폭력이 지속적인 경우에 해당할 가능성이 있고 "
            "피해관련 학생의 학교폭력 대책 심의위원회 요청 의사가 확인되어 "
            "학교폭력대책심의위원회 심의 요청이 필요한 사안으로 판단됨."
        )

    def _generate_draft_19(
        self,
        flow_selection: FlowSelection,
        source_text: str,
        generation_options: GenerationOptions,
    ) -> str:
        reason = CLOSURE_REASON_LABELS[flow_selection]
        legal_basis = CLOSURE_LEGAL_BASIS_LABELS[flow_selection]
        summary = self._summarize_source(source_text, limit=155 if self._is_balanced(generation_options) else 130)
        if self._is_balanced(generation_options):
            return (
                f"사안조사 결과, {summary}. 관련 진술과 확인 자료를 함께 검토한 결과, 현재 단계에서는 "
                f"{reason} 사유가 인정되는 것으로 보임. {legal_basis}에 따른 학교폭력이 아닌 사안 등 종결처리 "
                "대상에 해당하는 것으로 판단됨."
            )

        return (
            f"사안조사 결과, {summary}. 현재 확인된 자료와 진술을 종합할 때 본 사안은 "
            f"{reason}에 해당하는 사유가 확인되며, {legal_basis}에 따른 학교폭력이 아닌 사안 등 종결처리 "
            "대상에 해당하는 것으로 판단됨."
        )

    def _generate_draft_20(
        self,
        source_text: str,
        source_blocks: SourceBlocks,
        generation_options: GenerationOptions,
    ) -> str:
        summary = self._summarize_source(source_text, limit=145 if self._is_balanced(generation_options) else 120)
        if self._is_balanced(generation_options):
            return (
                f"사안조사 결과, {summary}. 관련 학생 간 사과와 관계 회복 가능성이 확인되고, "
                "피해 정도와 사안의 반복성 등을 종합할 때 학교장 자체해결 절차로 다룰 수 있는 사안으로 보임. "
                f"{SELF_RESOLUTION_LEGAL_BASIS}에 따른 자체해결 요건에 해당하는 사안으로 검토됨."
            )

        return (
            f"사안조사 결과, {summary}. 관련 학생 간 사과와 관계 회복의 여지가 확인되고 "
            "피해 정도가 비교적 경미한 것으로 보임. 또한 사안이 지속적이거나 반복된 양상으로 "
            f"보기 어렵고 보복행위 정황도 확인되지 않아 {SELF_RESOLUTION_LEGAL_BASIS}에 따른 자체해결 "
            "요건에 해당하는 사안으로 검토됨."
        )

    def _generate_draft_21(
        self,
        source_text: str,
        source_blocks: SourceBlocks,
        flow_selection: FlowSelection,
        generation_options: GenerationOptions,
    ) -> str:
        reason = CLOSURE_REASON_LABELS[flow_selection]
        legal_basis = CLOSURE_LEGAL_BASIS_LABELS[flow_selection]
        summary = self._summarize_source(source_text, limit=145 if self._is_balanced(generation_options) else 120)
        if self._is_balanced(generation_options):
            return (
                f"사안조사 결과, {summary}. 관련 자료와 진술을 검토한 결과, 현재 확인 범위에서는 "
                f"{reason} 사유가 인정되는 것으로 보임. 관련 자료와 진술을 종합할 때 "
                f"{legal_basis}에 따른 학교장 종결 처리 사유에 해당하는 사안으로 검토됨."
            )

        return (
            f"사안조사 결과, {summary}. 현재 확인된 자료와 진술만으로는 학교폭력 사안으로 "
            f"계속 처리하기 어려운 점이 확인됨. {legal_basis} 및 {reason} "
            "사유에 따른 학교장 종결 처리 대상 사안으로 검토됨."
        )

    def _generate_draft_22(
        self,
        source_text: str,
        source_blocks: SourceBlocks,
        flow_selection: FlowSelection,
        generation_options: GenerationOptions,
    ) -> str:
        summary = self._summarize_source(source_text, limit=145 if self._is_balanced(generation_options) else 120)

        if flow_selection == FlowSelection.SELF_RESOLUTION:
            if self._is_balanced(generation_options):
                return (
                    f"사안조사 결과, {summary}. 관련 학생 간 사과와 관계 회복 가능성, 피해 정도, "
                    f"반복성 여부, 보복행위 부재 등을 종합하여 {SELF_RESOLUTION_LEGAL_BASIS}에 따른 "
                    "학교장 자체해결 요건을 충족하는 것으로 검토됨. "
                    "이에 전담기구 검토를 거쳐 학교장 자체해결 절차로 처리함."
                )

            return (
                f"사안조사 결과, {summary}. 관련 학생 간 사과와 관계 회복 가능성이 확인되었고 "
                "신체적·정신적 피해 정도가 비교적 경미한 것으로 판단됨. 또한 지속적이거나 반복된 "
                f"양상으로 보기 어렵고 보복행위 정황도 확인되지 않아 {SELF_RESOLUTION_LEGAL_BASIS}에 "
                "따라 전담기구 검토를 거쳐 학교장 "
                "자체해결 절차로 처리함."
            )

        if is_closure_flow(flow_selection):
            reason = CLOSURE_REASON_LABELS[flow_selection]
            legal_basis = CLOSURE_LEGAL_BASIS_LABELS[flow_selection]
            if self._is_balanced(generation_options):
                return (
                    f"사안조사 결과, {summary}. 확인된 자료와 진술을 종합할 때 본 사안은 {reason} "
                    f"사유에 해당하여 {legal_basis}에 따른 학교폭력이 아닌 사안 등 종결처리 대상으로 검토됨. "
                    "전담기구 검토에 따라 학교장 종결 처리 절차를 진행함."
                )

            return (
                f"사안조사 결과, {summary}. 본 사안은 {reason} 사유가 확인되어 학교폭력 "
                f"사안으로 계속 처리하기 어려운 것으로 검토됨. {legal_basis}에 따라 전담기구는 관련 진술과 확인 자료를 "
                "종합하여 학교장 종결 처리 대상에 해당한다고 판단하였으며, 이에 따라 종결 절차를 진행함."
            )

        raise DraftDisabledByFlowError()

    def _enforce_closure_basis(self, text: str, flow_selection: FlowSelection, *, ensure_basis: bool = True) -> str:
        legal_basis = CLOSURE_LEGAL_BASIS_LABELS[flow_selection]
        replacements = {
            "학교폭력 예방 및 대책에 관한 법률 제13조의2 제1항 각호": legal_basis,
            "학교폭력예방 및 대책에 관한 법률 제13조의2 제1항 각호": legal_basis,
            "학교폭력예방법 제13조의2 제1항 각호": legal_basis,
            "학교폭력 예방 및 대책에 관한 법률 제13조의2 제1항": legal_basis,
            "학교폭력예방 및 대책에 관한 법률 제13조의2 제1항": legal_basis,
            "학교폭력예방법 제13조의2 제1항": legal_basis,
            "학교폭력 예방 및 대책에 관한 법률 제13조의2": legal_basis,
            "학교폭력예방 및 대책에 관한 법률 제13조의2": legal_basis,
            "학교폭력예방법 제13조의2": legal_basis,
            "학교폭력 예방 및 대책에 관한 법률 제13조": legal_basis,
            "학교폭력예방 및 대책에 관한 법률 제13조": legal_basis,
            "학교폭력예방법 제13조": legal_basis,
            "학교폭력 예방 및 대책에 관한 법률 제14조의2 제1항 각호": legal_basis,
            "학교폭력예방 및 대책에 관한 법률 제14조의2 제1항 각호": legal_basis,
            "학교폭력예방법 제14조의2 제1항 각호": legal_basis,
            "학교폭력 예방 및 대책에 관한 법률 제14조의2 제1항": legal_basis,
            "학교폭력예방 및 대책에 관한 법률 제14조의2 제1항": legal_basis,
            "학교폭력예방법 제14조의2 제1항": legal_basis,
            "학교폭력 예방 및 대책에 관한 법률 제14조의2": legal_basis,
            "학교폭력예방 및 대책에 관한 법률 제14조의2": legal_basis,
            "학교폭력예방법 제14조의2": legal_basis,
            "학교폭력 예방 및 대책에 관한 법률 제14조": legal_basis,
            "학교폭력예방 및 대책에 관한 법률 제14조": legal_basis,
            "학교폭력예방법 제14조": legal_basis,
            "학교폭력 예방 및 대책에 관한 법률상": f"{legal_basis}상",
            "학교폭력예방 및 대책에 관한 법률상": f"{legal_basis}상",
            "학교폭력예방법상": f"{legal_basis}상",
            "학교폭력 예방 및 대책에 관한 법률에 따른": f"{legal_basis}에 따른",
            "학교폭력예방 및 대책에 관한 법률에 따른": f"{legal_basis}에 따른",
            "학교폭력예방법에 따른": f"{legal_basis}에 따른",
            "학교장 자체해결 요건": "학교장 종결 처리 기준",
            "학교장 자체해결 절차": "학교장 종결 처리 절차",
            "학교장 자체해결": "학교장 종결 처리",
            "자체해결 절차": "종결 처리 절차",
            "자체해결 요건": "종결 처리 기준",
            "자체해결 동의 절차": "종결 처리 절차",
            "자체해결 동의서": "종결처리 동의서",
        }
        for source, target in replacements.items():
            text = text.replace(source, target)
        suffix = r"(?:\s*(?:에\s*따른|에\s*의한|상|이라는|라는|을|를|은|는))?"
        disallowed_closure_article = rf"(?:제\s*)?(?:1\s*3|1\s*4)\s*조(?:\s*의\s*2)?(?:\s*제\s*\d+\s*항)?(?:\s*각호)?{suffix}"
        text = re.sub(disallowed_closure_article, legal_basis, text)
        text = text.replace(f"{legal_basis}를", f"{legal_basis}을")
        text = text.replace(f"{legal_basis}라는", legal_basis)
        text = text.replace(f"{legal_basis}이라는", legal_basis)
        if ensure_basis and legal_basis not in text:
            text = f"{text.rstrip('.')} {legal_basis}에 따른 종결처리 기준을 적용함."
        return text


class GeminiGenerator(MockGenerator):
    def __init__(self, *, api_key: str, model: str, fallback_model: str | None = None) -> None:
        self._api_key = api_key
        self._model = model
        self._fallback_model = fallback_model

    def _generate_text(
        self,
        document_type: DocumentType,
        flow_selection: FlowSelection,
        source_text: str,
        source_blocks: SourceBlocks,
        generation_options: GenerationOptions,
    ) -> str:
        if not self._api_key:
            raise AIServiceUnavailableError()

        try:
            from google import genai
        except ImportError as exc:
            raise AIServiceUnavailableError() from exc

        prompt = self._build_prompt(document_type, flow_selection, source_text, source_blocks, generation_options)

        client = genai.Client(api_key=self._api_key)
        last_error: Exception | None = None

        for model in self._model_candidates():
            try:
                response = client.models.generate_content(model=model, contents=prompt)
                text = self._clean_response(getattr(response, "text", ""))
                if text:
                    if is_closure_flow(flow_selection):
                        text = self._enforce_closure_basis(text, flow_selection)
                    return self._limit_text(text, CHAR_LIMITS[document_type])
            except Exception as exc:
                last_error = exc

        raise AIGenerationFailedError() from last_error

    def _model_candidates(self) -> list[str]:
        models = [self._model]
        if self._fallback_model and self._fallback_model not in models:
            models.append(self._fallback_model)
        return models

    def _build_prompt(
        self,
        document_type: DocumentType,
        flow_selection: FlowSelection,
        source_text: str,
        source_blocks: SourceBlocks,
        generation_options: GenerationOptions,
    ) -> str:
        char_limit = CHAR_LIMITS[document_type]
        target_field = TARGET_FIELDS[document_type]
        strictness = "짧고 단정하게" if generation_options.strictness == GenerationStrictness.STRICT else "자연스럽되 기준은 유지"
        prompt_source_text = source_text
        form_18_text = source_blocks.form_18_text
        form_19_text = source_blocks.form_19_text
        if is_closure_flow(flow_selection):
            prompt_source_text = self._enforce_closure_basis(source_text, flow_selection, ensure_basis=False)
            form_18_text = self._enforce_closure_basis(form_18_text, flow_selection, ensure_basis=False) if form_18_text else None
            form_19_text = self._enforce_closure_basis(form_19_text, flow_selection, ensure_basis=False) if form_19_text else None
        source_block_text = "\n".join(
            block
            for block in [
                f"DRAFT18 참고문: {form_18_text}" if form_18_text else "",
                f"DRAFT19 참고문: {form_19_text}" if form_19_text else "",
            ]
            if block
        )

        rules = self._draft_rules(document_type, flow_selection)
        return f"""
학교폭력 사안처리 서식에 붙여넣을 한국어 문구를 작성한다.

출력 규칙:
- 최종 문구만 출력한다.
- 설명, 제목, 따옴표, 마크다운, 번호표시는 쓰지 않는다.
- "행정문체로 작성", "완곡하게 작성" 같은 지시문 자체를 문구에 쓰지 않는다.
- 존대어를 쓰지 않는다.
- "~합니다", "~습니다", "~드립니다", "~바랍니다", "협조 바랍니다", "주시기 바랍니다"를 쓰지 않는다.
- 행정문체를 필수로 사용하고, 문장 종결은 "~함", "~됨", "~확인됨", "~판단됨", "~검토됨"을 우선한다.
- DRAFT20과 DRAFT21은 학부모에게 제안하거나 동의를 요청하는 문장이 아니라 사안조사 내용을 완곡하게 정리하는 문장으로 쓴다.
- 반드시 "사안조사 결과,"로 시작한다.
- 전술은 사안조사 보고서 요약, 후술은 해당 Draft 판단 또는 사안조사 내용 정리로 쓴다.
- {char_limit}자 이내로 쓴다.
- 문체: {strictness}
- 대상 필드: {target_field}

Draft별 필수 기준:
{rules}

사안조사 보고서 원문:
{prompt_source_text}

참고 생성문:
{source_block_text or "없음"}
""".strip()

    def _draft_rules(self, document_type: DocumentType, flow_selection: FlowSelection) -> str:
        if document_type == DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT:
            if flow_selection == FlowSelection.SELF_RESOLUTION:
                return (
                    "- 양측 간 사과, 신체적/정신적 피해 경미, 지속적이거나 반복적으로 보기 어려운 점, "
                    "보복행위가 없었던 점을 모두 언급한다.\n"
                    f"- '{SELF_RESOLUTION_LEGAL_BASIS}'에 따른 학교장 자체해결 요건에 해당하는 것으로 "
                    "판단됨 취지의 문장을 포함한다."
                )
            return (
                "- 치료 진단서, 재산상 피해, 지속성, 보복행위, 피해관련 학생의 심의위원회 요청 의사 중 "
                "확인 가능한 요소를 근거로 쓴다.\n"
                "- 학교폭력대책심의위원회 심의 요청이 필요한 사안으로 쓴다."
            )

        if document_type == DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT:
            legal_basis = CLOSURE_LEGAL_BASIS_LABELS[flow_selection]
            return (
                f"- 선택 사유 '{CLOSURE_REASON_LABELS[flow_selection]}'를 명시한다.\n"
                "- '학교폭력이 아닌 사안 등 종결처리' 흐름으로 쓴다.\n"
                f"- 허용 법령 근거는 '{legal_basis}'만 사용한다.\n"
                "- 허용 법령 근거 외 다른 법령 조항, 학교장 자체해결 요건, 자체해결 동의 절차는 절대 쓰지 않는다.\n"
                "- 학교폭력 사안으로 계속 처리하기 어려워 학교폭력이 아닌 사안 등 종결처리 대상에 해당한다는 취지로 쓴다."
            )

        if document_type == DocumentType.FORM_20_SELF_RESOLUTION_CONSENT:
            return (
                "- DRAFT18의 자체해결 판단 근거를 조금 더 완곡한 행정문체로 재서술한다.\n"
                f"- 자체해결 근거는 '{SELF_RESOLUTION_LEGAL_BASIS}'로 유지한다.\n"
                "- 학부모에게 제안하거나 동의를 요청하지 않고, 자체해결 동의서의 '사안조사 내용'만 작성한다.\n"
                "- 존대어, 요청형 문장, 안내문 말투는 쓰지 않는다.\n"
                "- '~합니다', '~주시기 바랍니다', '~협조 바랍니다', '~동의하여 주시기 바랍니다' 같은 표현을 쓰지 않는다."
            )

        if document_type == DocumentType.FORM_21_SELF_RESOLUTION_RESULT:
            legal_basis = CLOSURE_LEGAL_BASIS_LABELS[flow_selection]
            return (
                "- DRAFT19의 종결 판단 근거를 조금 더 완곡한 행정문체로 재서술한다.\n"
                f"- 허용 법령 근거는 '{legal_basis}'만 사용한다.\n"
                "- 허용 법령 근거 외 다른 법령 조항, 학교장 자체해결 요건, 자체해결 동의 절차는 절대 쓰지 않는다.\n"
                "- 학부모에게 제안하거나 동의를 요청하지 않고, 종결처리 동의서의 '사안조사 내용'만 작성한다.\n"
                "- 존대어, 요청형 문장, 안내문 말투는 쓰지 않는다.\n"
                "- '~합니다', '~주시기 바랍니다', '~협조 바랍니다', '~동의하여 주시기 바랍니다' 같은 표현을 쓰지 않는다."
            )

        if flow_selection == FlowSelection.SELF_RESOLUTION:
            return (
                "- 사안조사 보고서와 DRAFT18 흐름을 종합하여 학교장 자체해결 결과 보고서 문구로 쓴다.\n"
                f"- 자체해결 근거는 '{SELF_RESOLUTION_LEGAL_BASIS}'로 유지한다."
            )

        legal_basis = CLOSURE_LEGAL_BASIS_LABELS[flow_selection]
        return (
            "- 사안조사 보고서와 DRAFT19 흐름을 종합하여 학교장 종결 결과 보고서 문구로 쓴다.\n"
            f"- 허용 법령 근거는 '{legal_basis}'만 사용한다.\n"
            "- 허용 법령 근거 외 다른 법령 조항, 학교장 자체해결 요건, 자체해결 동의 절차는 절대 쓰지 않는다."
        )

    def _clean_response(self, text: str) -> str:
        return enforce_administrative_prose(text)

    def _limit_text(self, text: str, limit: int) -> str:
        if len(text) <= limit:
            return text

        snippet = text[:limit].rstrip(" .,")
        last_space = snippet.rfind(" ")
        if last_space > int(limit * 0.7):
            snippet = snippet[:last_space].rstrip(" .,")
        return snippet

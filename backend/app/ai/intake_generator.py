from dataclasses import asdict, dataclass
import re

from app.core.errors import AIGenerationFailedError, AIServiceUnavailableError, IntakeSourceRequiredError
from app.ai.style import enforce_administrative_prose


@dataclass(frozen=True)
class Form10Timeline:
    date: str
    place: str
    summary: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


@dataclass(frozen=True)
class Form10Draft:
    title: str
    subtitle: str
    overview: str
    timeline: Form10Timeline
    actions: list[str]
    char_count: int
    char_limit: int = 1000

    def to_dict(self) -> dict[str, object]:
        return {
            "title": self.title,
            "subtitle": self.subtitle,
            "overview": self.overview,
            "timeline": self.timeline.to_dict(),
            "actions": self.actions,
            "char_count": self.char_count,
            "char_limit": self.char_limit,
        }


class MockCaseIntakeGenerator:
    def generate(self, *, statement: str, tone: str) -> Form10Draft:
        normalized = self._normalize(statement)
        if not normalized:
            raise IntakeSourceRequiredError()

        date = self._extract_date(normalized)
        place = self._extract_labeled_value(normalized, ["장소", "발생 장소"]) or "입력 내용 참조"
        summary = self._build_summary(normalized, tone)
        overview = self._build_overview(summary)
        actions = self._build_actions(tone)
        char_count = self._count_occurrence_text(date, place, summary)

        return Form10Draft(
            title="서식 10: 사안접수 보고용",
            subtitle="사실 확인내용 기반 행정 문체 초안",
            overview=overview,
            timeline=Form10Timeline(date=date, place=place, summary=summary),
            actions=actions,
            char_count=char_count,
        )

    def _normalize(self, statement: str) -> str:
        return " ".join(statement.split())

    def _extract_date(self, statement: str) -> str:
        date_match = re.search(
            r"(\d{4}[년.\-]\s*\d{1,2}[월.\-]\s*\d{1,2}[일.]?(?:\s*\d{1,2}[:시]\s*\d{0,2}분?)?)",
            statement,
        )
        if date_match:
            return date_match.group(1).strip()

        short_date_match = re.search(r"(\d{1,2}[월.\-]\s*\d{1,2}[일.]?(?:\s*\d{1,2}[:시]\s*\d{0,2}분?)?)", statement)
        if short_date_match:
            return short_date_match.group(1).strip()

        return "입력 내용 참조"

    def _extract_labeled_value(self, statement: str, labels: list[str]) -> str | None:
        for label in labels:
            match = re.search(rf"{label}\s*[:：]\s*([^,;/\n]+)", statement)
            if match:
                return match.group(1).strip()
        return None

    def _build_summary(self, statement: str, tone: str) -> str:
        trimmed = statement[:500]

        if tone == "사실 중심형":
            return f"입력된 사실 확인내용을 종합하면, {trimmed} 해당 내용은 관련 학생 진술 및 확인 가능한 정황을 중심으로 추가 확인이 필요한 사안으로 파악됨."

        if tone == "상세 서술형":
            return f"입력된 사실 확인내용에 따르면, {trimmed} 위 내용을 바탕으로 발생 경위, 관련 학생의 진술, 목격 또는 확인 자료의 유무를 순차적으로 확인하여 사안접수 보고에 반영할 필요가 있음."

        return f"입력된 사실 확인내용을 검토한 결과, {trimmed} 위 사안은 학교폭력 사안 접수 절차에 따라 사실관계 확인 및 필요한 초기 조치가 요구되는 사안으로 확인됨."

    def _build_overview(self, summary: str) -> str:
        return (
            "본 보고서는 담당 교사가 입력한 사실 확인내용을 바탕으로 학교폭력 사안 접수 단계에서 "
            "활용할 수 있도록 행정 문체로 정리한 초안임. 구체적인 사실관계와 관련 학생 정보는 "
            f"추가 확인 후 확정하여야 하며, 현재 확인된 주요 내용은 다음과 같음. {summary[:180]}"
        )

    def _build_actions(self, tone: str) -> list[str]:
        if tone == "상세 서술형":
            return [
                "관련 학생의 진술을 분리하여 청취하고, 사실관계가 일치하지 않는 부분은 추가 확인함.",
                "목격 학생 진술, 상담 기록, 현장 확인 자료 등 객관 자료 확보 가능성을 검토함.",
                "보호자 안내 및 필요한 초기 보호 조치 여부를 확인한 뒤 사안조사 기록에 반영함.",
            ]

        return [
            "관련 학생 상담 및 사실관계 확인을 실시함.",
            "보호자 안내와 초기 보호 조치 필요 여부를 검토함.",
            "추가 자료 확인 후 사안조사 보고서 작성 여부를 판단함.",
        ]

    def _count_occurrence_text(self, date: str, place: str, summary: str) -> int:
        return len("\n".join([f"일시: {date}", f"장소: {place}", f"경위: {summary}"]))


class GeminiCaseIntakeGenerator(MockCaseIntakeGenerator):
    def __init__(self, *, api_key: str, model: str, fallback_model: str | None = None) -> None:
        self._api_key = api_key
        self._model = model
        self._fallback_model = fallback_model

    def generate(self, *, statement: str, tone: str) -> Form10Draft:
        normalized = self._normalize(statement)
        if not normalized:
            raise IntakeSourceRequiredError()
        if not self._api_key:
            raise AIServiceUnavailableError()

        date = self._extract_date(normalized)
        place = self._extract_labeled_value(normalized, ["장소", "발생 장소"]) or "입력 내용 참조"
        summary = self._generate_summary(statement=normalized, tone=tone)
        overview = self._build_overview(summary)
        actions = self._build_actions(tone)
        char_count = self._count_occurrence_text(date, place, summary)

        return Form10Draft(
            title="서식 10: 사안접수 보고용",
            subtitle="사실 확인내용 기반 행정 문체 초안",
            overview=overview,
            timeline=Form10Timeline(date=date, place=place, summary=summary),
            actions=actions,
            char_count=char_count,
        )

    def _generate_summary(self, *, statement: str, tone: str) -> str:
        try:
            from google import genai
        except ImportError as exc:
            raise AIServiceUnavailableError() from exc

        prompt = f"""
학교폭력 사안접수 보고서 <서식10>의 '사실 확인내용' 초안을 작성한다.

출력 규칙:
- 최종 문구만 출력한다.
- 제목, 따옴표, 마크다운, 번호표시는 쓰지 않는다.
- "행정문체로 작성" 같은 지시문 자체를 문구에 쓰지 않는다.
- 담당 교사가 최종 검토할 초안으로 쓴다.
- 존대어를 쓰지 않는다.
- "~합니다", "~습니다", "~드립니다", "~바랍니다", "협조 바랍니다", "주시기 바랍니다"를 쓰지 않는다.
- 행정문체를 필수로 사용하고, 문장 종결은 "~함", "~됨", "~확인됨", "~판단됨", "~검토됨"을 우선한다.
- 700자 이내로 쓴다.
- 문체: {tone}

사용자 입력:
{statement}
""".strip()

        client = genai.Client(api_key=self._api_key)
        last_error: Exception | None = None

        for model in self._model_candidates():
            try:
                response = client.models.generate_content(model=model, contents=prompt)
                text = enforce_administrative_prose(getattr(response, "text", ""))
                if text:
                    return text[:700].rstrip(" .,")
            except Exception as exc:
                last_error = exc

        raise AIGenerationFailedError() from last_error

    def _model_candidates(self) -> list[str]:
        models = [self._model]
        if self._fallback_model and self._fallback_model not in models:
            models.append(self._fallback_model)
        return models

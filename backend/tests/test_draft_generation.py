import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ai.generator import GenerationOptions, MockGenerator, SourceBlocks
from app.core.errors import DraftDisabledByFlowError, FormSourceRequiredError
from app.domain.drafts import CHAR_LIMITS, CLOSURE_REASON_LABELS, DocumentType, FlowSelection, GenerationStrictness


SOURCE_TEXT = (
    "서식12 사안조사 보고서 원문. 관련 학생 진술, 목격자 진술, 발생 경위, "
    "상담 및 보호자 통보 내용이 포함되어 있음."
)


class MockGeneratorTest(unittest.TestCase):
    def setUp(self) -> None:
        self.generator = MockGenerator()

    def generate(
        self,
        document_type: DocumentType,
        flow_selection: FlowSelection,
        source_blocks: SourceBlocks | None = None,
        source_text: str = SOURCE_TEXT,
        generation_options: GenerationOptions | None = None,
    ):
        return self.generator.generate(
            document_type=document_type,
            flow_selection=flow_selection,
            source_text=source_text,
            source_blocks=source_blocks,
            generation_options=generation_options,
        )

    def test_self_resolution_draft_18_contains_required_factors(self) -> None:
        block = self.generate(
            DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
            FlowSelection.SELF_RESOLUTION,
        )

        required_phrases = [
            "양측 간 사과",
            "신체적/정신적 피해 경미",
            "지속적이거나 반복적으로 보기 어려운 점",
            "보복행위가 없었던 점",
            "학교폭력 예방 및 대책에 관한 법률 상 학교장 자체해결 요건에 해당하는 것으로 판단됨",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, block.text)

    def test_self_resolution_disables_draft_19_and_21(self) -> None:
        disabled_documents = [
            DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT,
            DocumentType.FORM_21_SELF_RESOLUTION_RESULT,
        ]

        for document_type in disabled_documents:
            with self.subTest(document_type=document_type):
                with self.assertRaises(DraftDisabledByFlowError):
                    self.generate(document_type, FlowSelection.SELF_RESOLUTION)

    def test_committee_request_generates_draft_18_and_disables_followups(self) -> None:
        block = self.generate(
            DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
            FlowSelection.COMMITTEE_REQUEST,
        )
        self.assertIn("학교폭력이 지속적인 경우", block.text)
        self.assertIn("학교폭력 대책 심의위원회 요청 의사", block.text)

        disabled_documents = [
            DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT,
            DocumentType.FORM_20_SELF_RESOLUTION_CONSENT,
            DocumentType.FORM_21_SELF_RESOLUTION_RESULT,
            DocumentType.FORM_22_FINAL_CASE_SUMMARY,
        ]
        for document_type in disabled_documents:
            with self.subTest(document_type=document_type):
                with self.assertRaises(DraftDisabledByFlowError):
                    self.generate(document_type, FlowSelection.COMMITTEE_REQUEST)

    def test_closure_flows_generate_draft_19_with_selected_reason(self) -> None:
        for flow_selection, reason in CLOSURE_REASON_LABELS.items():
            with self.subTest(flow_selection=flow_selection):
                block = self.generate(
                    DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT,
                    flow_selection,
                )
                self.assertIn(reason, block.text)
                self.assertIn("학교장 종결 처리에 해당하는 것으로 판단됨", block.text)

    def test_closure_flows_disable_draft_18_and_20(self) -> None:
        disabled_documents = [
            DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
            DocumentType.FORM_20_SELF_RESOLUTION_CONSENT,
        ]
        for flow_selection in CLOSURE_REASON_LABELS:
            for document_type in disabled_documents:
                with self.subTest(flow_selection=flow_selection, document_type=document_type):
                    with self.assertRaises(DraftDisabledByFlowError):
                        self.generate(document_type, flow_selection)

    def test_char_limits_are_assigned_by_document_type(self) -> None:
        cases = [
            (DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT, FlowSelection.SELF_RESOLUTION),
            (DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT, FlowSelection.CLOSURE_FALSE_REPORT),
            (DocumentType.FORM_20_SELF_RESOLUTION_CONSENT, FlowSelection.SELF_RESOLUTION),
            (DocumentType.FORM_21_SELF_RESOLUTION_RESULT, FlowSelection.CLOSURE_FALSE_REPORT),
            (DocumentType.FORM_22_FINAL_CASE_SUMMARY, FlowSelection.SELF_RESOLUTION),
        ]

        for document_type, flow_selection in cases:
            with self.subTest(document_type=document_type):
                block = self.generate(document_type, flow_selection)
                self.assertEqual(CHAR_LIMITS[document_type], block.char_limit)
                self.assertLessEqual(len(block.text), block.char_limit)

    def test_generated_text_does_not_expose_prompt_instructions(self) -> None:
        cases = [
            (DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT, FlowSelection.COMMITTEE_REQUEST),
            (DocumentType.FORM_20_SELF_RESOLUTION_CONSENT, FlowSelection.SELF_RESOLUTION),
            (DocumentType.FORM_21_SELF_RESOLUTION_RESULT, FlowSelection.CLOSURE_FALSE_REPORT),
            (DocumentType.FORM_22_FINAL_CASE_SUMMARY, FlowSelection.SELF_RESOLUTION),
            (DocumentType.FORM_22_FINAL_CASE_SUMMARY, FlowSelection.CLOSURE_FALSE_REPORT),
        ]
        banned_phrases = [
            "정리함",
            "완곡하게",
            "행정문체",
            "기재할 수 있도록",
            "반영할",
            "안내하며",
        ]

        for document_type, flow_selection in cases:
            with self.subTest(document_type=document_type, flow_selection=flow_selection):
                block = self.generate(document_type, flow_selection)
                for phrase in banned_phrases:
                    self.assertNotIn(phrase, block.text)

    def test_draft_18_to_22_begin_with_source_summary_then_flow_judgment(self) -> None:
        source_text = (
            "2026년 4월 15일 점심시간 운동장 뒤편에서 관련 학생 간 언어적 충돌이 있었고, "
            "피해 관련 학생은 불안감을 호소하였으며 담임교사가 즉시 상담을 실시함."
        )
        cases = [
            (
                DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
                FlowSelection.SELF_RESOLUTION,
                "학교장 자체해결 요건",
            ),
            (
                DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
                FlowSelection.COMMITTEE_REQUEST,
                "학교폭력대책심의위원회 심의 요청",
            ),
            (
                DocumentType.FORM_19_COMMITTEE_CLOSURE_RESULT,
                FlowSelection.CLOSURE_FALSE_REPORT,
                "오인신고",
            ),
            (
                DocumentType.FORM_20_SELF_RESOLUTION_CONSENT,
                FlowSelection.SELF_RESOLUTION,
                "학교장 자체해결 절차",
            ),
            (
                DocumentType.FORM_21_SELF_RESOLUTION_RESULT,
                FlowSelection.CLOSURE_SUSPECTED_CASE,
                "의심사안",
            ),
            (
                DocumentType.FORM_22_FINAL_CASE_SUMMARY,
                FlowSelection.SELF_RESOLUTION,
                "학교장 자체해결 절차",
            ),
            (
                DocumentType.FORM_22_FINAL_CASE_SUMMARY,
                FlowSelection.CLOSURE_ADULT_OR_UNIDENTIFIABLE,
                "관련자 성인 등 특정 불가",
            ),
        ]

        for document_type, flow_selection, expected_judgment in cases:
            with self.subTest(document_type=document_type, flow_selection=flow_selection):
                block = self.generate(document_type, flow_selection, source_text=source_text)
                self.assertTrue(block.text.startswith("사안조사 결과, 2026년 4월 15일"))
                self.assertIn("운동장 뒤편", block.text)
                self.assertIn("언어적 충돌", block.text)
                self.assertIn(expected_judgment, block.text)
                self.assertNotIn("....", block.text)
                self.assertNotIn("즉시 상.", block.text)
                self.assertNotIn("즉시 상 등", block.text)
                self.assertNotIn("즉시 등", block.text)
                self.assertLessEqual(len(block.text), block.char_limit)

    def test_balanced_strictness_changes_mock_generation_style(self) -> None:
        strict_block = self.generate(
            DocumentType.FORM_20_SELF_RESOLUTION_CONSENT,
            FlowSelection.SELF_RESOLUTION,
            generation_options=GenerationOptions(strictness=GenerationStrictness.STRICT),
        )
        balanced_block = self.generate(
            DocumentType.FORM_20_SELF_RESOLUTION_CONSENT,
            FlowSelection.SELF_RESOLUTION,
            generation_options=GenerationOptions(strictness=GenerationStrictness.BALANCED),
        )

        self.assertNotEqual(strict_block.text, balanced_block.text)
        self.assertIn("보호자에게 관련 내용을 전달하고 동의 절차를 진행하고자 함", balanced_block.text)
        self.assertLessEqual(len(balanced_block.text), balanced_block.char_limit)

    def test_balanced_self_resolution_keeps_required_legal_factors(self) -> None:
        block = self.generate(
            DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
            FlowSelection.SELF_RESOLUTION,
            generation_options=GenerationOptions(strictness=GenerationStrictness.BALANCED),
        )

        required_phrases = [
            "양측 간 사과",
            "신체적/정신적 피해 경미",
            "지속적이거나 반복적으로 보기 어려운 점",
            "보복행위가 없었던 점",
            "학교폭력 예방 및 대책에 관한 법률 상 학교장 자체해결",
        ]
        for phrase in required_phrases:
            self.assertIn(phrase, block.text)
        self.assertLessEqual(len(block.text), block.char_limit)

    def test_source_text_is_required(self) -> None:
        with self.assertRaises(FormSourceRequiredError):
            self.generator.generate(
                document_type=DocumentType.FORM_18_COMMITTEE_REVIEW_RESULT,
                flow_selection=FlowSelection.SELF_RESOLUTION,
                source_text="",
            )


if __name__ == "__main__":
    unittest.main()

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ai.intake_generator import MockCaseIntakeGenerator
from app.core.errors import IntakeSourceRequiredError


class MockCaseIntakeGeneratorTest(unittest.TestCase):
    def setUp(self) -> None:
        self.generator = MockCaseIntakeGenerator()

    def test_generates_form_10_draft_from_statement(self) -> None:
        draft = self.generator.generate(
            statement="2026년 4월 15일 점심시간, 장소: 운동장 뒤편, 학생 간 언어적 충돌이 있었고 즉시 상담함.",
            tone="공식 문서체",
        )

        self.assertEqual("서식 10: 사안접수 보고용", draft.title)
        self.assertEqual("2026년 4월 15일", draft.timeline.date)
        self.assertEqual("운동장 뒤편", draft.timeline.place)
        self.assertIn("학교폭력 사안 접수 절차", draft.timeline.summary)
        self.assertGreater(len(draft.actions), 0)
        self.assertEqual(1000, draft.char_limit)
        self.assertLessEqual(draft.char_count, draft.char_limit)

    def test_form_10_char_count_tracks_occurrence_field_only(self) -> None:
        draft = self.generator.generate(
            statement="2026년 4월 15일 점심시간, 장소: 운동장 뒤편, 학생 간 언어적 충돌이 있었고 즉시 상담함.",
            tone="공식 문서체",
        )
        occurrence_text = "\n".join(
            [
                f"일시: {draft.timeline.date}",
                f"장소: {draft.timeline.place}",
                f"경위: {draft.timeline.summary}",
            ]
        )

        self.assertEqual(len(occurrence_text), draft.char_count)

    def test_form_10_uses_administrative_non_honorific_style(self) -> None:
        draft = self.generator.generate(
            statement="2026년 4월 15일 점심시간, 장소: 운동장 뒤편, 학생 간 언어적 충돌이 있었고 즉시 상담함.",
            tone="공식 문서체",
        )
        text = " ".join([draft.overview, draft.timeline.summary, *draft.actions])

        banned_phrases = ["합니다", "습니다", "드립니다", "주시기 바랍니다", "협조", "부탁드립니다"]
        for phrase in banned_phrases:
            self.assertNotIn(phrase, text)

    def test_empty_statement_is_rejected(self) -> None:
        with self.assertRaises(IntakeSourceRequiredError):
            self.generator.generate(statement="   ", tone="공식 문서체")


if __name__ == "__main__":
    unittest.main()

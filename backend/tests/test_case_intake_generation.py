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
        self.assertLessEqual(draft.char_count, draft.char_limit)

    def test_empty_statement_is_rejected(self) -> None:
        with self.assertRaises(IntakeSourceRequiredError):
            self.generator.generate(statement="   ", tone="공식 문서체")


if __name__ == "__main__":
    unittest.main()

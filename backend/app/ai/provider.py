from dataclasses import dataclass

from app.ai.generator import GeminiGenerator, MockGenerator
from app.ai.intake_generator import GeminiCaseIntakeGenerator, MockCaseIntakeGenerator
from app.core.settings import AppSettings, get_settings


@dataclass(frozen=True)
class AIProviderStatus:
    provider: str
    label: str
    model: str | None
    configured: bool


def get_ai_provider_status(settings: AppSettings | None = None) -> AIProviderStatus:
    settings = settings or get_settings()
    if settings.ai_provider == "gemini":
        return AIProviderStatus(
            provider="gemini",
            label="Gemini API",
            model=settings.gemini_model,
            configured=bool(settings.gemini_api_key),
        )

    return AIProviderStatus(provider="mock", label="MockGenerator", model=None, configured=True)


def build_document_generator(settings: AppSettings | None = None) -> MockGenerator:
    settings = settings or get_settings()
    if settings.ai_provider == "gemini":
        return GeminiGenerator(
            api_key=settings.gemini_api_key,
            model=settings.gemini_model,
            fallback_model=settings.gemini_fallback_model,
        )
    return MockGenerator()


def build_intake_generator(settings: AppSettings | None = None) -> MockCaseIntakeGenerator:
    settings = settings or get_settings()
    if settings.ai_provider == "gemini":
        return GeminiCaseIntakeGenerator(
            api_key=settings.gemini_api_key,
            model=settings.gemini_model,
            fallback_model=settings.gemini_fallback_model,
        )
    return MockCaseIntakeGenerator()

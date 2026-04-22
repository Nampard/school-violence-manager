from dataclasses import dataclass
import os
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_ROOT / ".env"


def load_env_file(path: Path = ENV_FILE) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


@dataclass(frozen=True)
class AppSettings:
    ai_provider: str
    gemini_api_key: str
    gemini_model: str


def get_settings() -> AppSettings:
    load_env_file()
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    configured_provider = os.getenv("AI_PROVIDER", "auto").strip().lower()

    if configured_provider == "auto":
        ai_provider = "gemini" if gemini_api_key else "mock"
    else:
        ai_provider = configured_provider

    return AppSettings(
        ai_provider=ai_provider,
        gemini_api_key=gemini_api_key,
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip() or "gemini-2.5-flash",
    )

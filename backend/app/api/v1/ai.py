from fastapi import APIRouter

from app.ai.provider import get_ai_provider_status

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/status")
def ai_status() -> dict[str, object]:
    status = get_ai_provider_status()
    return {
        "status": "success",
        "data": {
            "provider": status.provider,
            "label": status.label,
            "model": status.model,
            "configured": status.configured,
        },
        "meta": {},
    }

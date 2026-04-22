HONORIFIC_BANNED_PHRASES = [
    "합니다",
    "습니다",
    "드립니다",
    "바랍니다",
    "주시기 바랍니다",
    "협조하여 주시기 바랍니다",
    "협조 바랍니다",
    "부탁드립니다",
]


def enforce_administrative_prose(text: str) -> str:
    normalized = " ".join(text.replace("\n", " ").split()).strip(" \"'")

    replacements = [
        ("발생하였습니다", "발생함"),
        ("확인되었습니다", "확인됨"),
        ("검토되었습니다", "검토됨"),
        ("판단되었습니다", "판단됨"),
        ("실시하였습니다", "실시함"),
        ("안내하였습니다", "안내함"),
        ("완료되었습니다", "완료됨"),
        ("이루어졌습니다", "이루어짐"),
        ("볼 수 있습니다", "볼 수 있음"),
        ("할 수 있습니다", "할 수 있음"),
        ("필요합니다", "필요함"),
        ("요구됩니다", "요구됨"),
        ("해당합니다", "해당함"),
        ("확인됩니다", "확인됨"),
        ("판단됩니다", "판단됨"),
        ("검토됩니다", "검토됨"),
        ("진행됩니다", "진행됨"),
        ("진행하고자 합니다", "진행하는 것으로 검토됨"),
        ("진행하고자 함", "진행하는 것으로 검토됨"),
        ("협조하여 주시기 바랍니다", "확인 대상으로 정리됨"),
        ("협조 바랍니다", "확인 대상으로 정리됨"),
        ("주시기 바랍니다", "확인 대상으로 정리됨"),
        ("부탁드립니다", "확인 대상으로 정리됨"),
        ("안내드립니다", "안내함"),
        ("드립니다", "함"),
    ]
    for old, new in replacements:
        normalized = normalized.replace(old, new)

    return normalized


def has_honorific_notice_style(text: str) -> bool:
    return any(phrase in text for phrase in HONORIFIC_BANNED_PHRASES)

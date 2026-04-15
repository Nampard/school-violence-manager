from dataclasses import dataclass, field
from uuid import uuid4

from app.ai.generator import CopyBlock


@dataclass
class StoredGeneratedTextBlock:
    id: str
    case_id: str
    copy_block: CopyBlock


@dataclass
class InMemoryGeneratedTextBlockRepository:
    blocks: list[StoredGeneratedTextBlock] = field(default_factory=list)

    def save(self, *, case_id: str, copy_block: CopyBlock) -> StoredGeneratedTextBlock:
        stored = StoredGeneratedTextBlock(id=str(uuid4()), case_id=case_id, copy_block=copy_block)
        self.blocks.append(stored)
        return stored

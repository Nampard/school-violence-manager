from dataclasses import dataclass

from app.ai.generator import CopyBlock, MockGenerator, SourceBlocks
from app.domain.drafts import DocumentType, FlowSelection
from app.services.generated_text_blocks.repository import InMemoryGeneratedTextBlockRepository


@dataclass(frozen=True)
class GenerationResult:
    case_id: str
    document_type: DocumentType
    flow_selection: FlowSelection
    copy_block: CopyBlock
    generated_text_block_id: str


class GeneratedTextBlockService:
    def __init__(
        self,
        *,
        generator: MockGenerator | None = None,
        repository: InMemoryGeneratedTextBlockRepository | None = None,
    ) -> None:
        self._generator = generator or MockGenerator()
        self._repository = repository or InMemoryGeneratedTextBlockRepository()

    def generate(
        self,
        *,
        case_id: str,
        document_type: DocumentType,
        flow_selection: FlowSelection,
        source_text: str,
        source_blocks: SourceBlocks | None = None,
    ) -> GenerationResult:
        copy_block = self._generator.generate(
            document_type=document_type,
            flow_selection=flow_selection,
            source_text=source_text,
            source_blocks=source_blocks,
        )
        stored = self._repository.save(case_id=case_id, copy_block=copy_block)
        return GenerationResult(
            case_id=case_id,
            document_type=document_type,
            flow_selection=flow_selection,
            copy_block=copy_block,
            generated_text_block_id=stored.id,
        )

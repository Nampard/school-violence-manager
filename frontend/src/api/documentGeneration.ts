import type { DocumentType, FlowSelection } from '../domain/draftFlow'
import type { CharLimitMode, GenerationStrictness } from '../domain/generationSettings'

export interface GenerateDocumentPayload {
  document_type: DocumentType
  flow_selection: FlowSelection
  source_text: string
  source_blocks?: {
    form_18_text?: string
    form_19_text?: string
  }
  generation_options?: {
    strictness: GenerationStrictness
    char_limit_mode: CharLimitMode
  }
  output_mode?: 'COPY_BLOCKS'
}

export interface CopyBlock {
  label: string
  source_form: string
  target_form: string
  target_field: string
  text: string
  char_limit: number
  style_profile: string
  review_required: boolean
}

export interface GenerateDocumentResponse {
  status: 'success'
  data: {
    case_id: string
    document_type: DocumentType
    flow_selection: FlowSelection
    generated_text_block_id: string
    copy_block: CopyBlock
  }
  meta: {
    request_id: string
  }
}

interface ErrorResponse {
  status: 'error'
  error: {
    code: string
    message: string
  }
  meta?: {
    request_id: string
  }
}

export async function generateDocumentDraft(caseId: string, payload: GenerateDocumentPayload): Promise<CopyBlock> {
  let response: Response
  try {
    response = await fetch(`/api/v1/cases/${caseId}/documents/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        output_mode: payload.output_mode ?? 'COPY_BLOCKS',
      }),
    })
  } catch {
    throw new Error('백엔드 서버에 연결할 수 없습니다. 127.0.0.1:8000 서버를 먼저 실행해 주세요.')
  }

  let body: GenerateDocumentResponse | ErrorResponse
  try {
    body = (await response.json()) as GenerateDocumentResponse | ErrorResponse
  } catch {
    throw new Error('백엔드 응답을 읽을 수 없습니다. 서버 로그를 확인해 주세요.')
  }

  if (!response.ok || body.status === 'error') {
    const message =
      body.status === 'error'
        ? body.error.message
        : '문구 생성 요청에 실패했습니다. 백엔드 서버 상태를 확인해 주세요.'
    throw new Error(message)
  }

  return body.data.copy_block
}

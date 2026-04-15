export interface Form10Draft {
  title: string
  subtitle: string
  overview: string
  timeline: {
    date: string
    place: string
    summary: string
  }
  actions: string[]
  char_count?: number
  char_limit?: number
  generated_at?: string
}

interface GenerateCaseIntakeResponse {
  status: 'success'
  data: {
    case_id: string
    document_type: 'FORM_10_CASE_INTAKE'
    draft: Form10Draft
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

export async function generateCaseIntakeDraft(caseId: string, statement: string, tone: string): Promise<Form10Draft> {
  let response: Response
  try {
    response = await fetch(`/api/v1/cases/${caseId}/intake/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statement, tone }),
    })
  } catch {
    throw new Error('백엔드 서버에 연결할 수 없습니다. 127.0.0.1:8000 서버를 먼저 실행해 주세요.')
  }

  let body: GenerateCaseIntakeResponse | ErrorResponse
  try {
    body = (await response.json()) as GenerateCaseIntakeResponse | ErrorResponse
  } catch {
    throw new Error('백엔드 응답을 읽을 수 없습니다. 서버 로그를 확인해 주세요.')
  }

  if (!response.ok || body.status === 'error') {
    const message =
      body.status === 'error'
        ? body.error.message
        : '사안접수 초안 생성 요청에 실패했습니다. 백엔드 서버 상태를 확인해 주세요.'
    throw new Error(message)
  }

  return {
    ...body.data.draft,
    generated_at: new Date().toLocaleString('ko-KR', { hour12: false }),
  }
}

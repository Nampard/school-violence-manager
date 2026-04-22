export type AIProvider = 'mock' | 'gemini'

export interface AIStatus {
  provider: AIProvider
  label: string
  model: string | null
  configured: boolean
}

interface AIStatusResponse {
  status: 'success'
  data: AIStatus
  meta: Record<string, unknown>
}

export async function getAIStatus(): Promise<AIStatus> {
  const response = await fetch('/api/v1/ai/status')
  if (!response.ok) {
    throw new Error('AI 상태를 확인할 수 없습니다.')
  }

  const body = (await response.json()) as AIStatusResponse
  return body.data
}

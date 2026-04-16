export type GenerationEngine = 'MOCK'
export type GenerationTone = 'FORM_SPECIFIC'
export type GenerationStrictness = 'STRICT' | 'BALANCED'
export type CharLimitMode = 'ENFORCE' | 'WARN'

export interface GenerationSettings {
  engine: GenerationEngine
  tone: GenerationTone
  strictness: GenerationStrictness
  charLimitMode: CharLimitMode
}

export const defaultGenerationSettings: GenerationSettings = {
  engine: 'MOCK',
  tone: 'FORM_SPECIFIC',
  strictness: 'STRICT',
  charLimitMode: 'ENFORCE',
}

export const generationSettingLabels = {
  engine: {
    MOCK: 'MockGenerator',
  },
  tone: {
    FORM_SPECIFIC: '서식별 자동 문체',
  },
  strictness: {
    STRICT: '엄격',
    BALANCED: '보통',
  },
  charLimitMode: {
    ENFORCE: '글자 수 강제',
    WARN: '경고만 표시',
  },
} as const

export const generationSettingDescriptions = {
  strictness: {
    STRICT: '필수 판단 근거를 중심으로 짧고 단정하게 생성합니다.',
    BALANCED: '같은 기준을 유지하되 문장을 조금 더 자연스럽게 풀어 생성합니다.',
  },
  charLimitMode: {
    ENFORCE: '백엔드 생성 단계에서 글자 수 제한 준수를 우선합니다.',
    WARN: '초과 여부를 확인하되, 이후 실제 AI provider에서 경고 중심으로 운용할 수 있습니다.',
  },
} as const

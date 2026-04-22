import type { DocumentType } from '../domain/draftFlow'
import type { Form10Draft } from '../api/caseIntake'

export type ViewId = 'intake' | 'documents'

export interface CaseMeta {
  archiveName: string
  caseId: string
  studentLabel: string
  date: string
}

export interface DraftCard {
  id: string
  documentType: DocumentType
  draftNo: string
  title: string
  titleNote?: string
  tagTone: 'sage' | 'blue' | 'indigo'
  field: string
  limit: string
  body: string
  options?: string[]
  italic?: boolean
}

export const caseMeta: CaseMeta = {
  archiveName: 'ARCHIVE-01: 학교폭력 사안처리 생성기',
  caseId: '2024-082',
  studentLabel: '비식별 학생',
  date: '2026.04.14',
}

export const investigationSource = `[사건 개요]
2026년 4월 13일 점심시간, 학교 뒤편 운동장에서 관련 학생 A와 관련 학생 B 사이에 언어적 충돌이 발생함.
상담 결과 관련 학생 A는 장난이었다고 주장하나, 관련 학생 B는 지속적인 언어폭력으로 인한 심리적 불안을 호소하고 있음.
목격자 C의 진술에 따르면 해당 발언이 다소 강압적이었음을 확인.

[조사 상세]
- 발생 일시: 2026.04.13 12:45
- 발생 장소: 운동장 스탠드 뒤편
- 관련 학생: 비식별 학생 2명
- 조치 사항: 즉시 분리 조치 및 상담 실시`

export const documentDrafts: DraftCard[] = [
  {
    id: 'draft-18',
    documentType: 'FORM_18_COMMITTEE_REVIEW_RESULT',
    draftNo: 'DRAFT 18',
    title: '전담기구 보고서',
    titleNote: '(자체해결 or 심의요청)',
    tagTone: 'sage',
    field: '자체해결 또는 심의위원회 요청',
    limit: '124 / 500',
    options: ['학교장 자체해결', '학폭대책심의위 요청'],
    italic: true,
    body:
      '심의 내용을 생성합니다. 학교장 자체해결 또는 심의 요청의 상황에 맞게 행정 문체로 정리됩니다.',
  },
  {
    id: 'draft-19',
    documentType: 'FORM_19_COMMITTEE_CLOSURE_RESULT',
    draftNo: 'DRAFT 19',
    title: '전담기구 보고서(종결)',
    tagTone: 'blue',
    field: '종결 시(오인신고 등)',
    limit: '0 / 500',
    options: ['오인신고', '의심사안', '관련자 성인 등 특정 불가'],
    italic: true,
    body:
      '종결 처리를 위한 심의내용을 생성합니다. 오인신고, 학교폭력 의심사안, 관련자 특정 불가 등 사안 성격에 맞춰 행정 문체로 정리됩니다.',
  },
  {
    id: 'draft-20',
    documentType: 'FORM_20_SELF_RESOLUTION_CONSENT',
    draftNo: 'DRAFT 20',
    title: '자체해결 동의서(사안조사 내용)',
    tagTone: 'indigo',
    field: '보호자 전달 통지서 내용',
    limit: '118 / 400',
    italic: true,
    body:
      '자체 해결(종결) 동의서에 필요한 사안내용으로 정리됩니다.',
  },
  {
    id: 'draft-21',
    documentType: 'FORM_21_SELF_RESOLUTION_RESULT',
    draftNo: 'DRAFT 21',
    title: '종결처리 동의서(사안조사 내용)',
    tagTone: 'indigo',
    field: '보호자 전달 통지서 내용',
    limit: '82 / 400',
    italic: true,
    body:
      '자체 해결(종결) 동의서에 필요한 사안내용으로 정리됩니다.',
  },
]

export const comprehensiveDraft = {
  documentType: 'FORM_22_FINAL_CASE_SUMMARY' as const satisfies DocumentType,
  draftNo: 'DRAFT 22',
  title: '학교장 자체해결(종결) 결과 보고서',
  body:
    '피해학생과 관련 학생의 진술이 상충하는 부분이 있으나, 목격 학생의 일관된 진술과 당시 정황을 종합할 때 지속적인 언어적 압박이 있었던 것으로 판단됨. 학교폭력 전담기구의 심의를 거쳐 적절한 선도 및 보호 조치가 수립되어야 할 사안으로 분류함.',
  sourceForm: '서식 12 (Core Investigation)',
  targetField: '자체해결 또는 종결 결과 보고서',
  profile: 'Legal/Analytic',
}

export const form10Document: Form10Draft = {
  title: '서식 10: 사안접수 보고용',
  subtitle: '교육부 표준 양식 기반 AI 드래프트',
  overview:
    '본 보고서는 2026년 04월 13일 발생한 학생 간 갈등 사안에 대하여 학교폭력예방 및 대책에 관한 법률에 의거하여 작성되었습니다. 관련 학생들의 인적사항 및 구체적인 발생 경위는 아래와 같습니다.',
  timeline: {
    date: '2026년 04월 13일 12:45경',
    place: '운동장 스탠드 뒤편',
    summary:
      '관련 학생 A는 관련 학생 B에게 언어적 압박으로 인식될 수 있는 발언을 반복하였으며, 이에 관련 학생 B가 심리적 불안을 호소한 것으로 파악됨. 목격 학생의 진술에 따르면 신체적 접촉은 없었으나 위협적으로 받아들일 수 있는 표현이 있었던 것으로 확인됨.',
  },
  actions: ['즉시 분리 조치 및 피해 학생 상담 실시', '보호자 통보 및 사안 조사 안내 완료', '목격 학생 진술 확보 및 기록 보관'],
  char_count: 235,
  char_limit: 1000,
  generated_at: '2026.04.14 16:42:01',
}

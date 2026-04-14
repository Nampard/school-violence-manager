export type ViewId = 'intake' | 'documents'

export interface CaseMeta {
  archiveName: string
  caseId: string
  studentLabel: string
  date: string
}

export interface DraftCard {
  id: string
  draftNo: string
  title: string
  status: 'Review Pending' | 'Drafting' | 'Ready' | 'Refinement Required'
  statusTone: 'sage' | 'quiet' | 'danger'
  tagTone: 'sage' | 'blue' | 'indigo'
  field: string
  limit: string
  body: string
  italic?: boolean
}

export const caseMeta: CaseMeta = {
  archiveName: 'ARCHIVE-01: CASE CONTEXT',
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
    draftNo: 'DRAFT 18',
    title: '심의내용 (Official)',
    status: 'Review Pending',
    statusTone: 'sage',
    tagTone: 'sage',
    field: '심의 핵심 요약',
    limit: '124 / 500',
    body:
      '2026년 4월 13일 발생한 사안에 대하여 조사한 결과, 관련 학생들 간의 언어적 분쟁이 확인됨. 발언 수위와 지속성을 고려할 때 학교폭력 전담기구 심의를 통한 조치 검토가 필요함.',
  },
  {
    id: 'draft-19',
    draftNo: 'DRAFT 19',
    title: '종결용 심의내용',
    status: 'Drafting',
    statusTone: 'quiet',
    tagTone: 'blue',
    field: '종결 확인서',
    limit: '0 / 500',
    italic: true,
    body:
      'Generating summary for case closure... This content focuses on the final resolution steps and mutual agreement status between parties.',
  },
  {
    id: 'draft-20',
    draftNo: 'DRAFT 20',
    title: '보호자용 중립 문체',
    status: 'Ready',
    statusTone: 'sage',
    tagTone: 'indigo',
    field: '통지서 내용',
    limit: '118 / 400',
    body:
      '해당 사안은 학교 내에서 학생들 간 발생한 갈등 상황으로, 학교는 중립적인 입장에서 양측 학생의 진술을 청취하였습니다. 보호자분께서는 학생의 심리적 안정을 우선해 주시길 부탁드립니다.',
  },
  {
    id: 'draft-21',
    draftNo: 'DRAFT 21',
    title: '보호자용 (Simplified)',
    status: 'Refinement Required',
    statusTone: 'danger',
    tagTone: 'indigo',
    field: 'SMS/알림톡',
    limit: '82 / 400',
    body:
      '학생 간의 갈등이 발생하여 학교 측에서 조사를 진행하고 있습니다. 관련하여 문의사항이 있으시면 교무실로 연락 바랍니다. 현재 조사 단계이므로 확정된 사실은 없습니다.',
  },
]

export const comprehensiveDraft = {
  draftNo: 'DRAFT 22',
  title: '종합 사안조사 내용 (Comprehensive)',
  body:
    '피해학생과 관련 학생의 진술이 상충하는 부분이 있으나, 목격 학생의 일관된 진술과 당시 정황을 종합할 때 지속적인 언어적 압박이 있었던 것으로 판단됨. 학교폭력 전담기구의 심의를 거쳐 적절한 선도 및 보호 조치가 수립되어야 할 사안으로 분류함.',
  sourceForm: '서식 12 (Core Investigation)',
  targetField: '종합 조사 결론',
  profile: 'Legal/Analytic',
}

export const form10Document = {
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
}

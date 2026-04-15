export type DocumentType =
  | 'FORM_18_COMMITTEE_REVIEW_RESULT'
  | 'FORM_19_COMMITTEE_CLOSURE_RESULT'
  | 'FORM_20_SELF_RESOLUTION_CONSENT'
  | 'FORM_21_SELF_RESOLUTION_RESULT'
  | 'FORM_22_FINAL_CASE_SUMMARY'

export type FlowSelection =
  | 'SELF_RESOLUTION'
  | 'COMMITTEE_REQUEST'
  | 'CLOSURE_FALSE_REPORT'
  | 'CLOSURE_SUSPECTED_CASE'
  | 'CLOSURE_ADULT_OR_UNIDENTIFIABLE'

export const flowByDraftOption: Record<string, FlowSelection> = {
  '학교장 자체해결': 'SELF_RESOLUTION',
  '학폭대책심의위 요청': 'COMMITTEE_REQUEST',
  오인신고: 'CLOSURE_FALSE_REPORT',
  의심사안: 'CLOSURE_SUSPECTED_CASE',
  '관련자 성인 등 특정 불가': 'CLOSURE_ADULT_OR_UNIDENTIFIABLE',
}

export const activeDocumentsByFlow: Record<FlowSelection, DocumentType[]> = {
  SELF_RESOLUTION: [
    'FORM_18_COMMITTEE_REVIEW_RESULT',
    'FORM_20_SELF_RESOLUTION_CONSENT',
    'FORM_22_FINAL_CASE_SUMMARY',
  ],
  COMMITTEE_REQUEST: ['FORM_18_COMMITTEE_REVIEW_RESULT'],
  CLOSURE_FALSE_REPORT: [
    'FORM_19_COMMITTEE_CLOSURE_RESULT',
    'FORM_21_SELF_RESOLUTION_RESULT',
    'FORM_22_FINAL_CASE_SUMMARY',
  ],
  CLOSURE_SUSPECTED_CASE: [
    'FORM_19_COMMITTEE_CLOSURE_RESULT',
    'FORM_21_SELF_RESOLUTION_RESULT',
    'FORM_22_FINAL_CASE_SUMMARY',
  ],
  CLOSURE_ADULT_OR_UNIDENTIFIABLE: [
    'FORM_19_COMMITTEE_CLOSURE_RESULT',
    'FORM_21_SELF_RESOLUTION_RESULT',
    'FORM_22_FINAL_CASE_SUMMARY',
  ],
}

export function getFlowForOption(option: string): FlowSelection | null {
  return flowByDraftOption[option] ?? null
}

export function getFlowOption(flowSelection: FlowSelection | null): string | null {
  if (!flowSelection) {
    return null
  }

  const option = Object.entries(flowByDraftOption).find(([, flow]) => flow === flowSelection)
  return option?.[0] ?? null
}

export function isClosureFlow(flowSelection: FlowSelection): boolean {
  return flowSelection.startsWith('CLOSURE_')
}

export function isDraftEnabled(documentType: DocumentType, flowSelection: FlowSelection | null): boolean {
  if (!flowSelection) {
    return true
  }

  return activeDocumentsByFlow[flowSelection].includes(documentType)
}

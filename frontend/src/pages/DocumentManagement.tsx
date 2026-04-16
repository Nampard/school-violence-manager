import { useState } from 'react'
import type { CopyBlock } from '../api/documentGeneration'
import { generateDocumentDraft } from '../api/documentGeneration'
import { ComprehensiveDraft } from '../components/stitch/ComprehensiveDraft'
import { DraftCardView } from '../components/stitch/DraftCard'
import { SourceDossier } from '../components/stitch/SourceDossier'
import { caseMeta, comprehensiveDraft, documentDrafts, investigationSource } from '../data/mockCase'
import type { DocumentType, FlowSelection } from '../domain/draftFlow'
import { activeDocumentsByFlow, getFlowForOption, isClosureFlow, isDraftEnabled } from '../domain/draftFlow'
import type { GenerationSettings } from '../domain/generationSettings'

const allDocumentTypes: DocumentType[] = [
  'FORM_18_COMMITTEE_REVIEW_RESULT',
  'FORM_19_COMMITTEE_CLOSURE_RESULT',
  'FORM_20_SELF_RESOLUTION_CONSENT',
  'FORM_21_SELF_RESOLUTION_RESULT',
  'FORM_22_FINAL_CASE_SUMMARY',
]

interface DocumentManagementProps {
  generationSettings: GenerationSettings
}

export function DocumentManagement({ generationSettings }: DocumentManagementProps) {
  const [source, setSource] = useState(investigationSource)
  const [dirty, setDirty] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [flowSelection, setFlowSelection] = useState<FlowSelection | null>(null)
  const [copyBlocks, setCopyBlocks] = useState<Partial<Record<DocumentType, CopyBlock>>>({})
  const [generatingDocuments, setGeneratingDocuments] = useState<ReadonlySet<DocumentType>>(new Set())
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const changeSource = (value: string) => {
    if (submitted) {
      return
    }

    setSource(value)
    setDirty(true)
  }

  const setGeneratingDocument = (documentType: DocumentType, generating: boolean) => {
    setGeneratingDocuments((current) => {
      const next = new Set(current)
      if (generating) {
        next.add(documentType)
      } else {
        next.delete(documentType)
      }
      return next
    })
  }

  const pruneInactiveBlocks = (nextFlow: FlowSelection) => {
    const activeDocuments = activeDocumentsByFlow[nextFlow]
    setCopyBlocks((current) => {
      const next: Partial<Record<DocumentType, CopyBlock>> = {}
      for (const documentType of allDocumentTypes) {
        if (activeDocuments.includes(documentType) && current[documentType]) {
          next[documentType] = current[documentType]
        }
      }
      return next
    })
  }

  const generateOne = async (
    documentType: DocumentType,
    nextFlow: FlowSelection,
    sourceBlocks: { form_18_text?: string; form_19_text?: string } = {},
  ) => {
    setGeneratingDocument(documentType, true)
    try {
      const block = await generateDocumentDraft(caseMeta.caseId, {
        document_type: documentType,
        flow_selection: nextFlow,
        source_text: source,
        source_blocks: sourceBlocks,
        generation_options: {
          strictness: generationSettings.strictness,
          char_limit_mode: generationSettings.charLimitMode,
        },
      })

      setCopyBlocks((current) => ({
        ...current,
        [documentType]: block,
      }))
      return block.text
    } finally {
      setGeneratingDocument(documentType, false)
    }
  }

  const generateForFlow = async (nextFlow: FlowSelection) => {
    setApiError(null)

    try {
      if (nextFlow === 'SELF_RESOLUTION') {
        const form18Text = await generateOne('FORM_18_COMMITTEE_REVIEW_RESULT', nextFlow)
        await generateOne('FORM_20_SELF_RESOLUTION_CONSENT', nextFlow, { form_18_text: form18Text })
        await generateOne('FORM_22_FINAL_CASE_SUMMARY', nextFlow, { form_18_text: form18Text })
        return true
      }

      if (nextFlow === 'COMMITTEE_REQUEST') {
        await generateOne('FORM_18_COMMITTEE_REVIEW_RESULT', nextFlow)
        return true
      }

      if (isClosureFlow(nextFlow)) {
        const form19Text = await generateOne('FORM_19_COMMITTEE_CLOSURE_RESULT', nextFlow)
        await generateOne('FORM_21_SELF_RESOLUTION_RESULT', nextFlow, { form_19_text: form19Text })
        await generateOne('FORM_22_FINAL_CASE_SUMMARY', nextFlow, { form_19_text: form19Text })
        return true
      }

      return false
    } catch (error) {
      setApiError(error instanceof Error ? error.message : '문구 생성 요청 중 알 수 없는 오류가 발생했습니다.')
      return false
    }
  }

  const selectFlowOption = (option: string) => {
    if (submitted) {
      return
    }

    const nextFlow = getFlowForOption(option)
    if (!nextFlow) {
      return
    }

    setFlowSelection(nextFlow)
    pruneInactiveBlocks(nextFlow)
    void generateForFlow(nextFlow).then((generated) => {
      if (generated) {
        setDirty(false)
      }
    })
  }

  const syncSource = () => {
    if (submitted) {
      setSubmitted(false)
      setApiError(null)
      return
    }

    setSyncing(true)
    void (async () => {
      if (flowSelection) {
        const generated = await generateForFlow(flowSelection)
        if (generated) {
          setDirty(false)
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 560))
        setDirty(false)
      }
      setSyncing(false)
    })()
  }

  const submitDrafts = () => {
    if (!flowSelection) {
      setApiError('먼저 DRAFT 18 또는 DRAFT 19의 처리 흐름을 선택해 주세요.')
      return
    }

    const activeDocuments = activeDocumentsByFlow[flowSelection]
    const missingDocument = activeDocuments.find((documentType) => !copyBlocks[documentType])
    if (missingDocument) {
      setApiError('활성 Draft 초안을 먼저 생성한 뒤 고정해 주세요.')
      return
    }

    setApiError(null)
    setDirty(false)
    setSubmitted(true)
  }

  const getLimitLabel = (documentType: DocumentType, fallback: string) => {
    const block = copyBlocks[documentType]
    if (!block) {
      return fallback
    }

    return `${block.text.length} / ${block.char_limit}`
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="document-header mb-8 gap-6">
        <div>
          <h2 className="text-[30px] font-black leading-tight text-ink">Draft Generation Workspace</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Convert primary case investigations into multiple specialized school report formats.</p>
          {submitted && <p className="mt-3 text-sm font-black leading-6 text-sage">초안이 고정되었습니다. 고정 해제 후 다시 수정하거나 생성할 수 있습니다.</p>}
          {apiError && <p className="mt-3 text-sm font-black leading-6 text-danger">{apiError}</p>}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={syncSource}
            className="rounded-md bg-surface-mid px-6 py-2 text-sm font-black text-primary transition hover:bg-surface-high"
          >
            {submitted ? '고정 해제(리셋)' : syncing ? '초안 생성 중' : '초안 다시 생성'}
          </button>
          <button
            type="button"
            onClick={submitDrafts}
            disabled={submitted || syncing || generatingDocuments.size > 0}
            className="rounded-md bg-primary px-6 py-2 text-sm font-black text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-primary"
          >
            {submitted ? '초안 고정됨' : '초안 고정'}
          </button>
        </div>
      </header>

      <div className="document-workspace">
        <div className="source-sticky">
          <SourceDossier value={source} dirty={dirty || syncing} locked={submitted} onChange={changeSource} onSync={syncSource} />
        </div>

        <section>
          <div className="draft-grid">
            {documentDrafts.map((draft) => (
              <DraftCardView
                key={draft.id}
                draft={draft}
                body={copyBlocks[draft.documentType]?.text}
                limit={getLimitLabel(draft.documentType, draft.limit)}
                disabled={!isDraftEnabled(draft.documentType, flowSelection)}
                generating={generatingDocuments.has(draft.documentType)}
                locked={submitted}
                selectedFlow={flowSelection}
                onOptionSelect={selectFlowOption}
              />
            ))}
            <div className="draft-wide">
              <ComprehensiveDraft
                body={copyBlocks[comprehensiveDraft.documentType]?.text}
                disabled={!isDraftEnabled(comprehensiveDraft.documentType, flowSelection)}
                generating={generatingDocuments.has(comprehensiveDraft.documentType)}
                locked={submitted}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

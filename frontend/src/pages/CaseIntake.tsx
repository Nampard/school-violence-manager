import { useState } from 'react'
import type { Form10Draft } from '../api/caseIntake'
import { generateCaseIntakeDraft } from '../api/caseIntake'
import { Form10Document } from '../components/stitch/Form10Document'
import { IntakeComposer } from '../components/stitch/IntakeComposer'
import { caseMeta } from '../data/mockCase'

export function CaseIntake() {
  const [statement, setStatement] = useState('')
  const [tone, setTone] = useState('공식 문서체')
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<Form10Draft | undefined>()
  const [apiError, setApiError] = useState<string | null>(null)

  const generate = async () => {
    if (!statement.trim()) return

    setLoading(true)
    setApiError(null)
    try {
      const generated = await generateCaseIntakeDraft(caseMeta.caseId, statement, tone)
      setDraft(generated)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : '사안접수 초안 생성 중 알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="mb-10">
        <h2 className="text-[30px] font-black leading-tight text-ink">Case Intake</h2>
        <p className="mt-2 max-w-[720px] text-sm leading-6 text-muted">
          사실 관계를 기반으로 서식 10호 사안접수 보고서를 생성합니다. 입력된 정보는 아카이브-01 엔진을 통해 법적 요건을 충족하는 문구로 변환됩니다.
        </p>
        {apiError && <p className="mt-3 text-sm font-black leading-6 text-danger">{apiError}</p>}
      </header>

      <div className="case-intake-grid">
        <IntakeComposer value={statement} tone={tone} loading={loading} onChange={setStatement} onToneChange={setTone} onGenerate={generate} />
        <Form10Document regenerating={loading} document={draft} />
      </div>
    </div>
  )
}

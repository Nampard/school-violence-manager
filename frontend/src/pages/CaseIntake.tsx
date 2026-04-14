import { useState } from 'react'
import { Form10Document } from '../components/stitch/Form10Document'
import { IntakeComposer } from '../components/stitch/IntakeComposer'

export function CaseIntake() {
  const [statement, setStatement] = useState('')
  const [tone, setTone] = useState('공식 문서체')
  const [loading, setLoading] = useState(false)

  const generate = () => {
    if (!statement.trim()) return

    setLoading(true)
    setTimeout(() => setLoading(false), 650)
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="mb-10">
        <h2 className="text-[30px] font-black leading-tight text-ink">Case Intake</h2>
        <p className="mt-2 max-w-[720px] text-sm leading-6 text-muted">
          사실 관계를 기반으로 서식 10호 사안접수 보고서를 생성합니다. 입력된 정보는 아카이브-01 엔진을 통해 법적 요건을 충족하는 문구로 변환됩니다.
        </p>
      </header>

      <div className="case-intake-grid">
        <IntakeComposer value={statement} tone={tone} loading={loading} onChange={setStatement} onToneChange={setTone} onGenerate={generate} />
        <Form10Document regenerating={loading} />
      </div>
    </div>
  )
}

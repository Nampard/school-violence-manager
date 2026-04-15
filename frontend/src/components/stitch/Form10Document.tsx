import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Form10Draft } from '../../api/caseIntake'
import { form10Document } from '../../data/mockCase'

interface Form10DocumentProps {
  regenerating: boolean
  document?: Form10Draft
}

export function Form10Document({ regenerating, document = form10Document }: Form10DocumentProps) {
  const [copied, setCopied] = useState(false)
  const copyText = useMemo(
    () =>
      [
        '1. 사안 개요',
        document.overview,
        '',
        '2. 발생 경위',
        `일시: ${document.timeline.date}`,
        `장소: ${document.timeline.place}`,
        `경위: ${document.timeline.summary}`,
        '',
        '3. 조치 사항',
        ...document.actions.map((action) => `- ${action}`),
      ].join('\n'),
    [document],
  )
  const charLimit = document.char_limit ?? 4000
  const charCount = document.char_count ?? copyText.length
  const progress = `${Math.max(6, Math.min(100, Math.round((charCount / charLimit) * 100)))}%`

  const copy = () => {
    navigator.clipboard?.writeText(copyText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-black text-muted">
          <span className="material-symbols-outlined text-[24px] text-sage">verified</span>
          Format 10 AI Generated Result
        </div>
        <span className="inline-flex items-center gap-2 rounded-md bg-sage-soft px-4 py-2 text-[12px] font-black text-sage">
          <span className="h-1.5 w-1.5 rounded-sm bg-sage" />
          교사 검토 필요
        </span>
      </div>

      <div className={`rounded-lg p-0.5 shadow-[0_18px_46px_rgba(53,79,65,0.15)] ${regenerating ? 'bg-surface-mid' : 'ai-draft-surface'}`}>
        <article className="flex h-[720px] flex-col overflow-hidden rounded-lg bg-white">
          <header className="flex items-start justify-between gap-6 px-8 py-8 shadow-[0_1px_0_rgba(11,28,48,0.06)]">
            <div>
              <h3 className="text-xl font-black leading-tight text-ink">{document.title}</h3>
              <p className="mt-1 text-xs font-medium text-muted">{document.subtitle}</p>
            </div>
            <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-md bg-primary-soft px-4 py-2 text-sm font-black text-primary transition hover:bg-surface-mid">
              <span className="material-symbols-outlined text-[20px]">{copied ? 'check_circle' : 'content_copy'}</span>
              {copied ? '복사됨' : '복사하기'}
            </button>
          </header>

          <div className="flex-1 space-y-8 overflow-y-auto px-10 py-10">
            <ReportSection title="1. 사안 개요">
              <p>{document.overview}</p>
            </ReportSection>

            <ReportSection title="2. 발생 경위 (AI 정리)">
              <div className="space-y-5 rounded-lg bg-surface-low/55 p-7 shadow-[inset_0_0_0_1px_rgba(197,197,212,0.22)]">
                <FactRow label="일시">{document.timeline.date}</FactRow>
                <FactRow label="장소">{document.timeline.place}</FactRow>
                <FactRow label="경위">{document.timeline.summary}</FactRow>
              </div>
            </ReportSection>

            <ReportSection title="3. 조치 사항">
              <ul className="list-inside list-disc space-y-2">
                {document.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </ReportSection>
          </div>

          <footer className="flex items-center justify-between gap-4 bg-[#f7f9ff] px-8 py-4">
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-semibold text-[#8190a4]">CHARS: {charCount.toLocaleString()} / {charLimit.toLocaleString()}</span>
              <div className="h-1.5 w-36 overflow-hidden rounded-md bg-surface-mid">
                <div className="h-full bg-primary" style={{ width: progress }} />
              </div>
            </div>
            <p className="text-[12px] italic text-[#8190a4]">마지막 생성: {document.generated_at ?? '샘플 문서'}</p>
          </footer>
        </article>
      </div>

      <div className="flex items-start gap-4 rounded-lg bg-sage-soft/35 p-5">
        <span className="material-symbols-outlined mt-0.5 text-[22px] text-sage">info</span>
        <p className="text-[13px] leading-7 text-sage">
          <strong>Stoic Tip:</strong> 생성된 초안은 법적 증거로 활용될 수 있으므로, 반드시 실제 사실 관계와 일치하는지 담당 교사의 정밀한 검토를 거쳐야 합니다.
        </p>
      </div>
    </section>
  )
}

function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 text-sm leading-7 text-ink">
      <h4 className="pb-2 text-xs font-black text-muted shadow-[0_1px_0_rgba(11,28,48,0.07)]">{title}</h4>
      {children}
    </section>
  )
}

function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-5 sm:grid-cols-[52px_minmax(0,1fr)]">
      <span className="text-xs font-black text-primary-fixed-dim">{label}</span>
      <p className="text-sm leading-7 text-ink">{children}</p>
    </div>
  )
}

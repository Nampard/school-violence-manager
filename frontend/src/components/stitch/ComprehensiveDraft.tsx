import { useState } from 'react'
import { comprehensiveDraft } from '../../data/mockCase'

interface ComprehensiveDraftProps {
  body?: string
  disabled?: boolean
  generating?: boolean
  locked?: boolean
}

type ComprehensiveStatusTone = 'sage' | 'quiet' | 'danger' | 'primary'

const statusToneClass: Record<ComprehensiveStatusTone, string> = {
  sage: 'bg-sage-soft text-sage',
  quiet: 'bg-surface-mid text-muted',
  danger: 'bg-danger-soft text-danger',
  primary: 'bg-primary-soft text-primary',
}

function getComprehensiveStatus({
  disabled,
  generating,
  locked,
  generated,
}: {
  disabled: boolean
  generating: boolean
  locked: boolean
  generated: boolean
}) {
  if (disabled) {
    return { label: '비활성', tone: 'danger' as const }
  }

  if (generating) {
    return { label: '생성 중', tone: 'quiet' as const }
  }

  if (locked) {
    return { label: '초안 고정됨', tone: 'sage' as const }
  }

  if (generated) {
    return { label: '초안 생성됨', tone: 'primary' as const }
  }

  return { label: '초안 대기', tone: 'quiet' as const }
}

export function ComprehensiveDraft({ body, disabled = false, generating = false, locked = false }: ComprehensiveDraftProps) {
  const [copied, setCopied] = useState(false)
  const status = getComprehensiveStatus({ disabled, generating, locked, generated: body !== undefined })
  const displayBody = disabled ? '비활성 상태임' : generating ? '생성 중...' : body ?? comprehensiveDraft.body

  const copy = () => {
    if (disabled || generating) {
      return
    }

    navigator.clipboard?.writeText(displayBody).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    })
  }

  return (
    <article className="rounded-lg bg-white p-6 shadow-[inset_0_4px_0_#bac3ff,0_10px_34px_rgba(11,28,48,0.05)]">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="rounded bg-primary-soft px-2.5 py-1 text-[11px] font-black uppercase text-primary">{comprehensiveDraft.draftNo}</span>
          <h4 className="mt-3 text-lg font-black text-ink">{comprehensiveDraft.title}</h4>
        </div>
        <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-[11px] font-black ${statusToneClass[status.tone]}`}>
          <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
          {status.label}
        </div>
      </header>

      <div className="rounded-lg bg-gradient-to-br from-surface-low via-white to-sage-soft/35 p-5 shadow-[inset_0_0_0_1px_rgba(45,64,159,0.12)]">
        <p className={`text-sm leading-7 ${disabled ? 'font-black text-danger' : 'text-on-surface-variant'}`}>{displayBody}</p>
      </div>

      <footer className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid gap-7 sm:grid-cols-3">
          <Meta label="Source Form" value={comprehensiveDraft.sourceForm} />
          <Meta label="Target Field" value={comprehensiveDraft.targetField} />
          <Meta label="Profile" value={comprehensiveDraft.profile} accent />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copy}
            disabled={disabled || generating}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white transition hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-primary"
          >
            <span className="material-symbols-outlined text-[20px]">{copied ? 'check_circle' : 'content_copy'}</span>
          </button>
        </div>
      </footer>
    </article>
  )
}

function Meta({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase text-muted">{label}</p>
      <p className={`mt-1 text-[13px] font-black ${accent ? 'text-primary' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

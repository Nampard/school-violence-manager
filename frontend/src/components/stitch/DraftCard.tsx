import { useState } from 'react'
import type { DraftCard } from '../../data/mockCase'
import type { FlowSelection } from '../../domain/draftFlow'
import { getFlowForOption } from '../../domain/draftFlow'

interface DraftCardProps {
  draft: DraftCard
  body?: string
  limit?: string
  disabled?: boolean
  generating?: boolean
  selectedFlow?: FlowSelection | null
  onOptionSelect?: (option: string) => void
}

const tagToneClass: Record<DraftCard['tagTone'], string> = {
  sage: 'bg-[#4c6758] text-white',
  blue: 'bg-secondary-container text-on-secondary-container',
  indigo: 'bg-primary-soft text-primary',
}

const statusToneClass: Record<DraftCard['statusTone'], string> = {
  sage: 'bg-sage-soft text-sage',
  quiet: 'bg-surface-mid text-muted',
  danger: 'bg-danger-soft text-danger',
}

export function DraftCardView({
  draft,
  body,
  limit,
  disabled = false,
  generating = false,
  selectedFlow = null,
  onOptionSelect,
}: DraftCardProps) {
  const [copied, setCopied] = useState(false)
  const isGenerated = body !== undefined
  const displayBody = disabled ? '비활성 상태임' : generating ? '생성 중...' : body ?? draft.body

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
    <article className="flex min-h-[250px] flex-col rounded-lg bg-white p-6 shadow-[0_10px_34px_rgba(11,28,48,0.05)] transition hover:shadow-[0_18px_42px_rgba(11,28,48,0.08)]">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className={`rounded px-2.5 py-1 text-[11px] font-black uppercase ${tagToneClass[draft.tagTone]}`}>{draft.draftNo}</span>
          <h4 className="mt-3 text-base font-black leading-6 text-ink">
            {draft.title}
            {draft.titleNote && <span className="ml-1 inline-block text-[0.8em]">{draft.titleNote}</span>}
          </h4>
        </div>
        <span className={`rounded-md px-3 py-2 text-[11px] font-black ${statusToneClass[draft.statusTone]}`}>{draft.status}</span>
      </header>

      <div className="ai-draft-surface mb-4 flex-1 rounded-lg p-4">
        <p
          className={`text-sm leading-7 ${
            disabled
              ? 'font-black text-danger'
              : draft.italic && !isGenerated
                ? 'italic text-muted'
                : 'text-on-surface-variant'
          }`}
        >
          {displayBody}
        </p>
      </div>

      {draft.options && (
        <div className="mb-5 flex flex-wrap gap-2">
          {draft.options.map((option) => {
            const active = getFlowForOption(option) === selectedFlow
            return (
              <button
                key={option}
                type="button"
                onClick={() => onOptionSelect?.(option)}
                className={`rounded-md px-3 py-2 text-xs font-black transition ${
                  active ? 'bg-primary text-white' : 'bg-surface-mid text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between gap-5">
        <div className="flex gap-10">
          <Meta label="Field" value={draft.field} />
          <Meta label="Limit" value={limit ?? draft.limit} />
        </div>
        <button
          type="button"
          onClick={copy}
          disabled={disabled || generating}
          aria-label={`${draft.title} 복사`}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-mid text-ink transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-surface-mid disabled:hover:text-ink"
        >
          <span className="material-symbols-outlined text-[18px]">{copied ? 'check_circle' : 'content_copy'}</span>
        </button>
      </footer>
    </article>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase text-muted">{label}</p>
      <p className="mt-1 text-[13px] font-bold text-ink">{value}</p>
    </div>
  )
}

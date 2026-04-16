interface HelpAnchor {
  x: number
  y: number
}

interface HelpPopoverProps {
  anchor: HelpAnchor | null
  onClose: () => void
}

export function HelpPopover({ anchor, onClose }: HelpPopoverProps) {
  if (!anchor) {
    return null
  }

  const width = 340
  const estimatedHeight = 244
  const margin = 16
  const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth
  const viewportHeight = typeof window === 'undefined' ? 768 : window.innerHeight
  const maxLeft = Math.max(margin, viewportWidth - width - margin)
  const maxTop = Math.max(margin, viewportHeight - estimatedHeight - margin)
  const left = Math.min(Math.max(anchor.x + 12, margin), maxLeft)
  const preferredTop = anchor.y - estimatedHeight - 12
  const top =
    preferredTop > margin
      ? preferredTop
      : Math.min(Math.max(anchor.y + 16, margin), maxTop)

  return (
    <aside
      className="fixed z-[80] w-[340px] max-w-[calc(100vw-32px)] animate-fade-in rounded-lg border border-surface-mid bg-white p-5 text-ink shadow-[0_24px_70px_rgba(11,28,48,0.22)]"
      style={{ left, top }}
      role="dialog"
      aria-label="Help"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Help</p>
          <h2 className="mt-2 text-lg font-black">초안 생성 도움말</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-low hover:text-primary"
          aria-label="도움말 닫기"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="space-y-3 text-sm leading-6 text-muted">
        <p>서식 12 사안조사 보고서를 기준으로 선택한 처리 흐름에 맞는 Draft만 생성됩니다.</p>
        <p>비활성 Draft는 현재 흐름에서 사용하지 않는 서식이며, 생성 요청도 보내지 않습니다.</p>
        <p>초안 고정은 현재 문구를 잠그고, 고정 해제(리셋)는 다시 수정 가능한 상태로 돌립니다.</p>
      </div>
    </aside>
  )
}

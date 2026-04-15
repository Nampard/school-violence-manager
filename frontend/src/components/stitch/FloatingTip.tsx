import type { ReactNode } from 'react'

interface FloatingTipProps {
  title: string
  children: ReactNode
}

export function FloatingTip({ title, children }: FloatingTipProps) {
  return (
    <aside className="floating-tip rounded-lg bg-ink p-5 text-white shadow-[0_24px_60px_rgba(11,28,48,0.22)] transition-opacity duration-300 hover:opacity-20">
      <div className="mb-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-[22px] text-sage-soft">tips_and_updates</span>
        <p className="text-xs font-black uppercase">{title}</p>
      </div>
      <p className="text-xs leading-6 text-white/90">{children}</p>
    </aside>
  )
}

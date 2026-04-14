import { StitchSidebar } from './StitchSidebar'
import { StitchTopbar } from './StitchTopbar'
import type { ViewId } from '../../data/mockCase'
import type { ReactNode } from 'react'

interface StitchShellProps {
  activeView: ViewId
  onViewChange: (view: ViewId) => void
  children: ReactNode
}

export function StitchShell({ activeView, onViewChange, children }: StitchShellProps) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <StitchSidebar activeView={activeView} onViewChange={onViewChange} />
      <StitchTopbar activeView={activeView} onViewChange={onViewChange} />
      <main className="stitch-shell-main">{children}</main>
    </div>
  )
}

import { StitchSidebar } from './StitchSidebar'
import { StitchTopbar } from './StitchTopbar'
import type { ViewId } from '../../data/mockCase'
import type { TeacherProfile } from '../../domain/userProfile'
import type { MouseEvent, ReactNode } from 'react'

interface StitchShellProps {
  activeView: ViewId
  onViewChange: (view: ViewId) => void
  onHelpOpen: (event: MouseEvent<HTMLButtonElement>) => void
  profile: TeacherProfile
  onGenerationPanelOpen: () => void
  onProfileOpen: () => void
  children: ReactNode
}

export function StitchShell({ activeView, onViewChange, onHelpOpen, profile, onGenerationPanelOpen, onProfileOpen, children }: StitchShellProps) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <StitchSidebar activeView={activeView} onViewChange={onViewChange} onHelpOpen={onHelpOpen} profile={profile} />
      <StitchTopbar
        activeView={activeView}
        onViewChange={onViewChange}
        onHelpOpen={onHelpOpen}
        onGenerationPanelOpen={onGenerationPanelOpen}
        onProfileOpen={onProfileOpen}
      />
      <main className="stitch-shell-main">{children}</main>
    </div>
  )
}

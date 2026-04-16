import type { MouseEvent } from 'react'
import type { ViewId } from '../../data/mockCase'
import { getProfileDisplay } from '../../domain/userProfile'
import type { TeacherProfile } from '../../domain/userProfile'

interface StitchSidebarProps {
  activeView: ViewId
  onViewChange: (view: ViewId) => void
  onHelpOpen: (event: MouseEvent<HTMLButtonElement>) => void
  profile: TeacherProfile
}

const navItems: Array<{ id: ViewId; label: string; icon: string }> = [
  { id: 'intake', label: 'Case Intake', icon: 'assignment_add' },
  { id: 'documents', label: 'Document Management', icon: 'folder_open' },
]

export function StitchSidebar({ activeView, onViewChange, onHelpOpen, profile }: StitchSidebarProps) {
  const profileDisplay = getProfileDisplay(profile)

  return (
    <aside className="stitch-sidebar fixed left-0 top-0 z-50 h-screen w-64 flex-col bg-[#f8faff]">
      <div className="p-8">
        <h1 className="text-xl font-black leading-none text-primary">학폭기록 아카이브</h1>
        <p className="mt-2 text-xs font-medium text-muted">학생생활안전부</p>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-4">
        {navItems.map((item) => {
          const active = activeView === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-3 rounded-md px-4 py-3 text-left transition ${
                active
                  ? 'bg-primary-soft text-primary shadow-[inset_-4px_0_0_#3426dc]'
                  : 'text-muted hover:bg-surface-low hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              <span className="max-w-[150px] text-sm font-bold leading-5">{item.label}</span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={onHelpOpen}
          className="flex items-center gap-3 rounded-md px-4 py-3 text-left text-muted transition hover:bg-surface-low hover:text-primary"
        >
          <span className="material-symbols-outlined text-[24px]">help</span>
          <span className="text-sm font-medium">Help</span>
        </button>
      </nav>

      <div className="p-6">
        <div className="flex items-center gap-3 rounded-md bg-white px-3 py-3 shadow-[0_8px_28px_rgba(11,28,48,0.05)]">
          <div className="h-10 w-10 overflow-hidden rounded-md bg-gradient-to-b from-[#f6a63a] to-[#1f3348]">
            <div className="flex h-full w-full items-center justify-center">
              <span className="material-symbols-outlined text-[26px] text-white">person</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-ink">{profileDisplay.schoolName}</p>
            <p className="truncate text-xs text-muted">{profileDisplay.teacherName}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

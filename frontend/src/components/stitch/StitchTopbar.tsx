import { caseMeta } from '../../data/mockCase'
import type { ViewId } from '../../data/mockCase'

interface StitchTopbarProps {
  activeView: ViewId
  onViewChange: (view: ViewId) => void
}

export function StitchTopbar({ activeView, onViewChange }: StitchTopbarProps) {
  return (
    <header className="stitch-topbar sticky top-0 z-40 bg-white/90 shadow-[0_2px_18px_rgba(11,28,48,0.07)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-8">
        <div className="flex min-w-0 items-center gap-6">
          <h2 className="shrink-0 text-lg font-black uppercase text-primary">{caseMeta.archiveName}</h2>
          <span className="hidden h-5 w-px bg-surface-mid md:block" />
          <div className="hidden min-w-0 items-center gap-6 text-sm font-medium text-muted md:flex">
            <span className="text-primary">Case ID: {caseMeta.caseId}</span>
            <span>Student: {caseMeta.studentLabel}</span>
            <span>Date: {caseMeta.date}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-muted">
          <button type="button" aria-label="알림" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-surface-low hover:text-primary">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
          </button>
          <button type="button" aria-label="설정" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-surface-low hover:text-primary">
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
          <div className="hidden h-10 w-10 overflow-hidden rounded-md bg-gradient-to-b from-[#f6a63a] to-[#1f3348] sm:block">
            <span className="material-symbols-outlined flex h-full items-end justify-center pb-1 text-[26px] text-white">person</span>
          </div>
        </div>
      </div>

      <div className="stitch-mobile-tabs gap-2 overflow-x-auto px-6 pb-4 hide-scrollbar">
        <MobileTab active={activeView === 'intake'} label="Case Intake" onClick={() => onViewChange('intake')} />
        <MobileTab active={activeView === 'documents'} label="Document Management" onClick={() => onViewChange('documents')} />
      </div>
    </header>
  )
}

function MobileTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-md px-4 py-2 text-sm font-bold ${active ? 'bg-primary text-white' : 'bg-surface-low text-muted'}`}
    >
      {label}
    </button>
  )
}

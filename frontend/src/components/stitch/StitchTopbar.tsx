import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { caseMeta } from '../../data/mockCase'
import type { ViewId } from '../../data/mockCase'

interface StitchTopbarProps {
  activeView: ViewId
  onViewChange: (view: ViewId) => void
  onHelpOpen: (event: MouseEvent<HTMLButtonElement>) => void
  onGenerationPanelOpen: () => void
  onProfileOpen: () => void
}

const appVersion = '0.1.0'

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

function getKstTimestamp() {
  const now = new Date()

  return {
    date: dateFormatter.format(now).replaceAll('-', '.'),
    time: timeFormatter.format(now),
  }
}

export function StitchTopbar({ activeView, onViewChange, onHelpOpen, onGenerationPanelOpen, onProfileOpen }: StitchTopbarProps) {
  const [kstTimestamp, setKstTimestamp] = useState(() => getKstTimestamp())

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setKstTimestamp(getKstTimestamp())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  return (
    <header className="stitch-topbar sticky top-0 z-40 bg-white/90 shadow-[0_2px_18px_rgba(11,28,48,0.07)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-8">
        <div className="flex min-w-0 items-center gap-6">
          <h2 className="shrink-0 text-lg font-black uppercase text-primary">{caseMeta.archiveName}</h2>
          <span className="hidden h-5 w-px bg-surface-mid md:block" />
          <div className="hidden min-w-0 items-center gap-6 text-sm font-medium text-muted md:flex">
            <span className="text-primary">Date: {kstTimestamp.date}</span>
            <span>Time: {kstTimestamp.time}</span>
            <span>Version: {appVersion}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-muted">
          <button type="button" onClick={onHelpOpen} aria-label="Help" className="stitch-topbar-help h-10 w-10 items-center justify-center rounded-md hover:bg-surface-low hover:text-primary">
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>
          <button
            type="button"
            onClick={onGenerationPanelOpen}
            aria-label="생성 환경 제어판"
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-surface-low hover:text-primary"
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
          <button
            type="button"
            onClick={onProfileOpen}
            aria-label="사용자 정보 설정"
            className="hidden h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-[#f6a63a] to-[#1f3348] transition hover:brightness-105 sm:flex"
          >
            <span className="material-symbols-outlined text-[26px] text-white">person</span>
          </button>
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

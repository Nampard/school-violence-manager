import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { TeacherProfile } from '../../domain/userProfile'

interface ProfileDialogProps {
  open: boolean
  profile: TeacherProfile
  onClose: () => void
  onSave: (profile: TeacherProfile) => void
}

export function ProfileDialog({ open, profile, onClose, onSave }: ProfileDialogProps) {
  const [draftProfile, setDraftProfile] = useState(profile)

  useEffect(() => {
    if (open) {
      setDraftProfile(profile)
    }
  }, [open, profile])

  if (!open) {
    return null
  }

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({
      schoolName: draftProfile.schoolName.trim(),
      teacherName: draftProfile.teacherName.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/20 px-4 backdrop-blur-sm" role="presentation">
      <form
        onSubmit={submitProfile}
        className="w-full max-w-[420px] animate-fade-in rounded-lg border border-surface-mid bg-white p-6 shadow-[0_28px_80px_rgba(11,28,48,0.24)]"
        role="dialog"
        aria-modal="true"
        aria-label="교사 프로필 설정"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Profile</p>
            <h2 className="mt-2 text-xl font-black text-ink">사용자 정보</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-low hover:text-primary"
            aria-label="프로필 창 닫기"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <label className="block text-sm font-black text-ink" htmlFor="school-name">
          소속학교
        </label>
        <input
          id="school-name"
          type="text"
          value={draftProfile.schoolName}
          onChange={(event) => setDraftProfile((current) => ({ ...current, schoolName: event.target.value }))}
          className="mt-2 w-full rounded-md border border-surface-mid bg-surface px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:bg-white"
          placeholder="예: 충북기록고등학교"
        />

        <label className="mt-5 block text-sm font-black text-ink" htmlFor="teacher-name">
          교사 이름
        </label>
        <input
          id="teacher-name"
          type="text"
          value={draftProfile.teacherName}
          onChange={(event) => setDraftProfile((current) => ({ ...current, teacherName: event.target.value }))}
          className="mt-2 w-full rounded-md border border-surface-mid bg-surface px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-primary focus:bg-white"
          placeholder="예: 김기록"
        />

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md bg-surface-mid px-5 py-2 text-sm font-black text-primary hover:bg-surface-high">
            취소
          </button>
          <button type="submit" className="rounded-md bg-primary px-5 py-2 text-sm font-black text-white hover:bg-primary-deep">
            저장
          </button>
        </div>
      </form>
    </div>
  )
}

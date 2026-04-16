import type { GenerationSettings } from '../../domain/generationSettings'
import { generationSettingDescriptions, generationSettingLabels } from '../../domain/generationSettings'

interface GenerationControlPanelProps {
  open: boolean
  settings: GenerationSettings
  onClose: () => void
  onChange: (settings: GenerationSettings) => void
}

export function GenerationControlPanel({ open, settings, onClose, onChange }: GenerationControlPanelProps) {
  if (!open) {
    return null
  }

  return (
    <aside
      className="fixed right-6 top-20 z-[85] w-[380px] max-w-[calc(100vw-32px)] animate-fade-in rounded-lg border border-surface-mid bg-white p-5 text-ink shadow-[0_28px_80px_rgba(11,28,48,0.24)]"
      role="dialog"
      aria-label="생성 환경 제어판"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Control Panel</p>
          <h2 className="mt-2 text-xl font-black">생성 환경 제어판</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-low hover:text-primary"
          aria-label="제어판 닫기"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="space-y-5">
        <section className="rounded-lg bg-surface p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Generation Engine</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-ink">{generationSettingLabels.engine[settings.engine]}</p>
              <p className="mt-1 text-xs font-medium text-muted">토큰을 쓰지 않는 로컬 개발용 생성기</p>
            </div>
            <span className="rounded-md bg-sage-soft px-3 py-1 text-xs font-black text-sage">Mock 사용 중</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">Gemini API 키는 프론트에 저장하지 않고, 추후 FastAPI 백엔드 환경변수로 연결합니다.</p>
        </section>

        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-muted">Style Defaults</p>
          <div className="grid gap-3">
            <SettingRow label="문체 기본값" value={generationSettingLabels.tone[settings.tone]} />
            <SettingRow label="출력 구조" value="전술: 사안 요약 / 후술: Draft별 판단" />
            <SettingRow label="검토 표시" value="모든 초안 교사 검토 필요" />
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-muted">Generation Rules</p>
          <p className="mb-3 text-xs leading-5 text-muted">{generationSettingDescriptions.strictness[settings.strictness]}</p>
          <div className="grid grid-cols-2 gap-2">
            <ToggleButton
              active={settings.strictness === 'STRICT'}
              label={generationSettingLabels.strictness.STRICT}
              onClick={() => onChange({ ...settings, strictness: 'STRICT' })}
            />
            <ToggleButton
              active={settings.strictness === 'BALANCED'}
              label={generationSettingLabels.strictness.BALANCED}
              onClick={() => onChange({ ...settings, strictness: 'BALANCED' })}
            />
            <ToggleButton
              active={settings.charLimitMode === 'ENFORCE'}
              label={generationSettingLabels.charLimitMode.ENFORCE}
              onClick={() => onChange({ ...settings, charLimitMode: 'ENFORCE' })}
            />
            <ToggleButton
              active={settings.charLimitMode === 'WARN'}
              label={generationSettingLabels.charLimitMode.WARN}
              onClick={() => onChange({ ...settings, charLimitMode: 'WARN' })}
            />
          </div>
        </section>
      </div>
    </aside>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-surface px-3 py-3">
      <span className="text-xs font-black text-muted">{label}</span>
      <span className="text-right text-sm font-black text-ink">{value}</span>
    </div>
  )
}

function ToggleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-black transition ${
        active ? 'bg-primary text-white shadow-[0_10px_24px_rgba(45,64,159,0.22)]' : 'bg-surface text-muted hover:bg-surface-mid hover:text-primary'
      }`}
    >
      {label}
    </button>
  )
}

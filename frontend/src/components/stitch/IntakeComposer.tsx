interface IntakeComposerProps {
  value: string
  tone: string
  loading: boolean
  onChange: (value: string) => void
  onToneChange: (tone: string) => void
  onGenerate: () => void
}

const toneOptions = ['공식 문서체', '사실 중심형', '상세 서술형']

export function IntakeComposer({ value, tone, loading, onChange, onToneChange, onGenerate }: IntakeComposerProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm font-black text-muted">
          <span className="material-symbols-outlined text-[24px] text-primary">description</span>
          사안 사실 확인 내용 입력
        </label>
        <span className="text-[10px] font-semibold uppercase text-[#9aa8ba]">Section 01 / Teacher Input</span>
      </div>

      <div className="group relative">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[600px] w-full resize-none rounded-lg bg-surface-low px-8 py-8 text-sm leading-7 text-ink outline-none transition placeholder:text-[#8c9bb0] focus:bg-[#edf3ff]"
          placeholder="사건 발생 일시, 장소, 대상 학생 및 주요 행위를 육하원칙에 따라 자유롭게 기술해 주세요..."
        />
        <div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-500 group-focus-within:scale-x-100" />
      </div>

      <div className="rounded-lg bg-surface-mid p-6">
        <p className="mb-4 text-xs font-black uppercase text-muted">문체 조정 Options</p>
        <div className="flex flex-wrap gap-3">
          {toneOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onToneChange(option)}
              className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                tone === option ? 'bg-white text-primary shadow-[0_8px_22px_rgba(11,28,48,0.05)]' : 'bg-white/55 text-muted hover:bg-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!value.trim() || loading}
        className={`flex h-14 w-full items-center justify-center gap-2 rounded-md text-base font-black transition ${
          value.trim() && !loading
            ? 'bg-primary text-white shadow-[0_20px_40px_rgba(45,64,159,0.2)] hover:bg-primary-deep'
            : 'bg-surface-mid text-muted'
        }`}
      >
        <span className={`material-symbols-outlined text-[22px] ${loading ? 'animate-spin' : ''}`}>{loading ? 'sync' : 'auto_awesome'}</span>
        {loading ? '초안 생성 중' : '초안 생성'}
      </button>
    </section>
  )
}

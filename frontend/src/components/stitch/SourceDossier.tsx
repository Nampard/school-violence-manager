interface SourceDossierProps {
  value: string
  onChange: (value: string) => void
  dirty: boolean
  onSync: () => void
  locked?: boolean
}

export function SourceDossier({ value, onChange, dirty, onSync, locked = false }: SourceDossierProps) {
  return (
    <section className="rounded-lg bg-white p-8 shadow-[0_10px_34px_rgba(11,28,48,0.05)]">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-md bg-primary" />
        <h3 className="text-lg font-black text-ink">Main Source Input</h3>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-3 text-xs font-black uppercase text-muted">Form Identity</p>
          <div className="rounded-md bg-surface-low px-4 py-3 shadow-[inset_4px_0_0_#3426dc]">
            <p className="text-sm font-black text-primary">서식 12: 사안조사 보고서</p>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-black uppercase text-muted">Primary Investigation Data</p>
          <textarea
            value={value}
            disabled={locked}
            onChange={(event) => onChange(event.target.value)}
            className={`h-[500px] w-full resize-none rounded-lg bg-surface-low px-4 py-4 text-sm leading-7 text-ink outline-none transition disabled:cursor-not-allowed disabled:text-muted focus:bg-[#edf3ff] ${
              dirty ? 'shadow-[inset_0_0_0_2px_rgba(186,26,26,0.22)]' : 'shadow-[inset_0_0_0_1px_rgba(197,197,212,0.20)]'
            }`}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-medium text-muted">{locked ? '초안 고정됨' : dirty ? 'Unsynced changes' : 'Last updated: 14:22:05'}</span>
          <button
            type="button"
            onClick={onSync}
            disabled={locked}
            className="flex items-center gap-2 text-[14px] font-black text-primary hover:text-primary-deep disabled:cursor-not-allowed disabled:text-muted"
          >
            <span className={`material-symbols-outlined text-[17px] ${dirty ? 'animate-spin-counterclockwise' : ''}`}>{dirty ? 'replay' : 'sync'}</span>
            Sync Source
          </button>
        </div>
      </div>
    </section>
  )
}

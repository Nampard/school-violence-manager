import { useState } from 'react'
import { ComprehensiveDraft } from '../components/stitch/ComprehensiveDraft'
import { DraftCardView } from '../components/stitch/DraftCard'
import { FloatingTip } from '../components/stitch/FloatingTip'
import { SourceDossier } from '../components/stitch/SourceDossier'
import { documentDrafts, investigationSource } from '../data/mockCase'

export function DocumentManagement() {
  const [source, setSource] = useState(investigationSource)
  const [dirty, setDirty] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const changeSource = (value: string) => {
    setSource(value)
    setDirty(true)
  }

  const syncSource = () => {
    setSyncing(true)
    setTimeout(() => {
      setDirty(false)
      setSyncing(false)
    }, 560)
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="document-header mb-8 gap-6">
        <div>
          <h2 className="text-[30px] font-black leading-tight text-ink">Draft Generation Workspace</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Convert primary case investigations into multiple specialized school report formats.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={syncSource}
            className="rounded-md bg-surface-mid px-6 py-2 text-sm font-black text-primary transition hover:bg-surface-high"
          >
            {syncing ? 'Refreshing...' : 'Refresh All Drafts'}
          </button>
          <button type="button" className="rounded-md bg-primary px-6 py-2 text-sm font-black text-white transition hover:bg-primary-deep">
            Submit Documentation
          </button>
        </div>
      </header>

      <div className="document-workspace">
        <div className="source-sticky">
          <SourceDossier value={source} dirty={dirty || syncing} onChange={changeSource} onSync={syncSource} />
        </div>

        <section>
          <div className="draft-grid">
            {documentDrafts.map((draft) => (
              <DraftCardView key={draft.id} draft={draft} />
            ))}
            <div className="draft-wide">
              <ComprehensiveDraft />
            </div>
          </div>
        </section>
      </div>

      <div>
        <FloatingTip title="Efficiency Tip">
          Changes made to the <strong>Main Source Input</strong> will automatically trigger draft regeneration across all 5 format cards.
        </FloatingTip>
      </div>
    </div>
  )
}

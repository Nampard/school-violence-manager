import { useState } from 'react'
import { StitchShell } from './components/stitch/StitchShell'
import { CaseIntake } from './pages/CaseIntake'
import { DocumentManagement } from './pages/DocumentManagement'
import type { ViewId } from './data/mockCase'

function App() {
  const [activeView, setActiveView] = useState<ViewId>('intake')

  return (
    <StitchShell activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'intake' ? <CaseIntake /> : <DocumentManagement />}
    </StitchShell>
  )
}

export default App

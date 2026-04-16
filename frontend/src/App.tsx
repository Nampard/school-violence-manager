import { useState } from 'react'
import type { MouseEvent } from 'react'
import { GenerationControlPanel } from './components/stitch/GenerationControlPanel'
import { HelpPopover } from './components/stitch/HelpPopover'
import { ProfileDialog } from './components/stitch/ProfileDialog'
import { StitchShell } from './components/stitch/StitchShell'
import { CaseIntake } from './pages/CaseIntake'
import { DocumentManagement } from './pages/DocumentManagement'
import type { ViewId } from './data/mockCase'
import { defaultGenerationSettings } from './domain/generationSettings'
import type { GenerationSettings } from './domain/generationSettings'
import { emptyTeacherProfile } from './domain/userProfile'
import type { TeacherProfile } from './domain/userProfile'

interface HelpAnchor {
  x: number
  y: number
}

const teacherProfileStorageKey = 'school-violence-manager.teacher-profile'
const generationSettingsStorageKey = 'school-violence-manager.generation-settings'

function loadTeacherProfile(): TeacherProfile {
  if (typeof window === 'undefined') {
    return emptyTeacherProfile
  }

  const storedProfile = window.localStorage.getItem(teacherProfileStorageKey)
  if (!storedProfile) {
    return emptyTeacherProfile
  }

  try {
    const parsedProfile = JSON.parse(storedProfile) as Partial<TeacherProfile>

    return {
      schoolName: typeof parsedProfile.schoolName === 'string' ? parsedProfile.schoolName : '',
      teacherName: typeof parsedProfile.teacherName === 'string' ? parsedProfile.teacherName : '',
    }
  } catch {
    return emptyTeacherProfile
  }
}

function loadGenerationSettings(): GenerationSettings {
  if (typeof window === 'undefined') {
    return defaultGenerationSettings
  }

  const storedSettings = window.localStorage.getItem(generationSettingsStorageKey)
  if (!storedSettings) {
    return defaultGenerationSettings
  }

  try {
    const parsedSettings = JSON.parse(storedSettings) as Partial<GenerationSettings>

    return {
      engine: parsedSettings.engine === 'MOCK' ? parsedSettings.engine : defaultGenerationSettings.engine,
      tone: parsedSettings.tone === 'FORM_SPECIFIC' ? parsedSettings.tone : defaultGenerationSettings.tone,
      strictness: parsedSettings.strictness === 'BALANCED' ? 'BALANCED' : defaultGenerationSettings.strictness,
      charLimitMode: parsedSettings.charLimitMode === 'WARN' ? 'WARN' : defaultGenerationSettings.charLimitMode,
    }
  } catch {
    return defaultGenerationSettings
  }
}

function App() {
  const [activeView, setActiveView] = useState<ViewId>('intake')
  const [helpAnchor, setHelpAnchor] = useState<HelpAnchor | null>(null)
  const [profile, setProfile] = useState<TeacherProfile>(() => loadTeacherProfile())
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>(() => loadGenerationSettings())
  const [generationPanelOpen, setGenerationPanelOpen] = useState(false)

  const openHelp = (event: MouseEvent<HTMLButtonElement>) => {
    setHelpAnchor({ x: event.clientX, y: event.clientY })
  }

  const saveProfile = (nextProfile: TeacherProfile) => {
    setProfile(nextProfile)
    window.localStorage.setItem(teacherProfileStorageKey, JSON.stringify(nextProfile))
    setProfileDialogOpen(false)
  }

  const changeGenerationSettings = (nextSettings: GenerationSettings) => {
    setGenerationSettings(nextSettings)
    window.localStorage.setItem(generationSettingsStorageKey, JSON.stringify(nextSettings))
  }

  return (
    <>
      <StitchShell
        activeView={activeView}
        onViewChange={setActiveView}
        onHelpOpen={openHelp}
        profile={profile}
        onGenerationPanelOpen={() => setGenerationPanelOpen((open) => !open)}
        onProfileOpen={() => setProfileDialogOpen(true)}
      >
        {activeView === 'intake' ? <CaseIntake /> : <DocumentManagement generationSettings={generationSettings} />}
      </StitchShell>
      <HelpPopover anchor={helpAnchor} onClose={() => setHelpAnchor(null)} />
      <GenerationControlPanel
        open={generationPanelOpen}
        settings={generationSettings}
        onClose={() => setGenerationPanelOpen(false)}
        onChange={changeGenerationSettings}
      />
      <ProfileDialog open={profileDialogOpen} profile={profile} onClose={() => setProfileDialogOpen(false)} onSave={saveProfile} />
    </>
  )
}

export default App

/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
* @description
  Root application component.
 *   Manages top-level view routing between the main view and role-specific pages.
 *   Reads application settings from SettingsContext (loaded by SettingsProvider on startup).
 *   Holds verifiedCoach state during the coach session; cleared when navigating away.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'react-hot-toast'
import { useSettingsContext } from './app/providers/SettingsProvider'
import { HomePage } from './pages/Home/HomePage'
import { TraineePage } from './pages/Trainee/TraineePage'
import { CoachPage } from './pages/Coach/CoachPage'
import { AdminPage } from './pages/Admin/AdminPage'
import type { CoachData } from './features/coach/types'

type View = 'main' | 'trainee' | 'coach' | 'admin'

export default function App() {
  const { t } = useTranslation()
  const { settings, loading: settingsLoading, error: settingsError, reload } = useSettingsContext()
  const [view, setView] = useState<View>('main')
  const [verifiedCoach, setVerifiedCoach] = useState<CoachData | undefined>(undefined)

  const coachPassword = settings.find(s => s.parameter === 'coach_pwd')?.value ?? ''
  const adminPassword = settings.find(s => s.parameter === 'admin_pwd')?.value ?? ''

  if (settingsLoading) {
    return (
      <div className="container">
        <p>{t('settings.loading')}</p>
      </div>
    )
  }

  if (settingsError) {
    return (
      <div className="container">
        <p className="error">{t('settings.error', { message: settingsError })}</p>
        <button onClick={reload}>{t('settings.retry')}</button>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      {view === 'trainee' && <TraineePage onBack={() => setView('main')} />}
      {view === 'coach' && (
        <CoachPage
          onBack={() => { setVerifiedCoach(undefined); setView('main'); }}
          coachData={verifiedCoach}
        />
      )}
      {view === 'admin' && <AdminPage onBack={() => setView('main')} />}
      {view === 'main' && (
        <HomePage
          onGoTrainee={() => setView('trainee')}
          onGoCoach={(coachData) => { setVerifiedCoach(coachData); setView('coach'); }}
          onGoAdmin={() => setView('admin')}
          coachPassword={coachPassword}
          adminPassword={adminPassword}
        />
      )}
    </>
  )
}

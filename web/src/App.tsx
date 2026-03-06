/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 * @description Root application component.
 *   Manages top-level view routing between the main view and role-specific pages.
 *   Reads application settings from SettingsContext (loaded by SettingsProvider on startup).
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

type View = 'main' | 'trainee' | 'coach' | 'admin'

export default function App() {
  const { t } = useTranslation()
  const { settings, loading: settingsLoading, error: settingsError, reload } = useSettingsContext()
  const [view, setView] = useState<View>('main')

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

  const coachPassword = settings.find(s => s.parameter === 'coach_pwd')?.value ?? ''
  const adminPassword = settings.find(s => s.parameter === 'admin_pwd')?.value ?? ''

  if (view === 'trainee') {
    return <TraineePage onBack={() => setView('main')} />
  }

  if (view === 'coach') {
    return <CoachPage onBack={() => setView('main')} />
  }

  if (view === 'admin') {
    return <AdminPage onBack={() => setView('main')} />
  }

  return (
    <>
      <Toaster position="top-center" />
      <HomePage
        onGoTrainee={() => setView('trainee')}
        onGoCoach={() => setView('coach')}
        onGoAdmin={() => setView('admin')}
        coachPassword={coachPassword}
        adminPassword={adminPassword}
      />
    </>
  )
}

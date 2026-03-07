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
 *   Wraps the app in MUI ThemeProvider for consistent design.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useSettingsContext } from './app/providers/SettingsProvider'
import { HomePage } from './pages/Home/HomePage'
import { TraineePage } from './pages/Trainee/TraineePage'
import { CoachPage } from './pages/Coach/CoachPage'
import { AdminPage } from './pages/Admin/AdminPage'
import type { CoachData } from './features/coach/types'

const theme = createTheme({
  palette: {
    primary: { main: '#0066cc' },
  },
})

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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
          <Typography>{t('settings.loading')}</Typography>
        </Box>
      </ThemeProvider>
    )
  }

  if (settingsError) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
          <Typography color="error">{t('settings.error', { message: settingsError })}</Typography>
          <Button onClick={reload} sx={{ mt: 1 }}>{t('settings.retry')}</Button>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  )
}

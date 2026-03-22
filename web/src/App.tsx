/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
* @description
  Root application component.
 *   Manages route-based navigation between the main view and role-specific pages.
 *   Reads application settings from SettingsContext (loaded by SettingsProvider on startup).
 *   Holds verifiedCoach state during the coach session; cleared when navigating away.
 *   Wraps the app in MUI ThemeProvider for consistent design.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { getTheme } from './theme.config';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useSettingsContext } from './app/providers/SettingsProvider'
import { HomePage } from './pages/Home/HomePage'
import { TraineePage } from './pages/Trainee/TraineePage'
import { CoachPage } from './pages/Coach/CoachPage'
import { AdminPage } from './pages/Admin/AdminPage'
import { ManualsPage } from './pages/Manuals/ManualsPage'
import type { CoachData } from './features/coach/types'

const ADMIN_SESSION_TOKEN_KEY = 'oqm_admin_session_token'

const customTheme = getTheme('kickboxing'); // Change to your desired theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: customTheme.colors.accentPrimary },
    secondary: { main: customTheme.colors.accentSecondary },
    background: {
      default: customTheme.colors.bgPrimary,
      paper: customTheme.colors.bgCard,
    },
    text: {
      primary: customTheme.colors.textPrimary,
      secondary: customTheme.colors.textSecondary,
    },
    error: { main: customTheme.colors.accentWarning },
    success: { main: customTheme.colors.accentSuccess },
    warning: { main: customTheme.colors.accentGold },
  },
});

interface HomeRouteProps {
  onCoachVerified: (result: { sessionToken: string; coachData?: CoachData }) => void;
  onAdminAuthenticated: (sessionToken: string) => void;
}

function HomeRoute({ onCoachVerified, onAdminAuthenticated }: HomeRouteProps) {
  const navigate = useNavigate();

  return (
    <HomePage
      onGoTrainee={() => navigate('/trainee')}
      onGoManuals={() => navigate('/manuals')}
      onGoCoach={(coachData) => {
        onCoachVerified(coachData);
        navigate('/coach');
      }}
      onGoAdmin={(sessionToken) => {
        onAdminAuthenticated(sessionToken);
        navigate('/admin');
      }}
    />
  );
}

function TraineeRoute() {
  const navigate = useNavigate();

  return <TraineePage onBack={() => navigate('/')} />;
}

function ManualsRoute() {
  const navigate = useNavigate();

  return <ManualsPage onBack={() => navigate('/')} />;
}

interface CoachRouteProps {
  isCoachAuthenticated: boolean;
  verifiedCoach?: CoachData;
  coachSessionToken?: string;
  onLeaveCoach: () => void;
}

function CoachRoute({ isCoachAuthenticated, verifiedCoach, coachSessionToken, onLeaveCoach }: CoachRouteProps) {
  const navigate = useNavigate();

  if (!isCoachAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <CoachPage
      onBack={() => {
        onLeaveCoach();
        navigate('/');
      }}
      coachData={verifiedCoach}
      sessionToken={coachSessionToken}
    />
  );
}

interface AdminRouteProps {
  isAdminAuthenticated: boolean;
  onLeaveAdmin: () => void;
}

function AdminRoute({ isAdminAuthenticated, onLeaveAdmin }: AdminRouteProps) {
  const navigate = useNavigate();

  if (!isAdminAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <AdminPage onBack={() => {
    onLeaveAdmin();
    navigate('/');
  }} />;
}

export default function App() {
  const { t } = useTranslation()
  const { loading: settingsLoading, error: settingsError, reload } = useSettingsContext()
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [coachAuthenticated, setCoachAuthenticated] = useState(false)
  const [coachSessionToken, setCoachSessionToken] = useState<string | undefined>(undefined)
  const [verifiedCoach, setVerifiedCoach] = useState<CoachData | undefined>(undefined)

  if (settingsLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
          maxWidth: 800,
          mx: 'auto',
          p: 2,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
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
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/"
            element={(
              <HomeRoute
                onCoachVerified={(result) => {
                  setCoachSessionToken(result.sessionToken)
                  setCoachAuthenticated(true)
                  setVerifiedCoach(result.coachData)
                }}
                onAdminAuthenticated={(sessionToken) => {
                  sessionStorage.setItem(ADMIN_SESSION_TOKEN_KEY, sessionToken)
                  setAdminAuthenticated(true)
                }}
              />
            )}
          />
          <Route path="/trainee" element={<TraineeRoute />} />
          <Route path="/manuals" element={<ManualsRoute />} />
          <Route
            path="/coach"
            element={(
              <CoachRoute
                isCoachAuthenticated={coachAuthenticated}
                verifiedCoach={verifiedCoach}
                coachSessionToken={coachSessionToken}
                onLeaveCoach={() => {
                  setCoachAuthenticated(false)
                  setCoachSessionToken(undefined)
                  setVerifiedCoach(undefined)
                }}
              />
            )}
          />
          <Route
            path="/admin"
            element={(
              <AdminRoute
                isAdminAuthenticated={adminAuthenticated}
                onLeaveAdmin={() => {
                  sessionStorage.removeItem(ADMIN_SESSION_TOKEN_KEY)
                  setAdminAuthenticated(false)
                }}
              />
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

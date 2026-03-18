/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Trainee registration page with available session listing and registration dialogs (OQM-0015).
 *   Fetches trainee sessions from GAS, supports manual data entry and confirmation,
 *   and stores pending trainee profile for repeated registrations.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PinIcon from '@mui/icons-material/Pin';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { getTraineeSessions } from '../../features/trainee/api/trainee.api';
import { ConfirmTraineeRegistrationDialog } from '../../features/trainee/components/ConfirmTraineeRegistrationDialog';
import { ManualTraineeRegistrationDialog } from '../../features/trainee/components/ManualTraineeRegistrationDialog';
import { TraineeSessionCard } from '../../features/trainee/components/TraineeSessionCard';
import type { PendingTraineeData, TraineeSessionItem } from '../../features/trainee/types';
import { LoadingOverlay } from '../../shared/components/LoadingOverlay/LoadingOverlay';

export interface TraineePageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
}

/** Format date string 'YYYY-MM-DD' as 'Mo DD.MM.YYYY' using locale-aware weekday abbreviation. */
function formatDateLabel(dateStr: string, locale: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString(locale === 'fi' ? 'fi-FI' : 'en-GB', { weekday: 'short' });
  return `${weekday} ${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

/** Trainee registration page displaying available sessions in a 21-day window. */
export function TraineePage({ onBack }: TraineePageProps) {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState<TraineeSessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TraineeSessionItem | null>(null);
  const [confirmTraineeData, setConfirmTraineeData] = useState<PendingTraineeData | undefined>(undefined);
  const [pendingTraineeData, setPendingTraineeData] = useState<PendingTraineeData | undefined>(undefined);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    toast(t('traineeRegistration.fetchingSessions'));
    try {
      const data = await getTraineeSessions();
      setSessions(data);
    } catch {
      setError(t('traineeRegistration.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const sessionsByDate = useMemo(() => {
    const grouped = new Map<string, TraineeSessionItem[]>();
    for (const session of sessions) {
      if (!grouped.has(session.date)) grouped.set(session.date, []);
      grouped.get(session.date)!.push(session);
    }
    return grouped;
  }, [sessions]);

  function handleOpenRegister(session: TraineeSessionItem) {
    setSelectedSession(session);
    if (session.trainee_registered) return;
    if (pendingTraineeData) {
      setConfirmTraineeData(pendingTraineeData);
      setConfirmDialogOpen(true);
      return;
    }
    setManualDialogOpen(true);
  }

  function handleManualOk(data: PendingTraineeData) {
    setConfirmTraineeData(data);
    setConfirmDialogOpen(true);
  }

  function handleConfirmSuccess(_registrationId: string) {
    setConfirmDialogOpen(false);
    setManualDialogOpen(false);
    if (selectedSession) {
      setSessions(prev => prev.map(session => (
        session.id === selectedSession.id
          ? { ...session, trainee_registered: true }
          : session
      )));
    }
    if (confirmTraineeData) {
      setPendingTraineeData(confirmTraineeData);
    }
  }

  function handleAlreadyRegistered() {
    setConfirmDialogOpen(false);
    setManualDialogOpen(false);
    if (selectedSession) {
      setSessions(prev => prev.map(session => (
        session.id === selectedSession.id
          ? { ...session, trainee_registered: true }
          : session
      )));
    }
    if (confirmTraineeData) {
      setPendingTraineeData(confirmTraineeData);
    }
  }

  function handleConfirmCancel() {
    setConfirmDialogOpen(false);
    toast(t('traineeRegistration.registrationCancelled'));
  }

  function handleManualCancel() {
    setManualDialogOpen(false);
    setSelectedSession(null);
    toast(t('traineeRegistration.registrationCancelled'));
  }

  function handleLogout() {
    setPendingTraineeData(undefined);
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <LoadingOverlay visible={loading} />

      <Box mt={1} mb={4} textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom>
          {t('traineeRegistration.title')}
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Alert severity={pendingTraineeData ? 'success' : 'warning'} sx={{ borderRadius: 2 }}>
            {pendingTraineeData
              ? t('traineeRegistration.loggedInAs', {
                  first_name: pendingTraineeData.first_name,
                  last_name: pendingTraineeData.last_name,
                })
              : t('traineeRegistration.notLoggedIn')}
          </Alert>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {pendingTraineeData ? (
              <Button variant="contained" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ flex: 1 }}>
                {t('traineeRegistration.logout')}
              </Button>
            ) : (
              <Button variant="contained" startIcon={<LoginIcon />} sx={{ flex: 1 }}>
                {t('traineeRegistration.login')}
              </Button>
            )}

            <Button variant="outlined" startIcon={<PinIcon />} sx={{ flex: 1 }}>
              {t('traineeRegistration.registerPin')}
            </Button>

            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSessions} sx={{ flex: 1 }} disabled={loading}>
              {t('coachQuickRegistration.refreshData')}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                setPendingTraineeData(undefined);
                onBack();
              }}
              sx={{ flex: 1 }}
            >
              {t('traineeRegistration.backToMain')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && sessionsByDate.size === 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography align="center" color="text.secondary">
              {t('traineeRegistration.noSessions')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {Array.from(sessionsByDate.entries()).map(([date, dateSessions]) => (
        <Card key={date} sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              {formatDateLabel(date, i18n.language)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
              {dateSessions.map(session => (
                <TraineeSessionCard
                  key={session.id}
                  session={session}
                  onRegister={handleOpenRegister}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}

      <ManualTraineeRegistrationDialog
        open={manualDialogOpen}
        initialData={pendingTraineeData}
        onOk={handleManualOk}
        onCancel={handleManualCancel}
      />

      <ConfirmTraineeRegistrationDialog
        open={confirmDialogOpen}
        session={selectedSession}
        traineeData={confirmTraineeData}
        onSuccess={handleConfirmSuccess}
        onAlreadyRegistered={handleAlreadyRegistered}
        onCancel={handleConfirmCancel}
      />

    </Container>
  );
}

/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Coach Quick Registration Page — shown after coach authenticates via PIN or password.
 *   Fetches a 21-day window of session data from the GAS backend and displays session cards
 *   grouped by date. Coaches can click Register to open a confirmation dialog that sends a
 *   real registration to the backend (OQM-0008), or Remove to trigger a removal confirmation.
 *   Uses MUI for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LoadingOverlay } from '../../shared/components/LoadingOverlay/LoadingOverlay';
import { SessionCard } from '../../features/coach/components/SessionCard';
import { ConfirmCoachRegistrationDialog } from '../../features/coach/components/ConfirmCoachRegistrationDialog';
import { ConfirmRemoveCoachDialog } from '../../features/coach/components/ConfirmRemoveCoachDialog';
import { ManualCoachRegistrationDialog } from '../../features/coach/components/ManualCoachRegistrationDialog';
import { SparringCoachRegistrationDialog } from '../../features/coach/components/SparringCoachRegistrationDialog';
import { getCoachSessions } from '../../features/coach/api/coach.api';
import type { CoachData, SessionItem } from '../../features/coach/types';

export interface CoachPageProps {
  /** Navigates back to the main view and clears coach session state. */
  onBack: () => void;
  /** Verified coach data returned from the backend on successful PIN login; undefined for password login. */
  coachData?: CoachData;
}

/** Format date string 'YYYY-MM-DD' as 'Mo DD.MM.YYYY' using locale-aware weekday abbreviation. */
function formatDateLabel(dateStr: string, locale: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString(locale === 'fi' ? 'fi-FI' : 'en-GB', { weekday: 'short' });
  return `${weekday} ${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

/** Coach Quick Registration page displaying a 21-day window of sessions grouped by date. */
export function CoachPage({ onBack, coachData }: CoachPageProps) {
  const { t, i18n } = useTranslation();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRegisterOpen, setConfirmRegisterOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [manualRegisterOpen, setManualRegisterOpen] = useState(false);
  const [sparringDialogOpen, setSparringDialogOpen] = useState(false);
  const [sparringDialogData, setSparringDialogData] = useState<{ firstname: string; lastname: string } | undefined>(undefined);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  // Temporary CoachData built from manual name entry or PIN registration (OQM-0010).
  const [pendingCoachData, setPendingCoachData] = useState<CoachData | undefined>(undefined);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCoachSessions();
      setSessions(data);
    } catch {
      setError(t('coachQuickRegistration.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /** Group sessions by date, preserving sort order. */
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, SessionItem[]>();
    for (const s of sessions) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    }
    return map;
  }, [sessions]);

  const loggedInLabel = coachData?.alias
    ? t('coachQuickRegistration.loggedInAs', { name: coachData.alias })
    : t('coachQuickRegistration.loggedInAs', { name: t('coachQuickRegistration.notRegistered') });

  function handleRegister(session: SessionItem) {
    setSelectedSession(session);
    if (session.is_free_sparring) {
      setSparringDialogOpen(true);
      setSparringDialogData(coachData ? { firstname: coachData.firstname, lastname: coachData.lastname } : undefined);
    } else if (coachData) {
      setConfirmRegisterOpen(true);
    } else {
      setManualRegisterOpen(true);
    }
  }

  function handleRemove(session: SessionItem) {
    setSelectedSession(session);
    setConfirmRemoveOpen(true);
  }

  function handleRegisterSuccess(registrationId: string) {
    setConfirmRegisterOpen(false);
    const wasSparringFlow = sparringDialogOpen;
    setSparringDialogOpen(false);
    const activeCoach = coachData || pendingCoachData;
    if (selectedSession && activeCoach) {
      const coachName = activeCoach.alias || `${activeCoach.firstname} ${activeCoach.lastname}`;
      if (wasSparringFlow) {
        // New free/sparring session — add to list only if date is within current window
        const isWithinSpan = sessionsByDate.has(selectedSession.date);
        if (isWithinSpan) {
          setSessions(prev => [
            ...prev,
            {
              ...selectedSession,
              coach_firstname: activeCoach.firstname,
              coach_lastname: activeCoach.lastname,
              coach_alias: coachName,
              registration_id: registrationId,
            },
          ]);
        } else {
          toast(t('coachQuickRegistration.newSessionOutsideSpan'));
        }
      } else {
        setSessions(prev =>
          prev.map(s =>
            s.id === selectedSession.id
              ? {
                  ...s,
                  coach_firstname: activeCoach.firstname,
                  coach_lastname: activeCoach.lastname,
                  coach_alias: coachName,
                  registration_id: registrationId,
                }
              : s
          )
        );
      }
    }
    setSelectedSession(null);
    setPendingCoachData(undefined);
  }

  function handleRegisterCancel() {
    setConfirmRegisterOpen(false);
    if (sparringDialogOpen) {
      // Sparring flow — keep SparringDialog open for modifications, don't show cancel toast
      setSelectedSession(null);
    } else {
      setSelectedSession(null);
      setPendingCoachData(undefined);
      toast(t('coachQuickRegistration.registrationCancelled'));
    }
  }

  function handleManualRegisterOk(newCoachData: CoachData) {
    setManualRegisterOpen(false);
    setPendingCoachData(newCoachData);
    setConfirmRegisterOpen(true);
  }

  function handleManualRegisterCancel() {
    setManualRegisterOpen(false);
    setSelectedSession(null);
    toast(t('coachQuickRegistration.registrationCancelled'));
  }

  function handleRemoveSuccess(_registrationId: string) {
    setConfirmRemoveOpen(false);
    if (selectedSession) {
      setSessions(prev =>
        prev.map(s =>
          s.id === selectedSession.id
            ? { ...s, coach_firstname: '', coach_lastname: '', coach_alias: '', registration_id: '' }
            : s
        )
      );
    }
    setSelectedSession(null);
  }

  function handleRemoveCancel() {
    setConfirmRemoveOpen(false);
    setSelectedSession(null);
    toast(t('coachQuickRegistration.removalCancelled'));
  }

  const actionButtons = (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Button
        variant="contained"
        startIcon={<SportsMartialArtsIcon />}
        onClick={() => {
          setSparringDialogData(coachData ? { firstname: coachData.firstname, lastname: coachData.lastname } : undefined);
          setSparringDialogOpen(true);
        }}
        sx={{ flex: 1 }}
      >
        {t('coachQuickRegistration.freeSparringSession')}
      </Button>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={fetchSessions}
        disabled={loading}
        sx={{ flex: 1 }}
      >
        {t('coachQuickRegistration.refreshData')}
      </Button>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ flex: 1 }}
      >
        {t('coachQuickRegistration.backToMain')}
      </Button>
    </Stack>
  );

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Box sx={{ minHeight: '100vh' }}>
      <LoadingOverlay visible={loading} />

      <Box mt={1} mb={4} textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom>
          {t('coachQuickRegistration.title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('coachQuickRegistration.subtitle')}
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Alert severity={coachData?.alias ? 'success' : 'warning'} sx={{ borderRadius: 2 }}>
            {loggedInLabel}
          </Alert>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>{actionButtons}</CardContent>
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
              {t('coachQuickRegistration.noSessions')}
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
            {dateSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRegister={handleRegister}
                onRemove={handleRemove}
                cardStyle={{ width: '340px', height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              />
            ))}
          </Box>
          </CardContent>
        </Card>
      ))}

      <ConfirmCoachRegistrationDialog
        open={confirmRegisterOpen}
        session={selectedSession}
        coachData={coachData ?? pendingCoachData}
        onSuccess={handleRegisterSuccess}
        onCancel={handleRegisterCancel}
      />

      <ManualCoachRegistrationDialog
        open={manualRegisterOpen}
        onOk={handleManualRegisterOk}
        onCancel={handleManualRegisterCancel}
      />

      <SparringCoachRegistrationDialog
        open={sparringDialogOpen}
        coachData={sparringDialogData}
        onConfirm={data => {
          // Keep SparringDialog open — ConfirmDialog shows on top.
          // If ConfirmDialog is cancelled, SparringDialog stays open for modifications.
          const sparringPendingCoach: import('../../features/coach/types').CoachData = {
            id: coachData?.id || '',
            firstname: data.firstname,
            lastname: data.lastname,
            alias: coachData?.alias || `${data.firstname} ${data.lastname}`,
            pin: '',
            created_at: '',
            last_activity: '',
          };
          const newSession: import('../../features/coach/types').SessionItem = {
            id: `sparring_${Date.now()}`,
            session_type: 'free/sparring',
            session_type_alias: t('coachQuickRegistration.freeSparringSession'),
            date: data.date,
            start_time: data.start_time,
            end_time: data.end_time,
            location: '',
            coach_firstname: data.firstname,
            coach_lastname: data.lastname,
            coach_alias: sparringPendingCoach.alias,
            registration_id: '',
            is_free_sparring: true,
          };
          setSelectedSession(newSession);
          setPendingCoachData(sparringPendingCoach);
          setConfirmRegisterOpen(true);
        }}
        onCancel={() => {
          setSparringDialogOpen(false);
          setSelectedSession(null);
          setPendingCoachData(undefined);
          toast(t('coachQuickRegistration.registrationCancelled'));
        }}
      />

      <ConfirmRemoveCoachDialog
        open={confirmRemoveOpen}
        session={selectedSession}
        onSuccess={handleRemoveSuccess}
        onCancel={handleRemoveCancel}
      />
      </Box>
    </Container>
  );
}

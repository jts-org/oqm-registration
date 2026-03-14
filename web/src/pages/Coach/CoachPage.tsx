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
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', p: 2 }}>
      <LoadingOverlay visible={loading} />

      <Typography variant="h5" component="h1" align="center" gutterBottom>
        {t('coachQuickRegistration.title')}
      </Typography>

      <Typography align="center" color="text.secondary" gutterBottom>
        {loggedInLabel}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
        <ButtonGroup variant="outlined" aria-label="coach-page-actions">
          <Button onClick={() => {
            setSparringDialogData(coachData ? { firstname: coachData.firstname, lastname: coachData.lastname } : undefined);
            setSparringDialogOpen(true);
          }}>
            {t('coachQuickRegistration.freeSparringSession')}
          </Button>
          <Button onClick={fetchSessions} disabled={loading}>
            {t('coachQuickRegistration.refreshData')}
          </Button>
          <Button onClick={onBack}>
            {t('coachQuickRegistration.backToMain')}
          </Button>
        </ButtonGroup>
      </Box>

      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && sessionsByDate.size === 0 && (
        <Typography align="center" color="text.secondary">
          {t('coachQuickRegistration.noSessions')}
        </Typography>
      )}

      {Array.from(sessionsByDate.entries()).map(([date, dateSessions]) => (
        <Box key={date} sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
        </Box>
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
  );
}

/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Coach Quick Registration Page — shown after coach authenticates via PIN or password.
 *   Fetches a 21-day window of session data from the GAS backend and displays session cards
 *   grouped by date. Coaches can click Register or Remove to trigger dummy confirmation dialogs.
 *   Uses MUI for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { LoadingOverlay } from '../../shared/components/LoadingOverlay/LoadingOverlay';
import { SessionCard } from '../../features/coach/components/SessionCard';
import { ConfirmCoachRegistrationDialog } from '../../features/coach/components/ConfirmCoachRegistrationDialog';
import { ConfirmRemoveCoachDialog } from '../../features/coach/components/ConfirmRemoveCoachDialog';
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
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);

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
    setConfirmRegisterOpen(true);
  }

  function handleRemove(session: SessionItem) {
    setSelectedSession(session);
    setConfirmRemoveOpen(true);
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
        <Button variant="outlined" onClick={fetchSessions} disabled={loading}>
          {t('coachQuickRegistration.refreshData')}
        </Button>
        <Button variant="outlined" onClick={onBack}>
          {t('coachQuickRegistration.backToMain')}
        </Button>
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
        onConfirm={() => { setConfirmRegisterOpen(false); setSelectedSession(null); }}
        onCancel={() => { setConfirmRegisterOpen(false); setSelectedSession(null); }}
      />

      <ConfirmRemoveCoachDialog
        open={confirmRemoveOpen}
        onConfirm={() => { setConfirmRemoveOpen(false); setSelectedSession(null); }}
        onCancel={() => { setConfirmRemoveOpen(false); setSelectedSession(null); }}
      />
    </Box>
  );
}

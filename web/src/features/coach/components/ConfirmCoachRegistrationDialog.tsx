/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Confirmation dialog shown when a coach clicks 'Register' on a session card (OQM-0008).
 *   Displays session details and coach name, calls the GAS backend to register the coach,
 *   shows loading state during the API call, and notifies the parent on success or cancellation.
 *   Uses MUI Dialog for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';
import { registerCoachForSession } from '../api/coach.api';
import type { SessionItem, CoachData } from '../types';

export interface ConfirmCoachRegistrationDialogProps {
  open: boolean;
  /** The session the coach wants to register for. */
  session: SessionItem | null;
  /** The authenticated coach; undefined when logged in via password only. */
  coachData?: CoachData;
  /** Called with the new registration id after a successful registration. */
  onSuccess: (registrationId: string) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
}

/** Format 'YYYY-MM-DD' as 'DD.MM.YYYY' for display. */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

/** Modal confirming coach registration for a session — calls the GAS backend on confirm. */
export function ConfirmCoachRegistrationDialog({
  open,
  session,
  coachData,
  onSuccess,
  onCancel,
}: ConfirmCoachRegistrationDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!session || !coachData || loading) return;
    setLoading(true);
    toast(t('coachQuickRegistration.registrationOngoing'));
    try {
      const payload = {
        firstname: coachData.firstname,
        lastname: coachData.lastname,
        session_type: session.session_type,
        date: session.date,
        ...(session.is_free_sparring && {
          start_time: session.start_time,
          end_time: session.end_time,
        }),
      };
      const registrationId = await registerCoachForSession(payload);
      toast.success(t('coachQuickRegistration.registrationSuccess'));
      onSuccess(registrationId);
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'already_taken') {
        toast.error(t('coachQuickRegistration.alreadyTaken'));
      } else if (code === 'unknown_coach') {
        toast.error(t('coachQuickRegistration.unknownCoach'));
      } else {
        toast.error(t('coachQuickRegistration.registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  const coachName = coachData?.alias || (coachData ? `${coachData.firstname} ${coachData.lastname}` : '');

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-register-title">
      <LoadingOverlay visible={loading} />
      <DialogTitle id="confirm-register-title">
        {t('coachQuickRegistration.confirmRegisterTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('coachQuickRegistration.confirmRegisterQuestion')}
        </DialogContentText>
        {session && (
          <>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{t('coachQuickRegistration.sessionTypeLabel')}:</strong>{' '}
              {session.session_type_alias || session.session_type}
            </Typography>
            <Typography variant="body2">
              <strong>{t('coachQuickRegistration.sessionDateLabel')}:</strong>{' '}
              {formatDate(session.date)}
            </Typography>
            <Typography variant="body2">
              <strong>{t('coachQuickRegistration.sessionTimeLabel')}:</strong>{' '}
              {session.start_time} – {session.end_time}
            </Typography>
          </>
        )}
        {coachName && (
          <Typography variant="body2">
            <strong>{t('coachQuickRegistration.coachNameLabel')}:</strong>{' '}
            {coachName}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {t('coachQuickRegistration.cancel')}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary" disabled={loading || !session || !coachData}>
          {t('coachQuickRegistration.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

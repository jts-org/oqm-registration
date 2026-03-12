/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Confirmation dialog shown when a coach clicks 'Remove' on a session card (OQM-0009).
 *   Displays session details and coach name, calls the GAS backend to remove the coach registration,
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
import Alert from '@mui/material/Alert';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';
import { removeCoachFromSession } from '../api/coach.api';
import type { SessionItem } from '../types';

export interface ConfirmRemoveCoachDialogProps {
  open: boolean;
  /** The session the coach wants to be removed from. */
  session: SessionItem | null;
  /** Called with the updated registration id after a successful removal. */
  onSuccess: (registrationId: string) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
}

/** Format 'YYYY-MM-DD' as 'DD.MM.YYYY' for display. */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

/** Modal confirming coach removal from a session — calls the GAS backend on confirm. */
export function ConfirmRemoveCoachDialog({
  open,
  session,
  onSuccess,
  onCancel,
}: ConfirmRemoveCoachDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!session || loading) return;
    setLoading(true);
    toast(t('coachQuickRegistration.removalOngoing'));
    try {
      const registrationId = await removeCoachFromSession({
        firstname: session.coach_firstname,
        lastname: session.coach_lastname,
        session_type: session.session_type,
        date: session.date,
      });
      toast.success(t('coachQuickRegistration.removalSuccess'));
      onSuccess(registrationId);
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'concurrent_operation') {
        toast.error(t('coachQuickRegistration.concurrentOperation'));
      } else if (code === 'session_available') {
        toast.error(t('coachQuickRegistration.sessionAvailable'));
      } else if (code === 'registration_not_found') {
        toast.error(t('coachQuickRegistration.registrationNotFound'));
      } else {
        toast.error(t('coachQuickRegistration.removalFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  const coachName = session
    ? (session.coach_alias || `${session.coach_firstname} ${session.coach_lastname}`.trim())
    : '';

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-remove-title">
      <LoadingOverlay visible={loading} />
      <DialogTitle id="confirm-remove-title">
        {t('coachQuickRegistration.confirmRemoveTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('coachQuickRegistration.confirmRemoveQuestion')}
        </DialogContentText>
        <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
          {t('coachQuickRegistration.confirmRemoveNotification')}
        </Alert>
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
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading || !session}>
          {t('coachQuickRegistration.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

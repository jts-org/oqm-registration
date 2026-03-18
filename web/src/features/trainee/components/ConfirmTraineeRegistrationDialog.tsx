/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Confirmation dialog for trainee session registration.
 *   Sends registration payload to GAS and surfaces inline validation errors.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';
import { registerTraineeForSession } from '../api/trainee.api';
import type { PendingTraineeData, RegisterTraineeForSessionPayload, TraineeSessionItem } from '../types';

export interface ConfirmTraineeRegistrationDialogProps {
  open: boolean;
  session: TraineeSessionItem | null;
  traineeData?: PendingTraineeData;
  onSuccess: (registrationId: string) => void;
  onAlreadyRegistered: () => void;
  onCancel: () => void;
}

/** Confirm and submit trainee registration request while handling known business errors. */
export function ConfirmTraineeRegistrationDialog({
  open,
  session,
  traineeData,
  onSuccess,
  onAlreadyRegistered,
  onCancel,
}: ConfirmTraineeRegistrationDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string>('');

  async function handleConfirm() {
    if (!session || !traineeData || loading) return;
    setInlineError('');
    setLoading(true);
    toast(t('traineeRegistration.registrationOngoing'));

    const payload: RegisterTraineeForSessionPayload = {
      first_name: traineeData.first_name,
      last_name: traineeData.last_name,
      age_group: traineeData.age_group,
      underage_age: traineeData.age_group === 'underage' ? traineeData.underage_age : undefined,
      session_type: session.session_type,
      camp_session_id: session.id.startsWith('camp_') ? session.id.split('_')[1] : undefined,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
    };

    try {
      const registrationId = await registerTraineeForSession(payload);
      toast.success(t('traineeRegistration.registrationSuccess'));
      onSuccess(registrationId);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'concurrent_request') {
        setInlineError(t('traineeRegistration.concurrentRequest'));
      } else if (code === 'already_registered') {
        onAlreadyRegistered();
        toast(t('traineeRegistration.alreadyRegistered'));
      } else if (code === 'validation_failed') {
        setInlineError(t('traineeRegistration.validationFailed'));
      } else if (code === 'validation_failed_age') {
        setInlineError(t('traineeRegistration.validationFailedAge'));
      } else {
        setInlineError(t('traineeRegistration.registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-trainee-register-title">
      <LoadingOverlay visible={loading} />
      <DialogTitle id="confirm-trainee-register-title">{t('traineeRegistration.confirmRegisterTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('traineeRegistration.confirmRegisterQuestion')}</DialogContentText>

        {session && (
          <>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{t('traineeRegistration.sessionTypeLabel')}:</strong> {session.session_type_alias || session.session_type}
            </Typography>
            <Typography variant="body2">
              <strong>{t('traineeRegistration.sessionDateLabel')}:</strong> {session.date}
            </Typography>
            <Typography variant="body2">
              <strong>{t('traineeRegistration.sessionTimeLabel')}:</strong> {session.start_time} - {session.end_time}
            </Typography>
            {session.is_free_sparring && (session.coach_firstname || session.coach_lastname) && (
              <Typography variant="body2">
                <strong>{t('traineeRegistration.coachLabel')}:</strong> {session.coach_firstname} {session.coach_lastname}
              </Typography>
            )}
            {session.camp_instructor_name && (
              <Typography variant="body2">
                <strong>{t('traineeRegistration.campInstructorLabel')}:</strong> {session.camp_instructor_name}
              </Typography>
            )}
          </>
        )}

        {traineeData && (
          <>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{t('traineeRegistration.traineeNameLabel')}:</strong> {traineeData.first_name} {traineeData.last_name}
            </Typography>
            {traineeData.age_group === 'underage' && (
              <Typography variant="body2">
                <strong>{t('traineeRegistration.traineeAgeLabel')}:</strong> {traineeData.underage_age}
              </Typography>
            )}
          </>
        )}

        {inlineError && <Alert severity="error" sx={{ mt: 2 }}>{inlineError}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            toast(t('traineeRegistration.registrationCancelled'));
            onCancel();
          }}
          disabled={loading}
        >
          {t('traineeRegistration.cancel')}
        </Button>
        <Button onClick={handleConfirm} variant="contained" disabled={loading || !session || !traineeData}>
          {t('manualTraineeRegistration.ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

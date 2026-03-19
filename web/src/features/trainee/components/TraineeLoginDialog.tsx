/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Modal dialog for trainee login via PIN code.
 *   PIN must be 4–6 digits. Calls the GAS backend verifyTraineePin route.
 *   Uses MUI Dialog, TextField, and Button for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';
import { verifyTraineePin } from '../api/trainee.api';
import type { TraineeData } from '../types';

const PIN_PATTERN = /^\d{4,6}$/;

export interface TraineeLoginDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called with the verified trainee data on successful PIN verification. */
  onLoginSuccess: (trainee: TraineeData) => void;
  /** Called when the user cancels the dialog. */
  onCancel: () => void;
}

/**
 * Modal dialog asking the trainee to authenticate via PIN code.
 * Calls verifyTraineePin on submit and propagates result via onLoginSuccess.
 */
export function TraineeLoginDialog({ open, onLoginSuccess, onCancel }: TraineeLoginDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const pinValid = PIN_PATTERN.test(pin);

  async function handleVerify() {
    if (!pinValid || isVerifying) return;
    setIsVerifying(true);
    toast(t('traineeLogin.verificationOngoing'));
    try {
      const traineeData = await verifyTraineePin(pin);
      toast.success(t('traineeLogin.verificationSuccess'));
      resetState();
      onLoginSuccess(traineeData);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'no_match_found') {
        setPinError(t('traineeLogin.invalidPin'));
      } else {
        toast.error(t('traineeLogin.verificationFailed'));
      }
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  }

  function handleCancel() {
    resetState();
    toast(t('traineeLogin.verificationCancelled'));
    onCancel();
  }

  function resetState() {
    setPin('');
    setPinError('');
  }

  return (
    <Dialog
      open={open}
      aria-labelledby="trainee-login-title"
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        },
        backdrop: {
          sx: {
            backgroundColor: 'rgba(10, 10, 15, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(8px)',
          },
        },
      }}
    >
      <DialogTitle id="trainee-login-title">{t('traineeLogin.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
            <TextField
              id="trainee-pin"
              type="password"
              label={t('traineeLogin.enterPin')}
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError(''); }}
              inputProps={{ maxLength: 6, inputMode: 'numeric', 'aria-label': t('traineeLogin.enterPin') }}
              error={!!pinError}
              margin="dense"
              sx={{ flex: 1 }}
              autoComplete="one-time-code"
            />
            <Button
              onClick={handleVerify}
              disabled={!pinValid || isVerifying}
              variant="contained"
              sx={{ mt: { xs: 0.5, sm: 1 }, minWidth: 120, whiteSpace: 'nowrap' }}
            >
              {t('traineeLogin.verify')}
            </Button>
          </Stack>
          {pinError && <Alert severity="error" sx={{ mt: 1 }}>{pinError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="outlined">
          {t('traineeLogin.cancel')}
        </Button>
      </DialogActions>
      <LoadingOverlay visible={isVerifying} />
    </Dialog>
  );
}

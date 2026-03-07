/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Modal dialog for coach login via PIN code or password.
 *   PIN must be 4–6 digits. Password is compared to the coach_pwd setting.
 *   Opens a RegisterPinDialog when the user wants to register a new PIN.
 *   PIN verification calls the GAS backend (verifyCoachPin route).
 *   Uses MUI Dialog, TextField, and Button for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { RegisterPinDialog } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';
import type { RegisterPinData } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';
import { registerCoachPin, verifyCoachPin } from '../api/coach.api';
import type { CoachLoginDialogProps } from '../types';

const PIN_PATTERN = /^\d{4,6}$/;

/**
 * Modal dialog asking the coach to authenticate via PIN code or password.
 * Opens a RegisterPinDialog when the user wants to register a new PIN.
 */
export function CoachLoginDialog({ open, coachPassword, onLoginSuccess, onCancel }: CoachLoginDialogProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pinError, setPinError] = useState('');
  const [registerPinOpen, setRegisterPinOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const pinValid = PIN_PATTERN.test(pin);
  const loginEnabled = password.length > 0;

  async function handleVerify() {
    if (!pinValid || isVerifying) return;
    setIsVerifying(true);
    try {
      const coachData = await verifyCoachPin(pin);
      toast.success(t('coachLogin.loginSuccess'));
      onLoginSuccess(coachData);
    } catch (err) {
      setPinError(t('coachLogin.invalidPin'));
      setPin('');
      setPassword('');
    } finally {
      setIsVerifying(false);
    }
  }

  function handleLogin() {
    if (password === coachPassword) {
      onLoginSuccess();
    } else {
      setPasswordError(t('coachLogin.wrongPassword'));
    }
  }

  function handleRegisterPinOpen() {
    setRegisterPinOpen(true);
  }

  async function handleCoachRegistration(data: RegisterPinData) {
    await registerCoachPin(data);
  }

  function handlePinRegistered(newPin: string) {
    setPin(newPin);
    setRegisterPinOpen(false);
  }

  function handleRegisterPinCancel() {
    setRegisterPinOpen(false);
  }

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="coach-login-title"
        onClose={onCancel}
      >
        <DialogTitle id="coach-login-title">{t('coachLogin.title')}</DialogTitle>
        <DialogContent>
          {/* PIN code section */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 0.5 }}>
            <TextField
              id="coach-pin"
              type="password"
              label={t('coachLogin.enterPin')}
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError(''); }}
              inputProps={{ maxLength: 6, inputMode: 'numeric', 'aria-label': t('coachLogin.enterPin') }}
              error={!!pinError}
              helperText={pinError || ' '}
              margin="dense"
              sx={{ flex: 1 }}
              autoComplete="one-time-code"
            />
            <Button
              onClick={handleVerify}
              disabled={!pinValid || isVerifying}
              variant="contained"
              sx={{ mt: 1, whiteSpace: 'nowrap' }}
            >
              {t('coachLogin.verify')}
            </Button>
          </Box>
          <Button
            onClick={handleRegisterPinOpen}
            type="button"
            size="small"
            sx={{ textTransform: 'none', p: 0, mb: 1 }}
          >
            {t('coachLogin.registerNewPin')}
          </Button>

          {/* Password section */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              id="coach-password"
              type="password"
              label={t('coachLogin.enterPassword')}
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
              inputProps={{ 'aria-label': t('coachLogin.enterPassword') }}
              error={!!passwordError}
              helperText={passwordError || ' '}
              margin="dense"
              sx={{ flex: 1 }}
              autoComplete="current-password"
            />
            <Button
              onClick={handleLogin}
              disabled={!loginEnabled}
              variant="contained"
              sx={{ mt: 1, whiteSpace: 'nowrap' }}
            >
              {t('coachLogin.login')}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>{t('coachLogin.cancel')}</Button>
        </DialogActions>
        <LoadingOverlay visible={isVerifying} />
      </Dialog>

      <RegisterPinDialog
        open={registerPinOpen}
        onRegister={handleCoachRegistration}
        onSuccess={handlePinRegistered}
        onCancel={handleRegisterPinCancel}
        showAlias={true}
      />
    </>
  );
}




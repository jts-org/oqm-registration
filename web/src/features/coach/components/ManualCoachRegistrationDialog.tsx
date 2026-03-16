/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Dialog shown when a password-authenticated coach clicks "Register" on a session card (OQM-0010).
 *   Collects first name and last name for coaches without a PIN code.
 *   Also supports opening RegisterPinDialog to register a PIN directly from this dialog;
 *   pre-fills name fields when transferring to RegisterPinDialog.
 *   After PIN registration, closes and opens ConfirmCoachRegistrationDialog with full CoachData.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RegisterPinDialog } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';
import type { RegisterPinData } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';
import { registerCoachPin } from '../api/coach.api';
import type { CoachData } from '../types';

/** Allows letters (including Nordic), spaces and hyphens between letter groups. */
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([- ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

function isValidName(value: string): boolean {
  if (!value || value.trim().length === 0) return false;
  if (value.length > 30) return false;
  return NAME_PATTERN.test(value);
}

export interface ManualCoachRegistrationDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /**
   * Called when the user clicks "Ok" (with manually typed names) or after a successful PIN registration.
   * Receives a CoachData object pre-populated with the coach's details.
   */
  onOk: (coachData: CoachData) => void;
  /** Called when the user clicks "Cancel". Parent is responsible for showing a cancellation toast. */
  onCancel: () => void;
}

/**
 * Dialog for password-authenticated coaches to fill in their name for session registration.
 * "Ok" is disabled until first name and last name are valid.
 * "Register PIN code" opens RegisterPinDialog; on success, closes this dialog and calls onOk.
 */
export function ManualCoachRegistrationDialog({
  open,
  onOk,
  onCancel,
}: ManualCoachRegistrationDialogProps) {
  const { t } = useTranslation();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [registerPinOpen, setRegisterPinOpen] = useState(false);
  // Ref stores CoachData returned from registerCoachPin before onSuccess fires (avoids React state batching).
  const pendingCoachDataRef = useRef<CoachData | null>(null);

  // Reset fields when dialog opens.
  useEffect(() => {
    if (open) {
      setFirstname('');
      setLastname('');
      setRegisterPinOpen(false);
      pendingCoachDataRef.current = null;
    }
  }, [open]);

  const isFormValid = isValidName(firstname) && isValidName(lastname);

  function handleOk() {
    if (!isFormValid) return;
    const coachData: CoachData = {
      id: '',
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      alias: '',
      pin: '',
      created_at: '',
      last_activity: '',
    };
    onOk(coachData);
  }

  function handleCancel() {
    setFirstname('');
    setLastname('');
    onCancel();
  }

  function handleOpenRegisterPin() {
    setRegisterPinOpen(true);
  }

  async function handlePinRegister(data: RegisterPinData): Promise<void> {
    const coachData = await registerCoachPin(data);
    pendingCoachDataRef.current = coachData;
  }

  function handlePinRegistered(_pin: string) {
    setRegisterPinOpen(false);
    if (pendingCoachDataRef.current) {
      onOk(pendingCoachDataRef.current);
    }
  }

  function handlePinCancel() {
    setRegisterPinOpen(false);
    pendingCoachDataRef.current = null;
  }

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="manual-coach-registration-title"
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
          backdrop: {
            sx: {
              backgroundColor: 'rgba(10, 10, 15, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
          },
        }}
      >
        <DialogTitle id="manual-coach-registration-title">
          {t('manualCoachRegistration.title')}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              id="outlined-helpertext-firstname"
              label={t('manualCoachRegistration.firstName')}
              placeholder={t('manualCoachRegistration.firstNamePlaceholder')}
              value={firstname}
              onChange={e => setFirstname(e.target.value)}
              required
              inputProps={{ maxLength: 30, 'aria-label': t('manualCoachRegistration.firstName') }}
              fullWidth
            />
            <TextField
              id="outlined-helpertext-lastname"
              label={t('manualCoachRegistration.lastName')}
              placeholder={t('manualCoachRegistration.lastNamePlaceholder')}
              value={lastname}
              onChange={e => setLastname(e.target.value)}
              required
              inputProps={{ maxLength: 30, 'aria-label': t('manualCoachRegistration.lastName') }}
              fullWidth
            />
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 2 }}>
            {t('manualCoachRegistration.pinHint')}
          </Typography>

          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleOpenRegisterPin}
              sx={{ cursor: 'pointer', textAlign: 'left' }}
            >
              {t('manualCoachRegistration.registerPinLink')}
            </Link>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel} variant="outlined">
            {t('manualCoachRegistration.cancel')}
          </Button>
          <Button onClick={handleOk} disabled={!isFormValid} variant="contained" color="primary">
            {t('manualCoachRegistration.ok')}
          </Button>
        </DialogActions>
      </Dialog>

      <RegisterPinDialog
        open={registerPinOpen}
        onRegister={handlePinRegister}
        onSuccess={handlePinRegistered}
        onCancel={handlePinCancel}
        initialFirstname={firstname}
        initialLastname={lastname}
      />
    </>
  );
}

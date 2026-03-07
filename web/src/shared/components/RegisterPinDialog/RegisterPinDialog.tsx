/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Reusable modal dialog for registering a new PIN code.
 *   Collects firstname, lastname, alias (optional) and a validated PIN.
 *   PIN must be 4–6 numeric characters. Used by coach and trainee flows.
 *   Uses MUI Dialog, TextField, and Button for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { LoadingOverlay } from '../LoadingOverlay/LoadingOverlay';

const PIN_PATTERN = /^\d{4,6}$/;
/** Allows letters (including Nordic), spaces and hyphens between letter groups. */
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([- ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

function isValidName(value: string): boolean {
  if (!value || value.trim().length === 0) return false;
  if (value.length > 30) return false;
  return NAME_PATTERN.test(value);
}

/** Data collected and submitted by the RegisterPinDialog. */
export interface RegisterPinData {
  firstname: string;
  lastname: string;
  alias: string;
  pin: string;
}

export interface RegisterPinDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /**
   * Called with form data when the user clicks Register.
   * Implementation must call the backend API.
   * Throw Error('pin_reserved') if the PIN is already taken.
   * Throw other errors for network/service failures (shown as toast).
   */
  onRegister: (data: RegisterPinData) => Promise<void>;
  /** Called after successful registration, passing the registered PIN. */
  onSuccess: (pin: string) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
  /** Whether to show the Alias input field. Defaults to true. */
  showAlias?: boolean;
}

/**
 * Modal dialog that collects user details and a new PIN code.
 * The PIN must be 4–6 digits and entered identically in both fields.
 * Firstname and Lastname are required; Alias is optional.
 */
export function RegisterPinDialog({
  open,
  onRegister,
  onSuccess,
  onCancel,
  showAlias = true,
}: RegisterPinDialogProps) {
  const { t } = useTranslation();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [alias, setAlias] = useState('');
  const [pin, setPin] = useState('');
  const [pinAgain, setPinAgain] = useState('');
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinReservedOpen, setPinReservedOpen] = useState(false);

  // Reset form state each time the dialog opens.
  useEffect(() => {
    if (open) {
      setFirstname('');
      setLastname('');
      setAlias('');
      setPin('');
      setPinAgain('');
      setDirty({});
      setIsSubmitting(false);
      setPinReservedOpen(false);
    }
  }, [open]);

  function markDirty(field: string) {
    setDirty(prev => ({ ...prev, [field]: true }));
  }

  const firstnameError =
    dirty.firstname && !isValidName(firstname)
      ? firstname.trim() === ''
        ? t('registerPin.mandatory')
        : t('registerPin.invalidName')
      : null;

  const lastnameError =
    dirty.lastname && !isValidName(lastname)
      ? lastname.trim() === ''
        ? t('registerPin.mandatory')
        : t('registerPin.invalidName')
      : null;

  const pinError = dirty.pin && pin.trim() === '' ? t('registerPin.mandatory') : null;
  const pinAgainError =
    dirty.pinAgain && pinAgain.trim() === '' ? t('registerPin.mandatory') : null;

  const pinMismatch =
    pin.length > 0 && pinAgain.length > 0 && pin !== pinAgain
      ? t('registerPin.pinMismatch')
      : null;

  const aliasValid = alias === '' || isValidName(alias);

  const isFormValid =
    isValidName(firstname) &&
    isValidName(lastname) &&
    aliasValid &&
    PIN_PATTERN.test(pin) &&
    pin === pinAgain;

  async function handleRegister() {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRegister({ firstname, lastname, alias, pin });
      toast.success(t('registerPin.successMessage'));
      onSuccess(pin);
    } catch (err) {
      if (err instanceof Error && err.message === 'pin_reserved') {
        setPinReservedOpen(true);
      } else {
        toast.error(t('registerPin.networkError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePinReservedClose() {
    setPinReservedOpen(false);
    setPin('');
    setPinAgain('');
    setDirty(prev => ({ ...prev, pin: false, pinAgain: false }));
  }

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="register-pin-title"
        onClose={onCancel}
      >
        <DialogTitle id="register-pin-title">{t('registerPin.title')}</DialogTitle>
        <DialogContent>
          {/* Firstname */}
          <TextField
            id="register-pin-firstname"
            type="text"
            label={t('registerPin.firstname')}
            value={firstname}
            inputProps={{ maxLength: 30, 'aria-label': t('registerPin.firstname') }}
            onChange={e => {
              setFirstname(e.target.value);
              markDirty('firstname');
            }}
            error={!!firstnameError}
            helperText={firstnameError || ' '}
            fullWidth
            margin="dense"
          />

          {/* Lastname */}
          <TextField
            id="register-pin-lastname"
            type="text"
            label={t('registerPin.lastname')}
            value={lastname}
            inputProps={{ maxLength: 30, 'aria-label': t('registerPin.lastname') }}
            onChange={e => {
              setLastname(e.target.value);
              markDirty('lastname');
            }}
            error={!!lastnameError}
            helperText={lastnameError || ' '}
            fullWidth
            margin="dense"
          />

          {/* Alias (optional, hidden for trainee) */}
          {showAlias && (
            <TextField
              id="register-pin-alias"
              type="text"
              label={t('registerPin.alias')}
              value={alias}
              inputProps={{ maxLength: 30, 'aria-label': t('registerPin.alias') }}
              onChange={e => setAlias(e.target.value)}
              fullWidth
              margin="dense"
            />
          )}

          {/* Enter new PIN code */}
          <TextField
            id="register-pin-new"
            type="password"
            label={t('registerPin.enterNewPin')}
            value={pin}
            onChange={e => {
              setPin(e.target.value);
              markDirty('pin');
            }}
            inputProps={{ 'aria-label': t('registerPin.enterNewPin') }}
            error={!!pinError}
            helperText={pinError || ' '}
            fullWidth
            margin="dense"
          />

          {/* Enter PIN again */}
          <TextField
            id="register-pin-again"
            type="password"
            label={t('registerPin.enterPinAgain')}
            value={pinAgain}
            onChange={e => {
              setPinAgain(e.target.value);
              markDirty('pinAgain');
            }}
            inputProps={{ 'aria-label': t('registerPin.enterPinAgain') }}
            error={!!(pinAgainError || pinMismatch)}
            helperText={pinAgainError || pinMismatch || ' '}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRegister} disabled={!isFormValid || isSubmitting} variant="contained">
            {t('registerPin.register')}
          </Button>
          <Button onClick={onCancel}>
            {t('registerPin.cancel')}
          </Button>
        </DialogActions>
        <LoadingOverlay visible={isSubmitting} />
      </Dialog>

      {/* PIN reserved notification dialog */}
      <Dialog
        open={pinReservedOpen}
        PaperProps={{ role: 'alertdialog', 'aria-describedby': 'pin-reserved-message' }}
        onClose={handlePinReservedClose}
      >
        <DialogContent>
          <p id="pin-reserved-message">{t('registerPin.pinReserved')}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePinReservedClose}>
            {t('registerPin.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


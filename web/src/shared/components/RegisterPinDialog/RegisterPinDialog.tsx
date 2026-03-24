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
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { LoadingOverlay } from '../LoadingOverlay/LoadingOverlay';

const PIN_PATTERN = /^\d{4,6}$/;
/** Allows letters (including Nordic), spaces and hyphens between letter groups. */
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[- ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
/** First name additionally allows a dot to support values like 'John J.'. */
const FIRSTNAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ .-][A-Za-zÀ-ÖØ-öø-ÿ]+)*\.?$/;

type BusinessErrorCode =
  | 'invalid_password'
  | 'pin_reserved'
  | 'concurrent_request'
  | 'name_already_exists'
  | 'mismatching_aliases'
  | 'already_registered'
  | 'pins_do_not_match';

function isValidName(value: string, pattern = NAME_PATTERN): boolean {
  if (!value || value.trim().length === 0) return false;
  if (value.length > 30) return false;
  return pattern.test(value);
}

function normalizeAge(value?: number): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 17
    ? value
    : undefined;
}

interface NumberSpinnerProps {
  id: string;
  label: string;
  value: string;
  min: number;
  max: number;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

function NumberSpinner({
  id,
  label,
  value,
  min,
  max,
  onChange,
  error = false,
  helperText = ' ',
}: NumberSpinnerProps) {
  const parsed = value === '' ? Number.NaN : Number(value);
  const canDecrease = Number.isInteger(parsed) && parsed > min;
  const canIncrease = Number.isInteger(parsed) && parsed < max;

  function decrement() {
    if (!canDecrease) return;
    onChange(String(parsed - 1));
  }

  function increment() {
    if (!canIncrease) return;
    onChange(String(parsed + 1));
  }

  function handleInputChange(next: string) {
    if (next === '' || /^\d+$/.test(next)) {
      onChange(next);
    }
  }

  return (
    <FormControl size="small" error={error} sx={{ width: 152 }}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        id={id}
        label={label}
        type="number"
        value={value}
        onChange={event => handleInputChange(event.target.value)}
        inputProps={{
          min,
          max,
          step: 1,
          inputMode: 'numeric',
          pattern: '[0-9]*',
          'aria-label': label,
        }}
        startAdornment={
          <InputAdornment position="start">
            <IconButton
              edge="start"
              size="small"
              onClick={decrement}
              disabled={!canDecrease}
              aria-label="Decrease age"
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              edge="end"
              size="small"
              onClick={increment}
              disabled={!canIncrease}
              aria-label="Increase age"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}

/** Data collected and submitted by the RegisterPinDialog. */
export interface RegisterPinData {
  firstname: string;
  lastname: string;
  alias?: string;
  pin: string;
  password?: string;
  isUnderage?: boolean;
  age?: number;
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
  /** Pre-fill the Firstname field when the dialog opens (OQM-0010). */
  initialFirstname?: string;
  /** Pre-fill the Lastname field when the dialog opens (OQM-0010). */
  initialLastname?: string;
  /** Pre-fill trainee underage state when opening in trainee mode. */
  initialIsUnderage?: boolean;
  /** Pre-fill trainee age when opening in trainee mode. */
  initialAge?: number;
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
  initialFirstname = '',
  initialLastname = '',
  initialIsUnderage = false,
  initialAge,
}: RegisterPinDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [alias, setAlias] = useState('');
  const [isUnderage, setIsUnderage] = useState(false);
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('');
  const [pinAgain, setPinAgain] = useState('');
  const [password, setPassword] = useState('');
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessErrorCode, setBusinessErrorCode] = useState<BusinessErrorCode | null>(null);

  // Reset form state each time the dialog opens; pre-fill names when provided (OQM-0010).
  useEffect(() => {
    if (open) {
      const resolvedAge = normalizeAge(initialAge);
      setFirstname(initialFirstname);
      setLastname(initialLastname);
      setAlias('');
      setIsUnderage(initialIsUnderage);
      setAge(initialIsUnderage ? String(resolvedAge ?? 15) : '');
      setPin('');
      setPinAgain('');
      setPassword('');
      setDirty({});
      setIsSubmitting(false);
      setBusinessErrorCode(null);
    }
  }, [open, initialFirstname, initialLastname, initialIsUnderage, initialAge]);

  function markDirty(field: string) {
    setDirty(prev => ({ ...prev, [field]: true }));
  }

  const firstnameError =
    dirty.firstname && !isValidName(firstname, FIRSTNAME_PATTERN)
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
  const passwordError =
    showAlias && dirty.password && password.trim() === '' ? t('registerPin.mandatory') : null;

  const pinMismatch =
    pin.length > 0 && pinAgain.length > 0 && pin !== pinAgain
      ? t('registerPin.pinMismatch')
      : null;

  const aliasValid = alias === '' || isValidName(alias);
  const ageNumber = age === '' ? Number.NaN : Number(age);
  const ageValid = !isUnderage || (Number.isInteger(ageNumber) && ageNumber >= 1 && ageNumber <= 17);
  const ageError =
    isUnderage && age.trim() === ''
      ? t('registerPin.mandatory')
      : isUnderage && !ageValid
        ? t('registerPin.ageRange')
        : null;

  const isFormValid =
    isValidName(firstname, FIRSTNAME_PATTERN) &&
    isValidName(lastname) &&
    aliasValid &&
    ageValid &&
    PIN_PATTERN.test(pin) &&
    pin === pinAgain &&
    (!showAlias || password.trim().length > 0);

  function buildPayload(): RegisterPinData {
    const basePayload: RegisterPinData = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      pin,
    };

    if (showAlias) {
      return {
        ...basePayload,
        alias: alias.trim(),
        password: password.trim(),
      };
    }

    if (isUnderage) {
      return {
        ...basePayload,
        isUnderage: true,
        age: ageNumber,
      };
    }

    return basePayload;
  }

  function handleCancel() {
    if (isSubmitting) return;
    toast(t('registerPin.cancelledMessage'));
    onCancel();
  }

  async function handleRegister() {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    toast(t('registerPin.ongoingMessage'));
    try {
      await onRegister(buildPayload());
      toast.success(t('registerPin.successMessage'));
      onSuccess(pin);
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (
        code === 'invalid_password' ||
        code === 'pin_reserved' ||
        code === 'concurrent_request' ||
        code === 'name_already_exists' ||
        code === 'mismatching_aliases' ||
        code === 'already_registered' ||
        code === 'pins_do_not_match'
      ) {
        setBusinessErrorCode(code);
      } else {
        toast.error(t('registerPin.networkError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBusinessErrorClose() {
    const shouldClearPinFields = businessErrorCode === 'pin_reserved';
    setBusinessErrorCode(null);
    if (shouldClearPinFields) {
      setPin('');
      setPinAgain('');
      setDirty(prev => ({ ...prev, pin: false, pinAgain: false }));
    }
  }

  function getBusinessErrorMessage(): string {
    switch (businessErrorCode) {
      case 'invalid_password':
        return t('registerPin.invalidPassword');
      case 'pin_reserved':
        return t('registerPin.pinReserved');
      case 'concurrent_request':
        return t('registerPin.concurrentRequest');
      case 'name_already_exists':
        return t('registerPin.nameAlreadyExists');
      case 'mismatching_aliases':
        return t('registerPin.mismatchingAliases');
      case 'already_registered':
        return t('registerPin.alreadyRegistered');
      case 'pins_do_not_match':
        return t('registerPin.pinsDoNotMatch');
      default:
        return '';
    }
  }

  function handleUnderageToggle(checked: boolean) {
    setIsUnderage(checked);
    setAge(checked ? '15' : '');
  }

  return (
    <>
      <Dialog
        open={open}
        aria-labelledby="register-pin-title"
        onClose={onCancel}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
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
        <DialogTitle id="register-pin-title">{t('registerPin.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('registerPin.hint')}
          </Typography>

          <Stack spacing={2} sx={{ mt: 0.5 }}>
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
            />

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
            />

            {!showAlias && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                flexWrap="wrap"
                sx={{
                  "@media (max-width: 400px)": {
                    flexDirection: "column",
                    alignItems: "stretch",
                  },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  height="56px"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isUnderage}
                        onChange={(_event, checked) => handleUnderageToggle(checked)}
                      />
                    }
                    label={t('registerPin.underageLabel')}
                    sx={{
                      m: 0,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Box>

                {isUnderage && (
                  <Box
                    display="flex"
                    alignItems="center"
                    height="56px"
                  >
                    <Box 
                      width={180} 
                      display="flex" 
                      alignItems="center"
                      sx={{
                        "& > *": {
                          marginTop: "auto",
                          marginBottom: "auto",
                        },
                      }}
                    >
                      <NumberSpinner
                        id="register-pin-age"
                        label={t('registerPin.ageLabel')}
                        value={age}
                        min={1}
                        max={17}
                        onChange={setAge}
                        error={!!ageError}
                        helperText={ageError || ' '}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {showAlias && (
              <TextField
                id="register-pin-alias"
                type="text"
                label={t('registerPin.alias')}
                value={alias}
                inputProps={{ maxLength: 30, 'aria-label': t('registerPin.alias') }}
                onChange={e => setAlias(e.target.value)}
                fullWidth
              />
            )}

            <Grid container spacing={2} data-testid="register-pin-pin-grid">
              <Grid size={{ xs: 12, sm: 6 }} data-testid="register-pin-pin-grid-item-new">
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
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} data-testid="register-pin-pin-grid-item-again">
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
                />
              </Grid>
            </Grid>

            {showAlias && (
              <TextField
                id="register-pin-password"
                type="password"
                label={t('registerPin.coachPassword')}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  markDirty('password');
                }}
                inputProps={{ 'aria-label': t('registerPin.coachPassword') }}
                error={!!passwordError}
                helperText={passwordError || ' '}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel} variant="outlined" disabled={isSubmitting}>
            {t('registerPin.cancel')}
          </Button>
          <Button
            onClick={handleRegister}
            disabled={!isFormValid || isSubmitting}
            variant="contained"
            color="primary"
          >
            {t('registerPin.register')}
          </Button>
        </DialogActions>
        <LoadingOverlay visible={isSubmitting} />
      </Dialog>

      {/* PIN reserved notification dialog */}
      <Dialog
        open={businessErrorCode !== null}
        maxWidth="xs"
        slotProps={{
          paper: { 
            role: 'alertdialog', 
            'aria-describedby': 'register-pin-error-message', 
            sx: {
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRadius: 3,
            },
          }
        }}
        onClose={handleBusinessErrorClose}
      >
        <DialogContent>
          <Alert severity="error" id="register-pin-error-message" sx={{ mt: 1 }}>
            {getBusinessErrorMessage()}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleBusinessErrorClose} variant="outlined">
            {t('registerPin.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


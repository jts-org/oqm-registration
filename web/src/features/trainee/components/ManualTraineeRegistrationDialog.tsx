/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Manual dialog for collecting trainee registration profile data.
 *   Includes underage checkbox and age spinner for under-18 trainees.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import type { PendingTraineeData } from '../types';

const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([- ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

function isValidName(value: string): boolean {
  if (!value || value.trim().length === 0) return false;
  if (value.length > 30) return false;
  return NAME_PATTERN.test(value);
}

interface NumberSpinnerProps {
  id: string;
  label: string;
  value: string;
  min: number;
  max: number;
  onChange: (value: string) => void;
}

function NumberSpinner({ id, label, value, min, max, onChange }: NumberSpinnerProps) {
  const parsed = value === '' ? Number.NaN : Number(value);
  const canDecrease = Number.isInteger(parsed) && parsed > min;
  const canIncrease = Number.isInteger(parsed) && parsed < max;

  function decrement() {
    if (canDecrease) onChange(String(parsed - 1));
  }

  function increment() {
    if (canIncrease) onChange(String(parsed + 1));
  }

  return (
    <FormControl size="small" sx={{ width: 152 }}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        id={id}
        label={label}
        type="number"
        value={value}
        onChange={event => onChange(event.target.value)}
        inputProps={{ min, max, step: 1, inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': label }}
        startAdornment={
          <InputAdornment position="start">
            <IconButton edge="start" size="small" onClick={decrement} disabled={!canDecrease} aria-label="Decrease age">
              <RemoveIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton edge="end" size="small" onClick={increment} disabled={!canIncrease} aria-label="Increase age">
              <AddIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText>{' '}</FormHelperText>
    </FormControl>
  );
}

export interface ManualTraineeRegistrationDialogProps {
  open: boolean;
  initialData?: PendingTraineeData;
  onOk: (data: PendingTraineeData) => void;
  onCancel: () => void;
}

/** Collect trainee details and emit normalized data for confirmation step. */
export function ManualTraineeRegistrationDialog({
  open,
  initialData,
  onOk,
  onCancel,
}: ManualTraineeRegistrationDialogProps) {
  const { t } = useTranslation();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [isUnderage, setIsUnderage] = useState(false);
  const [age, setAge] = useState('15');

  useEffect(() => {
    if (!open) return;
    setFirstname(initialData?.first_name ?? '');
    setLastname(initialData?.last_name ?? '');
    const underage = initialData?.age_group === 'underage';
    setIsUnderage(underage);
    setAge(underage ? String(initialData?.underage_age ?? 15) : '15');
  }, [open, initialData]);

  const isValid = isValidName(firstname) && isValidName(lastname);

  function handleOk() {
    if (!isValid) return;
    onOk({
      first_name: firstname.trim(),
      last_name: lastname.trim(),
      age_group: isUnderage ? 'underage' : 'adult',
      underage_age: isUnderage ? Number(age || 15) : undefined,
    });
  }

  return (
    <Dialog open={open} aria-labelledby="manual-trainee-registration-title" onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle id="manual-trainee-registration-title">{t('manualTraineeRegistration.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label={t('manualTraineeRegistration.firstName')}
            placeholder={t('manualTraineeRegistration.firstNamePlaceholder')}
            value={firstname}
            onChange={event => setFirstname(event.target.value)}
            required
            inputProps={{ maxLength: 30, 'aria-label': t('manualTraineeRegistration.firstName') }}
            fullWidth
          />
          <TextField
            label={t('manualTraineeRegistration.lastName')}
            placeholder={t('manualTraineeRegistration.lastNamePlaceholder')}
            value={lastname}
            onChange={event => setLastname(event.target.value)}
            required
            inputProps={{ maxLength: 30, 'aria-label': t('manualTraineeRegistration.lastName') }}
            fullWidth
          />

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
            <FormControlLabel
              control={<Checkbox checked={isUnderage} onChange={(_e, checked) => setIsUnderage(checked)} />}
              label={t('manualTraineeRegistration.underageLabel')}
              sx={{ m: 0 }}
            />
            {isUnderage && (
              <NumberSpinner
                id="manual-trainee-registration-age"
                label={t('manualTraineeRegistration.ageLabel')}
                value={age}
                min={1}
                max={17}
                onChange={setAge}
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary">
            {t('manualTraineeRegistration.pinHint')}
          </Typography>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Link component="button" variant="body2" sx={{ cursor: 'pointer', textAlign: 'left' }}>
              {t('manualTraineeRegistration.pinHintLink')}
            </Link>
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          {t('manualTraineeRegistration.cancel')}
        </Button>
        <Button onClick={handleOk} disabled={!isValid} variant="contained">
          {t('manualTraineeRegistration.ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

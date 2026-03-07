/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Modal dialog for admin login via password.
 *   Password is compared to the admin_pwd setting value.
 *   Uses MUI Dialog, TextField, and Button for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type { AdminLoginDialogProps } from '../types';

/**
 * Modal dialog asking the admin to authenticate with a password.
 * On failure an inline error message is shown; the dialog stays open.
 */
export function AdminLoginDialog({ open, adminPassword, onLoginSuccess, onCancel }: AdminLoginDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginEnabled = password.length > 0;

  function handleLogin() {
    if (password === adminPassword) {
      onLoginSuccess();
    } else {
      setError(t('adminLogin.incorrectPassword'));
    }
  }

  return (
    <Dialog
      open={open}
      aria-labelledby="admin-login-title"
      onClose={onCancel}
    >
      <DialogTitle id="admin-login-title">{t('adminLogin.title')}</DialogTitle>
      <DialogContent>
        <TextField
          id="admin-password"
          type="password"
          label={t('adminLogin.enterPassword')}
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setError('');
          }}
          error={!!error}
          helperText={error || ' '}
          inputProps={{ 'aria-label': t('adminLogin.enterPassword') }}
          fullWidth
          margin="dense"
          autoComplete="current-password"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogin} disabled={!loginEnabled} variant="contained">
          {t('adminLogin.login')}
        </Button>
        <Button onClick={onCancel}>
          {t('adminLogin.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

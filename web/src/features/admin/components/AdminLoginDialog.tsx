/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Modal dialog for admin login via password.
 *   Password verification is done server-side using adminLogin route.
 *   Uses MUI Dialog, TextField, and Button for accessible and consistent UI.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { adminLogin } from '../api/admin.api';
import type { AdminLoginDialogProps } from '../types';

/**
 * Modal dialog asking the admin to authenticate with a password.
 * On failure an inline error message is shown; the dialog stays open.
 */
export function AdminLoginDialog({ open, onLoginSuccess, onCancel }: AdminLoginDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginEnabled = password.length > 0;

  async function handleLogin() {
    try {
      const session = await adminLogin(password);
      onLoginSuccess(session.sessionToken);
    } catch (_err) {
      setError(t('adminLogin.incorrectPassword'));
      setPassword('');
    }
  }

  return (
    <Dialog
      open={open}
      aria-labelledby="admin-login-title"
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: {
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            border: '2px solid',
            borderColor: theme.palette.secondary.main,
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
          sx={{ 
            flex: 1,
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderColor: theme.palette.primary.main,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleLogin} 
          disabled={!loginEnabled} 
          variant="contained"
          sx={{ 
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderColor: theme.palette.primary.main,
          }}
        >
          {t('adminLogin.login')}
        </Button>
        <Button 
          onClick={onCancel}
          variant="contained"
          sx={{ 
            background: theme.palette.primary.main,
            color: theme.palette.text.primary,
            borderColor: theme.palette.primary.main,
          }}
        >
          {t('adminLogin.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Modal dialog asking whether to persist trainee identity in this browser.
 *   Replaces window.confirm to keep the QR registration flow reliable across browsers/devices.
 */
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';
import { useResponsiveDialog } from '../../../shared/hooks/useResponsive';

export interface StoreIdentityConsentDialogProps {
  open: boolean;
  onSave: () => void;
  onSkip: () => void;
}

/** Asks the trainee whether to save their identity in this browser; always resolves to Save or Skip. */
export function StoreIdentityConsentDialog({ open, onSave, onSkip }: StoreIdentityConsentDialogProps) {
  const { t } = useTranslation();
  const { fullScreen } = useResponsiveDialog();

  return (
    <Dialog
      open={open}
      aria-labelledby="store-identity-consent-title"
      onClose={onSkip}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle id="store-identity-consent-title">{t('qrRegister.storeIdentityTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('qrRegister.storeIdentityConsent')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onSkip} variant="outlined">
          {t('qrRegister.storeIdentitySkip')}
        </Button>
        <Button onClick={onSave} variant="contained">
          {t('qrRegister.storeIdentitySave')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

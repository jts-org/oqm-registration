/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Dummy confirmation dialog shown when the coach clicks 'Remove' on a session card.
 *   No backend call is made — this is a placeholder dialog (OQM-0007).
 *   Uses MUI Dialog for accessible and consistent UI.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export interface ConfirmRemoveCoachDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Dummy modal asking the coach to confirm removal from a session. */
export function ConfirmRemoveCoachDialog({
  open,
  onConfirm,
  onCancel,
}: ConfirmRemoveCoachDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-remove-title">
      <DialogTitle id="confirm-remove-title">
        {t('coachQuickRegistration.confirmRemoveTitle')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('coachQuickRegistration.confirmRemoveMessage')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('coachQuickRegistration.cancel')}</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {t('coachQuickRegistration.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

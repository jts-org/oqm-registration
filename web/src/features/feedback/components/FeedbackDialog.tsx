/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';
import { useResponsiveDialog } from '../../../shared/hooks/useResponsive';
import { verifyTraineePin } from '../../trainee/api/trainee.api';
import type { TraineeData } from '../../trainee/types';
import { sendFeedback } from '../api/feedback.api';
import type { FeedbackType } from '../types';

const PIN_PATTERN = /^\d{4,6}$/;
const MAX_MESSAGE_LENGTH = 500;

export interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const { t } = useTranslation();
  const { fullScreen } = useResponsiveDialog();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('feedback');
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPinValid = PIN_PATTERN.test(pin);
  const messageLength = message.length;
  const messageTooLong = messageLength > MAX_MESSAGE_LENGTH;
  const messageEmpty = message.trim().length === 0;
  const sendDisabled = isSubmitting || messageEmpty || messageTooLong;

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  function resetState() {
    setPin('');
    setPinError('');
    setIsVerifying(false);
    setShowForm(false);
    setSenderName('');
    setFeedbackType('feedback');
    setMessage('');
    setSubmitError('');
    setIsSubmitting(false);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  async function handleVerify() {
    if (!isPinValid || isVerifying) return;

    setIsVerifying(true);
    setPinError('');
    setSubmitError('');

    try {
      const traineeData = await verifyTraineePin(pin);
      setSenderName(formatSenderName(traineeData));
      setShowForm(true);
      toast.success(t('feedbackDialog.pinVerified'));
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'no_match_found') {
        setPinError(t('feedbackDialog.invalidPin'));
      } else {
        toast.error(t('feedbackDialog.verificationFailed'));
      }
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSend() {
    if (isSubmitting || messageEmpty || messageTooLong || !senderName) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await sendFeedback({
        type: feedbackType,
        from: senderName,
        message,
      });
      toast.success(t('feedbackDialog.sendSuccess'));
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setSubmitError(message === 'validation_error' ? t('feedbackDialog.validationError') : t('feedbackDialog.sendFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      aria-labelledby={showForm ? 'feedback-dialog-title' : 'pin-dialog-title'}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: theme => ({
            display: 'flex',
            flexDirection: 'column',
            width: { xs: '100%', sm: '480px' },
            maxWidth: '100%',
            ...(fullScreen
              ? {
                  height: '100%',
                  maxHeight: '100%',
                  borderRadius: 0,
                }
              : {
                  height: 'auto',
                  maxHeight: 'none',
                  borderRadius: 3,
                }),
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }),
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
      <DialogTitle id={showForm ? 'feedback-dialog-title' : 'pin-dialog-title'}>
        {showForm ? t('feedbackDialog.title') : t('feedbackPin.title')}
      </DialogTitle>
      <DialogContent
        dividers
        sx={
          fullScreen
            ? {
                flex: '1 1 0',
                minHeight: 0,
                maxHeight: '100%',
                overflowY: 'auto',
              }
            : {
                flex: '0 1 auto',
                overflowY: 'visible',
              }
        }
      >
        {showForm ? (
          <Stack spacing={2.5}>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
            <FormControl>
              <FormLabel id="feedback-type-label">{t('feedbackDialog.typeLabel')}</FormLabel>
              <RadioGroup
                aria-labelledby="feedback-type-label"
                value={feedbackType}
                onChange={event => setFeedbackType(event.target.value as FeedbackType)}
                row
              >
                <FormControlLabel value="feedback" control={<Radio />} label={t('feedbackDialog.feedbackOption')} />
                <FormControlLabel value="bug_report" control={<Radio />} label={t('feedbackDialog.bugReportOption')} />
                <FormControlLabel value="support_request" control={<Radio />} label={t('feedbackDialog.supportRequestOption')} />
              </RadioGroup>
            </FormControl>
            <TextField
              label={t('feedbackDialog.fromLabel')}
              value={senderName}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label={t('feedbackDialog.toLabel')}
              value={t('feedbackDialog.toValue')}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              id="feedback-message"
              label={t('feedbackDialog.messageLabel')}
              value={message}
              onChange={event => setMessage(event.target.value)}
              multiline
              minRows={6}
              fullWidth
              error={messageTooLong}
              helperText={messageTooLong ? t('feedbackDialog.messageTooLong') : t('feedbackDialog.messageHint')}
              inputProps={{ maxLength: MAX_MESSAGE_LENGTH, 'aria-label': t('feedbackDialog.messageLabel') }}
            />
            <Typography variant="body2" color={messageTooLong ? 'error' : 'text.secondary'}>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </Typography>
            {feedbackType === 'bug_report' ? (
              <Typography variant="body2" color="text.secondary">
                {t('feedbackDialog.bugReportHint')}
              </Typography>
            ) : null}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              id="feedback-pin"
              type="password"
              label={t('feedbackPin.enterPin')}
              value={pin}
              onChange={event => {
                setPin(event.target.value);
                setPinError('');
              }}
              inputProps={{ maxLength: 6, inputMode: 'numeric', 'aria-label': t('feedbackPin.enterPin') }}
              error={!!pinError}
              margin="dense"
              autoComplete="one-time-code"
            />
            {pinError ? <Alert severity="error">{pinError}</Alert> : null}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          {t('feedbackDialog.cancel')}
        </Button>
        {showForm ? (
          <Button onClick={handleSend} disabled={sendDisabled} variant="contained">
            {t('feedbackDialog.send')}
          </Button>
        ) : (
          <Button onClick={handleVerify} disabled={!isPinValid || isVerifying} variant="contained">
            {t('feedbackPin.verify')}
          </Button>
        )}
      </DialogActions>
      <LoadingOverlay visible={isVerifying || isSubmitting} />
    </Dialog>
  );
}

function formatSenderName(trainee: TraineeData): string {
  const name = [trainee.firstname, trainee.lastname].filter(Boolean).join(' ').trim();
  return name || trainee.id;
}

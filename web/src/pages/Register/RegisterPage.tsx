/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description QR registration flow entry route.
 *   Resolves a backend-truth selector, collects trainee identity, and submits only after explicit confirmation.
 */
import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resolveSessionSelector } from '../../features/trainee/api/trainee.api';
import { ConfirmTraineeRegistrationDialog } from '../../features/trainee/components/ConfirmTraineeRegistrationDialog';
import { ManualTraineeRegistrationDialog } from '../../features/trainee/components/ManualTraineeRegistrationDialog';
import { TraineeLoginDialog } from '../../features/trainee/components/TraineeLoginDialog';
import {
  readStoredTraineeIdentity,
  saveStoredTraineeIdentity,
  storedIdentityToPendingTraineeData,
} from '../../features/trainee/lib/identityStorage';
import type { PendingTraineeData, TraineeData, TraineeSessionItem } from '../../features/trainee/types';

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resolvedSession, setResolvedSession] = useState<TraineeSessionItem | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingTraineeData, setPendingTraineeData] = useState<PendingTraineeData | undefined>(undefined);

  useEffect(() => {
    const storedIdentity = readStoredTraineeIdentity();
    if (storedIdentity) {
      setPendingTraineeData(storedIdentityToPendingTraineeData(storedIdentity));
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadRegistration() {
      const requestedLanguage = searchParams.get('language')?.trim().toLowerCase();
      if (requestedLanguage === 'en' || requestedLanguage === 'fi') {
        if (i18n.language !== requestedLanguage) {
          await i18n.changeLanguage(requestedLanguage);
        }
        if (isCancelled) return;
      }

      const selector = (searchParams.get('session') ?? '').trim();

      if (!selector) {
        setResolvedSession(null);
        setError(t('qrRegister.missingSelector'));
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await resolveSessionSelector(selector);
        if (!isCancelled) setResolvedSession(result.session as TraineeSessionItem);
      } catch (err: unknown) {
        if (isCancelled) return;
        const code = err instanceof Error ? err.message : '';
        if (code === 'missing_selector') {
          setError(t('qrRegister.missingSelector'));
        } else if (code === 'unsupported_selector') {
          setError(t('qrRegister.unsupportedSelector'));
        } else if (code === 'no_session_today') {
          setError(t('qrRegister.noSessionToday'));
        } else {
          setError(t('qrRegister.invalidSelector'));
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    void loadRegistration();

    return () => {
      isCancelled = true;
    };
  }, [i18n, searchParams, t]);

  function handleContinue() {
    setPinDialogOpen(true);
  }

  function handleManualOpen() {
    setPinDialogOpen(false);
    setManualDialogOpen(true);
  }

  function handlePinSuccess(trainee: TraineeData) {
    const age = Number(trainee.age);
    const isUnderage = Number.isInteger(age) && age >= 1 && age <= 17;
    const verifiedTrainee: PendingTraineeData = isUnderage
      ? {
          first_name: trainee.firstname,
          last_name: trainee.lastname,
          age_group: 'underage',
          underage_age: age,
          pin: trainee.pin,
        }
      : {
          first_name: trainee.firstname,
          last_name: trainee.lastname,
          age_group: 'adult',
          pin: trainee.pin,
        };

    setPendingTraineeData(verifiedTrainee);
    setPinDialogOpen(false);
    setConfirmDialogOpen(true);
  }

  function handleManualConfirm(data: PendingTraineeData) {
    setPendingTraineeData(data);
    const shouldStore = window.confirm(t('qrRegister.storeIdentityConsent'));
    if (shouldStore) {
      const ageValue = data.age_group === 'underage'
        ? Number(data.underage_age ?? 15)
        : 18;
      const normalisedName = `${data.first_name} ${data.last_name}`.trim();
      saveStoredTraineeIdentity({
        pin: data.pin,
        name: normalisedName,
        age: ageValue,
      });
    }
    setManualDialogOpen(false);
    setConfirmDialogOpen(true);
  }

  function handleConfirmSuccess() {
    setConfirmDialogOpen(false);
    navigate('/');
  }

  function handleAlreadyRegistered() {
    setConfirmDialogOpen(false);
    toast(t('traineeRegistration.alreadyRegistered'));
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button variant="text" onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}>
          {t('qrRegister.backToMain')}
        </Button>

        <Typography variant="h4" component="h1">
          {t('qrRegister.title')}
        </Typography>

        {loading && (
          <Alert severity="info">{t('qrRegister.loading')}</Alert>
        )}

        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        {resolvedSession && !error && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">{t('qrRegister.summaryTitle')}</Typography>
                <Typography><strong>{t('traineeRegistration.sessionTypeLabel')}:</strong> {resolvedSession.session_type_alias || resolvedSession.session_type}</Typography>
                <Typography><strong>{t('traineeRegistration.sessionDateLabel')}:</strong> {resolvedSession.date}</Typography>
                <Typography><strong>{t('traineeRegistration.sessionTimeLabel')}:</strong> {resolvedSession.start_time} - {resolvedSession.end_time}</Typography>
                {resolvedSession.coach_firstname || resolvedSession.coach_lastname ? (
                  <Typography><strong>{t('traineeRegistration.coachLabel')}:</strong> {resolvedSession.coach_firstname} {resolvedSession.coach_lastname}</Typography>
                ) : null}
                <Button variant="contained" onClick={handleContinue}>
                  {t('qrRegister.continue')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      <TraineeLoginDialog
        open={pinDialogOpen}
        title={t('qrRegister.pinTitle')}
        manualFallbackLabel={t('qrRegister.manualEntry')}
        onLoginSuccess={handlePinSuccess}
        onManualFallback={handleManualOpen}
        onCancel={() => setPinDialogOpen(false)}
      />

      <ManualTraineeRegistrationDialog
        open={manualDialogOpen}
        onOk={handleManualConfirm}
        onCancel={() => setManualDialogOpen(false)}
      />

      <ConfirmTraineeRegistrationDialog
        open={confirmDialogOpen}
        session={resolvedSession}
        traineeData={pendingTraineeData}
        onSuccess={handleConfirmSuccess}
        onAlreadyRegistered={handleAlreadyRegistered}
        onCancel={() => setConfirmDialogOpen(false)}
      />
    </Container>
  );
}

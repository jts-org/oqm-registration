/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Customer event registration page (OQM-0050).
 *   Resolves a customer event by identifier, auto-selects single session,
 *   collects trainee identity, shows summary, and submits registration.
 *   Tracer bullet: single-session happy path only.
 */
import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDateDisplay, formatTimeDisplay } from '../../shared/utils/formatters';
import {
  resolveCustomerEvent,
  registerTraineeForSession,
  registerTraineeBatchForCustomerEvent,
} from '../../features/trainee/api/trainee.api';
import { SessionSelector } from '../../features/trainee/components/SessionSelector';
import type {
  CustomerEvent,
  CustomerEventSession,
  PendingTraineeData,
  RegisterTraineeForSessionPayload,
  RegisterTraineeBatchForCustomerEventPayload,
} from '../../features/trainee/types';

interface ResolverState {
  loading: boolean;
  error: string;
  event: CustomerEvent | null;
  sessions: CustomerEventSession[];
}

interface FormState {
  firstName: string;
  lastName: string;
  isUnderage: boolean;
  age: string;
}

export function RegisterCustomerEventPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Resolver state
  const [resolverState, setResolverState] = useState<ResolverState>({
    loading: false,
    error: '',
    event: null,
    sessions: [],
  });

  // Form state
  const [formState, setFormState] = useState<FormState>({
    firstName: '',
    lastName: '',
    isUnderage: false,
    age: '',
  });

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);

  // Resolve customer event on component mount
  useEffect(() => {
    const customerId = (searchParams.get('customer-event') ?? '').trim();

    if (!customerId) {
      setResolverState(prev => ({
        ...prev,
        error: t('customerEventRegister.missingCustomerEvent'),
      }));
      return;
    }

    let isCancelled = false;

    async function loadEvent() {
      setResolverState(prev => ({ ...prev, loading: true, error: '' }));

      try {
        const result = await resolveCustomerEvent(customerId);
        if (!isCancelled && result) {
          const sessions = result.sessions ?? [];
          setResolverState(prev => ({
            ...prev,
            event: result.event ?? null,
            sessions,
            loading: false,
          }));
          if (sessions.length === 1) {
            setSelectedSessionIds([sessions[0].id]);
          } else if (sessions.length > 1) {
            setSelectedSessionIds(sessions.map(s => s.id));
          }
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        const code = err instanceof Error ? err.message : '';
        let errorMessage = t('customerEventRegister.invalidCustomerEvent');
        if (code === 'missing_customer_event') {
          errorMessage = t('customerEventRegister.missingCustomerEvent');
        } else if (code === 'invalid_customer_event') {
          errorMessage = t('customerEventRegister.invalidCustomerEvent');
        } else if (code === 'inactive_customer_event') {
          errorMessage = t('customerEventRegister.inactiveCustomerEvent');
        }
        setResolverState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    }

    void loadEvent();

    return () => {
      isCancelled = true;
    };
  }, [searchParams, t]);

  // Validate form
  const isFormValid = () => {
    const firstNameValid = formState.firstName.trim().length > 0;
    const lastNameValid = formState.lastName.trim().length > 0;
    const ageValid = !formState.isUnderage || (formState.age.trim().length > 0 && !isNaN(Number(formState.age)));
    const sessionsValid = selectedSessionIds.length > 0;
    return firstNameValid && lastNameValid && ageValid && sessionsValid;
  };

  // Handle form input change
  const handleInputChange = (field: keyof FormState, value: string | boolean) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleSession = (sessionId: string) => {
    setSelectedSessionIds(prev =>
      prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId]
    );
  };

  const handleSelectAllSessions = () => {
    setSelectedSessionIds(resolverState.sessions.map(s => s.id));
  };

  const handleDeselectAllSessions = () => {
    setSelectedSessionIds([]);
  };

  // Handle confirmation
  const handleConfirm = async () => {
    if (!resolverState.event || selectedSessionIds.length === 0 || !isFormValid()) {
      return;
    }

    const selectedSessions = resolverState.sessions.filter(s =>
      selectedSessionIds.includes(s.id)
    );

    if (selectedSessions.length === 0) return;

    setSubmitting(true);
    try {
      const ageGroup = formState.isUnderage ? 'underage' : 'adult';

      // Always use customer event batch registration endpoint
      const batchPayload: RegisterTraineeBatchForCustomerEventPayload = {
        customer_event: resolverState.event.id,
        schedule_ids: selectedSessionIds,
        first_name: formState.firstName.trim(),
        last_name: formState.lastName.trim(),
        age_group: ageGroup,
        ...(ageGroup === 'underage' ? { underage_age: Number(formState.age) } : {}),
      };

      await registerTraineeBatchForCustomerEvent(batchPayload);
      toast.success(
        selectedSessionIds.length === 1
          ? t('customerEventRegister.registrationSuccess')
          : t('customerEventRegister.multiSessionSuccess', { count: selectedSessionIds.length })
      );
      
      // Navigate back to home after successful registration
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      let errorMessage = t('customerEventRegister.registrationFailed');
      
      if (code === 'already_registered') {
        errorMessage = t('customerEventRegister.alreadyRegistered');
      } else if (code === 'concurrent_request') {
        errorMessage = t('customerEventRegister.concurrentRequest');
      } else if (code === 'validation_failed') {
        errorMessage = t('customerEventRegister.validationFailed');
      } else if (code === 'validation_failed_age') {
        errorMessage = t('customerEventRegister.validationFailedAge');
      } else if (code === 'invalid_schedule') {
        errorMessage = t('customerEventRegister.invalidSchedule');
      } else if (code === 'invalid_session_eligibility') {
        errorMessage = t('customerEventRegister.invalidSessionEligibility');
      }
      
      toast.error(errorMessage);
      setShowConfirmation(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Determine flow state
  const isResolverReady = !resolverState.loading && !resolverState.error && resolverState.event;
  const hasNoSessions = isResolverReady && resolverState.sessions.length === 0;
  const hasSingleSession = isResolverReady && resolverState.sessions.length === 1;
  const hasMultipleSessions = isResolverReady && resolverState.sessions.length > 1;
  const event = resolverState.event;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button variant="text" onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}>
          {t('customerEventRegister.backToMain')}
        </Button>

        <Typography variant="h4" component="h1">
          {t('customerEventRegister.title')}
        </Typography>

        {/* Resolver state: Loading */}
        {resolverState.loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Resolver state: Error */}
        {resolverState.error && (
          <Alert severity="error">
            {resolverState.error}
          </Alert>
        )}

        {/* Resolver state: No sessions */}
        {hasNoSessions && (
          <Alert severity="warning">
            {t('customerEventRegister.noSessionsAvailable')}
          </Alert>
        )}

        {/* Resolver state: Ready (single or multiple sessions) */}
        {isResolverReady && resolverState.sessions.length > 0 && event && (
          <>
            {/* Event summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('customerEventRegister.eventLabel')}
                </Typography>
                <Typography variant="body1">
                  {event.event_alias || event.event}
                </Typography>
                {event.instructor && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      {t('customerEventRegister.instructorLabel')}
                    </Typography>
                    <Typography variant="body2">
                      {event.instructor}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Multi-session selector (2+ sessions) */}
            {hasMultipleSessions && (
              <SessionSelector
                sessions={resolverState.sessions}
                selectedSessionIds={selectedSessionIds}
                onToggleSession={handleToggleSession}
                onSelectAll={handleSelectAllSessions}
                onDeselectAll={handleDeselectAllSessions}
                disabled={submitting}
              />
            )}

            {/* Single session: Display details */}
            {hasSingleSession && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('customerEventRegister.sessionLabel')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('customerEventRegister.sessionNameLabel')}:</strong>{' '}
                    {resolverState.sessions[0].session_name_alias ||
                      resolverState.sessions[0].session_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('customerEventRegister.dateLabel')}:</strong>{' '}
                    {formatDateDisplay(resolverState.sessions[0].date)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('customerEventRegister.timeLabel')}:</strong>{' '}
                    {formatTimeDisplay(resolverState.sessions[0].start_time)} - {formatTimeDisplay(resolverState.sessions[0].end_time)}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Identity form */}
            {!showConfirmation && (
              <>
                <Typography variant="h6">
                  {t('customerEventRegister.identityFormTitle')}
                </Typography>

                <TextField
                  fullWidth
                  label={t('customerEventRegister.firstNameLabel')}
                  value={formState.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  placeholder={t('customerEventRegister.firstNamePlaceholder')}
                  disabled={submitting}
                />

                <TextField
                  fullWidth
                  label={t('customerEventRegister.lastNameLabel')}
                  value={formState.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  placeholder={t('customerEventRegister.lastNamePlaceholder')}
                  disabled={submitting}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formState.isUnderage}
                      onChange={e => handleInputChange('isUnderage', e.target.checked)}
                      disabled={submitting}
                    />
                  }
                  label={t('customerEventRegister.underageLabel')}
                />

                {formState.isUnderage && (
                  <TextField
                    fullWidth
                    label={t('customerEventRegister.ageLabel')}
                    type="number"
                    value={formState.age}
                    onChange={e => handleInputChange('age', e.target.value)}
                    placeholder={t('customerEventRegister.agePlaceholder')}
                    inputProps={{ min: '1', max: '17' }}
                    disabled={submitting}
                  />
                )}

                {/* Confirmation button */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setShowConfirmation(true)}
                  disabled={!isFormValid() || submitting}
                  sx={{ mt: 2 }}
                  aria-label={t('customerEventRegister.confirmLabel')}
                >
                  {t('customerEventRegister.confirmLabel')}
                </Button>
              </>
            )}

            {/* Confirmation dialog inline */}
            {showConfirmation && (hasSingleSession || hasMultipleSessions) && event && (
              <Card sx={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid #ffc107' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('customerEventRegister.summaryTitle')}
                  </Typography>

                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>{t('customerEventRegister.eventLabel')}:</strong>{' '}
                      {event.event_alias || event.event}
                    </Typography>

                    {hasSingleSession && resolverState.sessions.length > 0 && (
                      <>
                        <Typography variant="body2">
                          <strong>{t('customerEventRegister.sessionNameLabel')}:</strong>{' '}
                          {resolverState.sessions[0].session_name_alias ||
                            resolverState.sessions[0].session_name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>{t('customerEventRegister.dateLabel')}:</strong>{' '}
                          {formatDateDisplay(resolverState.sessions[0].date)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>{t('customerEventRegister.timeLabel')}:</strong>{' '}
                          {formatTimeDisplay(resolverState.sessions[0].start_time)} - {formatTimeDisplay(resolverState.sessions[0].end_time)}
                        </Typography>
                      </>
                    )}

                    {hasMultipleSessions && (
                      <Box sx={{ my: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          <strong>{t('customerEventRegister.selectedSessionsLabel')}:</strong>
                        </Typography>
                        <Stack spacing={1}>
                          {resolverState.sessions
                            .filter(s => selectedSessionIds.includes(s.id))
                            .map(s => (
                              <Box
                                key={s.id}
                                sx={{
                                  p: 1,
                                  backgroundColor: 'background.paper',
                                  borderRadius: 1,
                                  border: '1px solid #ddd',
                                }}
                              >
                                <Typography variant="body2" fontWeight="bold">
                                  {s.session_name_alias || s.session_name}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {formatDateDisplay(s.date)} ({formatTimeDisplay(s.start_time)} - {formatTimeDisplay(s.end_time)})
                                </Typography>
                              </Box>
                            ))}
                        </Stack>
                      </Box>
                    )}

                    <Typography variant="body2" sx={{ borderTop: '1px solid #ccc', pt: 1, mt: 1 }}>
                      <strong>{t('customerEventRegister.traineeNameLabel')}:</strong>{' '}
                      {formState.firstName} {formState.lastName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>{t('customerEventRegister.ageGroupLabel')}:</strong>{' '}
                      {formState.isUnderage
                        ? t('customerEventRegister.underageValue', { age: formState.age })
                        : t('customerEventRegister.adultValue')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setShowConfirmation(false)}
                      disabled={submitting}
                    >
                      {t('customerEventRegister.editLabel')}
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleConfirm}
                      disabled={submitting}
                      aria-label={t('customerEventRegister.submitLabel')}
                    >
                      {submitting ? (
                        <CircularProgress size={24} />
                      ) : (
                        t('customerEventRegister.submitLabel')
                      )}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}

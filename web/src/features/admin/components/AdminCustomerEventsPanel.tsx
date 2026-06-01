/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Admin Events panel for creating a customer event and schedule rows.
 * @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { registerCustomerEventWithSchedule } from '../api/admin.api';
import type { CustomerEventWithScheduleResponse } from '../types';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';

interface AdminCustomerEventsPanelProps {
  sessionToken: string;
}

interface DraftScheduleRow {
  key: string;
  session_name: string;
  session_name_alias: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface DraftEventForm {
  event: string;
  event_alias: string;
  instructor: string;
  start_date: string;
  end_date: string;
}

function createDraftScheduleRow(seed: number): DraftScheduleRow {
  return {
    key: `schedule-row-${seed}`,
    session_name: '',
    session_name_alias: '',
    date: '',
    start_time: '',
    end_time: '',
  };
}

function formatRowReason(t: (key: string) => string, reason: string): string {
  if (reason === 'already_registered') return t('adminEvents.reasonAlreadyRegistered');
  if (reason === 'validation_failed') return t('adminEvents.reasonValidationFailed');
  if (reason === 'validation_failed_date_range') return t('adminEvents.reasonValidationFailedDateRange');
  if (reason === 'validation_failed_time_range') return t('adminEvents.reasonValidationFailedTimeRange');
  return t('adminEvents.reasonUnknown');
}

function isTopLevelFormValid(form: DraftEventForm): boolean {
  if (!form.event.trim() || !form.event_alias.trim() || !form.instructor.trim()) return false;
  if (!form.start_date || !form.end_date) return false;
  if (form.end_date < form.start_date) return false;
  return true;
}

function isScheduleRowValid(row: DraftScheduleRow, startDate: string, endDate: string): boolean {
  if (!row.session_name.trim() || !row.session_name_alias.trim()) return false;
  if (!row.date || !row.start_time || !row.end_time) return false;
  if (startDate && endDate && (row.date < startDate || row.date > endDate)) return false;
  if (row.end_time < row.start_time) return false;
  return true;
}

export function AdminCustomerEventsPanel({ sessionToken }: AdminCustomerEventsPanelProps) {
  const { t } = useTranslation();
  const [isAddViewOpen, setIsAddViewOpen] = useState(false);
  const [form, setForm] = useState<DraftEventForm>({
    event: '',
    event_alias: '',
    instructor: '',
    start_date: '',
    end_date: '',
  });
  const [rows, setRows] = useState<DraftScheduleRow[]>([createDraftScheduleRow(1)]);
  const [seed, setSeed] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [response, setResponse] = useState<CustomerEventWithScheduleResponse | null>(null);

  const isFormValid = useMemo(() => {
    if (!isTopLevelFormValid(form)) return false;
    if (rows.length === 0) return false;
    return rows.every((row) => isScheduleRowValid(row, form.start_date, form.end_date));
  }, [form, rows]);

  function updateRow(rowKey: string, patch: Partial<DraftScheduleRow>) {
    setRows((previous) => previous.map((row) => (row.key === rowKey ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((previous) => [...previous, createDraftScheduleRow(seed)]);
    setSeed((previous) => previous + 1);
  }

  function removeRow(rowKey: string) {
    setRows((previous) => {
      if (previous.length === 1) return previous;
      return previous.filter((row) => row.key !== rowKey);
    });
  }

  function resetForm() {
    setForm({
      event: '',
      event_alias: '',
      instructor: '',
      start_date: '',
      end_date: '',
    });
    setRows([createDraftScheduleRow(1)]);
    setSeed(2);
    setSubmitAttempted(false);
    setSubmitError(null);
    setResponse(null);
  }

  async function handleSubmit() {
    setSubmitAttempted(true);
    if (!isFormValid || !sessionToken) return;

    setSubmitError(null);
    setResponse(null);
    setIsSubmitting(true);
    try {
      const result = await registerCustomerEventWithSchedule(sessionToken, {
        event: form.event.trim(),
        event_alias: form.event_alias.trim(),
        instructor: form.instructor.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        schedules: rows.map((row) => ({
          session_name: row.session_name.trim(),
          session_name_alias: row.session_name_alias.trim(),
          date: row.date,
          start_time: row.start_time,
          end_time: row.end_time,
        })),
      });
      setResponse(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      if (message === 'concurrent_request') {
        setSubmitError(t('adminEvents.concurrentRequest'));
      } else if (message === 'Unauthorized' || message === 'Forbidden') {
        setSubmitError(t('adminEvents.unauthorized'));
      } else {
        setSubmitError(t('adminEvents.submitFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasRangeError = !!form.start_date && !!form.end_date && form.end_date < form.start_date;

  if (!isAddViewOpen) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4" component="h2">
          {t('adminEvents.title')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                  {t('adminEvents.customerEventsCardTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('adminEvents.customerEventsCardDescription')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => {
                    resetForm();
                    setIsAddViewOpen(true);
                  }}
                >
                  {t('adminEvents.add')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h2">
          {t('adminEvents.addCustomerEventTitle')}
        </Typography>
        <Button variant="outlined" onClick={() => setIsAddViewOpen(false)}>
          {t('adminEvents.backToEvents')}
        </Button>
      </Stack>

      {submitError && <Alert severity="error">{submitError}</Alert>}

      {response && (
        <Alert severity={response.scheduleRejectedCount > 0 ? 'warning' : 'success'}>
          <Stack spacing={0.5}>
            <Typography>{t('adminEvents.summaryEventInserted', { count: response.customerEventInsertedCount })}</Typography>
            <Typography>{t('adminEvents.summaryTotal', { count: response.totalScheduleRows })}</Typography>
            <Typography>{t('adminEvents.summaryAdded', { count: response.scheduleInsertedCount })}</Typography>
            <Typography>{t('adminEvents.summaryRejected', { count: response.scheduleRejectedCount })}</Typography>
            {response.results
              .filter((result) => result.status === 'rejected')
              .map((result) => (
                <Typography key={`reject-${result.rowIndex}`} variant="body2">
                  {t('adminEvents.rowRejectedReason', {
                    rowIndex: result.rowIndex + 1,
                    reason: formatRowReason(t, result.reason || ''),
                  })}
                </Typography>
              ))}
          </Stack>
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('adminEvents.customerEventInfoTitle')}</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t('adminEvents.event')}
                value={form.event}
                onChange={(event) => setForm((previous) => ({ ...previous, event: event.target.value }))}
                fullWidth
                required
                inputProps={{ 'aria-label': 'event-name' }}
                error={submitAttempted && !form.event.trim()}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t('adminEvents.eventAlias')}
                value={form.event_alias}
                onChange={(event) => setForm((previous) => ({ ...previous, event_alias: event.target.value }))}
                fullWidth
                required
                inputProps={{ 'aria-label': 'event-alias' }}
                error={submitAttempted && !form.event_alias.trim()}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t('adminEvents.instructor')}
                value={form.instructor}
                onChange={(event) => setForm((previous) => ({ ...previous, instructor: event.target.value }))}
                fullWidth
                required
                inputProps={{ 'aria-label': 'instructor-name' }}
                error={submitAttempted && !form.instructor.trim()}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label={t('adminEvents.startDate')}
                type="date"
                value={form.start_date}
                onChange={(event) => setForm((previous) => ({ ...previous, start_date: event.target.value }))}
                fullWidth
                required
                inputProps={{ 'aria-label': 'event-start-date' }}
                InputLabelProps={{ shrink: true }}
                error={submitAttempted && !form.start_date}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label={t('adminEvents.endDate')}
                type="date"
                value={form.end_date}
                onChange={(event) => setForm((previous) => ({ ...previous, end_date: event.target.value }))}
                fullWidth
                required
                inputProps={{ 'aria-label': 'event-end-date' }}
                InputLabelProps={{ shrink: true }}
                error={submitAttempted && (!form.end_date || hasRangeError)}
                helperText={submitAttempted && hasRangeError ? t('adminEvents.endDateRangeError') : ''}
              />
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">{t('adminEvents.scheduleTitle')}</Typography>
          {rows.map((row, index) => {
            const rowDateOutOfRange = !!row.date && !!form.start_date && !!form.end_date
              && (row.date < form.start_date || row.date > form.end_date);
            const rowTimeRangeError = !!row.start_time && !!row.end_time && row.end_time < row.start_time;
            const rowMissingRequired = !row.session_name.trim()
              || !row.session_name_alias.trim()
              || !row.date
              || !row.start_time
              || !row.end_time;

            return (
              <Box key={row.key} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 2.5 }}>
                    <TextField
                      label={t('adminEvents.sessionName')}
                      value={row.session_name}
                      onChange={(event) => updateRow(row.key, { session_name: event.target.value })}
                      fullWidth
                      required
                      inputProps={{ 'aria-label': `session-name-${index + 1}` }}
                      error={submitAttempted && !row.session_name.trim()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2.5 }}>
                    <TextField
                      label={t('adminEvents.sessionNameAlias')}
                      value={row.session_name_alias}
                      onChange={(event) => updateRow(row.key, { session_name_alias: event.target.value })}
                      fullWidth
                      required
                      inputProps={{ 'aria-label': `session-alias-${index + 1}` }}
                      error={submitAttempted && !row.session_name_alias.trim()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                      label={t('adminEvents.date')}
                      type="date"
                      value={row.date}
                      onChange={(event) => updateRow(row.key, { date: event.target.value })}
                      fullWidth
                      required
                      inputProps={{ 'aria-label': `session-date-${index + 1}` }}
                      InputLabelProps={{ shrink: true }}
                      error={submitAttempted && (!row.date || rowDateOutOfRange)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                      label={t('adminEvents.startTime')}
                      type="time"
                      value={row.start_time}
                      onChange={(event) => updateRow(row.key, { start_time: event.target.value })}
                      fullWidth
                      required
                      inputProps={{ 'aria-label': `session-start-time-${index + 1}` }}
                      InputLabelProps={{ shrink: true }}
                      error={submitAttempted && !row.start_time}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                      label={t('adminEvents.endTime')}
                      type="time"
                      value={row.end_time}
                      onChange={(event) => updateRow(row.key, { end_time: event.target.value })}
                      fullWidth
                      required
                      inputProps={{ 'aria-label': `session-end-time-${index + 1}` }}
                      InputLabelProps={{ shrink: true }}
                      error={submitAttempted && (!row.end_time || rowTimeRangeError)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 1 }}>
                    <IconButton
                      aria-label={`${t('adminEvents.removeSession')} ${index + 1}`}
                      onClick={() => removeRow(row.key)}
                      disabled={rows.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
                {submitAttempted && rowMissingRequired && (
                  <Typography color="error" variant="caption">
                    {t('adminEvents.rowMissingRequired')}
                  </Typography>
                )}
                {submitAttempted && rowDateOutOfRange && (
                  <Typography color="error" variant="caption" sx={{ display: 'block' }}>
                    {t('adminEvents.rowDateRangeError')}
                  </Typography>
                )}
                {submitAttempted && rowTimeRangeError && (
                  <Typography color="error" variant="caption" sx={{ display: 'block' }}>
                    {t('adminEvents.rowTimeRangeError')}
                  </Typography>
                )}
              </Box>
            );
          })}

          <Stack direction="row" spacing={1}>
            <Button startIcon={<AddIcon />} onClick={addRow}>
              {t('adminEvents.addSession')}
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid || isSubmitting || !sessionToken}>
              {t('adminEvents.submit')}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <LoadingOverlay visible={isSubmitting} />
    </Stack>
  );
}

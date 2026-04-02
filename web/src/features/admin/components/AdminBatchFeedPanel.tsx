/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Admin batch feed panel for transferring trainee paper registrations to GAS.
 * Uses row-based input with MUI DatePicker/TimePicker and submits all rows in one request.
 * @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/fi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { registerTraineeBatchForSessions } from '../api/admin.api';
import type {
  BatchSessionType,
  BatchTraineeRegistrationResponse,
  BatchTraineeRegistrationRow,
  BatchTraineeRegistrationResult,
} from '../types';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';

interface AdminBatchFeedPanelProps {
  sessionToken: string;
}

interface DraftBatchRow {
  key: string;
  first_name: string;
  last_name: string;
  age_group: 'adult' | 'underage' | '';
  underage_age: string;
  dates: Dayjs[];
  start_time: Dayjs | null;
  end_time: Dayjs | null;
  camp_session_id: string;
}

function sessionTypeOptions(t: (key: string) => string): Array<{ value: BatchSessionType; label: string }> {
  return [
    { value: 'advanced', label: t('adminBatchFeed.sessionTypeAdvanced') },
    { value: 'basic', label: t('adminBatchFeed.sessionTypeBasic') },
    { value: 'fitness', label: t('adminBatchFeed.sessionTypeFitness') },
    { value: 'free/sparring', label: t('adminBatchFeed.sessionTypeFreeSparring') },
    { value: 'camp', label: t('adminBatchFeed.sessionTypeCamp') },
  ];
}

function createDraftRow(seed: number): DraftBatchRow {
  return {
    key: `row-${seed}`,
    first_name: '',
    last_name: '',
    age_group: '',
    underage_age: '',
    dates: [],
    start_time: null,
    end_time: null,
    camp_session_id: '',
  };
}

function getAdapterLocale(lang: string): string {
  if (lang === 'fi') return 'fi';
  return 'en';
}

function formatValidationReason(t: (key: string) => string, reason: string): string {
  if (reason === 'already_registered') return t('adminBatchFeed.reasonAlreadyRegistered');
  if (reason === 'validation_failed') return t('adminBatchFeed.reasonValidationFailed');
  if (reason === 'validation_failed_age') return t('adminBatchFeed.reasonValidationFailedAge');
  if (reason === 'validation_failed_time_pair') return t('adminBatchFeed.reasonValidationFailedTimePair');
  if (reason === 'validation_failed_camp_session_id') return t('adminBatchFeed.reasonValidationFailedCampSessionId');
  return t('adminBatchFeed.reasonUnknown');
}

function toPayloadRows(rows: DraftBatchRow[], sessionType: BatchSessionType): BatchTraineeRegistrationRow[] {
  return rows.flatMap((row) =>
    row.dates.map((date) => ({
      first_name: row.first_name.trim(),
      last_name: row.last_name.trim(),
      age_group: row.age_group || 'adult',
      underage_age: row.age_group === 'underage' ? row.underage_age.trim() : '',
      session_type: sessionType,
      camp_session_id: sessionType === 'camp' ? row.camp_session_id.trim() : '',
      dates: [date.format('YYYY-MM-DD')],
      start_time: row.start_time ? row.start_time.format('HH:mm') : '',
      end_time: row.end_time ? row.end_time.format('HH:mm') : '',
    })),
  );
}

function isRowClientValid(row: DraftBatchRow, sessionType: BatchSessionType): boolean {
  if (!row.first_name.trim() || !row.last_name.trim() || !row.age_group || row.dates.length === 0) return false;
  if (row.age_group === 'underage' && !row.underage_age.trim()) return false;

  const hasStart = !!row.start_time;
  const hasEnd = !!row.end_time;

  // For free/sparring: times are optional but if provided, both must be set
  if (sessionType === 'free/sparring') {
    if (hasStart !== hasEnd) return false;
  }
  // For other session types: times are not used, validation passes

  if (sessionType === 'camp' && !row.camp_session_id.trim()) return false;

  return true;
}

export function AdminBatchFeedPanel({ sessionToken }: AdminBatchFeedPanelProps) {
  const { t, i18n } = useTranslation();
  const [activeSessionType, setActiveSessionType] = useState<BatchSessionType>('advanced');
  const [rows, setRows] = useState<DraftBatchRow[]>([createDraftRow(1)]);
  const [seed, setSeed] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [response, setResponse] = useState<BatchTraineeRegistrationResponse | null>(null);

  const adapterLocale = getAdapterLocale(i18n.language);
  const options = sessionTypeOptions(t);

  const isFormValid = useMemo(
    () => rows.length > 0 && rows.every((row) => isRowClientValid(row, activeSessionType)),
    [activeSessionType, rows]
  );

  function updateRow(rowKey: string, patch: Partial<DraftBatchRow>) {
    setRows((previous) => previous.map((row) => (row.key === rowKey ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((previous) => [...previous, createDraftRow(seed)]);
    setSeed((previous) => previous + 1);
  }

  function removeRow(rowKey: string) {
    setRows((previous) => {
      if (previous.length === 1) return previous;
      return previous.filter((row) => row.key !== rowKey);
    });
  }

  async function handleSubmit() {
    if (!isFormValid || !sessionToken) return;
    setSubmitError(null);
    setResponse(null);
    setIsSubmitting(true);
    try {
      const result = await registerTraineeBatchForSessions(sessionToken, {
        rows: toPayloadRows(rows, activeSessionType),
      });
      setResponse(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      if (message === 'concurrent_request') {
        setSubmitError(t('adminBatchFeed.concurrentRequest'));
      } else if (message === 'Unauthorized' || message === 'Forbidden') {
        setSubmitError(t('adminBatchFeed.unauthorized'));
      } else {
        setSubmitError(t('adminBatchFeed.submitFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const helperText = activeSessionType === 'free/sparring'
    ? t('adminBatchFeed.freeSparringTimeRule')
    : t('adminBatchFeed.regularTimeRule');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h2">
          {t('adminBatchFeed.title')}
        </Typography>
        <Typography color="text.secondary">{t('adminBatchFeed.description')}</Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {options.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              color={activeSessionType === option.value ? 'primary' : 'default'}
              onClick={() => setActiveSessionType(option.value)}
              clickable
            />
          ))}
        </Stack>

        <Alert severity="info">{helperText}</Alert>
        {submitError && <Alert severity="error">{submitError}</Alert>}

        {rows.map((row, index) => {
          const isUnderage = row.age_group === 'underage';
          const isCamp = activeSessionType === 'camp';
          const hasStart = !!row.start_time;
          const hasEnd = !!row.end_time;
          const isTimePairInvalid = activeSessionType === 'free/sparring' && hasStart !== hasEnd;

          return (
            <Paper key={row.key} variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label={t('adminBatchFeed.firstName')}
                    value={row.first_name}
                    onChange={(event) => updateRow(row.key, { first_name: event.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label={t('adminBatchFeed.lastName')}
                    value={row.last_name}
                    onChange={(event) => updateRow(row.key, { last_name: event.target.value })}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth required error={row.dates.length === 0}>
                    <InputLabel id={`${row.key}-age-group-label`}>{t('adminBatchFeed.ageGroup')}</InputLabel>
                    <Select
                      labelId={`${row.key}-age-group-label`}
                      label={t('adminBatchFeed.ageGroup')}
                      value={row.age_group}
                      onChange={(event) => updateRow(row.key, { age_group: event.target.value as DraftBatchRow['age_group'] })}
                    >
                      <MenuItem value="adult">{t('adminBatchFeed.ageGroupAdult')}</MenuItem>
                      <MenuItem value="underage">{t('adminBatchFeed.ageGroupUnderage')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">{t('adminBatchFeed.dates')}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <DatePicker
                        label={t('adminBatchFeed.addDate')}
                        value={null}
                        onChange={(value) => {
                          if (value && !row.dates.some((d) => d.isSame(value, 'day'))) {
                            updateRow(row.key, { dates: [...row.dates, value].sort((a, b) => a.diff(b)) });
                          }
                        }}
                        slotProps={{ textField: { fullWidth: false, size: 'small', sx: { width: 150 } } }}
                      />
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                        {row.dates.map((date, dateIndex) => (
                          <Chip
                            key={`${row.key}-date-${date.format('YYYY-MM-DD')}`}
                            label={date.format('YYYY-MM-DD')}
                            onDelete={() => {
                              updateRow(row.key, { dates: row.dates.filter((_, i) => i !== dateIndex) });
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                    {row.dates.length === 0 && (
                      <Typography variant="caption" color="error">
                        {t('adminBatchFeed.atLeastOneDate')}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
                {activeSessionType === 'free/sparring' && (
                  <>
                    <Grid size={{ xs: 6, md: 1.5 }}>
                      <TimePicker
                        label={t('adminBatchFeed.startTime')}
                        value={row.start_time}
                        onChange={(value) => updateRow(row.key, { start_time: value })}
                        format="HH:mm"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: isTimePairInvalid,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 1.5 }}>
                      <TimePicker
                        label={t('adminBatchFeed.endTime')}
                        value={row.end_time}
                        onChange={(value) => updateRow(row.key, { end_time: value })}
                        format="HH:mm"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: isTimePairInvalid,
                            helperText: isTimePairInvalid ? t('adminBatchFeed.timePairRequired') : '',
                          },
                        }}
                      />
                    </Grid>
                  </>
                )}
                <Grid size={{ xs: 12, md: 1 }}>
                  <IconButton
                    aria-label={`${t('adminBatchFeed.removeRow')} ${index + 1}`}
                    onClick={() => removeRow(row.key)}
                    disabled={rows.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>

                {isUnderage && (
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      label={t('adminBatchFeed.underageAge')}
                      type="number"
                      value={row.underage_age}
                      onChange={(event) => updateRow(row.key, { underage_age: event.target.value })}
                      fullWidth
                      required
                    />
                  </Grid>
                )}

                {isCamp && (
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      label={t('adminBatchFeed.campSessionId')}
                      value={row.camp_session_id}
                      onChange={(event) => updateRow(row.key, { camp_session_id: event.target.value })}
                      fullWidth
                      required
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          );
        })}

        <Box>
          <Button startIcon={<AddIcon />} onClick={addRow}>
            {t('adminBatchFeed.addRow')}
          </Button>
        </Box>

        <Box>
          <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
            {t('adminBatchFeed.submit')}
          </Button>
        </Box>

        {response && (
          <Alert severity={response.rejectedCount > 0 ? 'warning' : 'success'}>
            <Stack spacing={1}>
              <Typography>{t('adminBatchFeed.summaryTotal', { count: response.totalRows })}</Typography>
              <Typography>{t('adminBatchFeed.summaryAdded', { count: response.addedCount })}</Typography>
              <Typography>{t('adminBatchFeed.summaryRejected', { count: response.rejectedCount })}</Typography>
              {response.results
                .filter((rowResult: BatchTraineeRegistrationResult) => rowResult.status === 'rejected')
                .map((rowResult: BatchTraineeRegistrationResult) => (
                  <Typography key={`${rowResult.rowIndex}-${rowResult.reason}`} variant="body2">
                    {t('adminBatchFeed.rowRejectedReason', {
                      rowIndex: rowResult.rowIndex + 1,
                      reason: formatValidationReason(t, rowResult.reason || ''),
                    })}
                  </Typography>
                ))}
            </Stack>
          </Alert>
        )}

        <LoadingOverlay visible={isSubmitting} />
      </Stack>
    </LocalizationProvider>
  );
}

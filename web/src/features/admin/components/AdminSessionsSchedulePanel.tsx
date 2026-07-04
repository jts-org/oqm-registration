/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Admin panel for managing sessions_schedule CRUD (OQM-0042).
 *   Loads all schedule rows on mount, provides Add/Edit dialog and delete
 *   confirmation dialog.
 *   @see .github/skills/wire-react-to-gas/SKILL.md
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { useResponsiveDialog } from '../../../shared/hooks/useResponsive';
import {
  listSessionsSchedule,
  addSessionSchedule,
  updateSessionSchedule,
  deleteSessionSchedule,
} from '../api/admin.api';
import type { SessionScheduleRecord, SessionSchedulePayload } from '../types';

interface AdminSessionsSchedulePanelProps {
  sessionToken: string;
}

// Day-of-week constants: Mon=0 … Sun=6
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;
type WeekdayNum = (typeof WEEKDAYS)[number];

const WEEKDAY_I18N_KEYS: Record<WeekdayNum, string> = {
  0: 'adminSessionsSchedule.mon',
  1: 'adminSessionsSchedule.tue',
  2: 'adminSessionsSchedule.wed',
  3: 'adminSessionsSchedule.thu',
  4: 'adminSessionsSchedule.fri',
  5: 'adminSessionsSchedule.sat',
  6: 'adminSessionsSchedule.sun',
};

/** "0,2,4" → [0, 2, 4] */
function weekdaysStringToArray(str: string): WeekdayNum[] {
  if (!str) return [];
  return str
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n) && n >= 0 && n <= 6) as WeekdayNum[];
}

/** [0, 2, 4] → "0,2,4" */
function weekdaysArrayToString(days: WeekdayNum[]): string {
  return [...days].sort((a, b) => a - b).join(',');
}

interface DraftForm {
  session_type: string;
  session_type_alias: string;
  start_date: string;
  end_date: string;
  weekdays: WeekdayNum[];
  start_time: string;
  end_time: string;
  location: string;
  location_alias: string;
  active: boolean;
}

function emptyDraft(): DraftForm {
  return {
    session_type: '',
    session_type_alias: '',
    start_date: '',
    end_date: '',
    weekdays: [],
    start_time: '',
    end_time: '',
    location: '',
    location_alias: '',
    active: true,
  };
}

function recordToDraft(record: SessionScheduleRecord): DraftForm {
  return {
    session_type: record.session_type,
    session_type_alias: record.session_type_alias,
    start_date: record.start_date,
    end_date: record.end_date,
    weekdays: weekdaysStringToArray(record.weekdays_available),
    start_time: record.start_time,
    end_time: record.end_time,
    location: record.location,
    location_alias: record.location_alias,
    active: record.active,
  };
}

function isDraftValid(draft: DraftForm): boolean {
  if (!draft.session_type.trim() || !draft.session_type_alias.trim()) return false;
  if (!draft.start_date || !draft.end_date) return false;
  if (draft.end_date < draft.start_date) return false;
  if (draft.weekdays.length === 0) return false;
  // Times are optional but must be paired
  if ((draft.start_time && !draft.end_time) || (!draft.start_time && draft.end_time)) return false;
  if (draft.start_time && draft.end_time && draft.end_time < draft.start_time) return false;
  return true;
}

function draftToPayload(draft: DraftForm, id?: string): SessionSchedulePayload {
  return {
    ...(id ? { id } : {}),
    session_type: draft.session_type.trim(),
    session_type_alias: draft.session_type_alias.trim(),
    start_date: draft.start_date,
    end_date: draft.end_date,
    weekdays_available: weekdaysArrayToString(draft.weekdays),
    start_time: draft.start_time,
    end_time: draft.end_time,
    location: draft.location.trim(),
    location_alias: draft.location_alias.trim(),
    active: draft.active,
  };
}

function mapErrorToMessage(error: string, t: (key: string) => string): string {
  if (error === 'schedule_already_exists') return t('adminSessionsSchedule.errorScheduleAlreadyExists');
  if (error === 'no_match_found') return t('adminSessionsSchedule.errorNoMatchFound');
  if (error === 'validation_failed') return t('adminSessionsSchedule.errorValidationFailed');
  if (error === 'concurrent_request') return t('adminSessionsSchedule.errorConcurrentRequest');
  if (error === 'unauthorized' || error === 'Unauthorized') return t('adminSessionsSchedule.errorUnauthorized');
  return t('adminSessionsSchedule.errorValidationFailed');
}

/**
 * Renders weekdays_available string (e.g. "0,2,4") as abbreviated day labels.
 */
function WeekdayChips({ value, t }: { value: string; t: (key: string) => string }) {
  const days = weekdaysStringToArray(value);
  if (days.length === 0) return <span>—</span>;
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      {days.map((d) => (
        <Chip key={d} label={t(WEEKDAY_I18N_KEYS[d])} size="small" />
      ))}
    </Stack>
  );
}

export function AdminSessionsSchedulePanel({ sessionToken }: AdminSessionsSchedulePanelProps) {
  const { t } = useTranslation();
  const { fullScreen } = useResponsiveDialog();

  // ── List state ──────────────────────────────────────────────────────────────
  const [schedules, setSchedules] = useState<SessionScheduleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Add/Edit dialog state ───────────────────────────────────────────────────
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<SessionScheduleRecord | null>(null);
  const [draft, setDraft] = useState<DraftForm>(emptyDraft());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Delete confirmation state ───────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<SessionScheduleRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Snackbar state ──────────────────────────────────────────────────────────
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Load schedules on mount ─────────────────────────────────────────────────
  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await listSessionsSchedule(sessionToken);
      setSchedules(data.schedules);
    } catch (err) {
      setLoadError(t('adminSessionsSchedule.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken, t]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // ── Field update helper ─────────────────────────────────────────────────────
  function updateDraft<K extends keyof DraftForm>(field: K, value: DraftForm[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  // ── Dialog open/close ───────────────────────────────────────────────────────
  function openAddDialog() {
    setDraft(emptyDraft());
    setSubmitAttempted(false);
    setSubmitError(null);
    setDialogMode('add');
  }

  function openEditDialog(record: SessionScheduleRecord) {
    setDraft(recordToDraft(record));
    setEditTarget(record);
    setSubmitAttempted(false);
    setSubmitError(null);
    setDialogMode('edit');
  }

  function closeDialog() {
    setDialogMode(null);
    setEditTarget(null);
    setSubmitError(null);
  }

  // ── Submit add/edit ─────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitAttempted(true);
    if (!isDraftValid(draft)) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (dialogMode === 'add') {
        const result = await addSessionSchedule(sessionToken, draftToPayload(draft));
        setSchedules((prev) => [...prev, result.schedule]);
        setSuccessMessage(t('adminSessionsSchedule.saveSuccess'));
        closeDialog();
      } else if (dialogMode === 'edit' && editTarget) {
        const result = await updateSessionSchedule(sessionToken, draftToPayload(draft, editTarget.id));
        setSchedules((prev) => prev.map((s) => (s.id === editTarget.id ? result.schedule : s)));
        setSuccessMessage(t('adminSessionsSchedule.saveSuccess'));
        closeDialog();
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setSubmitError(mapErrorToMessage(code, t));
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  function openDeleteDialog(record: SessionScheduleRecord) {
    setDeleteTarget(record);
  }

  function closeDeleteDialog() {
    setDeleteTarget(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSessionSchedule(sessionToken, deleteTarget.id);
      setSchedules((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSuccessMessage(t('adminSessionsSchedule.deleteSuccess'));
      closeDeleteDialog();
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setErrorMessage(mapErrorToMessage(code, t));
      closeDeleteDialog();
      // Refresh list in case the row no longer exists
      loadSchedules();
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Validation helpers (show only after first submit attempt) ───────────────
  const showErrors = submitAttempted;

  function fieldError(field: keyof DraftForm): string {
    if (!showErrors) return '';
    switch (field) {
      case 'session_type': return !draft.session_type.trim() ? t('adminSessionsSchedule.errorValidationFailed') : '';
      case 'session_type_alias': return !draft.session_type_alias.trim() ? t('adminSessionsSchedule.errorValidationFailed') : '';
      case 'start_date': return !draft.start_date ? t('adminSessionsSchedule.errorValidationFailed') : '';
      case 'end_date':
        if (!draft.end_date) return t('adminSessionsSchedule.errorValidationFailed');
        if (draft.start_date && draft.end_date < draft.start_date) return t('adminSessionsSchedule.errorEndDateRange');
        return '';
      case 'weekdays':
        return draft.weekdays.length === 0 ? t('adminSessionsSchedule.errorValidationFailed') : '';
      case 'end_time':
        if (draft.start_time && !draft.end_time) return t('adminSessionsSchedule.errorValidationFailed');
        if (draft.start_time && draft.end_time && draft.end_time < draft.start_time) return t('adminSessionsSchedule.errorTimeRange');
        return '';
      default: return '';
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">{t('adminSessionsSchedule.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          disabled={isLoading}
        >
          {t('adminSessionsSchedule.addSchedule')}
        </Button>
      </Stack>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress aria-label={t('adminSessionsSchedule.loading')} />
        </Box>
      )}

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }} action={
          <Button size="small" onClick={loadSchedules}>{t('settings.retry')}</Button>
        }>
          {loadError}
        </Alert>
      )}

      {!isLoading && !loadError && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label={t('adminSessionsSchedule.title')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('adminSessionsSchedule.sessionType')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.sessionTypeAlias')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.startDate')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.endDate')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.weekdaysAvailable')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.startTime')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.endTime')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.location')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.locationAlias')}</TableCell>
                <TableCell>{t('adminSessionsSchedule.active')}</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {t('adminSessionsSchedule.noSchedules')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {schedules.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.session_type}</TableCell>
                  <TableCell>{row.session_type_alias}</TableCell>
                  <TableCell>{row.start_date}</TableCell>
                  <TableCell>{row.end_date}</TableCell>
                  <TableCell><WeekdayChips value={row.weekdays_available} t={t} /></TableCell>
                  <TableCell>{row.start_time || '—'}</TableCell>
                  <TableCell>{row.end_time || '—'}</TableCell>
                  <TableCell>{row.location || '—'}</TableCell>
                  <TableCell>{row.location_alias || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.active ? t('adminSessionsSchedule.activeYes') : t('adminSessionsSchedule.activeNo')}
                      color={row.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        aria-label={t('adminSessionsSchedule.editSchedule')}
                        onClick={() => openEditDialog(row)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={t('adminSessionsSchedule.deleteSchedule')}
                        onClick={() => openDeleteDialog(row)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Add / Edit Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={dialogMode !== null}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
        aria-labelledby="schedule-dialog-title"
      >
        <DialogTitle id="schedule-dialog-title">
          {dialogMode === 'add' ? t('adminSessionsSchedule.addSchedule') : t('adminSessionsSchedule.editSchedule')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={t('adminSessionsSchedule.sessionType')}
              value={draft.session_type}
              onChange={(e) => updateDraft('session_type', e.target.value)}
              required
              fullWidth
              error={!!fieldError('session_type')}
              helperText={fieldError('session_type')}
              inputProps={{ 'aria-required': true }}
            />
            <TextField
              label={t('adminSessionsSchedule.sessionTypeAlias')}
              value={draft.session_type_alias}
              onChange={(e) => updateDraft('session_type_alias', e.target.value)}
              required
              fullWidth
              error={!!fieldError('session_type_alias')}
              helperText={fieldError('session_type_alias')}
            />
            <TextField
              label={t('adminSessionsSchedule.startDate')}
              type="date"
              value={draft.start_date}
              onChange={(e) => updateDraft('start_date', e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!fieldError('start_date')}
              helperText={fieldError('start_date')}
            />
            <TextField
              label={t('adminSessionsSchedule.endDate')}
              type="date"
              value={draft.end_date}
              onChange={(e) => updateDraft('end_date', e.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!fieldError('end_date')}
              helperText={fieldError('end_date')}
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                {t('adminSessionsSchedule.weekdaysAvailable')} *
              </Typography>
              <ToggleButtonGroup
                value={draft.weekdays}
                onChange={(_e, newDays: WeekdayNum[]) => updateDraft('weekdays', newDays)}
                aria-label={t('adminSessionsSchedule.weekdaysAvailable')}
                size="small"
              >
                {WEEKDAYS.map((d) => (
                  <ToggleButton key={d} value={d} aria-label={t(WEEKDAY_I18N_KEYS[d])}>
                    {t(WEEKDAY_I18N_KEYS[d])}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {showErrors && draft.weekdays.length === 0 && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                  {t('adminSessionsSchedule.errorValidationFailed')}
                </Typography>
              )}
            </Box>

            <TextField
              label={t('adminSessionsSchedule.startTime')}
              type="time"
              value={draft.start_time}
              onChange={(e) => updateDraft('start_time', e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label={t('adminSessionsSchedule.endTime')}
              type="time"
              value={draft.end_time}
              onChange={(e) => updateDraft('end_time', e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!fieldError('end_time')}
              helperText={fieldError('end_time')}
            />
            <TextField
              label={t('adminSessionsSchedule.location')}
              value={draft.location}
              onChange={(e) => updateDraft('location', e.target.value)}
              fullWidth
            />
            <TextField
              label={t('adminSessionsSchedule.locationAlias')}
              value={draft.location_alias}
              onChange={(e) => updateDraft('location_alias', e.target.value)}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={draft.active}
                  onChange={(e) => updateDraft('active', e.target.checked)}
                  inputProps={{ 'aria-label': t('adminSessionsSchedule.active') }}
                />
              }
              label={t('adminSessionsSchedule.active')}
            />

            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={isSubmitting}>
            {t('adminSessionsSchedule.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('adminSessionsSchedule.saving') : t('adminSessionsSchedule.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
        aria-labelledby="delete-confirm-title"
      >
        <DialogTitle id="delete-confirm-title">
          {t('adminSessionsSchedule.confirmDeleteTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{t('adminSessionsSchedule.confirmDeleteMessage')}</DialogContentText>
          {deleteTarget && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {deleteTarget.session_type} — {deleteTarget.start_date} / {deleteTarget.end_date}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            {t('adminSessionsSchedule.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t('adminSessionsSchedule.deleting') : t('adminSessionsSchedule.deleteSchedule')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar feedback ─────────────────────────────────────────────── */}
      <Snackbar
        open={successMessage !== null}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMessage(null)}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorMessage !== null}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorMessage(null)}
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

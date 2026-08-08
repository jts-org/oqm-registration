/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Admin account management panel for coach and trainee account CRUD.
 *   Loads account lists, supports create/edit/delete dialogs, and shows
 *   restriction-aware write feedback using existing backend error codes.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import RefreshIcon from '@mui/icons-material/Refresh';

import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';
import { useResponsiveDialog } from '../../../shared/hooks/useResponsive';
import {
  createCoachAccount,
  createTraineeAccount,
  deleteCoachAccount,
  deleteTraineeAccount,
  listCoachAccounts,
  listTraineeAccounts,
  updateCoachAccount,
  updateTraineeAccount,
} from '../api/admin.api';
import type {
  CoachAccountRecord,
  CreateCoachAccountPayload,
  CreateTraineeAccountPayload,
  TraineeAccountRecord,
  UpdateCoachAccountPayload,
  UpdateTraineeAccountPayload,
} from '../types';

interface AdminAccountListPanelProps {
  sessionToken: string;
}

type AccountEntity = 'coach' | 'trainee';
type EditorMode = 'create' | 'edit';

interface CoachDraft {
  firstname: string;
  lastname: string;
  alias: string;
  pin: string;
}

interface TraineeDraft {
  firstname: string;
  lastname: string;
  age: string;
  pin: string;
}

interface EditorState {
  entity: AccountEntity;
  mode: EditorMode;
  id?: string;
}

interface DeleteState {
  entity: AccountEntity;
  id: string;
}

function emptyCoachDraft(): CoachDraft {
  return { firstname: '', lastname: '', alias: '', pin: '' };
}

function emptyTraineeDraft(): TraineeDraft {
  return { firstname: '', lastname: '', age: '', pin: '' };
}

function mapAccountErrorToMessage(code: string, t: (key: string) => string): string {
  if (code === 'validation_failed') return t('adminAccounts.errorValidationFailed');
  if (code === 'concurrent_request') return t('adminAccounts.errorConcurrentRequest');
  if (code === 'pin_reserved') return t('adminAccounts.errorPinReserved');
  if (code === 'no_match_found') return t('adminAccounts.errorNoMatchFound');
  if (code === 'forbidden') return t('adminAccounts.errorForbidden');
  if (code === 'unauthorized' || code === 'Unauthorized') return t('adminAccounts.errorUnauthorized');
  return t('adminAccounts.errorOperationFailed');
}

function isCoachDraftValid(draft: CoachDraft): boolean {
  return !!draft.firstname.trim() && !!draft.lastname.trim() && !!draft.pin.trim();
}

function isTraineeDraftValid(draft: TraineeDraft): boolean {
  return !!draft.firstname.trim() && !!draft.lastname.trim() && !!draft.age.trim() && !!draft.pin.trim();
}

export function AdminAccountListPanel({ sessionToken }: AdminAccountListPanelProps) {
  const { t } = useTranslation();
  const { fullScreen } = useResponsiveDialog();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [coachAccounts, setCoachAccounts] = useState<CoachAccountRecord[]>([]);
  const [traineeAccounts, setTraineeAccounts] = useState<TraineeAccountRecord[]>([]);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [traineeError, setTraineeError] = useState<string | null>(null);

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [coachDraft, setCoachDraft] = useState<CoachDraft>(emptyCoachDraft());
  const [traineeDraft, setTraineeDraft] = useState<TraineeDraft>(emptyTraineeDraft());
  const [editorError, setEditorError] = useState<string | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<DeleteState | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const isBusy = isLoading || isSubmitting || isDeleting;

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setCoachError(null);
    setTraineeError(null);

    const [coachResult, traineeResult] = await Promise.allSettled([
      listCoachAccounts(sessionToken),
      listTraineeAccounts(sessionToken),
    ]);

    if (coachResult.status === 'fulfilled') {
      setCoachAccounts(coachResult.value.accounts);
    } else {
      setCoachAccounts([]);
      setCoachError(t('adminAccounts.coachLoadError'));
    }

    if (traineeResult.status === 'fulfilled') {
      setTraineeAccounts(traineeResult.value.accounts);
    } else {
      setTraineeAccounts([]);
      setTraineeError(t('adminAccounts.traineeLoadError'));
    }

    setIsLoading(false);
  }, [sessionToken, t]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  function openCreateCoach() {
    setCoachDraft(emptyCoachDraft());
    setEditorError(null);
    setEditor({ entity: 'coach', mode: 'create' });
  }

  function openCreateTrainee() {
    setTraineeDraft(emptyTraineeDraft());
    setEditorError(null);
    setEditor({ entity: 'trainee', mode: 'create' });
  }

  function openEditCoach(account: CoachAccountRecord) {
    setCoachDraft({
      firstname: account.firstname,
      lastname: account.lastname,
      alias: account.alias || '',
      pin: account.pin,
    });
    setEditorError(null);
    setEditor({ entity: 'coach', mode: 'edit', id: account.id });
  }

  function openEditTrainee(account: TraineeAccountRecord) {
    setTraineeDraft({
      firstname: account.firstname,
      lastname: account.lastname,
      age: account.age || '',
      pin: account.pin,
    });
    setEditorError(null);
    setEditor({ entity: 'trainee', mode: 'edit', id: account.id });
  }

  function closeEditor() {
    setEditor(null);
    setEditorError(null);
  }

  function openDeleteCoach(id: string) {
    setDeleteDialog({ entity: 'coach', id });
  }

  function openDeleteTrainee(id: string) {
    setDeleteDialog({ entity: 'trainee', id });
  }

  function closeDeleteDialog() {
    setDeleteDialog(null);
  }

  const editorTitle = useMemo(() => {
    if (!editor) return '';
    if (editor.entity === 'coach' && editor.mode === 'create') return t('adminAccounts.addCoachTitle');
    if (editor.entity === 'coach' && editor.mode === 'edit') return t('adminAccounts.editCoachTitle');
    if (editor.entity === 'trainee' && editor.mode === 'create') return t('adminAccounts.addTraineeTitle');
    return t('adminAccounts.editTraineeTitle');
  }, [editor, t]);

  async function handleSubmitEditor() {
    if (!editor) return;

    setEditorError(null);
    setFeedbackMessage(null);

    try {
      setIsSubmitting(true);

      if (editor.entity === 'coach') {
        if (!isCoachDraftValid(coachDraft)) {
          setEditorError(t('adminAccounts.errorValidationFailed'));
          return;
        }

        if (editor.mode === 'create') {
          const payload: CreateCoachAccountPayload = {
            firstname: coachDraft.firstname.trim(),
            lastname: coachDraft.lastname.trim(),
            alias: coachDraft.alias.trim(),
            pin: coachDraft.pin.trim(),
          };
          await createCoachAccount(sessionToken, payload);
          setSuccessMessage(t('adminAccounts.coachCreateSuccess'));
        } else {
          const payload: UpdateCoachAccountPayload = {
            id: String(editor.id || ''),
            firstname: coachDraft.firstname.trim(),
            lastname: coachDraft.lastname.trim(),
            alias: coachDraft.alias.trim(),
            pin: coachDraft.pin.trim(),
          };
          await updateCoachAccount(sessionToken, payload);
          setSuccessMessage(t('adminAccounts.coachUpdateSuccess'));
        }
      } else {
        if (!isTraineeDraftValid(traineeDraft)) {
          setEditorError(t('adminAccounts.errorValidationFailed'));
          return;
        }

        if (editor.mode === 'create') {
          const payload: CreateTraineeAccountPayload = {
            firstname: traineeDraft.firstname.trim(),
            lastname: traineeDraft.lastname.trim(),
            age: traineeDraft.age.trim(),
            pin: traineeDraft.pin.trim(),
          };
          await createTraineeAccount(sessionToken, payload);
          setSuccessMessage(t('adminAccounts.traineeCreateSuccess'));
        } else {
          const payload: UpdateTraineeAccountPayload = {
            id: String(editor.id || ''),
            firstname: traineeDraft.firstname.trim(),
            lastname: traineeDraft.lastname.trim(),
            age: traineeDraft.age.trim(),
            pin: traineeDraft.pin.trim(),
          };
          await updateTraineeAccount(sessionToken, payload);
          setSuccessMessage(t('adminAccounts.traineeUpdateSuccess'));
        }
      }

      closeEditor();
      await loadAccounts();
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setEditorError(mapAccountErrorToMessage(code, t));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteDialog) return;

    setFeedbackMessage(null);

    try {
      setIsDeleting(true);
      if (deleteDialog.entity === 'coach') {
        await deleteCoachAccount(sessionToken, deleteDialog.id);
        setSuccessMessage(t('adminAccounts.coachDeleteSuccess'));
      } else {
        await deleteTraineeAccount(sessionToken, deleteDialog.id);
        setSuccessMessage(t('adminAccounts.traineeDeleteSuccess'));
      }

      closeDeleteDialog();
      await loadAccounts();
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setFeedbackMessage(mapAccountErrorToMessage(code, t));
      closeDeleteDialog();
      await loadAccounts();
    } finally {
      setIsDeleting(false);
    }
  }

  const coachDeleteMessage = t('adminAccounts.confirmDeleteCoachMessage');
  const traineeDeleteMessage = t('adminAccounts.confirmDeleteTraineeMessage');

  const editorIsCoach = editor?.entity === 'coach';

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="h4" component="h2">
            {t('adminAccounts.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('adminAccounts.description')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadAccounts}
          disabled={isBusy}
          aria-label={t('adminAccounts.refresh')}
        >
          {t('adminAccounts.refresh')}
        </Button>
      </Stack>

      {feedbackMessage && <Alert severity="error">{feedbackMessage}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h6" component="h3">
                  {t('adminAccounts.coachSectionTitle')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddAltIcon />}
                  onClick={openCreateCoach}
                  disabled={isBusy}
                >
                  {t('adminAccounts.createCoach')}
                </Button>
              </Stack>

              {coachError && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={
                    <Button size="small" onClick={loadAccounts}>
                      {t('settings.retry')}
                    </Button>
                  }
                >
                  {coachError}
                </Alert>
              )}

              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small" aria-label={t('adminAccounts.coachTableAria')}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('adminAccounts.firstName')}</TableCell>
                      <TableCell>{t('adminAccounts.lastName')}</TableCell>
                      <TableCell>{t('adminAccounts.alias')}</TableCell>
                      <TableCell>{t('adminAccounts.pin')}</TableCell>
                      <TableCell align="right">{t('adminAccounts.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coachAccounts.length === 0 && !coachError && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            {t('adminAccounts.noCoachAccounts')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {coachAccounts.map((account) => (
                      <TableRow key={account.id} hover>
                        <TableCell>{account.firstname}</TableCell>
                        <TableCell>{account.lastname}</TableCell>
                        <TableCell>{account.alias || '-'}</TableCell>
                        <TableCell>{account.pin}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <IconButton
                              aria-label={t('adminAccounts.editCoachAccount')}
                              onClick={() => openEditCoach(account)}
                              disabled={isBusy}
                              sx={{ width: 48, height: 48 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label={t('adminAccounts.deleteCoachAccount')}
                              onClick={() => openDeleteCoach(account.id)}
                              disabled={isBusy}
                              color="error"
                              sx={{ width: 48, height: 48 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h6" component="h3">
                  {t('adminAccounts.traineeSectionTitle')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddAltIcon />}
                  onClick={openCreateTrainee}
                  disabled={isBusy}
                >
                  {t('adminAccounts.createTrainee')}
                </Button>
              </Stack>

              {traineeError && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  action={
                    <Button size="small" onClick={loadAccounts}>
                      {t('settings.retry')}
                    </Button>
                  }
                >
                  {traineeError}
                </Alert>
              )}

              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small" aria-label={t('adminAccounts.traineeTableAria')}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('adminAccounts.firstName')}</TableCell>
                      <TableCell>{t('adminAccounts.lastName')}</TableCell>
                      <TableCell>{t('adminAccounts.age')}</TableCell>
                      <TableCell>{t('adminAccounts.pin')}</TableCell>
                      <TableCell align="right">{t('adminAccounts.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {traineeAccounts.length === 0 && !traineeError && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            {t('adminAccounts.noTraineeAccounts')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {traineeAccounts.map((account) => (
                      <TableRow key={account.id} hover>
                        <TableCell>{account.firstname}</TableCell>
                        <TableCell>{account.lastname}</TableCell>
                        <TableCell>{account.age || '-'}</TableCell>
                        <TableCell>{account.pin}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <IconButton
                              aria-label={t('adminAccounts.editTraineeAccount')}
                              onClick={() => openEditTrainee(account)}
                              disabled={isBusy}
                              sx={{ width: 48, height: 48 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label={t('adminAccounts.deleteTraineeAccount')}
                              onClick={() => openDeleteTrainee(account.id)}
                              disabled={isBusy}
                              color="error"
                              sx={{ width: 48, height: 48 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={editor !== null}
        onClose={closeEditor}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
        slotProps={{
          paper: {
            sx: (theme) => ({
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
        }}
      >
        <DialogTitle>{editorTitle}</DialogTitle>
        <DialogContent
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
          <Stack spacing={2} sx={{ pt: 1 }}>
            {editorError && <Alert severity="error">{editorError}</Alert>}

            <TextField
              label={t('adminAccounts.firstName')}
              value={editorIsCoach ? coachDraft.firstname : traineeDraft.firstname}
              onChange={(event) => {
                if (editorIsCoach) {
                  setCoachDraft((prev) => ({ ...prev, firstname: event.target.value }));
                } else {
                  setTraineeDraft((prev) => ({ ...prev, firstname: event.target.value }));
                }
              }}
              required
              fullWidth
            />

            <TextField
              label={t('adminAccounts.lastName')}
              value={editorIsCoach ? coachDraft.lastname : traineeDraft.lastname}
              onChange={(event) => {
                if (editorIsCoach) {
                  setCoachDraft((prev) => ({ ...prev, lastname: event.target.value }));
                } else {
                  setTraineeDraft((prev) => ({ ...prev, lastname: event.target.value }));
                }
              }}
              required
              fullWidth
            />

            {editorIsCoach ? (
              <TextField
                label={t('adminAccounts.alias')}
                value={coachDraft.alias}
                onChange={(event) => setCoachDraft((prev) => ({ ...prev, alias: event.target.value }))}
                fullWidth
              />
            ) : (
              <TextField
                label={t('adminAccounts.age')}
                value={traineeDraft.age}
                onChange={(event) => setTraineeDraft((prev) => ({ ...prev, age: event.target.value }))}
                required
                fullWidth
              />
            )}

            <TextField
              label={t('adminAccounts.pin')}
              value={editorIsCoach ? coachDraft.pin : traineeDraft.pin}
              onChange={(event) => {
                if (editorIsCoach) {
                  setCoachDraft((prev) => ({ ...prev, pin: event.target.value }));
                } else {
                  setTraineeDraft((prev) => ({ ...prev, pin: event.target.value }));
                }
              }}
              required
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditor} disabled={isSubmitting}>
            {t('adminAccounts.cancel')}
          </Button>
          <Button onClick={handleSubmitEditor} variant="contained" disabled={isSubmitting}>
            {t('adminAccounts.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog !== null}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
        slotProps={{
          paper: {
            sx: (theme) => ({
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
        }}
      >
        <DialogTitle>{t('adminAccounts.confirmDeleteTitle')}</DialogTitle>
        <DialogContent
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
          <DialogContentText>
            {deleteDialog?.entity === 'coach' ? coachDeleteMessage : traineeDeleteMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isDeleting}>
            {t('adminAccounts.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {t('adminAccounts.deleteAction')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3500}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <LoadingOverlay visible={isBusy} />
    </Stack>
  );
}

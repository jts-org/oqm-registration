/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Sparring Coach Registration Dialog — collects free/sparring session information from the coach.
 *   Pre-fills coach name from coachData when provided (PIN-authenticated coach).
 *   Locale fallback logic: 'fi' → 'de' → 'en' for date/time fields.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Item from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/fi';
import 'dayjs/locale/de';

export interface SparringCoachRegistrationDialogProps {
  open: boolean;
  coachData?: {
    firstname: string;
    lastname: string;
  };
  onConfirm: (data: {
    firstname: string;
    lastname: string;
    date: string;
    start_time: string;
    end_time: string;
  }) => void;
  onCancel: () => void;
}

/** Resolve locale for dayjs: 'fi' → 'fi', 'de' → 'de', else 'en'. */
function getAdapterLocale(lang: string): string {
  if (lang === 'fi') return 'fi';
  if (lang === 'de') return 'de';
  return 'en';
}

export function SparringCoachRegistrationDialog({ open, coachData, onConfirm, onCancel }: SparringCoachRegistrationDialogProps) {
  const { t, i18n } = useTranslation();
  const [firstname, setFirstname] = useState(coachData?.firstname || '');
  const [lastname, setLastname] = useState(coachData?.lastname || '');
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs());
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs());

  // Sync state when dialog opens or coachData changes
  useEffect(() => {
    if (open) {
      setFirstname(coachData?.firstname || '');
      setLastname(coachData?.lastname || '');
      setDate(dayjs());
      setStartTime(dayjs());
      setEndTime(dayjs());
    }
  }, [open, coachData]);

  const isValid = Boolean(firstname && lastname && date?.isValid() && startTime?.isValid() && endTime?.isValid());

  function handleConfirm() {
    if (!isValid) return;
    onConfirm({
      firstname,
      lastname,
      date: date!.format('YYYY-MM-DD'),
      start_time: startTime!.format('HH:mm'),
      end_time: endTime!.format('HH:mm'),
    });
  }

  const adapterLocale = getAdapterLocale(i18n.language);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      <Dialog open={open} onClose={onCancel} aria-labelledby="sparring-coach-registration-title">
        <DialogTitle id="sparring-coach-registration-title">
          {t('coachQuickRegistration.fillSparringSessionInfo')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{xs: 6, md: 6}}>
                <Item>
                  <TextField
                    id="sparring-firstname"
                    label={t('coachQuickRegistration.firstName')}
                    value={firstname}
                    onChange={e => setFirstname(e.target.value)}
                    required
                  />
                </Item>
              </Grid>
              <Grid size={{xs: 6, md: 6}}>
                <Item>
                  <TextField
                    id="sparring-lastname"
                    label={t('coachQuickRegistration.lastName')}
                    value={lastname}
                    onChange={e => setLastname(e.target.value)}
                    required
                  />
                </Item>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{xs: 6, md: 6}}>
                <Item>
                  <DatePicker
                    label={t('coachQuickRegistration.date')}
                    views={['day', 'month', 'year']}
                    value={date}
                    onChange={setDate}
                  />
                </Item>
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{xs: 6, md: 6}}>
                <Item>
                  <TimePicker
                    label={t('coachQuickRegistration.startTime')}
                    value={startTime}
                    onChange={setStartTime}
                    format="HH:mm"
                  />
                </Item>
              </Grid>
              <Grid size={{xs: 6, md: 6}}>
                <Item>
                  <TimePicker
                    label={t('coachQuickRegistration.endTime')}
                    value={endTime}
                    onChange={setEndTime}
                    format="HH:mm"
                  />
                </Item>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box>
            <ButtonGroup>
              <Button onClick={handleConfirm} variant="contained" color="primary" disabled={!isValid}>
                {t('coachQuickRegistration.confirm')}
              </Button>
              <Button onClick={onCancel} variant="outlined">
                {t('coachQuickRegistration.cancel')}
              </Button>
            </ButtonGroup>
          </Box>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
